/**
 * Utility functions for the Wits and Wagers game application
 */

import { db } from "./db/client";
import { games } from "./db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

/**
 * Characters allowed in join codes (alphanumeric, excluding ambiguous characters)
 * Excludes: 0, O, I, l to avoid confusion
 */
const JOIN_CODE_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Length of generated join codes
 */
const JOIN_CODE_LENGTH = 6;

/**
 * Maximum number of attempts to generate a unique join code
 */
const MAX_COLLISION_RETRIES = 10;

/**
 * Generates a random 6-character alphanumeric join code
 * @returns A random join code string
 */
function generateRandomCode(): string {
  let code = "";
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * JOIN_CODE_CHARS.length);
    code += JOIN_CODE_CHARS[randomIndex];
  }
  return code;
}

/**
 * Checks if a join code already exists in the database
 * @param code - The join code to check
 * @returns True if the code exists, false otherwise
 */
async function codeExists(code: string): Promise<boolean> {
  const result = await db
    .select({ joinCode: games.joinCode })
    .from(games)
    .where(eq(games.joinCode, code))
    .limit(1);

  return result.length > 0;
}

/**
 * Generates a unique join code for a game session
 * Implements collision detection and retry logic
 *
 * @returns A unique 6-character alphanumeric join code
 * @throws Error if unable to generate a unique code after MAX_COLLISION_RETRIES attempts
 *
 * @example
 * const joinCode = await generateUniqueJoinCode();
 * console.log(joinCode); // e.g., "A3K9P2"
 */
export async function generateUniqueJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
    const code = generateRandomCode();
    const exists = await codeExists(code);

    if (!exists) {
      return code;
    }

    // Log collision for monitoring (in production, use proper logging)
    console.warn(
      `Join code collision detected: ${code} (attempt ${attempt + 1}/${MAX_COLLISION_RETRIES})`,
    );
  }

  throw new Error(
    `Failed to generate unique join code after ${MAX_COLLISION_RETRIES} attempts`,
  );
}

/**
 * Answer format types supported by the application
 */
export type AnswerFormat = "plain" | "currency" | "date" | "percentage";

/**
 * Formats a numerical value according to the specified format type
 *
 * @param value - The numerical value to format
 * @param format - The format type to apply
 * @returns The formatted string representation of the value
 *
 * @example
 * formatNumber(1234.5, "currency")    // "$1234.50"
 * formatNumber(2024, "date")          // "2024"
 * formatNumber(75, "percentage")      // "75%"
 * formatNumber(123.45, "plain")       // "123.45"
 * formatNumber(1234.567, "currency")  // "$1234.57" (rounds to 2 decimals)
 */
export function formatNumber(value: number, format: AnswerFormat): string {
  switch (format) {
    case "currency":
      // Format with dollar sign and exactly 2 decimal places
      return `$${value.toFixed(2)}`;

    case "date":
      // Format as a 4-digit year (round to nearest integer)
      return Math.round(value).toString();

    case "percentage":
      // Format with percent sign (no decimal places by default)
      return `${Math.round(value)}%`;

    case "plain":
      // Return the number as-is, converted to string
      // Remove trailing zeros after decimal point
      return value.toString();

    default:
      // Fallback to plain format for unknown types
      return value.toString();
  }
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a display name according to game requirements
 * Display names must be between 1 and 30 characters (inclusive)
 *
 * @param displayName - The display name to validate
 * @returns ValidationResult with valid flag and optional error message
 *
 * @example
 * validateDisplayName("John")           // { valid: true }
 * validateDisplayName("")               // { valid: false, error: "Display name must be between 1 and 30 characters" }
 * validateDisplayName("A".repeat(31))   // { valid: false, error: "Display name must be between 1 and 30 characters" }
 */
export function validateDisplayName(displayName: string): ValidationResult {
  if (displayName.length < 1 || displayName.length > 30) {
    return {
      valid: false,
      error: "Display name must be between 1 and 30 characters",
    };
  }

  return { valid: true };
}

/**
 * Validates a numerical guess
 * Guesses must be valid numbers (integers, decimals, negative numbers allowed)
 *
 * @param guess - The guess value to validate (can be string or number)
 * @returns ValidationResult with valid flag and optional error message
 *
 * @example
 * validateGuess(42)           // { valid: true }
 * validateGuess("123.45")     // { valid: true }
 * validateGuess("-10")        // { valid: true }
 * validateGuess("abc")        // { valid: false, error: "Guess must be a valid number" }
 * validateGuess("")           // { valid: false, error: "Guess must be a valid number" }
 */
export function validateGuess(guess: string | number): ValidationResult {
  const numValue = typeof guess === "string" ? parseFloat(guess) : guess;

  if (isNaN(numValue) || !isFinite(numValue)) {
    return {
      valid: false,
      error: "Guess must be a valid number",
    };
  }

  return { valid: true };
}

/**
 * Question data for game creation
 */
export interface QuestionInput {
  text: string;
  subText?: string;
  correctAnswer: number | string;
  answerFormat?: AnswerFormat;
  followUpNotes?: string;
}

/**
 * Game creation request data
 */
export interface GameCreationInput {
  title: string;
  questions: QuestionInput[];
}

/**
 * Validates required fields for game creation
 * Checks that title and questions array are provided, and each question has required fields
 *
 * @param input - The game creation input to validate
 * @returns ValidationResult with valid flag and optional error message
 *
 * @example
 * validateGameCreation({ title: "My Game", questions: [{ text: "Q1", correctAnswer: 42 }] })
 * // { valid: true }
 *
 * validateGameCreation({ title: "", questions: [] })
 * // { valid: false, error: "Game title is required" }
 *
 * validateGameCreation({ title: "Game", questions: [{ text: "", correctAnswer: 42 }] })
 * // { valid: false, error: "Question text is required for question 1" }
 */
export function validateGameCreation(
  input: GameCreationInput,
): ValidationResult {
  // Validate title
  if (!input.title || input.title.trim().length === 0) {
    return {
      valid: false,
      error: "Game title is required",
    };
  }

  // Validate questions array exists (can be empty)
  if (!input.questions || !Array.isArray(input.questions)) {
    return {
      valid: false,
      error: "Questions array is required",
    };
  }

  // Validate each question (if any exist)
  for (let i = 0; i < input.questions.length; i++) {
    const question = input.questions[i];
    const questionNum = i + 1;

    // Validate question text
    if (!question.text || question.text.trim().length === 0) {
      return {
        valid: false,
        error: `Question text is required for question ${questionNum}`,
      };
    }

    // Validate correct answer exists
    if (
      question.correctAnswer === undefined ||
      question.correctAnswer === null ||
      question.correctAnswer === ""
    ) {
      return {
        valid: false,
        error: `Correct answer is required for question ${questionNum}`,
      };
    }

    // Validate correct answer is a valid number
    const answerValidation = validateGuess(question.correctAnswer);
    if (!answerValidation.valid) {
      return {
        valid: false,
        error: `Correct answer must be a valid number for question ${questionNum}`,
      };
    }

    // Validate answer format if provided
    if (question.answerFormat) {
      const validFormats: AnswerFormat[] = [
        "plain",
        "currency",
        "date",
        "percentage",
      ];
      if (!validFormats.includes(question.answerFormat)) {
        return {
          valid: false,
          error: `Invalid answer format for question ${questionNum}. Must be one of: ${validFormats.join(", ")}`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Generates a QR code from a join URL as a data URL
 * The QR code can be displayed directly in an <img> tag
 *
 * @param joinUrl - The full URL that players will use to join the game
 * @returns A promise that resolves to a data URL string (e.g., "data:image/png;base64,...")
 * @throws Error if QR code generation fails
 *
 * @example
 * const joinUrl = "https://example.com/join/A3K9P2";
 * const qrCodeDataUrl = await generateQRCode(joinUrl);
 * // Use in React: <img src={qrCodeDataUrl} alt="Join Game QR Code" />
 */
export async function generateQRCode(joinUrl: string): Promise<string> {
  try {
    // Generate QR code as a data URL (PNG format)
    // Options:
    // - errorCorrectionLevel: 'M' provides medium error correction (15% recovery)
    // - type: 'image/png' generates a PNG image
    // - width: 300 sets a reasonable size for display
    const dataUrl = await QRCode.toDataURL(joinUrl, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 2,
    });

    return dataUrl;
  } catch (error) {
    // Log the error for debugging
    console.error("Failed to generate QR code:", error);
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Represents a guess submitted by a player
 */
export interface Guess {
  id: string;
  playerId: string;
  guess: number;
}

/**
 * Represents a bet placed by a player
 */
export interface Bet {
  id: string;
  playerId: string;
  guessId: string | null; // null if betting on zero
  betOnZero: number; // 1 if betting on zero, 0 otherwise
}

/**
 * Result of scoring calculation
 */
export interface ScoringResult {
  closestGuessId: string | null; // null if zero is closest
  scoreChanges: Record<string, number>; // playerId -> score change
}

/**
 * Calculates scoring for a question based on guesses, bets, and the correct answer
 *
 * Rules:
 * - The closest guess is the one with minimum absolute difference from the correct answer
 * - If multiple guesses have equal distance, the lower guess wins (tie-breaking)
 * - The player who submitted the closest guess gets +1 point
 * - Each player who bet on the closest guess gets +1 point
 * - Zero is always a valid betting option, even if no one guessed it
 *
 * @param guesses - Array of guesses submitted by players
 * @param bets - Array of bets placed by players
 * @param correctAnswer - The correct numerical answer to the question
 * @returns ScoringResult with closest guess ID and score changes map
 *
 * @example
 * const guesses = [
 *   { id: "g1", playerId: "p1", guess: 100 },
 *   { id: "g2", playerId: "p2", guess: 150 }
 * ];
 * const bets = [
 *   { id: "b1", playerId: "p3", guessId: "g1", betOnZero: 0 }
 * ];
 * const result = calculateScoring(guesses, bets, 120);
 * // result.closestGuessId === "g1" (100 is 20 away, 150 is 30 away)
 * // result.scoreChanges === { "p1": 1, "p3": 1 }
 */
export function calculateScoring(
  guesses: Guess[],
  bets: Bet[],
  correctAnswer: number,
): ScoringResult {
  const scoreChanges: Record<string, number> = {};

  // If there are no guesses, zero is the only option
  if (guesses.length === 0) {
    // Zero is closest (or only option)
    // Award points to players who bet on zero
    for (const bet of bets) {
      if (bet.betOnZero === 1) {
        scoreChanges[bet.playerId] = (scoreChanges[bet.playerId] || 0) + 1;
      }
    }

    return {
      closestGuessId: null, // null indicates zero is closest
      scoreChanges,
    };
  }

  // Find the closest guess
  // Calculate distance from correct answer for each guess
  let closestGuess: Guess | null = null;
  let minDistance = Infinity;

  for (const guess of guesses) {
    const distance = Math.abs(guess.guess - correctAnswer);

    // Update closest if this is closer, or if tied and this guess is lower
    if (
      distance < minDistance ||
      (distance === minDistance &&
        closestGuess &&
        guess.guess < closestGuess.guess)
    ) {
      closestGuess = guess;
      minDistance = distance;
    }
  }

  // Check if zero is closer than any guess
  const zeroDistance = Math.abs(0 - correctAnswer);
  let closestIsZero = false;

  if (zeroDistance < minDistance) {
    closestIsZero = true;
  } else if (zeroDistance === minDistance && closestGuess) {
    // Tie-breaking: select lower value (zero vs closest guess)
    if (0 < closestGuess.guess) {
      closestIsZero = true;
    }
  }

  if (closestIsZero) {
    // Zero is closest
    // Award points to players who bet on zero
    for (const bet of bets) {
      if (bet.betOnZero === 1) {
        scoreChanges[bet.playerId] = (scoreChanges[bet.playerId] || 0) + 1;
      }
    }

    return {
      closestGuessId: null, // null indicates zero is closest
      scoreChanges,
    };
  }

  // A guess is closest (not zero)
  if (!closestGuess) {
    // This should never happen if guesses.length > 0, but handle it
    return {
      closestGuessId: null,
      scoreChanges,
    };
  }

  // Award point to the player who made the closest guess
  scoreChanges[closestGuess.playerId] =
    (scoreChanges[closestGuess.playerId] || 0) + 1;

  // Award points to players who bet on the closest guess
  for (const bet of bets) {
    if (bet.guessId === closestGuess.id) {
      scoreChanges[bet.playerId] = (scoreChanges[bet.playerId] || 0) + 1;
    }
  }

  return {
    closestGuessId: closestGuess.id,
    scoreChanges,
  };
}
