import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/questions/parser", () => ({
  parseCSV: vi.fn(),
  parseJSON: vi.fn(),
}));

vi.mock("@/lib/questions/validator", () => ({
  validateQuestionBatch: vi.fn(),
}));

vi.mock("@/lib/games/state", () => ({
  canEditQuestions: vi.fn(),
}));

vi.mock("@/lib/auth/host", () => ({
  verifyGameHost: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    transaction: vi.fn(),
  },
}));

import { parseCSV, parseJSON } from "@/lib/questions/parser";
import { validateQuestionBatch } from "@/lib/questions/validator";
import { canEditQuestions } from "@/lib/games/state";
import { verifyGameHost } from "@/lib/auth/host";
import { db } from "@/lib/db/client";

describe("POST /api/games/[gameId]/questions/import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthorized users", async () => {
    vi.mocked(verifyGameHost).mockResolvedValue(false);

    const formData = new FormData();
    formData.append("file", new File(["test"], "test.csv"));

    const request = new NextRequest("http://localhost/api/games/game1/questions/import", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should reject import for active games", async () => {
    vi.mocked(verifyGameHost).mockResolvedValue(true);
    vi.mocked(canEditQuestions).mockResolvedValue(false);

    const formData = new FormData();
    formData.append("file", new File(["test"], "test.csv"));

    const request = new NextRequest("http://localhost/api/games/game1/questions/import", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error.code).toBe("INVALID_STATE");
  });

  it("should reject requests without file", async () => {
    vi.mocked(verifyGameHost).mockResolvedValue(true);
    vi.mocked(canEditQuestions).mockResolvedValue(true);

    const formData = new FormData();

    const request = new NextRequest("http://localhost/api/games/game1/questions/import", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("should reject unsupported file types", async () => {
    vi.mocked(verifyGameHost).mockResolvedValue(true);
    vi.mocked(canEditQuestions).mockResolvedValue(true);

    const formData = new FormData();
    formData.append("file", new File(["test"], "test.txt"));

    const request = new NextRequest("http://localhost/api/games/game1/questions/import", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("UNSUPPORTED_FILE_TYPE");
  });

  it("should handle CSV parse errors", async () => {
    vi.mocked(verifyGameHost).mockResolvedValue(true);
    vi.mocked(canEditQuestions).mockResolvedValue(true);
    vi.mocked(parseCSV).mockResolvedValue({
      success: false,
      errors: [{ index: 0, field: "file", message: "Parse error" }],
    });

    const formData = new FormData();
    formData.append("file", new File(["invalid csv"], "test.csv"));

    const request = new NextRequest("http://localhost/api/games/game1/questions/import", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("PARSE_ERROR");
  });

  it("should handle validation errors", async () => {
    vi.mocked(verifyGameHost).mockResolvedValue(true);
    vi.mocked(canEditQuestions).mockResolvedValue(true);
    vi.mocked(parseCSV).mockResolvedValue({
      success: true,
      questions: [{ text: "", correctAnswer: 4 }],
    });
    vi.mocked(validateQuestionBatch).mockReturnValue([
      { index: 0, errors: [{ field: "text", message: "Text required" }] },
    ]);

    const formData = new FormData();
    formData.append("file", new File(["text,correctAnswer\n,4"], "test.csv"));

    const request = new NextRequest("http://localhost/api/games/game1/questions/import", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("should successfully import valid CSV", async () => {
    vi.mocked(verifyGameHost).mockResolvedValue(true);
    vi.mocked(canEditQuestions).mockResolvedValue(true);
    vi.mocked(parseCSV).mockResolvedValue({
      success: true,
      questions: [
        { text: "Question 1", correctAnswer: 4 },
        { text: "Question 2", correctAnswer: 42 },
      ],
    });
    vi.mocked(validateQuestionBatch).mockReturnValue([]);

    // Mock database operations
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ maxOrder: 0 }]),
      }),
    } as any);

    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      return callback({
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);
    });

    const formData = new FormData();
    formData.append("file", new File(["text,correctAnswer\nQ1,4\nQ2,42"], "test.csv"));

    const request = new NextRequest("http://localhost/api/games/game1/questions/import", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, {
      params: Promise.resolve({ gameId: "game1" }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.imported).toBe(2);
  });
});
