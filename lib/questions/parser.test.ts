import { describe, it, expect } from "vitest";
import { parseCSV, parseJSON, serializeToCSV, serializeToJSON } from "./parser";
import type { ParsedQuestion } from "../types/questions";

describe("parseCSV", () => {
  it("should parse valid CSV with all fields", async () => {
    const csv = `text,subText,correctAnswer,answerFormat,followUpNotes
"What is 2+2?","Basic math",4,plain,"Simple addition"
"Population of Tokyo?","As of 2023",37400000,plain,"World's largest metro"`;

    const result = await parseCSV(csv);

    expect(result.success).toBe(true);
    expect(result.questions).toHaveLength(2);
    expect(result.questions![0].text).toBe("What is 2+2?");
    expect(result.questions![0].correctAnswer).toBe(4);
    expect(result.questions![1].correctAnswer).toBe(37400000);
  });

  it("should parse CSV with optional fields missing", async () => {
    const csv = `text,subText,correctAnswer,answerFormat,followUpNotes
"What is 2+2?",,4,,`;

    const result = await parseCSV(csv);

    expect(result.success).toBe(true);
    expect(result.questions).toHaveLength(1);
    expect(result.questions![0].text).toBe("What is 2+2?");
    expect(result.questions![0].subText).toBeUndefined();
  });

  it("should handle CSV parse errors", async () => {
    const csv = `text,correctAnswer
"Unclosed quote,4`;

    const result = await parseCSV(csv);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

describe("parseJSON", () => {
  it("should parse valid JSON array", async () => {
    const json = JSON.stringify([
      {
        text: "What is 2+2?",
        subText: "Basic math",
        correctAnswer: 4,
        answerFormat: "plain",
        followUpNotes: "Simple addition",
      },
      {
        text: "Population of Tokyo?",
        correctAnswer: 37400000,
      },
    ]);

    const result = await parseJSON(json);

    expect(result.success).toBe(true);
    expect(result.questions).toHaveLength(2);
    expect(result.questions![0].text).toBe("What is 2+2?");
    expect(result.questions![1].correctAnswer).toBe(37400000);
  });

  it("should handle invalid JSON syntax", async () => {
    const json = `{ invalid json }`;

    const result = await parseJSON(json);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toContain("Failed to parse JSON");
  });

  it("should reject non-array JSON", async () => {
    const json = JSON.stringify({ text: "Not an array" });

    const result = await parseJSON(json);

    expect(result.success).toBe(false);
    expect(result.errors![0].message).toBe("JSON must be an array of questions");
  });
});

describe("serializeToCSV", () => {
  it("should serialize questions to CSV format", () => {
    const questions: ParsedQuestion[] = [
      {
        text: "What is 2+2?",
        subText: "Basic math",
        correctAnswer: 4,
        answerFormat: "plain",
        followUpNotes: "Simple addition",
      },
    ];

    const csv = serializeToCSV(questions);

    expect(csv).toContain("text,subText,correctAnswer,answerFormat,followUpNotes");
    expect(csv).toContain('"What is 2+2?"');
    expect(csv).toContain("4");
  });

  it("should handle quotes in text", () => {
    const questions: ParsedQuestion[] = [
      {
        text: 'Question with "quotes"',
        correctAnswer: 42,
      },
    ];

    const csv = serializeToCSV(questions);

    expect(csv).toContain('""quotes""');
  });
});

describe("serializeToJSON", () => {
  it("should serialize questions to JSON format", () => {
    const questions: ParsedQuestion[] = [
      {
        text: "What is 2+2?",
        correctAnswer: 4,
      },
    ];

    const json = serializeToJSON(questions);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].text).toBe("What is 2+2?");
    expect(parsed[0].correctAnswer).toBe(4);
  });
});

describe("round-trip serialization", () => {
  it("should preserve data through CSV round-trip", async () => {
    const original: ParsedQuestion[] = [
      {
        text: "What is 2+2?",
        subText: "Basic math",
        correctAnswer: 4,
        answerFormat: "plain",
        followUpNotes: "Simple addition",
      },
    ];

    const csv = serializeToCSV(original);
    const result = await parseCSV(csv);

    expect(result.success).toBe(true);
    expect(result.questions![0].text).toBe(original[0].text);
    expect(result.questions![0].correctAnswer).toBe(original[0].correctAnswer);
  });

  it("should preserve data through JSON round-trip", async () => {
    const original: ParsedQuestion[] = [
      {
        text: "What is 2+2?",
        correctAnswer: 4,
      },
    ];

    const json = serializeToJSON(original);
    const result = await parseJSON(json);

    expect(result.success).toBe(true);
    expect(result.questions![0].text).toBe(original[0].text);
    expect(result.questions![0].correctAnswer).toBe(original[0].correctAnswer);
  });
});
