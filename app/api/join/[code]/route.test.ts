import { describe, test, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";

// Mock the database client
vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

/**
 * Test suite for POST /api/games/[code]/join
 * Tests player join functionality including validation and database operations
 */
describe("POST /api/games/[code]/join", () => {
  let testGameId: string;
  let testJoinCode: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    testGameId = "test-game-id-123";
    testJoinCode = "TEST01";
  });

  describe("Successful join", () => {
    test("should allow player to join with valid display name", async () => {
      // Mock game exists
      const { db } = await import("@/lib/db/client");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testGameId }]),
          }),
        }),
      } as any);

      const request = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName: "Alice" }),
      });

      const response = await POST(request as any, {
        params: { code: testJoinCode },
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.playerId).toBeDefined();
      expect(data.gameId).toBe(testGameId);
    });

    test("should initialize player score to 0", async () => {
      // Mock game exists
      const { db } = await import("@/lib/db/client");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testGameId }]),
          }),
        }),
      } as any);

      const insertMock = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      vi.mocked(db.insert).mockReturnValue(insertMock() as any);

      const request = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName: "Bob" }),
      });

      await POST(request as any, {
        params: { code: testJoinCode },
      });

      // Verify insert was called with score: 0
      expect(db.insert).toHaveBeenCalled();
      const insertCall = vi.mocked(db.insert).mock.results[0].value;
      expect(insertCall.values).toHaveBeenCalledWith(
        expect.objectContaining({ score: 0 }),
      );
    });

    test("should generate unique player IDs for multiple players", async () => {
      // Mock game exists
      const { db } = await import("@/lib/db/client");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testGameId }]),
          }),
        }),
      } as any);

      const request1 = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName: "Player1" }),
      });

      const request2 = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName: "Player2" }),
      });

      const response1 = await POST(request1 as any, {
        params: { code: testJoinCode },
      });
      const response2 = await POST(request2 as any, {
        params: { code: testJoinCode },
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.playerId).not.toBe(data2.playerId);
    });

    test("should accept display name with 1 character", async () => {
      // Mock game exists
      const { db } = await import("@/lib/db/client");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testGameId }]),
          }),
        }),
      } as any);

      const request = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName: "A" }),
      });

      const response = await POST(request as any, {
        params: { code: testJoinCode },
      });

      expect(response.status).toBe(201);
    });

    test("should accept display name with 30 characters", async () => {
      // Mock game exists
      const { db } = await import("@/lib/db/client");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testGameId }]),
          }),
        }),
      } as any);

      const displayName = "A".repeat(30);
      const request = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName }),
      });

      const response = await POST(request as any, {
        params: { code: testJoinCode },
      });

      expect(response.status).toBe(201);
    });
  });

  describe("Display name validation", () => {
    test("should reject empty display name", async () => {
      const request = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName: "" }),
      });

      const response = await POST(request as any, {
        params: { code: testJoinCode },
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("1 and 30 characters");
    });

    test("should reject display name longer than 30 characters", async () => {
      const displayName = "A".repeat(31);
      const request = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName }),
      });

      const response = await POST(request as any, {
        params: { code: testJoinCode },
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("1 and 30 characters");
    });
  });

  describe("Join code validation", () => {
    test("should reject non-existent join code", async () => {
      // Mock game does NOT exist (empty result)
      const { db } = await import("@/lib/db/client");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // Empty array = game not found
          }),
        }),
      } as any);

      const request = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName: "Alice" }),
      });

      const response = await POST(request as any, {
        params: { code: "INVALID" },
      });

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error.code).toBe("GAME_NOT_FOUND");
      expect(data.error.message).toContain("Invalid join code");
    });
  });

  describe("Database operations", () => {
    test("should persist player information to database", async () => {
      // Mock game exists
      const { db } = await import("@/lib/db/client");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testGameId }]),
          }),
        }),
      } as any);

      const insertMock = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      vi.mocked(db.insert).mockReturnValue(insertMock() as any);

      const displayName = "TestPlayer";
      const request = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName }),
      });

      await POST(request as any, {
        params: { code: testJoinCode },
      });

      // Verify insert was called with correct data
      expect(db.insert).toHaveBeenCalled();
      const insertCall = vi.mocked(db.insert).mock.results[0].value;
      expect(insertCall.values).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName,
          gameId: testGameId,
          score: 0,
        }),
      );
    });

    test("should allow multiple players to join the same game", async () => {
      // Mock game exists
      const { db } = await import("@/lib/db/client");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testGameId }]),
          }),
        }),
      } as any);

      const request1 = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName: "Player1" }),
      });

      const request2 = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName: "Player2" }),
      });

      const request3 = new Request("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ displayName: "Player3" }),
      });

      const response1 = await POST(request1 as any, {
        params: { code: testJoinCode },
      });
      const response2 = await POST(request2 as any, {
        params: { code: testJoinCode },
      });
      const response3 = await POST(request3 as any, {
        params: { code: testJoinCode },
      });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response3.status).toBe(201);

      // Verify insert was called 3 times
      expect(db.insert).toHaveBeenCalledTimes(3);
    });
  });
});
