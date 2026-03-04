import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { games, players, questions, guesses } from "@/lib/db/schema";
import { validateGuess } from "@/lib/utils";
import { broadcastGuessSubmitted } from "@/lib/realtime/broadcast";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/games/[gameId]/guesses
 * Submits a numerical guess for a question
 *
 * Request body:
 * {
 *   playerId: string;
 *   questionId: string;
 *   guess: number;
 * }
 *
 * Response:
 * {
 *   guessId: string;
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) {
  try {
    const { gameId } = await params;

    // Parse request body
    const body = await request.json();
    const { playerId, questionId, guess } = body;

    // Validate required fields
    if (!playerId || !questionId || guess === undefined || guess === null) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "playerId, questionId, and guess are required",
          },
        },
        { status: 400 },
      );
    }

    // Validate guess is numerical
    const guessValidation = validateGuess(guess);
    if (!guessValidation.valid) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: guessValidation.error,
          },
        },
        { status: 400 },
      );
    }

    // Validate player exists
    const player = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (player.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Player not found",
          },
        },
        { status: 404 },
      );
    }

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

    // Validate current phase is "guessing"
    const game = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (game.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "GAME_NOT_FOUND",
            message: "Game not found",
          },
        },
        { status: 404 },
      );
    }

    if (game[0].currentPhase !== "guessing") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_PHASE",
            message: "Guesses can only be submitted during the guessing phase",
          },
        },
        { status: 400 },
      );
    }

    // Check for duplicate guess from same player
    const existingGuess = await db
      .select()
      .from(guesses)
      .where(
        and(eq(guesses.playerId, playerId), eq(guesses.questionId, questionId)),
      )
      .limit(1);

    if (existingGuess.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "DUPLICATE_SUBMISSION",
            message: "Player has already submitted a guess for this question",
          },
        },
        { status: 400 },
      );
    }

    // Insert guess into database
    const guessId = randomUUID();
    const numericGuess = typeof guess === "string" ? parseFloat(guess) : guess;

    await db.insert(guesses).values({
      id: guessId,
      questionId,
      playerId,
      guess: String(numericGuess),
    });

    // Broadcast guess submitted event (non-blocking)
    try {
      const allGuesses = await db
        .select()
        .from(guesses)
        .where(eq(guesses.questionId, questionId));

      await broadcastGuessSubmitted(gameId, questionId, allGuesses.length);
    } catch (error) {
      // Log but don't fail the request if broadcasting fails
      console.error("Failed to broadcast guess submitted event:", error);
    }

    // Return guess ID
    return NextResponse.json(
      {
        guessId,
      },
      { status: 201 },
    );
  } catch (error) {
    // Log error for debugging
    console.error("Error submitting guess:", error);

    // Return error response
    return NextResponse.json(
      {
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to submit guess. Please try again.",
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
