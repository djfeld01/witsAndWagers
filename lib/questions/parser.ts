import { parse } from "csv-parse/sync";
import type { ParsedQuestion, ParseResult } from "../types/questions";

export async function parseCSV(content: string): Promise<ParseResult> {
  try {
    // Check if content is empty
    if (!content || content.trim() === "") {
      return {
        success: false,
        errors: [
          {
            index: 0,
            field: "file",
            message: "CSV file is empty",
          },
        ],
      };
    }

    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Check if any records were parsed
    if (!records || records.length === 0) {
      return {
        success: false,
        errors: [
          {
            index: 0,
            field: "file",
            message: "No valid questions found in CSV. Make sure the file has headers: text, correctAnswer (required), and optionally: subText, answerFormat, followUpNotes",
          },
        ],
      };
    }

    const questions: ParsedQuestion[] = [];
    const errors: Array<{ index: number; field: string; message: string }> = [];

    records.forEach((record: any, index: number) => {
      try {
        // Check for required columns
        if (!record.text && !record.correctAnswer) {
          errors.push({
            index,
            field: "columns",
            message: `Row ${index + 2}: Missing required columns. CSV must have 'text' and 'correctAnswer' columns`,
          });
          return;
        }

        if (!record.text || record.text.trim() === "") {
          errors.push({
            index,
            field: "text",
            message: `Row ${index + 2}: Question text is empty`,
          });
          return;
        }

        if (!record.correctAnswer || record.correctAnswer.trim() === "") {
          errors.push({
            index,
            field: "correctAnswer",
            message: `Row ${index + 2}: Correct answer is empty`,
          });
          return;
        }

        const parsedAnswer = parseFloat(record.correctAnswer);
        if (isNaN(parsedAnswer)) {
          errors.push({
            index,
            field: "correctAnswer",
            message: `Row ${index + 2}: Correct answer "${record.correctAnswer}" is not a valid number`,
          });
          return;
        }

        // Validate answerFormat if provided
        const validFormats = ["plain", "currency", "date", "percentage"];
        if (record.answerFormat && !validFormats.includes(record.answerFormat)) {
          errors.push({
            index,
            field: "answerFormat",
            message: `Row ${index + 2}: Invalid answer format "${record.answerFormat}". Must be one of: ${validFormats.join(", ")}`,
          });
          return;
        }

        const question: ParsedQuestion = {
          text: record.text,
          subText: record.subText || undefined,
          correctAnswer: parsedAnswer,
          answerFormat: record.answerFormat || "plain",
          followUpNotes: record.followUpNotes || undefined,
        };
        questions.push(question);
      } catch (error) {
        errors.push({
          index,
          field: "parse",
          message: `Row ${index + 2}: ${error instanceof Error ? error.message : "Unknown parsing error"}`,
        });
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    if (questions.length === 0) {
      return {
        success: false,
        errors: [
          {
            index: 0,
            field: "file",
            message: "No valid questions found after parsing",
          },
        ],
      };
    }

    return { success: true, questions };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let detailedMessage = `Failed to parse CSV: ${errorMessage}`;
    
    // Provide more specific error messages for common issues
    if (errorMessage.includes("Invalid Record Length")) {
      detailedMessage = "CSV format error: Inconsistent number of columns. Make sure all rows have the same number of columns and values are properly quoted.";
    } else if (errorMessage.includes("Invalid Opening Quote")) {
      detailedMessage = "CSV format error: Unclosed quote found. Make sure all quoted values are properly closed.";
    }

    return {
      success: false,
      errors: [
        {
          index: 0,
          field: "file",
          message: detailedMessage,
        },
      ],
    };
  }
}

export async function parseJSON(content: string): Promise<ParseResult> {
  try {
    // Check if content is empty
    if (!content || content.trim() === "") {
      return {
        success: false,
        errors: [
          {
            index: 0,
            field: "file",
            message: "JSON file is empty",
          },
        ],
      };
    }

    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      return {
        success: false,
        errors: [
          {
            index: 0,
            field: "file",
            message: "JSON must be an array of questions. Example: [{\"text\": \"Question?\", \"correctAnswer\": 42}]",
          },
        ],
      };
    }

    if (data.length === 0) {
      return {
        success: false,
        errors: [
          {
            index: 0,
            field: "file",
            message: "JSON array is empty. Add at least one question.",
          },
        ],
      };
    }

    const questions: ParsedQuestion[] = [];
    const errors: Array<{ index: number; field: string; message: string }> = [];

    data.forEach((item: any, index: number) => {
      try {
        // Check for required fields
        if (!item.text || item.text.trim() === "") {
          errors.push({
            index,
            field: "text",
            message: `Question ${index + 1}: Missing or empty 'text' field`,
          });
          return;
        }

        if (item.correctAnswer === undefined || item.correctAnswer === null) {
          errors.push({
            index,
            field: "correctAnswer",
            message: `Question ${index + 1}: Missing 'correctAnswer' field`,
          });
          return;
        }

        const parsedAnswer = typeof item.correctAnswer === "number" 
          ? item.correctAnswer 
          : parseFloat(item.correctAnswer);

        if (isNaN(parsedAnswer)) {
          errors.push({
            index,
            field: "correctAnswer",
            message: `Question ${index + 1}: 'correctAnswer' value "${item.correctAnswer}" is not a valid number`,
          });
          return;
        }

        // Validate answerFormat if provided
        const validFormats = ["plain", "currency", "date", "percentage"];
        if (item.answerFormat && !validFormats.includes(item.answerFormat)) {
          errors.push({
            index,
            field: "answerFormat",
            message: `Question ${index + 1}: Invalid 'answerFormat' "${item.answerFormat}". Must be one of: ${validFormats.join(", ")}`,
          });
          return;
        }

        const question: ParsedQuestion = {
          text: item.text,
          subText: item.subText,
          correctAnswer: parsedAnswer,
          answerFormat: item.answerFormat || "plain",
          followUpNotes: item.followUpNotes,
        };
        questions.push(question);
      } catch (error) {
        errors.push({
          index,
          field: "parse",
          message: `Question ${index + 1}: ${error instanceof Error ? error.message : "Unknown parsing error"}`,
        });
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    if (questions.length === 0) {
      return {
        success: false,
        errors: [
          {
            index: 0,
            field: "file",
            message: "No valid questions found after parsing",
          },
        ],
      };
    }

    return { success: true, questions };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let detailedMessage = `Failed to parse JSON: ${errorMessage}`;
    
    // Provide more specific error messages for common JSON issues
    if (errorMessage.includes("Unexpected token")) {
      detailedMessage = "JSON syntax error: Invalid JSON format. Check for missing commas, brackets, or quotes.";
    } else if (errorMessage.includes("Unexpected end of JSON")) {
      detailedMessage = "JSON syntax error: Incomplete JSON. The file appears to be truncated or missing closing brackets.";
    }

    return {
      success: false,
      errors: [
        {
          index: 0,
          field: "file",
          message: detailedMessage,
        },
      ],
    };
  }
}

export function serializeToCSV(questions: ParsedQuestion[]): string {
  const headers = ["text", "subText", "correctAnswer", "answerFormat", "followUpNotes"];
  const rows = questions.map((q) => [
    `"${q.text.replace(/"/g, '""')}"`,
    q.subText ? `"${q.subText.replace(/"/g, '""')}"` : '""',
    q.correctAnswer.toString(),
    q.answerFormat || "plain",
    q.followUpNotes ? `"${q.followUpNotes.replace(/"/g, '""')}"` : '""',
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function serializeToJSON(questions: ParsedQuestion[]): string {
  return JSON.stringify(questions, null, 2);
}
