"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function PlayerViewPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guess submission state
  const [guess, setGuess] = useState("");
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);
  const [guessSubmitted, setGuessSubmitted] = useState(false);

  // Bet submission state
  const [isSubmittingBet, setIsSubmittingBet] = useState(false);
  const [betSubmitted, setBetSubmitted] = useState(false);

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
    onPhaseChange: () => {
      fetchGameState();
      setGuessSubmitted(false);
      setBetSubmitted(false);
      setGuess("");
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
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isReconnecting]);

  // Load player info from local storage
  useEffect(() => {
    const storedPlayerId = localStorage.getItem("playerId");
    const storedGameId = localStorage.getItem("gameId");
    const storedDisplayName = localStorage.getItem("displayName");

    if (!storedPlayerId || storedGameId !== gameId) {
      router.push(`/join/${gameId}`);
      return;
    }

    setPlayerId(storedPlayerId);
    setDisplayName(storedDisplayName);
  }, [gameId, router]);

  // Initial fetch
  useEffect(() => {
    if (playerId) {
      fetchGameState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  // Check if player has submitted for current question
  useEffect(() => {
    if (gameState && playerId) {
      const currentQuestionId = gameState.game.currentQuestionId;
      if (currentQuestionId) {
        const hasGuess = gameState.guesses.some(
          (g) => g.playerId === playerId && g.questionId === currentQuestionId,
        );
        const hasBet = gameState.bets.some(
          (b) => b.playerId === playerId && b.questionId === currentQuestionId,
        );
        setGuessSubmitted(hasGuess);
        setBetSubmitted(hasBet);
      }
    }
  }, [gameState, playerId]);

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerId || !gameState?.game.currentQuestionId) return;

    const numericGuess = parseFloat(guess);
    if (isNaN(numericGuess)) {
      setError("Please enter a valid number");
      return;
    }

    setIsSubmittingGuess(true);
    setError(null);

    try {
      const response = await fetch(`/api/games/${gameId}/guesses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          questionId: gameState.game.currentQuestionId,
          guess: numericGuess,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to submit guess");
      }

      setGuessSubmitted(true);
      await fetchGameState();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit guess");
    } finally {
      setIsSubmittingGuess(false);
    }
  };

  const handleBetSubmit = async (
    guessId: string | null,
    betOnZero: boolean,
  ) => {
    if (!playerId || !gameState?.game.currentQuestionId) return;

    setIsSubmittingBet(true);
    setError(null);

    try {
      const response = await fetch(`/api/games/${gameId}/bets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          questionId: gameState.game.currentQuestionId,
          guessId,
          betOnZero,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to place bet");
      }

      setBetSubmitted(true);
      await fetchGameState();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bet");
    } finally {
      setIsSubmittingBet(false);
    }
  };

  if (loading || !playerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !gameState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-800"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return null;
  }

  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const currentQuestion = gameState.questions.find(
    (q) => q.id === gameState.game.currentQuestionId,
  );

  // Get guesses for betting phase
  const currentGuesses = gameState.guesses
    .filter((g) => g.questionId === gameState.game.currentQuestionId)
    .map((g) => ({
      ...g,
      numericGuess: parseFloat(g.guess),
    }))
    .sort((a, b) => a.numericGuess - b.numericGuess);

  // Always include zero as an option
  const bettingOptions = [
    { id: null, guess: "0", numericGuess: 0, isZero: true },
    ...currentGuesses.map((g) => ({ ...g, isZero: false })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {gameState.game.title}
              </h1>
              <div className="text-sm text-gray-600">{displayName}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {currentPlayer?.score || 0}
              </div>
              <div className="text-sm text-gray-600">points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status - Only show if reconnecting */}
      {isReconnecting && (
        <div className="bg-blue-100 border-b border-blue-200 px-4 py-2">
          <div className="max-w-4xl mx-auto text-sm text-blue-800">
            Reconnecting...
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!currentQuestion ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-xl text-gray-600">
              Waiting for game to start...
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Question */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentQuestion.text}
              </h2>
              {currentQuestion.subText && (
                <p className="text-gray-600">{currentQuestion.subText}</p>
              )}
            </div>

            {/* Guessing Phase */}
            {gameState.game.currentPhase === "guessing" && (
              <div className="bg-white p-6 rounded-lg shadow">
                {guessSubmitted ? (
                  <div className="text-center py-8">
                    <div className="text-green-600 text-xl font-bold mb-2">
                      ✓ Guess Submitted!
                    </div>
                    <div className="text-gray-600">
                      Waiting for other players...
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleGuessSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Guess
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="Enter your guess"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingGuess || !guess}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                      {isSubmittingGuess ? "Submitting..." : "Submit Guess"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Betting Phase */}
            {gameState.game.currentPhase === "betting" && (
              <div className="bg-white p-6 rounded-lg shadow">
                {betSubmitted ? (
                  <div className="text-center py-8">
                    <div className="text-green-600 text-xl font-bold mb-2">
                      ✓ Bet Placed!
                    </div>
                    <div className="text-gray-600">
                      Waiting for other players...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Choose a guess to bet on:
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {bettingOptions.map((option) => (
                        <button
                          key={option.id || "zero"}
                          onClick={() =>
                            handleBetSubmit(option.id, option.isZero)
                          }
                          disabled={isSubmittingBet}
                          className={`p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                            option.isZero
                              ? "border-gray-400 bg-gray-50"
                              : "border-gray-300"
                          }`}
                        >
                          <div className="text-2xl font-bold text-gray-900">
                            {option.guess}
                          </div>
                          {option.isZero && (
                            <div className="text-xs text-gray-600 mt-1">
                              (Always available)
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reveal Phase */}
            {gameState.game.currentPhase === "reveal" && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center py-8">
                  <div className="text-sm text-gray-600 mb-2">
                    Correct Answer
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-4">
                    {formatNumber(
                      parseFloat(currentQuestion.correctAnswer),
                      currentQuestion.answerFormat,
                    )}
                  </div>

                  {currentQuestion.followUpNotes && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700">
                        {currentQuestion.followUpNotes}
                      </p>
                    </div>
                  )}

                  <div className="text-lg text-gray-600">
                    Your Score:{" "}
                    <span className="font-bold text-blue-600">
                      {currentPlayer?.score || 0}
                    </span>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Waiting for next question...
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
