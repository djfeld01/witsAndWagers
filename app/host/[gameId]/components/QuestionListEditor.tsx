"use client";

import { useState } from "react";
import type { Question } from "@/lib/types/questions";

interface QuestionListEditorProps {
  gameId: string;
  questions: Question[];
  isActive: boolean;
  onQuestionsChange: () => void;
}

export function QuestionListEditor({
  gameId,
  questions,
  isActive,
  onQuestionsChange,
}: QuestionListEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localQuestions, setLocalQuestions] = useState(questions);

  // Update local questions when props change
  useState(() => {
    setLocalQuestions(questions);
  });

  const handleDragStart = (index: number) => {
    if (isActive) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (isActive || draggedIndex === null || draggedIndex === index) return;

    const newQuestions = [...localQuestions];
    const draggedItem = newQuestions[draggedIndex];
    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedItem);

    setLocalQuestions(newQuestions);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    setDraggedIndex(null);

    // Check if order actually changed
    const orderChanged = localQuestions.some(
      (q, i) => q.id !== questions[i]?.id,
    );

    if (!orderChanged) return;

    setSaving(true);
    setError(null);

    try {
      const questionIds = localQuestions.map((q) => q.id);
      const response = await fetch(`/api/games/${gameId}/questions/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to reorder questions");
      }

      onQuestionsChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder");
      // Revert to original order on error
      setLocalQuestions(questions);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditText(question.text);
    setEditAnswer(question.correctAnswer);
    setError(null);
  };

  const handleSave = async (questionId: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/games/${gameId}/questions/${questionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: editText,
            correctAnswer: parseFloat(editAnswer),
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to update question");
      }

      setEditingId(null);
      onQuestionsChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setError(null);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/games/${gameId}/questions/${questionId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to delete question");
      }

      onQuestionsChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-lg mb-2">No questions yet</p>
        <p className="text-sm">
          Use the "Add Question" button above or import questions from a file
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isActive && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          Questions cannot be edited while the game is active.
        </div>
      )}

      <div className="space-y-2">
        {localQuestions.map((question, index) => (
          <div
            key={question.id}
            draggable={!isActive && editingId !== question.id}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`border rounded-lg p-4 bg-white shadow-sm ${
              !isActive && editingId !== question.id
                ? "cursor-move hover:shadow-md transition-shadow"
                : ""
            } ${draggedIndex === index ? "opacity-50" : ""}`}
          >
            {editingId === question.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question {index + 1}
                  </label>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer
                  </label>
                  <input
                    type="number"
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={saving}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(question.id)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {index + 1}. {question.text}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Answer: {question.correctAnswer}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(question)}
                    disabled={isActive || saving}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    disabled={isActive || saving}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
