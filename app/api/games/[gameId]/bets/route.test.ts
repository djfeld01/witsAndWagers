import { describe, test, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock the database client
vi.mock("@/lib/db/client", () => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();

  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
    },
  };
});

describe("POST /api/games/[gameId]/bets", () => {
  let mockSelect: any;
  let mockInsert: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { db } = await import("@/lib/db/client");
    mockSelect = vi.mocked(db.select);
    mockInsert = vi.mocked(db.insert);
  });

  test("successfully places a bet on a guess", async () => {
    // Mock player exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "player1" }]),
        }),
      }),
    });

    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock game exists with betting phase
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "betting" }]),
        }),
      }),
    });

    // Mock guess exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "guess1" }]),
        }),
      }),
    });

    // Mock no existing bet
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    // Mock insert
    mockInsert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guessId: "guess1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("betId");
    expect(typeof data.betId).toBe("string");
  });

  test("successfully places a bet on zero", async () => {
    // Mock player exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "player1" }]),
        }),
      }),
    });

    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock game exists with betting phase
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "betting" }]),
        }),
      }),
    });

    // Mock no existing bet
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    // Mock insert
    mockInsert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      betOnZero: true,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("betId");
    expect(typeof data.betId).toBe("string");
  });

  test("allows player to bet on their own guess", async () => {
    // Mock player exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "player1" }]),
        }),
      }),
    });

    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock game exists with betting phase
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "betting" }]),
        }),
      }),
    });

    // Mock guess exists (player's own guess)
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "guess1", playerId: "player1" }]),
        }),
      }),
    });

    // Mock no existing bet
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    // Mock insert
    mockInsert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guessId: "guess1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });

    expect(response.status).toBe(201);
  });

  test("rejects missing playerId", async () => {
    const requestBody = {
      questionId: "question1",
      guessId: "guess1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  test("rejects missing questionId", async () => {
    const requestBody = {
      playerId: "player1",
      guessId: "guess1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  test("rejects when neither guessId nor betOnZero provided", async () => {
    const requestBody = {
      playerId: "player1",
      questionId: "question1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toContain("guessId or betOnZero");
  });

  test("rejects when player not found", async () => {
    // Mock player not found
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const requestBody = {
      playerId: "nonexistent",
      questionId: "question1",
      guessId: "guess1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Player not found");
  });

  test("rejects when question not found", async () => {
    // Mock player exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "player1" }]),
        }),
      }),
    });

    // Mock question not found
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "nonexistent",
      guessId: "guess1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Question not found");
  });

  test("rejects when game not found", async () => {
    // Mock player exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "player1" }]),
        }),
      }),
    });

    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock game not found
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guessId: "guess1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/nonexistent/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe("GAME_NOT_FOUND");
    expect(data.error.message).toBe("Game not found");
  });

  test("rejects when not in betting phase", async () => {
    // Mock player exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "player1" }]),
        }),
      }),
    });

    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock game in guessing phase
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "guessing" }]),
        }),
      }),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guessId: "guess1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("INVALID_PHASE");
    expect(data.error.message).toContain("betting phase");
  });

  test("rejects when guess not found", async () => {
    // Mock player exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "player1" }]),
        }),
      }),
    });

    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock game exists with betting phase
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "betting" }]),
        }),
      }),
    });

    // Mock guess not found
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guessId: "nonexistent",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Guess not found");
  });

  test("rejects duplicate bet from same player", async () => {
    // Mock player exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "player1" }]),
        }),
      }),
    });

    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock game exists with betting phase
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "betting" }]),
        }),
      }),
    });

    // Mock guess exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "guess1" }]),
        }),
      }),
    });

    // Mock existing bet found
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([
              { id: "bet1", playerId: "player1", questionId: "question1" },
            ]),
        }),
      }),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guessId: "guess1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("DUPLICATE_SUBMISSION");
    expect(data.error.message).toContain("already placed a bet");
  });

  test("handles database errors gracefully", async () => {
    // Mock player query to throw error
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockRejectedValue(new Error("Database error")),
        }),
      }),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guessId: "guess1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/bets",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe("DATABASE_ERROR");
  });
});
