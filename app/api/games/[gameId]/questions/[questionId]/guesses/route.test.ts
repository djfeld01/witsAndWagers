import { describe, test, expect, beforeEach, vi } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// Mock the database client
vi.mock("@/lib/db/client", () => {
  const mockSelect = vi.fn();

  return {
    db: {
      select: mockSelect,
    },
  };
});

describe("GET /api/games/[gameId]/questions/[questionId]/guesses", () => {
  let mockSelect: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { db } = await import("@/lib/db/client");
    mockSelect = vi.mocked(db.select);
  });

  test("retrieves guesses sorted in ascending order", async () => {
    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock guesses (unsorted)
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: "guess1", guess: "150", playerId: "player1" },
          { id: "guess2", guess: "50", playerId: "player2" },
          { id: "guess3", guess: "100", playerId: "player3" },
        ]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/questions/question1/guesses",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1", questionId: "question1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.guesses).toHaveLength(4); // 3 guesses + zero
    expect(data.guesses[0].value).toBe(0); // Zero should be first
    expect(data.guesses[1].value).toBe(50);
    expect(data.guesses[2].value).toBe(100);
    expect(data.guesses[3].value).toBe(150);
  });

  test("always includes zero as an option", async () => {
    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock guesses without zero
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: "guess1", guess: "100", playerId: "player1" },
          { id: "guess2", guess: "200", playerId: "player2" },
        ]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/questions/question1/guesses",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1", questionId: "question1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.guesses).toHaveLength(3); // 2 guesses + zero

    // Check zero is included
    const zeroGuess = data.guesses.find(
      (g: { value: number }) => g.value === 0,
    );
    expect(zeroGuess).toBeDefined();
    expect(zeroGuess.id).toBeNull();
    expect(zeroGuess.playerId).toBeNull();
  });

  test("does not duplicate zero if already submitted", async () => {
    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock guesses including zero
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: "guess1", guess: "0", playerId: "player1" },
          { id: "guess2", guess: "100", playerId: "player2" },
        ]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/questions/question1/guesses",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1", questionId: "question1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.guesses).toHaveLength(2); // 2 guesses, no duplicate zero

    // Check only one zero exists
    const zeroGuesses = data.guesses.filter(
      (g: { value: number }) => g.value === 0,
    );
    expect(zeroGuesses).toHaveLength(1);
  });

  test("handles empty guess list", async () => {
    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock no guesses
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/questions/question1/guesses",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1", questionId: "question1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.guesses).toHaveLength(1); // Only zero
    expect(data.guesses[0].value).toBe(0);
    expect(data.guesses[0].id).toBeNull();
    expect(data.guesses[0].playerId).toBeNull();
  });

  test("handles negative guesses correctly", async () => {
    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock guesses with negative values
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: "guess1", guess: "50", playerId: "player1" },
          { id: "guess2", guess: "-10", playerId: "player2" },
          { id: "guess3", guess: "-50", playerId: "player3" },
        ]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/questions/question1/guesses",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1", questionId: "question1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.guesses).toHaveLength(4); // 3 guesses + zero
    expect(data.guesses[0].value).toBe(-50);
    expect(data.guesses[1].value).toBe(-10);
    expect(data.guesses[2].value).toBe(0);
    expect(data.guesses[3].value).toBe(50);
  });

  test("handles decimal guesses correctly", async () => {
    // Mock question exists
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "question1" }]),
        }),
      }),
    });

    // Mock guesses with decimal values
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: "guess1", guess: "123.45", playerId: "player1" },
          { id: "guess2", guess: "50.5", playerId: "player2" },
          { id: "guess3", guess: "200.99", playerId: "player3" },
        ]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/questions/question1/guesses",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1", questionId: "question1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.guesses).toHaveLength(4); // 3 guesses + zero
    expect(data.guesses[0].value).toBe(0);
    expect(data.guesses[1].value).toBe(50.5);
    expect(data.guesses[2].value).toBe(123.45);
    expect(data.guesses[3].value).toBe(200.99);
  });

  test("rejects when question not found", async () => {
    // Mock question not found
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/questions/nonexistent/guesses",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1", questionId: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Question not found");
  });

  test("handles database errors gracefully", async () => {
    // Mock question query to throw error
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockRejectedValue(new Error("Database error")),
        }),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/questions/question1/guesses",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1", questionId: "question1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe("DATABASE_ERROR");
  });
});
