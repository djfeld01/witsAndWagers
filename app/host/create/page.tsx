"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuestionSourceSelector from "@/components/game-creation/QuestionSourceSelector";
import CategoryBrowser from "@/components/game-creation/CategoryBrowser";
import QuestionSetList from "@/components/game-creation/QuestionSetList";
import QuestionPreviewModal from "@/components/game-creation/QuestionPreviewModal";
import SelectedSetsPanel from "@/components/game-creation/SelectedSetsPanel";
import QuestionCustomizationEditor from "@/components/game-creation/QuestionCustomizationEditor";

// TODO: Future enhancement - Add optional logo upload field
// Allow hosts to upload a logo image that will be displayed in the header
// during gameplay (on host dashboard, display view, and player view)

interface SelectedSet {
  id: string;
  name: string;
  categoryName: string;
  questionCount: number;
}

interface LoadedQuestion {
  id: string;
  text: string;
  subText: string | null;
  correctAnswer: string;
  answerFormat: "plain" | "currency" | "date" | "percentage";
  followUpNotes: string | null;
  orderIndex: number;
  sourceCategoryName?: string;
}

export default function CreateGamePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Question source mode
  const [mode, setMode] = useState<"manual" | "premade">("manual");

  // Pre-made question selection state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [selectedSets, setSelectedSets] = useState<SelectedSet[]>([]);
  const [previewSetId, setPreviewSetId] = useState<string | null>(null);
  const [previewSetName, setPreviewSetName] = useState<string>("");

  // Customization state
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [loadedQuestions, setLoadedQuestions] = useState<LoadedQuestion[]>([]);

  const handleSetSelect = async (setId: string) => {
    if (selectedSetIds.includes(setId)) return;

    // Fetch the question set details to add to selectedSets
    try {
      const response = await fetch(
        `/api/question-sets?categoryId=${selectedCategoryId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch question set details");

      const data = await response.json();
      const set = data.questionSets.find((s: SelectedSet) => s.id === setId);

      if (set) {
        setSelectedSetIds([...selectedSetIds, setId]);
        setSelectedSets([
          ...selectedSets,
          {
            id: set.id,
            name: set.name,
            categoryName: set.categoryName,
            questionCount: set.questionCount,
          },
        ]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to select question set",
      );
    }
  };

  const handleSetDeselect = (setId: string) => {
    setSelectedSetIds(selectedSetIds.filter((id) => id !== setId));
    setSelectedSets(selectedSets.filter((set) => set.id !== setId));
  };

  const handlePreview = (setId: string, setName: string) => {
    setPreviewSetId(setId);
    setPreviewSetName(setName);
  };

  const handleProceedToCustomization = async () => {
    if (!title.trim()) {
      setError("Game title is required");
      return;
    }

    if (selectedSetIds.length === 0) {
      setError("Please select at least one question set");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Fetch all questions from selected sets
      const allQuestions: LoadedQuestion[] = [];
      for (const setId of selectedSetIds) {
        const response = await fetch(`/api/question-sets/${setId}/questions`);
        if (!response.ok) throw new Error("Failed to load questions");
        const data = await response.json();

        // Find the category name for this set
        const set = selectedSets.find((s) => s.id === setId);
        const categoryName = set?.categoryName || "Unknown";

        // Add questions with source category
        const questionsWithSource = data.questions.map(
          (q: LoadedQuestion, index: number) => ({
            ...q,
            id: `${setId}-${q.id}`,
            orderIndex: allQuestions.length + index,
            sourceCategoryName: categoryName,
          }),
        );

        allQuestions.push(...questionsWithSource);
      }

      setLoadedQuestions(allQuestions);
      setIsCustomizing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSelection = () => {
    setIsCustomizing(false);
    setLoadedQuestions([]);
  };

  const handleCreateGameWithQuestions = async () => {
    if (!title.trim()) {
      setError("Game title is required");
      return;
    }

    if (loadedQuestions.length === 0) {
      setError("At least one question is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Creating game with questions:", {
        title,
        questionCount: loadedQuestions.length,
      });

      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          questions: loadedQuestions.map((q, index) => ({
            text: q.text,
            subText: q.subText,
            correctAnswer: q.correctAnswer,
            answerFormat: q.answerFormat,
            followUpNotes: q.followUpNotes,
            orderIndex: index,
          })),
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error("Error response:", data);
        throw new Error(data.error?.message || "Failed to create game");
      }

      const data = await response.json();
      console.log("Game created successfully:", data);
      console.log("Attempting to navigate to:", `/host/${data.gameId}`);

      // Use window.location as a fallback if router.push doesn't work
      window.location.href = `/host/${data.gameId}`;
    } catch (err) {
      console.error("Error creating game:", err);
      setError(err instanceof Error ? err.message : "Failed to create game");
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          {isCustomizing ? (
            // Customization Editor View
            <QuestionCustomizationEditor
              questions={loadedQuestions}
              onQuestionsChange={setLoadedQuestions}
              onBack={handleBackToSelection}
              onCreateGame={handleCreateGameWithQuestions}
              isCreating={isSubmitting}
              error={error}
            />
          ) : (
            // Selection View
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create New Game
              </h1>
              <p className="text-gray-600 mb-8">
                {mode === "manual"
                  ? "Enter a title for your game. You'll add questions on the next page."
                  : "Select pre-made question sets to quickly create your game."}
              </p>

              <form onSubmit={handleManualSubmit} className="space-y-6">
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

                <QuestionSourceSelector
                  selectedMode={mode}
                  onModeChange={setMode}
                  disabled={isSubmitting}
                />

                {mode === "premade" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <CategoryBrowser
                        onCategorySelect={setSelectedCategoryId}
                        selectedCategoryId={selectedCategoryId}
                      />

                      {selectedCategoryId && (
                        <QuestionSetList
                          categoryId={selectedCategoryId}
                          selectedSetIds={selectedSetIds}
                          onSetSelect={handleSetSelect}
                          onSetDeselect={handleSetDeselect}
                          onPreview={handlePreview}
                        />
                      )}
                    </div>

                    <div>
                      <SelectedSetsPanel
                        selectedSets={selectedSets}
                        onRemoveSet={handleSetDeselect}
                        onProceedToCustomization={handleProceedToCustomization}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {mode === "manual" && (
                  <>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
                    >
                      {isSubmitting ? "Creating Game..." : "Create Game"}
                    </button>

                    <div className="mt-8 p-4 bg-blue-50 rounded-md">
                      <h3 className="text-sm font-medium text-blue-900 mb-2">
                        What&apos;s next?
                      </h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Upload questions from a CSV or JSON file</li>
                        <li>• Or add questions manually one by one</li>
                        <li>• Edit, reorder, or delete questions anytime</li>
                        <li>• Start the game when you&apos;re ready</li>
                      </ul>
                    </div>
                  </>
                )}
              </form>
            </>
          )}
        </div>
      </div>

      {previewSetId && (
        <QuestionPreviewModal
          setId={previewSetId}
          setName={previewSetName}
          onClose={() => setPreviewSetId(null)}
          onSelect={() => handleSetSelect(previewSetId)}
        />
      )}
    </div>
  );
}
