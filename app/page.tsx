"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-canary-yellow-100 via-celadon-100 to-vintage-grape-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-celadon-600 via-smart-blue-600 to-vintage-grape-600 bg-clip-text text-transparent drop-shadow-lg">
              #Trivia
            </h1>
          </div>
          <p className="text-2xl text-vintage-grape-800 font-medium mb-3">
            Guess. Bet. Win.
          </p>
          <p className="text-lg text-smart-blue-700 max-w-2xl mx-auto">
            The trivia game where you don't need to know the answer—just guess
            close and bet smart
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Host Card */}
          <a
            href="/host/create"
            className="group bg-gradient-to-br from-celadon-300 to-muted-teal-400 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-celadon-500 hover:border-celadon-600 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-canary-yellow-400 to-canary-yellow-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform">
                🎮
              </div>
              <h2 className="text-3xl font-bold text-smart-blue-900 mb-3">
                Host a Game
              </h2>
              <p className="text-smart-blue-800 text-lg font-medium">
                Create questions and run the show
              </p>
            </div>
          </a>

          {/* Player Card */}
          <div className="bg-gradient-to-br from-vintage-grape-300 to-smart-blue-400 p-10 rounded-2xl shadow-xl border-2 border-vintage-grape-500">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-canary-yellow-400 to-canary-yellow-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                📱
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Join a Game
              </h2>
              <p className="text-white mb-6 text-lg font-medium">
                Enter your game code
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const code = formData.get("code") as string;
                  if (code) {
                    window.location.href = `/join/${code.toUpperCase()}`;
                  }
                }}
              >
                <input
                  type="text"
                  name="code"
                  placeholder="ENTER CODE"
                  className="w-full px-6 py-4 border-2 border-white rounded-xl focus:ring-2 focus:ring-canary-yellow-500 focus:border-canary-yellow-500 mb-4 text-center text-xl font-mono uppercase tracking-wider bg-white/90"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-canary-yellow-500 to-canary-yellow-600 text-smart-blue-900 py-4 px-6 rounded-xl hover:from-canary-yellow-600 hover:to-canary-yellow-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Join Game
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-gradient-to-br from-muted-teal-300 to-muted-teal-400 rounded-2xl p-8 border-2 border-muted-teal-600 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            How to Play
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-3">🤔</div>
              <h4 className="font-semibold text-white mb-2">1. Guess</h4>
              <p className="text-celadon-50 text-sm">
                Submit your best guess to numerical trivia questions
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-white mb-2">2. Bet</h4>
              <p className="text-celadon-50 text-sm">
                Bet on which guess is closest to the answer
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-semibold text-white mb-2">3. Win</h4>
              <p className="text-celadon-50 text-sm">
                Earn points for accuracy and smart betting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
