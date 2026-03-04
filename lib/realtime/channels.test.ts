import { describe, test, expect } from "vitest";
import { getGameChannelName } from "./channels";

describe("Channel utilities", () => {
  describe("getGameChannelName", () => {
    test("should format channel name with game ID", () => {
      const gameId = "test-game-123";
      const channelName = getGameChannelName(gameId);
      expect(channelName).toBe("game:test-game-123");
    });

    test("should handle different game IDs", () => {
      expect(getGameChannelName("abc")).toBe("game:abc");
      expect(getGameChannelName("xyz-789")).toBe("game:xyz-789");
      expect(getGameChannelName("game1")).toBe("game:game1");
    });

    test("should create unique channel names for different games", () => {
      const channel1 = getGameChannelName("game1");
      const channel2 = getGameChannelName("game2");
      expect(channel1).not.toBe(channel2);
    });
  });
});
