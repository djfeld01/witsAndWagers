import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { guesses, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/games/[gameId]/questions/[questionId]/guesses
 * Retrieves all guesses for a question, sorted in ascending order, with zero always included
 *
 * Response:
 * {
 *   guesses: Array<{
 *     id: string | null; // null for zero option
 *     value: number;
 *     playerId: string | null; // null for zero option
 *   }>;
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string; questionId: string }> },
) {
  try {
    const { questionId } = await params;

    // Validate question exists
    const question = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (question.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Question not found",
          },
        },
        { status: 404 },
      );
    }

    // Retrieve all guesses for the question
    const questionGuesses = await db
      .select()
      .from(guesses)
      .where(eq(guesses.questionId, questionId));

    // Convert guesses to the response format
    const guessValues: Array<{
      id: string | null;
      value: number;
      playerId: string | null;
    }> = questionGuesses.map((g) => ({
      id: g.id,
      value: parseFloat(g.guess),
      playerId: g.playerId,
    }));

    // Always include zero as an option
    const hasZero = guessValues.some((g) => g.value === 0);
    if (!hasZero) {
      guessValues.push({
        id: null,
        value: 0,
        playerId: null,
      });
    }

    // Sort guesses in ascending numerical order
    guessValues.sort((a, b) => a.value - b.value);

    return NextResponse.json(
      {
        guesses: guessValues,
      },
      { status: 200 },
    );
  } catch (error) {
    // Log error for debugging
    console.error("Error retrieving guesses:", error);

    // Return error response
    return NextResponse.json(
      {
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to retrieve guesses. Please try again.",
          details:
            process.env.NODE_ENV === "development"
              ? { error: String(error) }
              : undefined,
        },
      },
      { status: 500 },
    );
  }
}
