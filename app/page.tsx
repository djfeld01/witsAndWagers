"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Wits & Wagers
          </h1>
          <p className="text-xl text-gray-600">
            The trivia game where you don't need to know the answer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Host Card */}
          <a
            href="/host/create"
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Host a Game
              </h2>
              <p className="text-gray-600">
                Create a new game and invite players to join
              </p>
            </div>
          </a>

          {/* Player Card */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Join a Game
              </h2>
              <p className="text-gray-600 mb-4">
                Scan the QR code or enter the join code
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
                className="mt-4"
              >
                <input
                  type="text"
                  name="code"
                  placeholder="Enter code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            How to play: Guess the answer to trivia questions, then bet on which
            guess is closest to the correct answer. Earn points for guessing
            correctly and betting wisely!
          </p>
        </div>
      </div>
    </div>
  );
}
