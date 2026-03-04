import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatNumber,
  validateDisplayName,
  validateGuess,
  validateGameCreation,
  generateQRCode,
  calculateScoring,
  type Guess,
  type Bet,
} from "./utils";

describe("Setup verification", () => {
  test("vitest is working", () => {
    expect(1 + 1).toBe(2);
  });
});

describe("generateUniqueJoinCode", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("generates a 6-character code", async () => {
    // Mock the database to return no existing codes
    vi.doMock("./db/client", () => ({
      db: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      },
    }));

    const { generateUniqueJoinCode } = await import("./utils");
    const code = await generateUniqueJoinCode();
    expect(code).toHaveLength(6);
  });

  test("generates alphanumeric code with allowed characters only", async () => {
    vi.doMock("./db/client", () => ({
      db: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      },
    }));

    const { generateUniqueJoinCode } = await import("./utils");
    const code = await generateUniqueJoinCode();
    const allowedChars = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]+$/;
    expect(code).toMatch(allowedChars);
  });

  test("excludes ambiguous characters (0, O, I, l)", async () => {
    vi.doMock("./db/client", () => ({
      db: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      },
    }));

    const { generateUniqueJoinCode } = await import("./utils");
    const code = await generateUniqueJoinCode();
    expect(code).not.toContain("0");
    expect(code).not.toContain("O");
    expect(code).not.toContain("I");
    expect(code).not.toContain("l");
  });

  test("generates unique codes on multiple calls", async () => {
    vi.doMock("./db/client", () => ({
      db: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      },
    }));

    const { generateUniqueJoinCode } = await import("./utils");
    const codes = new Set<string>();
    const numCodes = 20;

    for (let i = 0; i < numCodes; i++) {
      const code = await generateUniqueJoinCode();
      codes.add(code);
    }

    // All codes should be unique
    expect(codes.size).toBe(numCodes);
  });

  test("detects collision and retries when code exists in database", async () => {
    let callCount = 0;

    vi.doMock("./db/client", () => ({
      db: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => {
                callCount++;
                // First call returns existing code, subsequent calls return empty
                if (callCount === 1) {
                  return Promise.resolve([{ joinCode: "EXISTING" }]);
                }
                return Promise.resolve([]);
              },
            }),
          }),
        }),
      },
    }));

    const { generateUniqueJoinCode } = await import("./utils");
    const newCode = await generateUniqueJoinCode();

    expect(newCode).toHaveLength(6);
    expect(callCount).toBeGreaterThan(1); // Should have checked database multiple times
  });

  test("throws error after max retries if all codes collide", async () => {
    // Mock database to always return that code exists
    vi.doMock("./db/client", () => ({
      db: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([{ joinCode: "EXISTS" }]),
            }),
          }),
        }),
      },
    }));

    const { generateUniqueJoinCode } = await import("./utils");

    // Should throw after max retries
    await expect(generateUniqueJoinCode()).rejects.toThrow(
      /Failed to generate unique join code after \d+ attempts/,
    );
  });

  test("generates different codes on subsequent calls", async () => {
    vi.doMock("./db/client", () => ({
      db: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      },
    }));

    const { generateUniqueJoinCode } = await import("./utils");
    const code1 = await generateUniqueJoinCode();
    const code2 = await generateUniqueJoinCode();

    // While theoretically they could be the same, with 6 characters
    // and 33 possible characters per position, the probability is very low
    expect(code1).not.toBe(code2);
  });

  test("code format is uppercase", async () => {
    vi.doMock("./db/client", () => ({
      db: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      },
    }));

    const { generateUniqueJoinCode } = await import("./utils");
    const code = await generateUniqueJoinCode();
    expect(code).toBe(code.toUpperCase());
  });
});

describe("formatNumber", () => {
  describe("currency format", () => {
    test("formats positive number with dollar sign and two decimal places", () => {
      expect(formatNumber(1234.5, "currency")).toBe("$1234.50");
    });

    test("formats integer with two decimal places", () => {
      expect(formatNumber(100, "currency")).toBe("$100.00");
    });

    test("rounds to two decimal places", () => {
      expect(formatNumber(1234.567, "currency")).toBe("$1234.57");
      expect(formatNumber(1234.564, "currency")).toBe("$1234.56");
    });

    test("formats zero correctly", () => {
      expect(formatNumber(0, "currency")).toBe("$0.00");
    });

    test("formats negative numbers", () => {
      expect(formatNumber(-50.25, "currency")).toBe("$-50.25");
    });

    test("formats very large numbers", () => {
      expect(formatNumber(1000000, "currency")).toBe("$1000000.00");
    });

    test("formats very small decimal numbers", () => {
      expect(formatNumber(0.01, "currency")).toBe("$0.01");
      expect(formatNumber(0.005, "currency")).toBe("$0.01"); // Rounds up
    });
  });

  describe("date format", () => {
    test("formats year as integer", () => {
      expect(formatNumber(2024, "date")).toBe("2024");
    });

    test("rounds decimal to nearest integer", () => {
      expect(formatNumber(2024.6, "date")).toBe("2025");
      expect(formatNumber(2024.4, "date")).toBe("2024");
    });

    test("formats historical years", () => {
      expect(formatNumber(1776, "date")).toBe("1776");
    });

    test("formats negative years (BCE)", () => {
      expect(formatNumber(-500, "date")).toBe("-500");
    });

    test("formats zero", () => {
      expect(formatNumber(0, "date")).toBe("0");
    });
  });

  describe("percentage format", () => {
    test("formats integer with percent sign", () => {
      expect(formatNumber(75, "percentage")).toBe("75%");
    });

    test("rounds decimal to nearest integer", () => {
      expect(formatNumber(75.6, "percentage")).toBe("76%");
      expect(formatNumber(75.4, "percentage")).toBe("75%");
    });

    test("formats zero", () => {
      expect(formatNumber(0, "percentage")).toBe("0%");
    });

    test("formats negative percentages", () => {
      expect(formatNumber(-10, "percentage")).toBe("-10%");
    });

    test("formats percentages over 100", () => {
      expect(formatNumber(150, "percentage")).toBe("150%");
    });

    test("formats decimal percentages", () => {
      expect(formatNumber(33.333, "percentage")).toBe("33%");
    });
  });

  describe("plain format", () => {
    test("formats integer as string", () => {
      expect(formatNumber(123, "plain")).toBe("123");
    });

    test("formats decimal as string", () => {
      expect(formatNumber(123.45, "plain")).toBe("123.45");
    });

    test("formats zero", () => {
      expect(formatNumber(0, "plain")).toBe("0");
    });

    test("formats negative numbers", () => {
      expect(formatNumber(-42, "plain")).toBe("-42");
    });

    test("formats very large numbers", () => {
      expect(formatNumber(1000000, "plain")).toBe("1000000");
    });

    test("preserves decimal precision", () => {
      expect(formatNumber(3.14159, "plain")).toBe("3.14159");
    });
  });

  describe("edge cases", () => {
    test("handles very large numbers in currency format", () => {
      expect(formatNumber(999999999.99, "currency")).toBe("$999999999.99");
    });

    test("handles very small numbers in currency format", () => {
      expect(formatNumber(0.001, "currency")).toBe("$0.00");
    });

    test("handles negative zero", () => {
      expect(formatNumber(-0, "plain")).toBe("0");
    });

    test("handles decimal precision edge cases", () => {
      // Test floating point precision issues
      expect(formatNumber(0.1 + 0.2, "currency")).toBe("$0.30");
    });
  });
});

describe("validateDisplayName", () => {
  test("accepts valid display names", () => {
    expect(validateDisplayName("John").valid).toBe(true);
    expect(validateDisplayName("A").valid).toBe(true);
    expect(validateDisplayName("Player123").valid).toBe(true);
    expect(validateDisplayName("A".repeat(30)).valid).toBe(true);
  });

  test("rejects empty display names", () => {
    const result = validateDisplayName("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Display name must be between 1 and 30 characters",
    );
  });

  test("rejects display names longer than 30 characters", () => {
    const result = validateDisplayName("A".repeat(31));
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Display name must be between 1 and 30 characters",
    );
  });

  test("accepts display names with special characters", () => {
    expect(validateDisplayName("John Doe").valid).toBe(true);
    expect(validateDisplayName("Player-123").valid).toBe(true);
    expect(validateDisplayName("User_Name").valid).toBe(true);
    expect(validateDisplayName("Player#1").valid).toBe(true);
  });

  test("accepts display names with unicode characters", () => {
    expect(validateDisplayName("José").valid).toBe(true);
    expect(validateDisplayName("李明").valid).toBe(true);
    expect(validateDisplayName("🎮Player").valid).toBe(true);
  });

  test("boundary test: exactly 1 character", () => {
    expect(validateDisplayName("X").valid).toBe(true);
  });

  test("boundary test: exactly 30 characters", () => {
    const name30 = "A".repeat(30);
    expect(validateDisplayName(name30).valid).toBe(true);
  });
});

describe("validateGuess", () => {
  test("accepts valid integer guesses", () => {
    expect(validateGuess(42).valid).toBe(true);
    expect(validateGuess(0).valid).toBe(true);
    expect(validateGuess(-10).valid).toBe(true);
    expect(validateGuess(1000000).valid).toBe(true);
  });

  test("accepts valid decimal guesses", () => {
    expect(validateGuess(123.45).valid).toBe(true);
    expect(validateGuess(0.5).valid).toBe(true);
    expect(validateGuess(-3.14).valid).toBe(true);
  });

  test("accepts string representations of numbers", () => {
    expect(validateGuess("42").valid).toBe(true);
    expect(validateGuess("123.45").valid).toBe(true);
    expect(validateGuess("-10").valid).toBe(true);
    expect(validateGuess("0").valid).toBe(true);
  });

  test("rejects non-numerical strings", () => {
    const result = validateGuess("abc");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Guess must be a valid number");
  });

  test("rejects empty strings", () => {
    const result = validateGuess("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Guess must be a valid number");
  });

  test("accepts strings with partial numeric content", () => {
    // parseFloat is lenient and parses until it hits non-numeric content
    // This is acceptable behavior - "123abc" becomes 123
    expect(validateGuess("123abc").valid).toBe(true);
    expect(validateGuess("12.34.56").valid).toBe(true); // Becomes 12.34
  });

  test("rejects Infinity", () => {
    const result = validateGuess(Infinity);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Guess must be a valid number");
  });

  test("rejects -Infinity", () => {
    const result = validateGuess(-Infinity);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Guess must be a valid number");
  });

  test("rejects NaN", () => {
    const result = validateGuess(NaN);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Guess must be a valid number");
  });

  test("accepts scientific notation", () => {
    expect(validateGuess("1e5").valid).toBe(true);
    expect(validateGuess("1.5e-3").valid).toBe(true);
  });

  test("accepts very large numbers", () => {
    expect(validateGuess(999999999999).valid).toBe(true);
    expect(validateGuess("999999999999").valid).toBe(true);
  });

  test("accepts very small decimal numbers", () => {
    expect(validateGuess(0.0001).valid).toBe(true);
    expect(validateGuess("0.0001").valid).toBe(true);
  });
});

describe("validateGameCreation", () => {
  test("accepts valid game creation input", () => {
    const input = {
      title: "My Game",
      questions: [
        {
          text: "What is 2+2?",
          correctAnswer: 4,
        },
      ],
    };

    expect(validateGameCreation(input).valid).toBe(true);
  });

  test("accepts game with multiple questions", () => {
    const input = {
      title: "Trivia Night",
      questions: [
        { text: "Question 1", correctAnswer: 10 },
        { text: "Question 2", correctAnswer: 20 },
        { text: "Question 3", correctAnswer: 30 },
      ],
    };

    expect(validateGameCreation(input).valid).toBe(true);
  });

  test("accepts questions with all optional fields", () => {
    const input = {
      title: "Complete Game",
      questions: [
        {
          text: "Main question",
          subText: "Additional context",
          correctAnswer: 42,
          answerFormat: "plain" as const,
          followUpNotes: "Interesting fact",
        },
      ],
    };

    expect(validateGameCreation(input).valid).toBe(true);
  });

  test("accepts questions with different answer formats", () => {
    const input = {
      title: "Format Test",
      questions: [
        { text: "Q1", correctAnswer: 100, answerFormat: "currency" as const },
        { text: "Q2", correctAnswer: 2024, answerFormat: "date" as const },
        {
          text: "Q3",
          correctAnswer: 75,
          answerFormat: "percentage" as const,
        },
        { text: "Q4", correctAnswer: 42, answerFormat: "plain" as const },
      ],
    };

    expect(validateGameCreation(input).valid).toBe(true);
  });

  test("rejects empty title", () => {
    const input = {
      title: "",
      questions: [{ text: "Question", correctAnswer: 42 }],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Game title is required");
  });

  test("rejects whitespace-only title", () => {
    const input = {
      title: "   ",
      questions: [{ text: "Question", correctAnswer: 42 }],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Game title is required");
  });

  test("rejects empty questions array", () => {
    const input = {
      title: "My Game",
      questions: [],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("At least one question is required");
  });

  test("rejects missing question text", () => {
    const input = {
      title: "My Game",
      questions: [{ text: "", correctAnswer: 42 }],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Question text is required for question 1");
  });

  test("rejects whitespace-only question text", () => {
    const input = {
      title: "My Game",
      questions: [{ text: "   ", correctAnswer: 42 }],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Question text is required for question 1");
  });

  test("rejects missing correct answer", () => {
    const input = {
      title: "My Game",
      questions: [{ text: "Question" } as any],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Correct answer is required for question 1");
  });

  test("rejects empty string as correct answer", () => {
    const input = {
      title: "My Game",
      questions: [{ text: "Question", correctAnswer: "" }],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Correct answer is required for question 1");
  });

  test("rejects non-numerical correct answer", () => {
    const input = {
      title: "My Game",
      questions: [{ text: "Question", correctAnswer: "abc" }],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Correct answer must be a valid number for question 1",
    );
  });

  test("rejects invalid answer format", () => {
    const input = {
      title: "My Game",
      questions: [
        { text: "Question", correctAnswer: 42, answerFormat: "invalid" as any },
      ],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid answer format for question 1");
  });

  test("identifies error in second question", () => {
    const input = {
      title: "My Game",
      questions: [
        { text: "Question 1", correctAnswer: 10 },
        { text: "", correctAnswer: 20 },
      ],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Question text is required for question 2");
  });

  test("identifies error in third question", () => {
    const input = {
      title: "My Game",
      questions: [
        { text: "Question 1", correctAnswer: 10 },
        { text: "Question 2", correctAnswer: 20 },
        { text: "Question 3", correctAnswer: "invalid" },
      ],
    };

    const result = validateGameCreation(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Correct answer must be a valid number for question 3",
    );
  });

  test("accepts string numbers as correct answers", () => {
    const input = {
      title: "My Game",
      questions: [
        { text: "Question 1", correctAnswer: "42" },
        { text: "Question 2", correctAnswer: "123.45" },
      ],
    };

    expect(validateGameCreation(input).valid).toBe(true);
  });

  test("accepts negative numbers as correct answers", () => {
    const input = {
      title: "My Game",
      questions: [{ text: "Question", correctAnswer: -10 }],
    };

    expect(validateGameCreation(input).valid).toBe(true);
  });

  test("accepts zero as correct answer", () => {
    const input = {
      title: "My Game",
      questions: [{ text: "Question", correctAnswer: 0 }],
    };

    expect(validateGameCreation(input).valid).toBe(true);
  });

  test("accepts questions without optional fields", () => {
    const input = {
      title: "My Game",
      questions: [
        {
          text: "Question",
          correctAnswer: 42,
          // No subText, answerFormat, or followUpNotes
        },
      ],
    };

    expect(validateGameCreation(input).valid).toBe(true);
  });
});

describe("generateQRCode", () => {
  test("generates a data URL from a join URL", async () => {
    const joinUrl = "https://example.com/join/A3K9P2";
    const qrCodeDataUrl = await generateQRCode(joinUrl);

    // Should return a data URL string
    expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  test("generates different QR codes for different URLs", async () => {
    const url1 = "https://example.com/join/ABC123";
    const url2 = "https://example.com/join/XYZ789";

    const qrCode1 = await generateQRCode(url1);
    const qrCode2 = await generateQRCode(url2);

    // Different URLs should produce different QR codes
    expect(qrCode1).not.toBe(qrCode2);
  });

  test("generates same QR code for same URL", async () => {
    const joinUrl = "https://example.com/join/TEST12";

    const qrCode1 = await generateQRCode(joinUrl);
    const qrCode2 = await generateQRCode(joinUrl);

    // Same URL should produce identical QR codes
    expect(qrCode1).toBe(qrCode2);
  });

  test("handles URLs with different protocols", async () => {
    const httpUrl = "http://example.com/join/ABC123";
    const httpsUrl = "https://example.com/join/ABC123";

    const qrCode1 = await generateQRCode(httpUrl);
    const qrCode2 = await generateQRCode(httpsUrl);

    // Both should generate valid data URLs
    expect(qrCode1).toMatch(/^data:image\/png;base64,/);
    expect(qrCode2).toMatch(/^data:image\/png;base64,/);
    // Different protocols should produce different QR codes
    expect(qrCode1).not.toBe(qrCode2);
  });

  test("handles URLs with query parameters", async () => {
    const urlWithParams = "https://example.com/join/ABC123?ref=email";
    const qrCodeDataUrl = await generateQRCode(urlWithParams);

    expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  test("handles localhost URLs", async () => {
    const localhostUrl = "http://localhost:3000/join/TEST12";
    const qrCodeDataUrl = await generateQRCode(localhostUrl);

    expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  test("handles very long URLs", async () => {
    const longUrl = `https://example.com/join/${"A".repeat(100)}`;
    const qrCodeDataUrl = await generateQRCode(longUrl);

    expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  test("generates non-empty base64 data", async () => {
    const joinUrl = "https://example.com/join/ABC123";
    const qrCodeDataUrl = await generateQRCode(joinUrl);

    // Extract the base64 part
    const base64Data = qrCodeDataUrl.split(",")[1];

    // Should have substantial content (QR codes are typically several KB)
    expect(base64Data.length).toBeGreaterThan(100);
  });

  test("handles empty string URL", async () => {
    const emptyUrl = "";

    // QR code library should reject empty strings
    await expect(generateQRCode(emptyUrl)).rejects.toThrow(
      /Failed to generate QR code/,
    );
  });

  test("handles special characters in URL", async () => {
    const specialUrl = "https://example.com/join/ABC-123_XYZ";
    const qrCodeDataUrl = await generateQRCode(specialUrl);

    expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });
});

describe("calculateScoring", () => {
  describe("basic closest guess identification", () => {
    test("awards point to closest guesser", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 100 },
        { id: "g2", playerId: "p2", guess: 150 },
      ];
      const bets: Bet[] = [];
      const correctAnswer = 120;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1"); // 100 is 20 away, 150 is 30 away
      expect(result.scoreChanges["p1"]).toBe(1);
      expect(result.scoreChanges["p2"]).toBeUndefined();
    });

    test("identifies closest guess with multiple options", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 50 },
        { id: "g2", playerId: "p2", guess: 100 },
        { id: "g3", playerId: "p3", guess: 200 },
      ];
      const bets: Bet[] = [];
      const correctAnswer = 90;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g2"); // 100 is 10 away
      expect(result.scoreChanges["p2"]).toBe(1);
    });

    test("handles guess exactly equal to correct answer", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 100 },
        { id: "g2", playerId: "p2", guess: 120 },
      ];
      const bets: Bet[] = [];
      const correctAnswer = 120;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g2"); // Exact match, distance = 0
      expect(result.scoreChanges["p2"]).toBe(1);
    });
  });

  describe("tie-breaking rule", () => {
    test("selects lower guess when tied", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 100 },
        { id: "g2", playerId: "p2", guess: 140 },
      ];
      const bets: Bet[] = [];
      const correctAnswer = 120; // Both 20 away

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1"); // Lower guess wins
      expect(result.scoreChanges["p1"]).toBe(1);
      expect(result.scoreChanges["p2"]).toBeUndefined();
    });

    test("selects lower guess with multiple tied guesses", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 80 },
        { id: "g2", playerId: "p2", guess: 120 },
        { id: "g3", playerId: "p3", guess: 160 },
      ];
      const bets: Bet[] = [];
      const correctAnswer = 100; // g1 is 20 away, g2 is 20 away, g3 is 60 away

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1"); // Lower of the two tied guesses
      expect(result.scoreChanges["p1"]).toBe(1);
    });

    test("tie-breaking with negative numbers", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: -20 },
        { id: "g2", playerId: "p2", guess: 0 },
      ];
      const bets: Bet[] = [];
      const correctAnswer = -10; // Both 10 away

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1"); // -20 is lower than 0
      expect(result.scoreChanges["p1"]).toBe(1);
    });
  });

  describe("betting and score calculation", () => {
    test("awards points to correct bettors", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 100 },
        { id: "g2", playerId: "p2", guess: 150 },
      ];
      const bets: Bet[] = [
        { id: "b1", playerId: "p3", guessId: "g1", betOnZero: 0 },
        { id: "b2", playerId: "p4", guessId: "g1", betOnZero: 0 },
      ];
      const correctAnswer = 120;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1");
      expect(result.scoreChanges["p1"]).toBe(1); // Guesser
      expect(result.scoreChanges["p3"]).toBe(1); // Bettor
      expect(result.scoreChanges["p4"]).toBe(1); // Bettor
    });

    test("does not award points to incorrect bettors", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 100 },
        { id: "g2", playerId: "p2", guess: 150 },
      ];
      const bets: Bet[] = [
        { id: "b1", playerId: "p3", guessId: "g2", betOnZero: 0 }, // Wrong guess
      ];
      const correctAnswer = 120;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1");
      expect(result.scoreChanges["p1"]).toBe(1); // Guesser
      expect(result.scoreChanges["p3"]).toBeUndefined(); // Wrong bettor
    });

    test("allows player to bet on their own guess and get both points", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 100 },
        { id: "g2", playerId: "p2", guess: 150 },
      ];
      const bets: Bet[] = [
        { id: "b1", playerId: "p1", guessId: "g1", betOnZero: 0 }, // Self-bet
      ];
      const correctAnswer = 120;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1");
      expect(result.scoreChanges["p1"]).toBe(2); // +1 for guess, +1 for bet
    });

    test("handles multiple bets from different players", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 100 },
        { id: "g2", playerId: "p2", guess: 150 },
      ];
      const bets: Bet[] = [
        { id: "b1", playerId: "p1", guessId: "g1", betOnZero: 0 },
        { id: "b2", playerId: "p3", guessId: "g1", betOnZero: 0 },
        { id: "b3", playerId: "p4", guessId: "g2", betOnZero: 0 },
      ];
      const correctAnswer = 120;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1");
      expect(result.scoreChanges["p1"]).toBe(2); // Guess + bet
      expect(result.scoreChanges["p3"]).toBe(1); // Correct bet
      expect(result.scoreChanges["p4"]).toBeUndefined(); // Wrong bet
    });
  });

  describe("zero as betting option", () => {
    test("zero can be closest when no guesses submitted", () => {
      const guesses: Guess[] = [];
      const bets: Bet[] = [
        { id: "b1", playerId: "p1", guessId: null, betOnZero: 1 },
        { id: "b2", playerId: "p2", guessId: null, betOnZero: 1 },
      ];
      const correctAnswer = 10;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBeNull(); // null indicates zero
      expect(result.scoreChanges["p1"]).toBe(1);
      expect(result.scoreChanges["p2"]).toBe(1);
    });

    test("zero can be closest when all guesses are farther", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 100 },
        { id: "g2", playerId: "p2", guess: 200 },
      ];
      const bets: Bet[] = [
        { id: "b1", playerId: "p3", guessId: null, betOnZero: 1 },
      ];
      const correctAnswer = 5; // Zero is 5 away, 100 is 95 away

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBeNull(); // Zero wins
      expect(result.scoreChanges["p3"]).toBe(1); // Bet on zero
      expect(result.scoreChanges["p1"]).toBeUndefined();
    });

    test("zero loses to closer guess", () => {
      const guesses: Guess[] = [{ id: "g1", playerId: "p1", guess: 10 }];
      const bets: Bet[] = [
        { id: "b1", playerId: "p2", guessId: null, betOnZero: 1 },
      ];
      const correctAnswer = 8; // 10 is 2 away, zero is 8 away

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1"); // Guess wins
      expect(result.scoreChanges["p1"]).toBe(1);
      expect(result.scoreChanges["p2"]).toBeUndefined();
    });

    test("tie-breaking: zero wins when tied with higher guess", () => {
      const guesses: Guess[] = [{ id: "g1", playerId: "p1", guess: 20 }];
      const bets: Bet[] = [
        { id: "b1", playerId: "p2", guessId: null, betOnZero: 1 },
      ];
      const correctAnswer = 10; // Both 10 away, zero is lower

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBeNull(); // Zero wins tie
      expect(result.scoreChanges["p2"]).toBe(1);
      expect(result.scoreChanges["p1"]).toBeUndefined();
    });

    test("tie-breaking: negative guess wins over zero when tied", () => {
      const guesses: Guess[] = [{ id: "g1", playerId: "p1", guess: -10 }];
      const bets: Bet[] = [
        { id: "b1", playerId: "p2", guessId: null, betOnZero: 1 },
      ];
      const correctAnswer = -5; // Both 5 away, -10 is lower

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1"); // Negative guess wins
      expect(result.scoreChanges["p1"]).toBe(1);
      expect(result.scoreChanges["p2"]).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    test("handles single guess", () => {
      const guesses: Guess[] = [{ id: "g1", playerId: "p1", guess: 100 }];
      const bets: Bet[] = [];
      const correctAnswer = 200;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1");
      expect(result.scoreChanges["p1"]).toBe(1);
    });

    test("handles no bets", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 100 },
        { id: "g2", playerId: "p2", guess: 150 },
      ];
      const bets: Bet[] = [];
      const correctAnswer = 120;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1");
      expect(result.scoreChanges["p1"]).toBe(1);
      expect(Object.keys(result.scoreChanges).length).toBe(1);
    });

    test("handles all players betting on zero when zero loses", () => {
      const guesses: Guess[] = [{ id: "g1", playerId: "p1", guess: 100 }];
      const bets: Bet[] = [
        { id: "b1", playerId: "p2", guessId: null, betOnZero: 1 },
        { id: "b2", playerId: "p3", guessId: null, betOnZero: 1 },
      ];
      const correctAnswer = 95; // 100 is 5 away, zero is 95 away

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1");
      expect(result.scoreChanges["p1"]).toBe(1); // Guesser
      expect(result.scoreChanges["p2"]).toBeUndefined(); // Wrong bet
      expect(result.scoreChanges["p3"]).toBeUndefined(); // Wrong bet
    });

    test("handles negative correct answer", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: -50 },
        { id: "g2", playerId: "p2", guess: -30 },
      ];
      const bets: Bet[] = [];
      const correctAnswer = -40;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1"); // -50 is 10 away, -30 is 10 away, -50 is lower
    });

    test("handles very large numbers", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 1000000 },
        { id: "g2", playerId: "p2", guess: 2000000 },
      ];
      const bets: Bet[] = [];
      const correctAnswer = 1500000;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1"); // Both 500000 away, g1 is lower
    });

    test("handles decimal guesses and answers", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 10.5 },
        { id: "g2", playerId: "p2", guess: 11.5 },
      ];
      const bets: Bet[] = [];
      const correctAnswer = 10.8;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBe("g1"); // 10.5 is 0.3 away, 11.5 is 0.7 away
      expect(result.scoreChanges["p1"]).toBe(1);
    });

    test("handles empty guesses and empty bets", () => {
      const guesses: Guess[] = [];
      const bets: Bet[] = [];
      const correctAnswer = 100;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBeNull(); // Zero is closest
      expect(Object.keys(result.scoreChanges).length).toBe(0); // No one to award
    });

    test("handles correct answer of zero", () => {
      const guesses: Guess[] = [
        { id: "g1", playerId: "p1", guess: 10 },
        { id: "g2", playerId: "p2", guess: -5 },
      ];
      const bets: Bet[] = [
        { id: "b1", playerId: "p3", guessId: null, betOnZero: 1 },
      ];
      const correctAnswer = 0;

      const result = calculateScoring(guesses, bets, correctAnswer);

      expect(result.closestGuessId).toBeNull(); // Zero is exact match
      expect(result.scoreChanges["p3"]).toBe(1); // Bet on zero
    });
  });
});
