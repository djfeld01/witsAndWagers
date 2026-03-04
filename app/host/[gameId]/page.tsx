"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { generateQRCode } from "@/lib/qrcode";
import { useGameChannel } from "@/lib/hooks/useGameChannel";
import { QuestionListEditor } from "./components/QuestionListEditor";
import { FileUploadButton } from "./components/FileUploadButton";
import { GameResetButton } from "./components/GameResetButton";

interface GameState {
  game: {
    id: string;
    title: string;
    joinCode: string;
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

export default function HostDashboardPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showQuestionManagement, setShowQuestionManagement] = useState(true);

  // Check if game is active (has players or not in initial state)
  useEffect(() => {
    if (gameState) {
      const hasPlayers = gameState.players.length > 0;
      const notFirstQuestion =
        gameState.questions.length > 0 &&
        gameState.game.currentQuestionId !== gameState.questions[0]?.id;
      const notGuessingPhase = gameState.game.currentPhase !== "guessing";

      setIsGameActive(hasPlayers || notFirstQuestion || notGuessingPhase);
    }
  }, [gameState]);

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
      setError(err instanceof Error ? err.message : "Failed to advance phase");
    } finally {
      setIsAdvancing(false);
    }
  };

  // Fetch game state
  const fetchGameState = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}/state`);
      if (!response.ok) {
        throw new Error("Failed to fetch game state");
      }
      const data = await response.json();
      setGameState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to realtime updates
  const { isConnected, isReconnecting } = useGameChannel({
    gameId,
    onPlayerJoined: () => {
      fetchGameState();
    },
    onPhaseChange: () => {
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
  });

  // Fallback polling when realtime is not connected
  useEffect(() => {
    if (!isConnected && !isReconnecting) {
      const interval = setInterval(() => {
        fetchGameState();
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isReconnecting]);

  // Generate QR code
  useEffect(() => {
    if (gameState?.game.joinCode) {
      const joinUrl = `${window.location.origin}/join/${gameState.game.joinCode}`;
      generateQRCode(joinUrl).then(setQrCodeUrl);
    }
  }, [gameState?.game.joinCode]);

  // Initial fetch
  useEffect(() => {
    fetchGameState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading game...</div>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error || "Game not found"}</div>
      </div>
    );
  }

  const currentQuestion = gameState.questions.find(
    (q) => q.id === gameState.game.currentQuestionId,
  );

  const currentQuestionIndex = gameState.questions.findIndex(
    (q) => q.id === gameState.game.currentQuestionId,
  );

  // Count submissions for current question
  const guessCount = gameState.guesses.filter(
    (g) => g.questionId === gameState.game.currentQuestionId,
  ).length;

  const betCount = gameState.bets.filter(
    (b) => b.questionId === gameState.game.currentQuestionId,
  ).length;

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case "guessing":
        return "Guessing Phase";
      case "betting":
        return "Betting Phase";
      case "reveal":
        return "Reveal Phase";
      default:
        return phase;
    }
  };

  const getNextPhaseLabel = (phase: string) => {
    switch (phase) {
      case "guessing":
        return "Start Betting";
      case "betting":
        return "Reveal Answer";
      case "reveal":
        return "Next Question";
      default:
        return "Next Phase";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {gameState.game.title}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-sm text-gray-600">Join Code</div>
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {gameState.game.joinCode}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Players</div>
                <div className="text-2xl font-bold text-gray-900">
                  {gameState.players.length}
                </div>
              </div>
            </div>
            <a
              href={`/display/${gameId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Open Display View
            </a>
          </div>
        </div>

        {/* Question Management Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Question Management
            </h2>
            <button
              onClick={() => setShowQuestionManagement(!showQuestionManagement)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {showQuestionManagement ? "Hide" : "Show"}
            </button>
          </div>

          {showQuestionManagement && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <FileUploadButton
                  gameId={gameId}
                  onImportComplete={() => fetchGameState()}
                  disabled={isGameActive}
                />
                <GameResetButton
                  gameId={gameId}
                  onResetComplete={() => fetchGameState()}
                />
              </div>

              <QuestionListEditor
                gameId={gameId}
                questions={gameState.questions.map((q) => ({
                  id: q.id,
                  gameId: gameId,
                  orderIndex: q.order,
                  text: q.text,
                  subText: q.subText,
                  correctAnswer: q.correctAnswer,
                  answerFormat: q.answerFormat,
                  followUpNotes: q.followUpNotes,
                }))}
                isActive={isGameActive}
                onQuestionsChange={() => fetchGameState()}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Question */}
            {currentQuestion && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of{" "}
                    {gameState.questions.length}
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {getPhaseLabel(gameState.game.currentPhase)}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentQuestion.text}
                </h2>
                {currentQuestion.subText && (
                  <p className="text-gray-600 mb-4">
                    {currentQuestion.subText}
                  </p>
                )}

                {/* Submission Counts */}
                <div className="flex gap-4 mb-4">
                  {gameState.game.currentPhase === "guessing" && (
                    <div className="bg-gray-100 px-4 py-2 rounded">
                      <span className="text-sm text-gray-600">Guesses: </span>
                      <span className="font-bold text-gray-900">
                        {guessCount} / {gameState.players.length}
                      </span>
                    </div>
                  )}
                  {gameState.game.currentPhase === "betting" && (
                    <div className="bg-gray-100 px-4 py-2 rounded">
                      <span className="text-sm text-gray-600">Bets: </span>
                      <span className="font-bold text-gray-900">
                        {betCount} / {gameState.players.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Correct Answer (hidden until reveal) */}
                {gameState.game.currentPhase === "reveal" && (
                  <div className="bg-green-100 p-4 rounded mb-4">
                    <div className="text-sm text-green-800 mb-1">
                      Correct Answer
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {currentQuestion.correctAnswer}
                    </div>
                    {currentQuestion.followUpNotes && (
                      <div className="mt-3 text-sm text-green-800">
                        {currentQuestion.followUpNotes}
                      </div>
                    )}
                  </div>
                )}

                {/* Phase Control Button */}
                <button
                  onClick={advancePhase}
                  disabled={isAdvancing}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {isAdvancing
                    ? "Processing..."
                    : getNextPhaseLabel(gameState.game.currentPhase)}
                </button>
              </div>
            )}

            {/* Question List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                All Questions
              </h3>
              <div className="space-y-2">
                {gameState.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`p-3 rounded ${
                      question.id === gameState.game.currentQuestionId
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {index + 1}. {question.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Join Game
                </h3>
                <img src={qrCodeUrl} alt="QR Code" className="w-full rounded" />
                <div className="mt-4 text-center text-sm text-gray-600">
                  Scan to join
                </div>
              </div>
            )}

            {/* Players List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Players</h3>
              {gameState.players.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  No players yet
                </div>
              ) : (
                <div className="space-y-2">
                  {gameState.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium text-gray-900">
                        {player.displayName}
                      </span>
                      <span className="text-gray-600">{player.score} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
