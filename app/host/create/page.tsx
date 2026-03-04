"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// TODO: Future enhancement - Add optional logo upload field
// Allow hosts to upload a logo image that will be displayed in the header
// during gameplay (on host dashboard, display view, and player view)

export default function CreateGamePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Game title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          questions: [], // Create game without questions initially
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to create game");
      }

      const data = await response.json();
      router.push(`/host/${data.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Game
          </h1>
          <p className="text-gray-600 mb-8">
            Enter a title for your game. You'll add questions on the next page.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900"
                placeholder="e.g., Team Trivia Night"
                autoFocus
              />
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
              {isSubmitting ? "Creating Game..." : "Create Game"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              What's next?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload questions from a CSV or JSON file</li>
              <li>• Or add questions manually one by one</li>
              <li>• Edit, reorder, or delete questions anytime</li>
              <li>• Start the game when you're ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
