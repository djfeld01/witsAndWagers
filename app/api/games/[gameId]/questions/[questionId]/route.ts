import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { questions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { canEditQuestions } from "@/lib/games/state";
import { verifyGameHost } from "@/lib/auth/host";
import { validateQuestion } from "@/lib/questions/validator";
import type { ParsedQuestion } from "@/lib/types/questions";

/**
 * PATCH /api/games/[gameId]/questions/[questionId]
 * Updates a single question (only for inactive games)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string; questionId: string }> },
) {
  try {
    const { gameId, questionId } = await params;

    // Verify authorization
    const isHost = await verifyGameHost(gameId);
    if (!isHost) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Only the game host can edit questions",
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
              "Cannot edit questions for active game. Questions can only be edited before the game starts and before any players join.",
          },
        },
        { status: 409 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate question data
    const questionData: ParsedQuestion = {
      text: body.text,
      subText: body.subText,
      correctAnswer: body.correctAnswer,
      answerFormat: body.answerFormat,
      followUpNotes: body.followUpNotes,
    };

    const validationErrors = validateQuestion(questionData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid question data",
            details: validationErrors,
          },
        },
        { status: 400 },
      );
    }

    // Update question in database
    const updated = await db
      .update(questions)
      .set({
        text: questionData.text,
        subText: questionData.subText || null,
        correctAnswer: String(questionData.correctAnswer),
        answerFormat: questionData.answerFormat || "plain",
        followUpNotes: questionData.followUpNotes || null,
      })
      .where(and(eq(questions.id, questionId), eq(questions.gameId, gameId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Question not found",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error("Error updating question:", error);

    return NextResponse.json(
      {
        error: {
          code: "UPDATE_FAILED",
          message: "Failed to update question",
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

/**
 * DELETE /api/games/[gameId]/questions/[questionId]
 * Deletes a question (only for inactive games)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string; questionId: string }> },
) {
  try {
    const { gameId, questionId } = await params;

    // Verify authorization
    const isHost = await verifyGameHost(gameId);
    if (!isHost) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Only the game host can delete questions",
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
              "Cannot delete questions for active game. Questions can only be deleted before the game starts and before any players join.",
          },
        },
        { status: 409 },
      );
    }

    // Delete question from database
    const deleted = await db
      .delete(questions)
      .where(and(eq(questions.id, questionId), eq(questions.gameId, gameId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Question not found",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        deletedId: questionId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting question:", error);

    return NextResponse.json(
      {
        error: {
          code: "DELETE_FAILED",
          message: "Failed to delete question",
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
