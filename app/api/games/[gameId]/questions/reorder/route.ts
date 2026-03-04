import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { questions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { canEditQuestions } from "@/lib/games/state";
import { verifyGameHost } from "@/lib/auth/host";

/**
 * PATCH /api/games/[gameId]/questions/reorder
 * Reorders questions (only for inactive games)
 */
export async function PATCH(
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
            message: "Only the game host can reorder questions",
          },
        },
        { status: 403 },
      );
    }

    // Check if game allows question editing
    const canEdit = await canEditQuestions(gameId);
    if (!canEdit) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STATE",
            message:
              "Cannot reorder questions for active game. Questions can only be reordered before the game starts and before any players join.",
          },
        },
        { status: 409 },
      );
    }

    // Parse request body
    const body = await request.json();
    const questionIds: string[] = body.questionIds;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "questionIds must be a non-empty array",
          },
        },
        { status: 400 },
      );
    }

    // Update orderIndex for each question in transaction
    await db.transaction(async (tx) => {
      for (let i = 0; i < questionIds.length; i++) {
        await tx
          .update(questions)
          .set({ orderIndex: i })
          .where(
            and(eq(questions.id, questionIds[i]), eq(questions.gameId, gameId)),
          );
      }
    });

    return NextResponse.json(
      {
        success: true,
        reordered: questionIds.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error reordering questions:", error);

    return NextResponse.json(
      {
        error: {
          code: "REORDER_FAILED",
          message: "Failed to reorder questions",
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
