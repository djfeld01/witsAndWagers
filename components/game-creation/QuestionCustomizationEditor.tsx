"use client";

import { useState } from "react";

interface Question {
  id: string;
  text: string;
  subText: string | null;
  correctAnswer: string;
  answerFormat: "plain" | "currency" | "date" | "percentage";
  followUpNotes: string | null;
  orderIndex: number;
  sourceCategoryName?: string;
}

interface QuestionCustomizationEditorProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onBack: () => void;
  onCreateGame: () => void;
  isCreating: boolean;
  error?: string | null;
}

export default function QuestionCustomizationEditor({
  questions,
  onQuestionsChange,
  onBack,
  onCreateGame,
  isCreating,
  error,
}: QuestionCustomizationEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Question | null>(null);

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditForm({ ...question });
  };

  const handleSaveEdit = () => {
    if (!editForm || !editingId) return;

    const updatedQuestions = questions.map((q) =>
      q.id === editingId ? editForm : q,
    );
    onQuestionsChange(updatedQuestions);
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleRemove = (id: string) => {
    const updatedQuestions = questions
      .filter((q) => q.id !== id)
      .map((q, index) => ({ ...q, orderIndex: index }));
    onQuestionsChange(updatedQuestions);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newQuestions = [...questions];
    [newQuestions[index - 1], newQuestions[index]] = [
      newQuestions[index],
      newQuestions[index - 1],
    ];
    const reindexed = newQuestions.map((q, i) => ({ ...q, orderIndex: i }));
    onQuestionsChange(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return;
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index + 1]] = [
      newQuestions[index + 1],
      newQuestions[index],
    ];
    const reindexed = newQuestions.map((q, i) => ({ ...q, orderIndex: i }));
    onQuestionsChange(reindexed);
  };

  const handleAddManual = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      text: "",
      subText: null,
      correctAnswer: "",
      answerFormat: "plain",
      followUpNotes: null,
      orderIndex: questions.length,
      sourceCategoryName: "Manual",
    };
    onQuestionsChange([...questions, newQuestion]);
    handleEdit(newQuestion);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Customize Questions
          </h2>
          <p className="text-gray-600 mt-1">
            Edit, reorder, or remove questions before creating your game
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          ← Back to Selection
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>{questions.length}</strong> question
          {questions.length !== 1 ? "s" : ""} ready to add to your game
        </p>
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="bg-white border-2 border-gray-200 rounded-lg p-4"
          >
            {editingId === question.id && editForm ? (
              // Edit mode
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text *
                  </label>
                  <input
                    type="text"
                    value={editForm.text}
                    onChange={(e) =>
                      setEditForm({ ...editForm, text: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter question text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Text (optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.subText || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        subText: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional context or clarification"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correct Answer *
                    </label>
                    <input
                      type="text"
                      value={editForm.correctAnswer}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter answer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Answer Format
                    </label>
                    <select
                      value={editForm.answerFormat}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          answerFormat: e.target
                            .value as Question["answerFormat"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="plain">Plain Number</option>
                      <option value="currency">Currency ($)</option>
                      <option value="date">Date (Year)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Notes (optional)
                  </label>
                  <textarea
                    value={editForm.followUpNotes || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        followUpNotes: e.target.value || null,
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional information to display after revealing the answer"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!editForm.text || !editForm.correctAnswer}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === questions.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {index + 1}.
                        </span>
                        <span className="text-lg font-medium text-gray-900">
                          {question.text}
                        </span>
                      </div>
                      {question.subText && (
                        <p className="text-sm text-gray-600 ml-6">
                          {question.subText}
                        </p>
                      )}
                    </div>
                    {question.sourceCategoryName && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {question.sourceCategoryName}
                      </span>
                    )}
                  </div>

                  <div className="ml-6 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Answer:</span>{" "}
                      {question.correctAnswer}
                      {question.answerFormat === "currency" && " (currency)"}
                      {question.answerFormat === "date" && " (year)"}
                      {question.answerFormat === "percentage" && " (%)"}
                    </p>
                    {question.followUpNotes && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span>{" "}
                        {question.followUpNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(question)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(question.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleAddManual}
          className="px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-md hover:bg-blue-50 font-medium"
        >
          + Add Manual Question
        </button>
      </div>

      <div className="border-t pt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={onCreateGame}
          disabled={isCreating || questions.length === 0}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isCreating
            ? "Creating Game..."
            : `Create Game with ${questions.length} Question${questions.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
