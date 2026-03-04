import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { games, questions, players, guesses, bets } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyGameHost } from "@/lib/auth/host";

/**
 * POST /api/games/[gameId]/reset
 * Resets a game to its initial state
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) {
  try {
    const { gameId } = await params;

    // Verify authorization
    const isHost = await verifyGameHost(gameId);
    if (!isHost) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Only the game host can reset the game",
          },
        },
        { status: 403 },
      );
    }

    // Get first question ID for the game
    const firstQuestion = await db
      .select()
      .from(questions)
      .where(eq(questions.gameId, gameId))
      .orderBy(asc(questions.orderIndex))
      .limit(1);

    if (firstQuestion.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "NO_QUESTIONS",
            message: "Cannot reset game with no questions",
          },
        },
        { status: 400 },
      );
    }

    // Reset game in transaction
    await db.transaction(async (tx) => {
      // Delete all bets for this game
      const gamePlayers = await tx
        .select({ id: players.id })
        .from(players)
        .where(eq(players.gameId, gameId));

      if (gamePlayers.length > 0) {
        const playerIds = gamePlayers.map((p) => p.id);
        
        // Delete bets for all players in this game
        for (const playerId of playerIds) {
          await tx.delete(bets).where(eq(bets.playerId, playerId));
        }

        // Delete guesses for all players in this game
        for (const playerId of playerIds) {
          await tx.delete(guesses).where(eq(guesses.playerId, playerId));
        }
      }

      // Remove all players from game
      await tx.delete(players).where(eq(players.gameId, gameId));

      // Reset game state
      await tx
        .update(games)
        .set({
          currentQuestionId: firstQuestion[0].id,
          currentPhase: "guessing",
        })
        .where(eq(games.id, gameId));
    });

    return NextResponse.json(
      {
        success: true,
        gameId: gameId,
        message: "Game reset successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error resetting game:", error);

    return NextResponse.json(
      {
        error: {
          code: "RESET_FAILED",
          message: "Failed to reset game",
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
