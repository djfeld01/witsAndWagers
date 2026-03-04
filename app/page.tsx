"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-celadon-50 via-muted-teal-50 to-smart-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-celadon-600 via-smart-blue-600 to-vintage-grape-600 bg-clip-text text-transparent">
              #Trivia
            </h1>
          </div>
          <p className="text-2xl text-smart-blue-800 font-medium mb-3">
            Guess. Bet. Win.
          </p>
          <p className="text-lg text-muted-teal-700 max-w-2xl mx-auto">
            The trivia game where you don't need to know the answer—just guess
            close and bet smart
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Host Card */}
          <a
            href="/host/create"
            className="group bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-celadon-200 hover:border-celadon-400 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-celadon-400 to-celadon-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform">
                🎮
              </div>
              <h2 className="text-3xl font-bold text-smart-blue-900 mb-3">
                Host a Game
              </h2>
              <p className="text-muted-teal-700 text-lg">
                Create questions and run the show
              </p>
            </div>
          </a>

          {/* Player Card */}
          <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg border-2 border-smart-blue-200">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-smart-blue-400 to-smart-blue-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                📱
              </div>
              <h2 className="text-3xl font-bold text-smart-blue-900 mb-3">
                Join a Game
              </h2>
              <p className="text-muted-teal-700 mb-6 text-lg">
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
                  className="w-full px-6 py-4 border-2 border-muted-teal-300 rounded-xl focus:ring-2 focus:ring-smart-blue-500 focus:border-smart-blue-500 mb-4 text-center text-xl font-mono uppercase tracking-wider"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-smart-blue-600 to-vintage-grape-600 text-white py-4 px-6 rounded-xl hover:from-smart-blue-700 hover:to-vintage-grape-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Join Game
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border-2 border-canary-yellow-200">
          <h3 className="text-2xl font-bold text-smart-blue-900 mb-4 text-center">
            How to Play
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-3">🤔</div>
              <h4 className="font-semibold text-smart-blue-800 mb-2">
                1. Guess
              </h4>
              <p className="text-muted-teal-700 text-sm">
                Submit your best guess to numerical trivia questions
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-smart-blue-800 mb-2">2. Bet</h4>
              <p className="text-muted-teal-700 text-sm">
                Bet on which guess is closest to the answer
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-semibold text-smart-blue-800 mb-2">3. Win</h4>
              <p className="text-muted-teal-700 text-sm">
                Earn points for accuracy and smart betting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
