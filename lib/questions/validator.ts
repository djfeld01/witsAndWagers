import type { ParsedQuestion, ValidationError } from "../types/questions";

export function validateQuestion(question: ParsedQuestion): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate required field: text
  if (!question.text || question.text.trim() === "") {
    errors.push({
      field: "text",
      message: "Question text is required",
    });
  }

  // Validate required field: correctAnswer
  if (question.correctAnswer === undefined || question.correctAnswer === null) {
    errors.push({
      field: "correctAnswer",
      message: "Answer is required",
    });
  } else if (typeof question.correctAnswer !== "number" || isNaN(question.correctAnswer)) {
    errors.push({
      field: "correctAnswer",
      message: "Answer must be a number",
    });
  }

  return errors;
}

export function validateQuestionBatch(
  questions: ParsedQuestion[],
): Array<{
  index: number;
  errors: ValidationError[];
}> {
  const batchErrors: Array<{ index: number; errors: ValidationError[] }> = [];

  questions.forEach((question, index) => {
    const errors = validateQuestion(question);
    if (errors.length > 0) {
      batchErrors.push({ index, errors });
    }
  });

  return batchErrors;
}
