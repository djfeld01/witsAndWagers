"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGameChannel } from "@/lib/hooks/useGameChannel";
import { formatNumber } from "@/lib/format";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
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
                  <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {/* Zero option */}
                    <div className="bg-gray-700 bg-opacity-50 backdrop-blur-sm p-8 rounded-xl text-center border-2 border-gray-500">
                      <div className="text-5xl font-bold mb-2">0</div>
                      <div className="text-sm text-gray-300">
                        Always available
                      </div>
                    </div>

                    {/* Player guesses */}
                    {currentGuesses.map((guess) => (
                      <div
                        key={guess.id}
                        className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-xl text-center border-2 border-blue-400"
                      >
                        <div className="text-5xl font-bold mb-2">
                          {formatNumber(
                            guess.numericGuess,
                            currentQuestion.answerFormat,
                          )}
                        </div>
                        <div className="text-sm text-blue-200">
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
                  <div className="text-8xl font-bold text-green-400 mb-8">
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
                    <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
                      {currentGuesses.map((guess) => (
                        <div
                          key={guess.id}
                          className={`p-8 rounded-xl text-center border-4 ${
                            guess.id === closestGuessId
                              ? "bg-green-500 bg-opacity-30 border-green-400 scale-110"
                              : "bg-white bg-opacity-10 backdrop-blur-sm border-gray-500"
                          }`}
                        >
                          {guess.id === closestGuessId && (
                            <div className="text-xl text-green-300 mb-2">
                              ⭐ WINNER ⭐
                            </div>
                          )}
                          <div className="text-5xl font-bold mb-2">
                            {formatNumber(
                              guess.numericGuess,
                              currentQuestion.answerFormat,
                            )}
                          </div>
                          <div className="text-sm text-blue-200">
                            {guess.playerName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leaderboard Sidebar */}
      <div className="fixed top-24 right-8 bg-black bg-opacity-50 backdrop-blur-sm rounded-xl p-6 min-w-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Leaderboard</h3>
          {sortedPlayers.length > 3 && (
            <button
              onClick={() => setShowAllPlayers(!showAllPlayers)}
              className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              {showAllPlayers ? "Top 3" : "Show All"}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {(showAllPlayers ? sortedPlayers : topPlayers).map(
            (player, index) => (
              <div
                key={player.id}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  index === 0
                    ? "bg-yellow-500 bg-opacity-30 border-2 border-yellow-400"
                    : index === 1
                      ? "bg-gray-400 bg-opacity-30 border-2 border-gray-400"
                      : index === 2
                        ? "bg-orange-600 bg-opacity-30 border-2 border-orange-500"
                        : "bg-white bg-opacity-10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold w-8">
                    {index === 0
                      ? "🥇"
                      : index === 1
                        ? "🥈"
                        : index === 2
                          ? "🥉"
                          : `${index + 1}.`}
                  </div>
                  <div className="font-medium text-lg">
                    {player.displayName}
                  </div>
                </div>
                <div className="text-2xl font-bold">{player.score}</div>
              </div>
            ),
          )}
        </div>

        {sortedPlayers.length === 0 && (
          <div className="text-center text-gray-400 py-4">No players yet</div>
        )}
      </div>
    </div>
  );
}
