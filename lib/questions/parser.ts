import { parse } from "csv-parse/sync";
import type { ParsedQuestion, ParseResult } from "../types/questions";

export async function parseCSV(content: string): Promise<ParseResult> {
  try {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const questions: ParsedQuestion[] = [];
    const errors: Array<{ index: number; field: string; message: string }> = [];

    records.forEach((record: any, index: number) => {
      try {
        const question: ParsedQuestion = {
          text: record.text || "",
          subText: record.subText || undefined,
          correctAnswer: parseFloat(record.correctAnswer),
          answerFormat: record.answerFormat || "plain",
          followUpNotes: record.followUpNotes || undefined,
        };
        questions.push(question);
      } catch (error) {
        errors.push({
          index,
          field: "parse",
          message: `Failed to parse row ${index + 1}: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, questions };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          index: 0,
          field: "file",
          message: `Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

export async function parseJSON(content: string): Promise<ParseResult> {
  try {
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      return {
        success: false,
        errors: [
          {
            index: 0,
            field: "file",
            message: "JSON must be an array of questions",
          },
        ],
      };
    }

    const questions: ParsedQuestion[] = [];
    const errors: Array<{ index: number; field: string; message: string }> = [];

    data.forEach((item: any, index: number) => {
      try {
        const question: ParsedQuestion = {
          text: item.text || "",
          subText: item.subText,
          correctAnswer: typeof item.correctAnswer === "number" ? item.correctAnswer : parseFloat(item.correctAnswer),
          answerFormat: item.answerFormat || "plain",
          followUpNotes: item.followUpNotes,
        };
        questions.push(question);
      } catch (error) {
        errors.push({
          index,
          field: "parse",
          message: `Failed to parse question ${index}: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, questions };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          index: 0,
          field: "file",
          message: `Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
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
