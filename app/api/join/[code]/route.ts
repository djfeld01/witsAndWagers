import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { games, players } from "@/lib/db/schema";
import { validateDisplayName } from "@/lib/utils";
import { broadcastPlayerJoined } from "@/lib/realtime/broadcast";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

/**
 * POST /api/games/[code]/join
 * Allows a player to join a game session using a join code
 *
 * Request body:
 * {
 *   displayName: string;
 * }
 *
 * Response:
 * {
 *   playerId: string;
 *   gameId: string;
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;

    // Parse request body
    const body = await request.json();

    // Validate display name
    const validation = validateDisplayName(body.displayName);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: validation.error,
          },
        },
        { status: 400 },
      );
    }

    // Validate join code exists
    const joinCode = code;
    const gameResult = await db
      .select({ id: games.id })
      .from(games)
      .where(eq(games.joinCode, joinCode))
      .limit(1);

    if (gameResult.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "GAME_NOT_FOUND",
            message: "Invalid join code. Please check the code and try again.",
          },
        },
        { status: 404 },
      );
    }

    const gameId = gameResult[0].id;

    // Generate unique player ID
    const playerId = randomUUID();

    // Insert player into database with initial score of 0
    await db.insert(players).values({
      id: playerId,
      gameId: gameId,
      displayName: body.displayName,
      score: 0,
    });

    // Broadcast player joined event (non-blocking)
    try {
      await broadcastPlayerJoined(gameId, playerId, body.displayName);
    } catch (error) {
      // Log but don't fail the request if broadcasting fails
      console.error("Failed to broadcast player joined event:", error);
    }

    // Return player ID and game ID
    return NextResponse.json(
      {
        playerId,
        gameId,
      },
      { status: 201 },
    );
  } catch (error) {
    // Log error for debugging
    console.error("Error joining game:", error);

    // Return error response
    return NextResponse.json(
      {
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to join game. Please try again.",
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
