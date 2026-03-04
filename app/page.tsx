"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#f7f5d4] via-[#faddd1] to-[#e4eedd] flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <h1 className="text-6xl font-bold bg-linear-to-r from-[#78ac53] via-[#e75618] to-[#b85447] bg-clip-text text-transparent drop-shadow-lg">
              #Trivia
            </h1>
          </div>
          <p className="text-xl text-[#6e332b] font-medium mb-2">
            Guess. Bet. Win.
          </p>
          <p className="text-base text-[#486732] max-w-xl mx-auto">
            The trivia game where you don't need to know the answer—just guess
            close and bet smart
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Host Card */}
          <a
            href="/host/create"
            className="group bg-linear-to-br from-[#aecd98] to-[#78ac53] p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-[#608a42] hover:border-[#486732] hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-[#ddd755] to-[#adc33c] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-[#1a0c0a]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1a0c0a] mb-2">
                Host a Game
              </h2>
              <p className="text-[#49221d] text-base">
                Create questions and run the show
              </p>
            </div>
          </a>

          {/* Player Card */}
          <div className="bg-linear-to-br from-[#f09a75] to-[#ec7846] p-8 rounded-xl shadow-xl border-2 border-[#e75618]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-[#ddd755] to-[#d5cc2a] rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-[#1a0c0a]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Join a Game
              </h2>
              <p className="text-white mb-4 text-base">Enter your game code</p>
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
                  className="w-full px-4 py-3 border-2 border-white rounded-lg focus:ring-2 focus:ring-[#d5cc2a] focus:border-[#d5cc2a] mb-3 text-center text-lg font-mono uppercase tracking-wider bg-white/90"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-[#d5cc2a] to-[#adc33c] text-[#1a0c0a] py-3 px-4 rounded-lg hover:from-[#aaa422] hover:to-[#8a9c30] font-bold text-base shadow-lg hover:shadow-xl transition-all"
                >
                  Join Game
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-linear-to-br from-[#d49991] to-[#c6776c] rounded-xl p-6 border-2 border-[#b85447] shadow-xl">
          <h3 className="text-xl font-bold text-white mb-3 text-center">
            How to Play
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-white mb-1 text-sm">
                1. Guess
              </h4>
              <p className="text-[#f8eeed] text-xs">
                Submit your best guess to numerical trivia questions
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-white mb-1 text-sm">2. Bet</h4>
              <p className="text-[#f8eeed] text-xs">
                Bet on which guess is closest to the answer
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-white mb-1 text-sm">3. Win</h4>
              <p className="text-[#f8eeed] text-xs">
                Earn points for accuracy and smart betting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
