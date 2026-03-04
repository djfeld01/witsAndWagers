"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Question {
  text: string;
  subText: string;
  correctAnswer: string;
  answerFormat: "plain" | "currency" | "date" | "percentage";
  followUpNotes: string;
}

export default function CreateGamePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      text: "",
      subText: "",
      correctAnswer: "",
      answerFormat: "plain",
      followUpNotes: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        subText: "",
        correctAnswer: "",
        answerFormat: "plain",
        followUpNotes: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (
    index: number,
    field: keyof Question,
    value: string,
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const validateForm = (): string | null => {
    if (!title.trim()) {
      return "Game title is required";
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        return `Question ${i + 1}: Question text is required`;
      }
      if (!q.correctAnswer.trim()) {
        return `Question ${i + 1}: Correct answer is required`;
      }
      if (isNaN(parseFloat(q.correctAnswer))) {
        return `Question ${i + 1}: Correct answer must be a number`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
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
          questions,
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create New Game
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Title */}
          <div className="bg-white p-6 rounded-lg shadow">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter game title"
            />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Question {index + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) =>
                        updateQuestion(index, "text", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-text (optional)
                    </label>
                    <input
                      type="text"
                      value={question.subText}
                      onChange={(e) =>
                        updateQuestion(index, "subText", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional context"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer
                      </label>
                      <input
                        type="text"
                        value={question.correctAnswer}
                        onChange={(e) =>
                          updateQuestion(index, "correctAnswer", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Numerical answer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer Format
                      </label>
                      <select
                        value={question.answerFormat}
                        onChange={(e) =>
                          updateQuestion(index, "answerFormat", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={question.followUpNotes}
                      onChange={(e) =>
                        updateQuestion(index, "followUpNotes", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Interesting facts to display after reveal"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700"
          >
            + Add Question
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating Game..." : "Create Game"}
          </button>
        </form>
      </div>
    </div>
  );
}
