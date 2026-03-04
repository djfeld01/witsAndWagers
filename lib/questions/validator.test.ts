import { describe, it, expect } from "vitest";
import { validateQuestion, validateQuestionBatch } from "./validator";
import type { ParsedQuestion } from "../types/questions";

describe("validateQuestion", () => {
  it("should pass validation for valid question", () => {
    const question: ParsedQuestion = {
      text: "What is 2+2?",
      correctAnswer: 4,
    };

    const errors = validateQuestion(question);
    expect(errors).toHaveLength(0);
  });

  it("should fail validation when text is empty", () => {
    const question: ParsedQuestion = {
      text: "",
      correctAnswer: 4,
    };

    const errors = validateQuestion(question);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("text");
    expect(errors[0].message).toBe("Question text is required");
  });

  it("should fail validation when text is only whitespace", () => {
    const question: ParsedQuestion = {
      text: "   ",
      correctAnswer: 4,
    };

    const errors = validateQuestion(question);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("text");
  });

  it("should fail validation when correctAnswer is missing", () => {
    const question: ParsedQuestion = {
      text: "What is 2+2?",
      correctAnswer: undefined as any,
    };

    const errors = validateQuestion(question);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("correctAnswer");
    expect(errors[0].message).toBe("Answer is required");
  });

  it("should fail validation when correctAnswer is NaN", () => {
    const question: ParsedQuestion = {
      text: "What is 2+2?",
      correctAnswer: NaN,
    };

    const errors = validateQuestion(question);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("correctAnswer");
    expect(errors[0].message).toBe("Answer must be a number");
  });

  it("should fail validation when correctAnswer is not a number", () => {
    const question: ParsedQuestion = {
      text: "What is 2+2?",
      correctAnswer: "four" as any,
    };

    const errors = validateQuestion(question);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("correctAnswer");
  });

  it("should return multiple errors when multiple fields are invalid", () => {
    const question: ParsedQuestion = {
      text: "",
      correctAnswer: NaN,
    };

    const errors = validateQuestion(question);
    expect(errors).toHaveLength(2);
  });
});

describe("validateQuestionBatch", () => {
  it("should return empty array for all valid questions", () => {
    const questions: ParsedQuestion[] = [
      { text: "Question 1", correctAnswer: 1 },
      { text: "Question 2", correctAnswer: 2 },
      { text: "Question 3", correctAnswer: 3 },
    ];

    const errors = validateQuestionBatch(questions);
    expect(errors).toHaveLength(0);
  });

  it("should return errors with correct indices", () => {
    const questions: ParsedQuestion[] = [
      { text: "Question 1", correctAnswer: 1 },
      { text: "", correctAnswer: 2 },
      { text: "Question 3", correctAnswer: NaN },
    ];

    const errors = validateQuestionBatch(questions);
    expect(errors).toHaveLength(2);
    expect(errors[0].index).toBe(1);
    expect(errors[1].index).toBe(2);
  });

  it("should include all errors for each invalid question", () => {
    const questions: ParsedQuestion[] = [
      { text: "", correctAnswer: NaN },
    ];

    const errors = validateQuestionBatch(questions);
    expect(errors).toHaveLength(1);
    expect(errors[0].index).toBe(0);
    expect(errors[0].errors).toHaveLength(2);
  });
});
