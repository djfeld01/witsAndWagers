/**
 * Submission Counter Component
 * Displays real-time count of player submissions during guessing and betting phases
 */

interface SubmissionCounterProps {
  phase: "guessing" | "betting" | "reveal";
  submittedCount: number;
  totalCount: number;
}

export default function SubmissionCounter({
  phase,
  submittedCount,
  totalCount,
}: SubmissionCounterProps) {
  // Only show during guessing or betting phases
  if (phase === "reveal") {
    return null;
  }

  return (
    <div className="fixed top-24 right-8 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg shadow-xl border-2 border-white/20">
      <div className="flex items-center gap-3">
        <svg
          className="w-6 h-6 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-2xl font-bold text-white">
          {submittedCount}/{totalCount} submitted
        </span>
      </div>
    </div>
  );
}
