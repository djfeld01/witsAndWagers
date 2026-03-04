"use client";

import { useState } from "react";

interface GameResetButtonProps {
  gameId: string;
  onResetComplete: () => void;
}

export function GameResetButton({
  gameId,
  onResetComplete,
}: GameResetButtonProps) {
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    setError(null);

    try {
      const response = await fetch(`/api/games/${gameId}/reset`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to reset game");
      }

      setShowConfirm(false);
      onResetComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset game");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-2">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={resetting}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          Reset Game
        </button>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium mb-3">
            Are you sure you want to reset this game?
          </p>
          <p className="text-yellow-700 text-sm mb-4">
            This will remove all players, clear all guesses and bets, and reset
            the game to the first question. Questions will be preserved.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {resetting ? "Resetting..." : "Yes, Reset Game"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setError(null);
              }}
              disabled={resetting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
