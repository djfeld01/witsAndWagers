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

describe("POST /api/games/[gameId]/guesses", () => {
  let mockSelect: any;
  let mockInsert: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { db } = await import("@/lib/db/client");
    mockSelect = vi.mocked(db.select);
    mockInsert = vi.mocked(db.insert);
  });

  test("successfully submits a valid guess", async () => {
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

    // Mock game exists with guessing phase
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "guessing" }]),
        }),
      }),
    });

    // Mock no existing guess
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
      guess: 42,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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
    expect(data).toHaveProperty("guessId");
    expect(typeof data.guessId).toBe("string");
  });

  test("accepts decimal guess", async () => {
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "player1" }]),
        }),
      }),
    });

    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "guessing" }]),
        }),
      }),
    });

    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    mockInsert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guess: 123.45,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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

  test("accepts negative guess", async () => {
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "player1" }]),
        }),
      }),
    });

    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "guessing" }]),
        }),
      }),
    });

    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    mockInsert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guess: -10,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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
      guess: 42,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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
      guess: 42,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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

  test("rejects missing guess", async () => {
    const requestBody = {
      playerId: "player1",
      questionId: "question1",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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

  test("rejects non-numerical guess", async () => {
    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guess: "not a number",
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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
    expect(data.error.message).toContain("valid number");
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
      guess: 42,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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
      guess: 42,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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
      guess: 42,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/nonexistent/guesses",
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

  test("rejects when not in guessing phase", async () => {
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

    // Mock game in betting phase
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "betting" }]),
        }),
      }),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guess: 42,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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
    expect(data.error.message).toContain("guessing phase");
  });

  test("rejects duplicate guess from same player", async () => {
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

    // Mock game exists with guessing phase
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: "game1", currentPhase: "guessing" }]),
        }),
      }),
    });

    // Mock existing guess found
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([
              { id: "guess1", playerId: "player1", questionId: "question1" },
            ]),
        }),
      }),
    });

    const requestBody = {
      playerId: "player1",
      questionId: "question1",
      guess: 42,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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
    expect(data.error.message).toContain("already submitted");
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
      guess: 42,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/guesses",
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
