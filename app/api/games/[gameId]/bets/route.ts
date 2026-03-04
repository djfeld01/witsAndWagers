import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { games, players, questions, guesses, bets } from "@/lib/db/schema";
import { broadcastBetPlaced } from "@/lib/realtime/broadcast";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/games/[gameId]/bets
 * Places a bet on a guess (or zero) during the betting phase
 *
 * Request body:
 * {
 *   playerId: string;
 *   questionId: string;
 *   guessId?: string; // Optional - omit if betting on zero
 *   betOnZero?: boolean; // Optional - set to true if betting on zero
 * }
 *
 * Response:
 * {
 *   betId: string;
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
    const { playerId, questionId, guessId, betOnZero } = body;

    // Validate required fields
    if (!playerId || !questionId) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "playerId and questionId are required",
          },
        },
        { status: 400 },
      );
    }

    // Validate that either guessId or betOnZero is provided
    if (!guessId && !betOnZero) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Either guessId or betOnZero must be provided",
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

    // Validate current phase is "betting"
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

    if (game[0].currentPhase !== "betting") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_PHASE",
            message: "Bets can only be placed during the betting phase",
          },
        },
        { status: 400 },
      );
    }

    // If guessId is provided, validate it exists
    if (guessId) {
      const guess = await db
        .select()
        .from(guesses)
        .where(eq(guesses.id, guessId))
        .limit(1);

      if (guess.length === 0) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Guess not found",
            },
          },
          { status: 404 },
        );
      }
    }

    // Check for duplicate bet from same player
    const existingBet = await db
      .select()
      .from(bets)
      .where(and(eq(bets.playerId, playerId), eq(bets.questionId, questionId)))
      .limit(1);

    if (existingBet.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "DUPLICATE_SUBMISSION",
            message: "Player has already placed a bet for this question",
          },
        },
        { status: 400 },
      );
    }

    // Insert bet into database
    const betId = randomUUID();

    await db.insert(bets).values({
      id: betId,
      questionId,
      playerId,
      guessId: guessId || null,
      betOnZero: betOnZero ? 1 : 0,
    });

    // Broadcast bet placed event (non-blocking)
    try {
      const allBets = await db
        .select()
        .from(bets)
        .where(eq(bets.questionId, questionId));

      await broadcastBetPlaced(gameId, questionId, allBets.length);
    } catch (error) {
      // Log but don't fail the request if broadcasting fails
      console.error("Failed to broadcast bet placed event:", error);
    }

    // Return bet ID
    return NextResponse.json(
      {
        betId,
      },
      { status: 201 },
    );
  } catch (error) {
    // Log error for debugging
    console.error("Error placing bet:", error);

    // Return error response
    return NextResponse.json(
      {
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to place bet. Please try again.",
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
