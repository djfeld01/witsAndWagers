/**
 * Final Results Screen Component
 * Displays final standings and winner when game completes
 */

interface Player {
  id: string;
  displayName: string;
  score: number;
}

interface FinalResultsScreenProps {
  players: Player[];
  gameId: string;
}

export default function FinalResultsScreen({
  players,
  gameId,
}: FinalResultsScreenProps) {
  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Winner Announcement */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <svg
              className="w-40 h-40 text-yellow-400 mx-auto animate-bounce"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h1 className="text-7xl font-bold text-white mb-6">Game Over!</h1>
          {winner && (
            <>
              <p className="text-4xl text-yellow-400 font-semibold mb-4">
                🎉 {winner.displayName} Wins! 🎉
              </p>
              <p className="text-6xl font-bold text-white">
                {winner.score} points
              </p>
            </>
          )}
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 shadow-2xl border-2 border-white/20">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Final Standings
          </h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-6 rounded-xl transition-all ${
                  index === 0
                    ? "bg-linear-to-r from-yellow-500/30 to-yellow-600/30 border-2 border-yellow-400 scale-105"
                    : index === 1
                      ? "bg-white/10 border-2 border-gray-400"
                      : index === 2
                        ? "bg-white/10 border-2 border-orange-400"
                        : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-6">
                  <span
                    className={`text-4xl font-bold ${
                      index === 0
                        ? "text-yellow-400"
                        : index === 1
                          ? "text-gray-300"
                          : index === 2
                            ? "text-orange-400"
                            : "text-white"
                    }`}
                  >
                    {index === 0
                      ? "🥇"
                      : index === 1
                        ? "🥈"
                        : index === 2
                          ? "🥉"
                          : `#${index + 1}`}
                  </span>
                  <span className="text-3xl font-semibold text-white">
                    {player.displayName}
                  </span>
                </div>
                <span className="text-4xl font-bold text-white">
                  {player.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-10 text-center">
          <a
            href={`/host/${gameId}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-10 py-5 rounded-xl shadow-lg transition-all hover:scale-105"
          >
            Return to Host View
          </a>
        </div>
      </div>
    </div>
  );
}
