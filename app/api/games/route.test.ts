import { describe, test, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock the database client
vi.mock("@/lib/db/client", () => ({
  db: {
    transaction: vi.fn(async (callback) => {
      const mockTx = {
        insert: vi.fn(() => ({
          values: vi.fn().mockResolvedValue(undefined),
        })),
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn().mockResolvedValue(undefined),
          })),
        })),
      };
      return callback(mockTx);
    }),
  },
}));

// Mock the utils
vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual("@/lib/utils");
  return {
    ...actual,
    generateUniqueJoinCode: vi.fn().mockResolvedValue("ABC123"),
  };
});

describe("POST /api/games", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("creates game with valid request", async () => {
    const requestBody = {
      title: "Test Game",
      questions: [
        {
          text: "What is 2+2?",
          correctAnswer: 4,
        },
      ],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("gameId");
    expect(data).toHaveProperty("joinCode");
    expect(data).toHaveProperty("joinUrl");
    expect(data.joinCode).toBe("ABC123");
    expect(data.joinUrl).toContain("ABC123");
  });

  test("creates game with multiple questions", async () => {
    const requestBody = {
      title: "Multi-Question Game",
      questions: [
        { text: "Question 1", correctAnswer: 10 },
        { text: "Question 2", correctAnswer: 20 },
        { text: "Question 3", correctAnswer: 30 },
      ],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.gameId).toBeDefined();
  });

  test("creates game with all optional fields", async () => {
    const requestBody = {
      title: "Complete Game",
      questions: [
        {
          text: "Main question",
          subText: "Additional context",
          correctAnswer: 42,
          answerFormat: "currency",
          followUpNotes: "Interesting fact",
        },
      ],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.gameId).toBeDefined();
  });

  test("accepts all answer format types", async () => {
    const requestBody = {
      title: "Format Test",
      questions: [
        { text: "Q1", correctAnswer: 100, answerFormat: "currency" },
        { text: "Q2", correctAnswer: 2024, answerFormat: "date" },
        { text: "Q3", correctAnswer: 75, answerFormat: "percentage" },
        { text: "Q4", correctAnswer: 42, answerFormat: "plain" },
      ],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.gameId).toBeDefined();
  });

  test("rejects request with missing title", async () => {
    const requestBody = {
      title: "",
      questions: [{ text: "Question", correctAnswer: 42 }],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Game title is required");
  });

  test("accepts request with empty questions array", async () => {
    const requestBody = {
      title: "Test Game",
      questions: [],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.gameId).toBeDefined();
    expect(data.joinCode).toBeDefined();
    expect(data.joinUrl).toBeDefined();
  });

  test("rejects request with missing question text", async () => {
    const requestBody = {
      title: "Test Game",
      questions: [{ text: "", correctAnswer: 42 }],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Question text is required for question 1");
  });

  test("rejects request with missing correct answer", async () => {
    const requestBody = {
      title: "Test Game",
      questions: [{ text: "Question" }],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe(
      "Correct answer is required for question 1",
    );
  });

  test("rejects request with invalid answer format", async () => {
    const requestBody = {
      title: "Test Game",
      questions: [
        { text: "Question", correctAnswer: 42, answerFormat: "invalid" },
      ],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toContain("Invalid answer format");
  });

  test("handles database errors gracefully", async () => {
    // Mock database to throw error
    const { db } = await import("@/lib/db/client");
    vi.mocked(db.transaction).mockRejectedValueOnce(
      new Error("Database connection failed"),
    );

    const requestBody = {
      title: "Test Game",
      questions: [{ text: "Question", correctAnswer: 42 }],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe("DATABASE_ERROR");
    expect(data.error.message).toBe("Failed to create game. Please try again.");
  });

  test("accepts questions without optional fields", async () => {
    const requestBody = {
      title: "Minimal Game",
      questions: [
        {
          text: "Question",
          correctAnswer: 42,
          // No subText, answerFormat, or followUpNotes
        },
      ],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.gameId).toBeDefined();
  });

  test("generates valid join URL", async () => {
    const requestBody = {
      title: "Test Game",
      questions: [{ text: "Question", correctAnswer: 42 }],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.joinUrl).toMatch(/^https?:\/\/.+\/join\/[A-Z0-9]+$/);
  });

  test("accepts string numbers as correct answers", async () => {
    const requestBody = {
      title: "Test Game",
      questions: [
        { text: "Question 1", correctAnswer: "42" },
        { text: "Question 2", correctAnswer: "123.45" },
      ],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.gameId).toBeDefined();
  });

  test("accepts negative numbers as correct answers", async () => {
    const requestBody = {
      title: "Test Game",
      questions: [{ text: "Question", correctAnswer: -10 }],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.gameId).toBeDefined();
  });

  test("accepts zero as correct answer", async () => {
    const requestBody = {
      title: "Test Game",
      questions: [{ text: "Question", correctAnswer: 0 }],
    };

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.gameId).toBeDefined();
  });
});
