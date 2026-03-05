"use client";

import { useEffect, useState } from "react";

interface QuestionSet {
  id: string;
  name: string;
  description: string | null;
  questionCount: number;
  categoryName: string;
}

interface QuestionSetListProps {
  categoryId: string;
  selectedSetIds: string[];
  onSetSelect: (setId: string) => void;
  onSetDeselect: (setId: string) => void;
  onPreview: (setId: string, setName: string) => void;
  onSetsLoaded?: (sets: QuestionSet[]) => void;
}

export default function QuestionSetList({
  categoryId,
  selectedSetIds,
  onSetSelect,
  onSetDeselect,
  onPreview,
  onSetsLoaded,
}: QuestionSetListProps) {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestionSets();
  }, [categoryId]);

  const fetchQuestionSets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/question-sets?categoryId=${categoryId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load question sets");
      }
      const data = await response.json();
      setQuestionSets(data.questionSets);
      if (onSetsLoaded) {
        onSetsLoaded(data.questionSets);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load question sets",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (setId: string, isChecked: boolean) => {
    if (isChecked) {
      onSetSelect(setId);
    } else {
      onSetDeselect(setId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading question sets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchQuestionSets}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (questionSets.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">
          No question sets available in this category
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Select Question Sets
      </h3>
      <div className="space-y-4">
        {questionSets.map((set) => {
          const isSelected = selectedSetIds.includes(set.id);
          return (
            <div
              key={set.id}
              className={`p-4 border-2 rounded-lg transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      handleCheckboxChange(set.id, e.target.checked)
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {set.name}
                  </h4>
                  {set.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {set.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {set.questionCount} question
                    {set.questionCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => onPreview(set.id, set.name)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
