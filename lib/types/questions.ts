export type AnswerFormat = "plain" | "currency" | "date" | "percentage";

export interface Question {
  id: string;
  gameId: string;
  orderIndex: number;
  text: string;
  subText: string | null;
  correctAnswer: string; // Stored as string in DB (decimal)
  answerFormat: AnswerFormat;
  followUpNotes: string | null;
  roundCurrency: boolean | null; // Controls currency rounding, null defaults to true
}

export interface QuestionInput {
  text: string;
  subText?: string;
  correctAnswer: number;
  answerFormat?: AnswerFormat;
  followUpNotes?: string;
  roundCurrency?: boolean; // Controls currency rounding, defaults to true
}

export interface ImportResult {
  success: boolean;
  imported?: number;
  questions?: Question[];
  errors?: ValidationError[];
}

export interface ValidationError {
  index?: number;
  field: string;
  message: string;
}

export interface ParsedQuestion {
  text: string;
  subText?: string;
  correctAnswer: number;
  answerFormat?: AnswerFormat;
  followUpNotes?: string;
  roundCurrency?: boolean; // Controls currency rounding, defaults to true
}

export interface ParseResult {
  success: boolean;
  questions?: ParsedQuestion[];
  errors?: Array<{
    index: number;
    field: string;
    message: string;
  }>;
}
