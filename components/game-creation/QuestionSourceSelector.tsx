"use client";

interface QuestionSourceSelectorProps {
  selectedMode: "manual" | "premade";
  onModeChange: (mode: "manual" | "premade") => void;
  disabled?: boolean;
}

export default function QuestionSourceSelector({
  selectedMode,
  onModeChange,
  disabled = false,
}: QuestionSourceSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Question Source
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onModeChange("manual")}
          disabled={disabled}
          className={`p-4 border-2 rounded-lg text-left transition-all ${
            selectedMode === "manual"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300 bg-white hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMode === "manual"
                    ? "border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {selectedMode === "manual" && (
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                )}
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Create Questions Manually
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Add your own custom trivia questions one by one or upload from a
                file
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onModeChange("premade")}
          disabled={disabled}
          className={`p-4 border-2 rounded-lg text-left transition-all ${
            selectedMode === "premade"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300 bg-white hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMode === "premade"
                    ? "border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {selectedMode === "premade" && (
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                )}
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Use Pre-Made Questions
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Browse and select from curated question sets across various
                categories
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
