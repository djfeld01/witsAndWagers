"use client";

import { useEffect, useState } from "react";

interface Question {
  id: string;
  text: string;
  subText: string | null;
  correctAnswer: string;
  answerFormat: "plain" | "currency" | "date" | "percentage";
  followUpNotes: string | null;
  orderIndex: number;
}

interface QuestionPreviewModalProps {
  setId: string;
  setName?: string;
  onClose: () => void;
  onSelect: () => void;
}

export default function QuestionPreviewModal({
  setId,
  setName,
  onClose,
  onSelect,
}: QuestionPreviewModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/question-sets/${setId}/questions`);
      if (!response.ok) {
        throw new Error("Failed to load questions");
      }
      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnswer = (answer: string, format: string) => {
    switch (format) {
      case "currency":
        return `$${parseFloat(answer).toLocaleString()}`;
      case "percentage":
        return `${answer}%`;
      case "date":
        return answer;
      default:
        return answer;
    }
  };

  const displayedQuestions = showAll ? questions : questions.slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {setName || "Question Set Preview"}
              </h2>
              {!isLoading && !error && (
                <p className="mt-1 text-sm text-gray-600">
                  {questions.length} question{questions.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Loading questions...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchQuestions}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && questions.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">No questions in this set</p>
            </div>
          )}

          {!isLoading && !error && questions.length > 0 && (
            <div className="space-y-6">
              {displayedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        {question.text}
                      </p>
                      {question.subText && (
                        <p className="text-sm text-gray-600 mb-2">
                          {question.subText}
                        </p>
                      )}
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Answer:</p>
                        <p className="text-base font-semibold text-gray-900">
                          {formatAnswer(
                            question.correctAnswer,
                            question.answerFormat,
                          )}
                        </p>
                      </div>
                      {question.followUpNotes && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
                          <span className="font-medium">Note:</span>{" "}
                          {question.followUpNotes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {questions.length > 3 && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Show All {questions.length} Questions
                </button>
              )}

              {showAll && questions.length > 3 && (
                <button
                  onClick={() => setShowAll(false)}
                  className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Show Less
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onSelect();
              onClose();
            }}
            disabled={isLoading || error !== null || questions.length === 0}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Select This Set
          </button>
        </div>
      </div>
    </div>
  );
}
