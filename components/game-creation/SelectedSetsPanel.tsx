"use client";

interface SelectedSet {
  id: string;
  name: string;
  categoryName: string;
  questionCount: number;
}

interface SelectedSetsPanelProps {
  selectedSets: SelectedSet[];
  onRemoveSet: (setId: string) => void;
  onProceedToCustomization: () => void;
}

export default function SelectedSetsPanel({
  selectedSets,
  onRemoveSet,
  onProceedToCustomization,
}: SelectedSetsPanelProps) {
  const totalQuestions = selectedSets.reduce(
    (sum, set) => sum + set.questionCount,
    0,
  );

  if (selectedSets.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-4 bg-white border-2 border-blue-600 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Selected Question Sets
      </h3>

      <div className="space-y-3 mb-4">
        {selectedSets.map((set) => (
          <div
            key={set.id}
            className="flex items-start justify-between gap-3 p-3 bg-blue-50 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{set.name}</p>
              <p className="text-sm text-gray-600">
                {set.categoryName} • {set.questionCount} question
                {set.questionCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemoveSet(set.id)}
              className="flex-shrink-0 text-red-600 hover:text-red-700 text-xl leading-none"
              aria-label="Remove set"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Total Questions:
          </span>
          <span className="text-lg font-bold text-blue-600">
            {totalQuestions}
          </span>
        </div>

        <button
          type="button"
          onClick={onProceedToCustomization}
          disabled={selectedSets.length === 0}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Customize & Create Game
        </button>
      </div>
    </div>
  );
}
