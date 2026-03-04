"use client";

import { useState } from "react";

interface AddQuestionButtonProps {
  gameId: string;
  onQuestionAdded: () => void;
  disabled?: boolean;
}

export function AddQuestionButton({
  gameId,
  onQuestionAdded,
  disabled = false,
}: AddQuestionButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState("");
  const [subText, setSubText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [answerFormat, setAnswerFormat] = useState<
    "plain" | "currency" | "date" | "percentage"
  >("plain");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    setIsAdding(false);
    setText("");
    setSubText("");
    setCorrectAnswer("");
    setAnswerFormat("plain");
    setFollowUpNotes("");
    setError(null);
  };

  const handleSave = async () => {
    if (!text.trim()) {
      setError("Question text is required");
      return;
    }

    if (!correctAnswer.trim()) {
      setError("Correct answer is required");
      return;
    }

    if (isNaN(parseFloat(correctAnswer))) {
      setError("Correct answer must be a number");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const questionData = {
        text: text.trim(),
        subText: subText.trim() || undefined,
        correctAnswer: parseFloat(correctAnswer),
        answerFormat,
        followUpNotes: followUpNotes.trim() || undefined,
      };

      console.log("Adding question:", questionData);

      const response = await fetch(`/api/games/${gameId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });

      const data = await response.json();
      console.log("Response:", response.status, data);

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to add question");
      }

      handleCancel();
      onQuestionAdded();
    } catch (err) {
      console.error("Error adding question:", err);
      setError(err instanceof Error ? err.message : "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        disabled={disabled}
        className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Add Question
      </button>
    );
  }

  return (
    <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Add New Question
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text *
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Enter question"
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub-text (optional)
          </label>
          <input
            type="text"
            value={subText}
            onChange={(e) => setSubText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Additional context"
            disabled={saving}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <input
              type="number"
              step="any"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Numerical answer"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Format
            </label>
            <select
              value={answerFormat}
              onChange={(e) =>
                setAnswerFormat(
                  e.target.value as
                    | "plain"
                    | "currency"
                    | "date"
                    | "percentage",
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={saving}
            >
              <option value="plain">Plain Number</option>
              <option value="currency">Currency</option>
              <option value="date">Date (Year)</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Follow-up Notes (optional)
          </label>
          <textarea
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Interesting facts to display after reveal"
            rows={3}
            disabled={saving}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Adding..." : "Add Question"}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
