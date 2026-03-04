"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#f7f5d4] via-[#faddd1] to-[#e4eedd] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <h1 className="text-7xl font-bold bg-linear-to-r from-[#78ac53] via-[#e75618] to-[#b85447] bg-clip-text text-transparent drop-shadow-lg">
              #Trivia
            </h1>
          </div>
          <p className="text-2xl text-[#6e332b] font-medium mb-3">
            Guess. Bet. Win.
          </p>
          <p className="text-lg text-[#486732] max-w-2xl mx-auto">
            The trivia game where you don't need to know the answer—just guess
            close and bet smart
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Host Card */}
          <a
            href="/host/create"
            className="group bg-linear-to-br from-[#aecd98] to-[#78ac53] p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-[#608a42] hover:border-[#486732] hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-[#ddd755] to-[#adc33c] rounded-2xl flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform">
                🎮
              </div>
              <h2 className="text-3xl font-bold text-[#1a0c0a] mb-3">
                Host a Game
              </h2>
              <p className="text-[#49221d] text-lg font-medium">
                Create questions and run the show
              </p>
            </div>
          </a>

          {/* Player Card */}
          <div className="bg-linear-to-br from-[#f09a75] to-[#ec7846] p-10 rounded-2xl shadow-xl border-2 border-[#e75618]">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-[#ddd755] to-[#d5cc2a] rounded-2xl flex items-center justify-center text-4xl shadow-lg">
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
                  className="w-full px-6 py-4 border-2 border-white rounded-xl focus:ring-2 focus:ring-[#d5cc2a] focus:border-[#d5cc2a] mb-4 text-center text-xl font-mono uppercase tracking-wider bg-white/90"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-[#d5cc2a] to-[#adc33c] text-[#1a0c0a] py-4 px-6 rounded-xl hover:from-[#aaa422] hover:to-[#8a9c30] font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Join Game
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-linear-to-br from-[#d49991] to-[#c6776c] rounded-2xl p-8 border-2 border-[#b85447] shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            How to Play
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-3">🤔</div>
              <h4 className="font-semibold text-white mb-2">1. Guess</h4>
              <p className="text-[#f8eeed] text-sm">
                Submit your best guess to numerical trivia questions
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-white mb-2">2. Bet</h4>
              <p className="text-[#f8eeed] text-sm">
                Bet on which guess is closest to the answer
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-semibold text-white mb-2">3. Win</h4>
              <p className="text-[#f8eeed] text-sm">
                Earn points for accuracy and smart betting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
