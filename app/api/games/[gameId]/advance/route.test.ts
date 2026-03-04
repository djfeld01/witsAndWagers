import { describe, test, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock the database client
vi.mock("@/lib/db/client", () => {
  const mockSelect = vi.fn();
  const mockUpdate = vi.fn();

  return {
    db: {
      select: mockSelect,
      update: mockUpdate,
    },
  };
});

// Mock the utils
vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual("@/lib/utils");
  return {
    ...actual,
    calculateScoring: vi.fn(),
  };
});

describe("POST /api/games/[gameId]/advance", () => {
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockCalculateScoring: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { db } = await import("@/lib/db/client");
    const utils = await import("@/lib/utils");
    mockSelect = vi.mocked(db.select);
    mockUpdate = vi.mocked(db.update);
    mockCalculateScoring = vi.mocked(utils.calculateScoring);
  });

  describe("validation", () => {
    test("rejects request without targetPhase", async () => {
      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("targetPhase is required");
    });

    test("rejects invalid targetPhase value", async () => {
      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "invalid" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("must be one of");
    });

    test("rejects request for non-existent game", async () => {
      // Mock game not found
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "betting" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "nonexistent" }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe("GAME_NOT_FOUND");
    });
  });

  describe("phase transition validation", () => {
    test("allows guessing → betting transition", async () => {
      // Mock game exists with guessing phase
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "guessing",
                currentQuestionId: "question1",
              },
            ]),
          }),
        }),
      });

      // Mock update
      mockUpdate.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "betting" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.currentPhase).toBe("betting");
      expect(mockUpdate).toHaveBeenCalled();
    });

    test("allows betting → reveal transition", async () => {
      // Mock game exists with betting phase
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "betting",
                currentQuestionId: "question1",
              },
            ]),
          }),
        }),
      });

      // Mock question exists
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "question1",
                correctAnswer: "100",
              },
            ]),
          }),
        }),
      });

      // Mock guesses
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { id: "guess1", playerId: "player1", guess: "90" },
            ]),
        }),
      });

      // Mock bets
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock player for score update
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "player1", score: 0 }]),
          }),
        }),
      });

      // Mock calculateScoring
      mockCalculateScoring.mockReturnValue({
        closestGuessId: "guess1",
        scoreChanges: { player1: 1 },
      });

      // Mock update for player score
      mockUpdate.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      // Mock update for game phase
      mockUpdate.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "reveal" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.currentPhase).toBe("reveal");
      expect(data.scores).toBeDefined();
    });

    test("allows reveal → guessing transition", async () => {
      // Mock game exists with reveal phase
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "reveal",
                currentQuestionId: "question1",
              },
            ]),
          }),
        }),
      });

      // Mock update
      mockUpdate.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "guessing" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.currentPhase).toBe("guessing");
    });

    test("rejects guessing → reveal transition (skipping betting)", async () => {
      // Mock game exists with guessing phase
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "guessing",
                currentQuestionId: "question1",
              },
            ]),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "reveal" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("INVALID_PHASE");
      expect(data.error.message).toContain("Cannot transition");
    });

    test("rejects betting → guessing transition (going backwards)", async () => {
      // Mock game exists with betting phase
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "betting",
                currentQuestionId: "question1",
              },
            ]),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "guessing" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("INVALID_PHASE");
    });

    test("rejects reveal → betting transition (going backwards)", async () => {
      // Mock game exists with reveal phase
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "reveal",
                currentQuestionId: "question1",
              },
            ]),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "betting" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("INVALID_PHASE");
    });
  });

  describe("scoring on reveal phase", () => {
    test("calculates and updates scores when advancing to reveal", async () => {
      // Mock game exists with betting phase
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "betting",
                currentQuestionId: "question1",
              },
            ]),
          }),
        }),
      });

      // Mock question exists
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "question1",
                correctAnswer: "100",
              },
            ]),
          }),
        }),
      });

      // Mock guesses
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: "guess1", playerId: "player1", guess: "90" },
            { id: "guess2", playerId: "player2", guess: "150" },
          ]),
        }),
      });

      // Mock bets
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              id: "bet1",
              playerId: "player3",
              guessId: "guess1",
              betOnZero: 0,
            },
          ]),
        }),
      });

      // Mock calculateScoring
      mockCalculateScoring.mockReturnValue({
        closestGuessId: "guess1",
        scoreChanges: { player1: 1, player3: 1 },
      });

      // Mock player lookups for score updates
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "player1", score: 0 }]),
          }),
        }),
      });

      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "player3", score: 0 }]),
          }),
        }),
      });

      // Mock updates for player scores
      mockUpdate.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      mockUpdate.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      // Mock update for game phase
      mockUpdate.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "reveal" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.currentPhase).toBe("reveal");
      expect(data.scores).toEqual({ player1: 1, player3: 1 });
      expect(mockCalculateScoring).toHaveBeenCalled();
    });

    test("handles player betting on their own guess", async () => {
      // Mock game exists with betting phase
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "betting",
                currentQuestionId: "question1",
              },
            ]),
          }),
        }),
      });

      // Mock question exists
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "question1",
                correctAnswer: "100",
              },
            ]),
          }),
        }),
      });

      // Mock guesses
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { id: "guess1", playerId: "player1", guess: "100" },
            ]),
        }),
      });

      // Mock bets
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              id: "bet1",
              playerId: "player1",
              guessId: "guess1",
              betOnZero: 0,
            },
          ]),
        }),
      });

      // Mock calculateScoring - player gets 2 points
      mockCalculateScoring.mockReturnValue({
        closestGuessId: "guess1",
        scoreChanges: { player1: 2 },
      });

      // Mock player lookup for score update
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "player1", score: 0 }]),
          }),
        }),
      });

      // Mock update for player score
      mockUpdate.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      // Mock update for game phase
      mockUpdate.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "reveal" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.scores).toEqual({ player1: 2 });
    });

    test("does not include scores when not advancing to reveal", async () => {
      // Mock game exists with guessing phase
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "guessing",
                currentQuestionId: "question1",
              },
            ]),
          }),
        }),
      });

      // Mock update
      mockUpdate.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "betting" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.currentPhase).toBe("betting");
      expect(data.scores).toBeUndefined();
    });
  });

  describe("error handling", () => {
    test("handles missing currentQuestionId when advancing to reveal", async () => {
      // Mock game exists with betting phase but no currentQuestionId
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "betting",
                currentQuestionId: null,
              },
            ]),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "reveal" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("No current question");
    });

    test("handles invalid currentQuestionId when advancing to reveal", async () => {
      // Mock game exists with betting phase
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "game1",
                currentPhase: "betting",
                currentQuestionId: "nonexistent",
              },
            ]),
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

      const request = new NextRequest("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ targetPhase: "reveal" }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ gameId: "game1" }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("Current question not found");
    });
  });
});
