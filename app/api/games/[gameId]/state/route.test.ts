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

describe("GET /api/games/[gameId]/state", () => {
  let mockSelect: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { db } = await import("@/lib/db/client");
    mockSelect = vi.mocked(db.select);
  });

  test("retrieves complete game state successfully", async () => {
    const mockGame = {
      id: "game1",
      title: "Test Game",
      joinCode: "ABC123",
      currentQuestionId: "question1",
      currentPhase: "guessing",
      createdAt: new Date(),
    };

    const mockQuestions = [
      {
        id: "question1",
        gameId: "game1",
        orderIndex: 0,
        text: "What is 2+2?",
        subText: "Simple math",
        correctAnswer: "4",
        answerFormat: "plain",
        followUpNotes: "Basic addition",
      },
      {
        id: "question2",
        gameId: "game1",
        orderIndex: 1,
        text: "What is 5+5?",
        subText: null,
        correctAnswer: "10",
        answerFormat: "plain",
        followUpNotes: null,
      },
    ];

    const mockPlayers = [
      {
        id: "player1",
        gameId: "game1",
        displayName: "Alice",
        score: 5,
        joinedAt: new Date(),
      },
      {
        id: "player2",
        gameId: "game1",
        displayName: "Bob",
        score: 3,
        joinedAt: new Date(),
      },
    ];

    const mockGuesses = [
      {
        id: "guess1",
        questionId: "question1",
        playerId: "player1",
        guess: "4",
        submittedAt: new Date(),
      },
      {
        id: "guess2",
        questionId: "question1",
        playerId: "player2",
        guess: "5",
        submittedAt: new Date(),
      },
    ];

    const mockBets = [
      {
        id: "bet1",
        questionId: "question1",
        playerId: "player1",
        guessId: "guess1",
        betOnZero: 0,
        placedAt: new Date(),
      },
    ];

    // Mock game query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockGame]),
        }),
      }),
    });

    // Mock questions query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockQuestions),
      }),
    });

    // Mock players query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockPlayers),
      }),
    });

    // Mock guesses queries (one per question)
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockGuesses[0]]),
      }),
    });
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockGuesses[1]]),
      }),
    });

    // Mock bets queries (one per question)
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockBets[0]]),
      }),
    });
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/state",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.game).toEqual({
      id: "game1",
      title: "Test Game",
      joinCode: "ABC123",
      currentQuestionId: "question1",
      currentPhase: "guessing",
    });
    expect(data.questions).toHaveLength(2);
    expect(data.players).toHaveLength(2);
    expect(data.guesses).toHaveLength(2);
    expect(data.bets).toHaveLength(1);
    expect(data.scores).toEqual({
      player1: 5,
      player2: 3,
    });
  });

  test("retrieves game state with no players", async () => {
    const mockGame = {
      id: "game1",
      title: "Empty Game",
      joinCode: "XYZ789",
      currentQuestionId: "question1",
      currentPhase: "guessing",
      createdAt: new Date(),
    };

    const mockQuestions = [
      {
        id: "question1",
        gameId: "game1",
        orderIndex: 0,
        text: "Test question",
        subText: null,
        correctAnswer: "42",
        answerFormat: "plain",
        followUpNotes: null,
      },
    ];

    // Mock game query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockGame]),
        }),
      }),
    });

    // Mock questions query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockQuestions),
      }),
    });

    // Mock players query (empty)
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    // Mock guesses query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    // Mock bets query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/state",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.players).toHaveLength(0);
    expect(data.scores).toEqual({});
  });

  test("retrieves game state with no guesses or bets", async () => {
    const mockGame = {
      id: "game1",
      title: "New Game",
      joinCode: "NEW123",
      currentQuestionId: "question1",
      currentPhase: "guessing",
      createdAt: new Date(),
    };

    const mockQuestions = [
      {
        id: "question1",
        gameId: "game1",
        orderIndex: 0,
        text: "First question",
        subText: null,
        correctAnswer: "100",
        answerFormat: "plain",
        followUpNotes: null,
      },
    ];

    const mockPlayers = [
      {
        id: "player1",
        gameId: "game1",
        displayName: "Charlie",
        score: 0,
        joinedAt: new Date(),
      },
    ];

    // Mock game query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockGame]),
        }),
      }),
    });

    // Mock questions query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockQuestions),
      }),
    });

    // Mock players query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockPlayers),
      }),
    });

    // Mock guesses query (empty)
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    // Mock bets query (empty)
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/state",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.guesses).toHaveLength(0);
    expect(data.bets).toHaveLength(0);
    expect(data.scores).toEqual({
      player1: 0,
    });
  });

  test("calculates scores correctly from player records", async () => {
    const mockGame = {
      id: "game1",
      title: "Score Test",
      joinCode: "SCR123",
      currentQuestionId: "question1",
      currentPhase: "reveal",
      createdAt: new Date(),
    };

    const mockQuestions = [
      {
        id: "question1",
        gameId: "game1",
        orderIndex: 0,
        text: "Question",
        subText: null,
        correctAnswer: "50",
        answerFormat: "plain",
        followUpNotes: null,
      },
    ];

    const mockPlayers = [
      {
        id: "player1",
        gameId: "game1",
        displayName: "Alice",
        score: 10,
        joinedAt: new Date(),
      },
      {
        id: "player2",
        gameId: "game1",
        displayName: "Bob",
        score: 7,
        joinedAt: new Date(),
      },
      {
        id: "player3",
        gameId: "game1",
        displayName: "Charlie",
        score: 0,
        joinedAt: new Date(),
      },
    ];

    // Mock game query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockGame]),
        }),
      }),
    });

    // Mock questions query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockQuestions),
      }),
    });

    // Mock players query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockPlayers),
      }),
    });

    // Mock guesses query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    // Mock bets query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/state",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.scores).toEqual({
      player1: 10,
      player2: 7,
      player3: 0,
    });
  });

  test("returns 404 when game not found", async () => {
    // Mock game not found
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/nonexistent/state",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe("GAME_NOT_FOUND");
    expect(data.error.message).toBe("Game not found");
  });

  test("handles database errors gracefully", async () => {
    // Mock game query to throw error
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockRejectedValue(new Error("Database connection failed")),
        }),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/state",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe("DATABASE_ERROR");
    expect(data.error.message).toContain("Failed to retrieve game state");
  });

  test("handles game with no questions", async () => {
    const mockGame = {
      id: "game1",
      title: "Empty Game",
      joinCode: "EMP123",
      currentQuestionId: null,
      currentPhase: "guessing",
      createdAt: new Date(),
    };

    // Mock game query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockGame]),
        }),
      }),
    });

    // Mock questions query (empty)
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    // Mock players query
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/games/game1/state",
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.questions).toHaveLength(0);
    expect(data.guesses).toHaveLength(0);
    expect(data.bets).toHaveLength(0);
  });
});
