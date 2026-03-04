"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function JoinGamePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [displayName, setDisplayName] = useState("");
  const [gameTitle, setGameTitle] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate join code exists
  useEffect(() => {
    const validateCode = async () => {
      try {
        // We don't have a dedicated endpoint to check if code exists,
        // so we'll just show the form and handle errors on submit
        setLoading(false);
      } catch (err) {
        setError("Invalid join code");
        setLoading(false);
      }
    };

    validateCode();
  }, [code]);

  const validateDisplayName = (name: string): string | null => {
    if (!name.trim()) {
      return "Display name is required";
    }
    if (name.length < 1 || name.length > 30) {
      return "Display name must be between 1 and 30 characters";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateDisplayName(displayName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/join/${code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: displayName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to join game");
      }

      const data = await response.json();

      // Store player ID in local storage
      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("gameId", data.gameId);
      localStorage.setItem("displayName", displayName.trim());

      // Redirect to player view
      router.push(`/play/${data.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Join Game
          </h1>
          <div className="text-center mb-6">
            <span className="text-sm text-gray-600">Code: </span>
            <span className="text-lg font-mono font-bold text-blue-600">
              {code}
            </span>
          </div>

          {gameTitle && (
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600">Game</div>
              <div className="text-xl font-bold text-gray-900">{gameTitle}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Enter your name"
                maxLength={30}
                autoFocus
              />
              <div className="mt-1 text-sm text-gray-500">
                {displayName.length}/30 characters
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
            >
              {isSubmitting ? "Joining..." : "Join Game"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
