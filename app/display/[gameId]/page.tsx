"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGameChannel } from "@/lib/hooks/useGameChannel";
import { formatNumber } from "@/lib/format";
import { getResponsiveTextStyle } from "@/lib/display/responsiveText";
import SubmissionCounter from "./components/SubmissionCounter";
import FinalResultsScreen from "./components/FinalResultsScreen";

interface GameState {
  game: {
    id: string;
    title: string;
    currentPhase: "guessing" | "betting" | "reveal";
    currentQuestionId: string | null;
  };
  questions: Array<{
    id: string;
    text: string;
    subText: string | null;
    correctAnswer: string;
    answerFormat: "plain" | "currency" | "date" | "percentage";
    followUpNotes: string | null;
    order: number;
  }>;
  players: Array<{
    id: string;
    displayName: string;
    score: number;
  }>;
  guesses: Array<{
    id: string;
    questionId: string;
    playerId: string;
    guess: string;
  }>;
  bets: Array<{
    id: string;
    questionId: string;
    playerId: string;
    guessId: string | null;
    betOnZero: number;
  }>;
}

export default function DisplayViewPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(true);

  // Fetch game state
  const fetchGameState = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}/state`);
      if (!response.ok) {
        throw new Error("Failed to fetch game state");
      }
      const data = await response.json();
      setGameState(data);
    } catch (err) {
      console.error("Failed to load game:", err);
    } finally {
      setLoading(false);
    }
  };

  // Advance to next phase
  const advancePhase = async () => {
    if (!gameState) return;

    const phaseMap: Record<string, string> = {
      guessing: "betting",
      betting: "reveal",
      reveal: "guessing",
    };

    const targetPhase = phaseMap[gameState.game.currentPhase];

    setIsAdvancing(true);
    try {
      const response = await fetch(`/api/games/${gameId}/advance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetPhase }),
      });

      if (!response.ok) {
        throw new Error("Failed to advance phase");
      }

      await fetchGameState();
    } catch (err) {
      console.error("Failed to advance phase:", err);
    } finally {
      setIsAdvancing(false);
    }
  };

  // Subscribe to realtime updates
  const { isConnected, isReconnecting } = useGameChannel({
    gameId,
    onPhaseChange: () => {
      fetchGameState();
    },
    onPlayerJoined: () => {
      fetchGameState();
    },
    onGuessSubmitted: () => {
      fetchGameState();
    },
    onBetPlaced: () => {
      fetchGameState();
    },
    onScoreUpdate: () => {
      fetchGameState();
    },
    onReconnect: () => {
      fetchGameState();
    },
  });

  // Fallback polling when realtime is not connected
  useEffect(() => {
    if (!isConnected && !isReconnecting) {
      const interval = setInterval(() => {
        fetchGameState();
      }, 3000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isReconnecting]);

  // Initial fetch
  useEffect(() => {
    fetchGameState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-3xl text-white">Loading...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-3xl text-white">Game not found</div>
      </div>
    );
  }

  const currentQuestion = gameState.questions.find(
    (q) => q.id === gameState.game.currentQuestionId,
  );

  // Sort players by score (descending)
  const sortedPlayers = [...gameState.players].sort(
    (a, b) => b.score - a.score,
  );
  const topPlayers = sortedPlayers.slice(0, 3);

  // Calculate submission counts
  const submittedGuesses = gameState.guesses.filter(
    (g) => g.questionId === gameState.game.currentQuestionId,
  ).length;

  const submittedBets = gameState.bets.filter(
    (b) => b.questionId === gameState.game.currentQuestionId,
  ).length;

  const totalPlayers = gameState.players.length;

  // Detect game completion
  const isLastQuestion =
    currentQuestion &&
    gameState.questions.length > 0 &&
    currentQuestion.order ===
      Math.max(...gameState.questions.map((q) => q.order));

  const showFinalResults =
    gameState.game.currentPhase === "reveal" && isLastQuestion;

  // Get guesses for betting/reveal phase
  const currentGuesses = gameState.guesses
    .filter((g) => g.questionId === gameState.game.currentQuestionId)
    .map((g) => {
      const player = gameState.players.find((p) => p.id === g.playerId);
      return {
        ...g,
        playerName: player?.displayName || "Unknown",
        numericGuess: parseFloat(g.guess),
      };
    })
    .sort((a, b) => a.numericGuess - b.numericGuess);

  // Find closest guess for reveal phase
  let closestGuessId: string | null = null;
  if (gameState.game.currentPhase === "reveal" && currentQuestion) {
    const correctAnswer = parseFloat(currentQuestion.correctAnswer);
    let minDiff = Infinity;
    let closestGuess = 0;

    currentGuesses.forEach((guess) => {
      const diff = Math.abs(guess.numericGuess - correctAnswer);
      if (
        diff < minDiff ||
        (diff === minDiff && guess.numericGuess < closestGuess)
      ) {
        minDiff = diff;
        closestGuess = guess.numericGuess;
        closestGuessId = guess.id;
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-blue-950 text-white">
      {/* Submission Counter */}
      <SubmissionCounter
        phase={gameState.game.currentPhase}
        submittedCount={
          gameState.game.currentPhase === "guessing"
            ? submittedGuesses
            : submittedBets
        }
        totalCount={totalPlayers}
      />

      {/* Hidden Navigation Toggle - Click bottom-left corner to reveal */}
      <button
        onClick={() => setShowNavigation(!showNavigation)}
        className="fixed bottom-4 left-4 w-12 h-12 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center z-50 transition-all"
        title="Toggle navigation"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Navigation Panel */}
      {showNavigation && (
        <div className="fixed bottom-20 left-4 bg-black bg-opacity-80 backdrop-blur-sm rounded-xl p-4 z-50 min-w-[200px]">
          <div className="text-sm text-gray-400 mb-2">Navigation</div>
          <button
            onClick={advancePhase}
            disabled={isAdvancing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {isAdvancing
              ? "Processing..."
              : gameState?.game.currentPhase === "guessing"
                ? "Start Betting"
                : gameState?.game.currentPhase === "betting"
                  ? "Reveal Answer"
                  : "Next Question"}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <h1 className="text-4xl font-bold">{gameState.game.title}</h1>
          <div className="text-2xl font-mono bg-white text-blue-900 px-6 py-2 rounded-lg">
            {gameState.game.currentPhase.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {!currentQuestion ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-8">Waiting for game to start...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Guessing Phase - Full Screen Question */}
            {gameState.game.currentPhase === "guessing" && (
              <div className="text-center py-20">
                <div className="text-6xl font-bold mb-8">
                  {currentQuestion.text}
                </div>
                {currentQuestion.subText && (
                  <div className="text-3xl text-blue-200 mb-12">
                    {currentQuestion.subText}
                  </div>
                )}
                <div className="text-2xl text-blue-300">
                  Players are submitting their guesses...
                </div>
              </div>
            )}

            {/* Betting Phase - Show Guesses */}
            {gameState.game.currentPhase === "betting" && (
              <div>
                {/* Question (smaller) */}
                <div className="text-center mb-12">
                  <div className="text-4xl font-bold mb-4">
                    {currentQuestion.text}
                  </div>
                  {currentQuestion.subText && (
                    <div className="text-2xl text-blue-200">
                      {currentQuestion.subText}
                    </div>
                  )}
                </div>

                {/* Guesses */}
                <div className="mb-8">
                  <div className="text-3xl font-bold text-center mb-8">
                    Place Your Bets!
                  </div>
                  <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Zero option */}
                    <div className="bg-gray-200 backdrop-blur-sm p-12 rounded-xl text-center border-4 border-gray-600">
                      <div className="text-7xl font-bold mb-3 text-gray-900">
                        0
                      </div>
                      <div className="text-lg text-gray-700">
                        Always available
                      </div>
                    </div>

                    {/* Player guesses */}
                    {currentGuesses.map((guess) => (
                      <div
                        key={guess.id}
                        className="bg-white backdrop-blur-sm p-12 rounded-xl text-center border-4 border-blue-600"
                      >
                        <div
                          className="font-bold mb-3 text-gray-900"
                          style={getResponsiveTextStyle(guess.numericGuess)}
                        >
                          {formatNumber(
                            guess.numericGuess,
                            currentQuestion.answerFormat,
                          )}
                        </div>
                        <div className="text-xl text-gray-700">
                          {guess.playerName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-2xl text-blue-300 text-center">
                  Players are placing their bets...
                </div>
              </div>
            )}

            {/* Reveal Phase - Show Answer and Winners */}
            {gameState.game.currentPhase === "reveal" && (
              <>
                {showFinalResults ? (
                  <FinalResultsScreen players={sortedPlayers} gameId={gameId} />
                ) : (
                  <div>
                    {/* Question (smaller) */}
                    <div className="text-center mb-12">
                      <div className="text-4xl font-bold mb-4">
                        {currentQuestion.text}
                      </div>
                      {currentQuestion.subText && (
                        <div className="text-2xl text-blue-200">
                          {currentQuestion.subText}
                        </div>
                      )}
                    </div>

                    {/* Correct Answer */}
                    <div className="text-center mb-12">
                      <div className="text-2xl text-green-300 mb-4">
                        Correct Answer
                      </div>
                      <div
                        className="font-bold text-green-400 mb-8"
                        style={getResponsiveTextStyle(
                          parseFloat(currentQuestion.correctAnswer),
                        )}
                      >
                        {formatNumber(
                          parseFloat(currentQuestion.correctAnswer),
                          currentQuestion.answerFormat,
                        )}
                      </div>
                      {currentQuestion.followUpNotes && (
                        <div className="bg-blue-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-xl max-w-4xl mx-auto">
                          <p className="text-2xl text-blue-100">
                            {currentQuestion.followUpNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Guesses with Winner Highlighted */}
                    {currentGuesses.length > 0 && (
                      <div className="mb-12">
                        <div className="text-3xl font-bold text-center mb-8">
                          All Guesses
                        </div>
                        <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
                          {currentGuesses.map((guess) => (
                            <div
                              key={guess.id}
                              className={`p-12 rounded-xl text-center border-4 ${
                                guess.id === closestGuessId
                                  ? "bg-green-500 bg-opacity-30 border-green-400 scale-110"
                                  : "bg-white border-gray-400"
                              }`}
                            >
                              {guess.id === closestGuessId && (
                                <div className="text-2xl text-green-300 mb-3">
                                  ⭐ WINNER ⭐
                                </div>
                              )}
                              <div
                                className={`font-bold mb-3 ${
                                  guess.id === closestGuessId
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                                style={getResponsiveTextStyle(
                                  guess.numericGuess,
                                )}
                              >
                                {formatNumber(
                                  guess.numericGuess,
                                  currentQuestion.answerFormat,
                                )}
                              </div>
                              <div
                                className={`text-xl ${
                                  guess.id === closestGuessId
                                    ? "text-green-200"
                                    : "text-gray-700"
                                }`}
                              >
                                {guess.playerName}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Leaderboard Sidebar */}
      <div className="fixed top-24 right-8 bg-black bg-opacity-50 backdrop-blur-sm rounded-xl p-4 min-w-[250px]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">
            {leaderboardExpanded ? "Leaderboard" : "Leader"}
          </h3>
          <button
            onClick={() => setLeaderboardExpanded(!leaderboardExpanded)}
            className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
          >
            {leaderboardExpanded ? "Collapse" : "Expand"}
          </button>
        </div>

        <div className="space-y-2">
          {leaderboardExpanded ? (
            <>
              {/* Show top 3 or all players */}
              {(showAllPlayers ? sortedPlayers : topPlayers).map(
                (player, index) => (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center p-2 rounded-lg ${
                      index === 0
                        ? "bg-yellow-500 bg-opacity-30 border-2 border-yellow-400"
                        : index === 1
                          ? "bg-gray-400 bg-opacity-30 border-2 border-gray-400"
                          : index === 2
                            ? "bg-orange-600 bg-opacity-30 border-2 border-orange-500"
                            : "bg-white bg-opacity-10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-bold w-6">
                        {index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : index === 2
                              ? "🥉"
                              : `${index + 1}.`}
                      </div>
                      <div className="font-medium text-sm">
                        {player.displayName}
                      </div>
                    </div>
                    <div className="text-xl font-bold">{player.score}</div>
                  </div>
                ),
              )}
              {sortedPlayers.length > 3 && (
                <button
                  onClick={() => setShowAllPlayers(!showAllPlayers)}
                  className="w-full text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded mt-2"
                >
                  {showAllPlayers ? "Top 3" : "Show All"}
                </button>
              )}
            </>
          ) : (
            <>
              {/* Show only top player */}
              {sortedPlayers.length > 0 && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500 bg-opacity-30 border-2 border-yellow-400">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">🥇</div>
                    <div className="font-medium">
                      {sortedPlayers[0].displayName}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {sortedPlayers[0].score}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {sortedPlayers.length === 0 && (
          <div className="text-center text-gray-400 py-2 text-sm">
            No players yet
          </div>
        )}
      </div>
    </div>
  );
}
