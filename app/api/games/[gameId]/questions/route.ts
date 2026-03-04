import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { questions, games } from "@/lib/db/schema";
import { validateQuestion } from "@/lib/questions/validator";
import { canEditQuestions } from "@/lib/games/state";
import { verifyGameHost } from "@/lib/auth/host";
import { randomUUID } from "crypto";
import { eq, max } from "drizzle-orm";

/**
 * POST /api/games/[gameId]/questions
 * Adds a single question to the game
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) {
  try {
    const { gameId } = await params;
    console.log("Adding question to game:", gameId);

    // Verify authorization
    const isHost = await verifyGameHost(gameId);
    console.log("Is host:", isHost);
    if (!isHost) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Only the game host can add questions",
          },
        },
        { status: 403 },
      );
    }

    // Check if game allows question editing
    const canEdit = await canEditQuestions(gameId);
    console.log("Can edit:", canEdit);
    if (!canEdit) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STATE",
            message: "Cannot add questions to active game",
          },
        },
        { status: 409 },
      );
    }

    // Parse request body
    const body = await request.json();
    console.log("Request body:", body);

    // Validate question
    const validationErrors = validateQuestion(body);
    console.log("Validation errors:", validationErrors);
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

    // Get the current max orderIndex for this game
    const maxOrderResult = await db
      .select({ maxOrder: max(questions.orderIndex) })
      .from(questions)
      .where(eq(questions.gameId, gameId));

    const nextOrderIndex = (maxOrderResult[0]?.maxOrder ?? -1) + 1;
    console.log("Next order index:", nextOrderIndex);

    // Insert question
    const questionId = randomUUID();
    const newQuestion = {
      id: questionId,
      gameId: gameId,
      orderIndex: nextOrderIndex,
      text: body.text,
      subText: body.subText || null,
      correctAnswer: String(body.correctAnswer),
      answerFormat: body.answerFormat || ("plain" as const),
      followUpNotes: body.followUpNotes || null,
    };

    console.log("Inserting question:", newQuestion);
    await db.insert(questions).values(newQuestion);

    // If this is the first question, set it as current question
    const questionCount = await db
      .select({ count: questions.id })
      .from(questions)
      .where(eq(questions.gameId, gameId));

    console.log("Question count:", questionCount.length);
    if (questionCount.length === 1) {
      console.log("Setting as current question");
      await db
        .update(games)
        .set({ currentQuestionId: questionId })
        .where(eq(games.id, gameId));
    }

    console.log("Question added successfully");
    return NextResponse.json(
      {
        success: true,
        question: {
          id: newQuestion.id,
          text: newQuestion.text,
          orderIndex: newQuestion.orderIndex,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding question:", error);

    return NextResponse.json(
      {
        error: {
          code: "ADD_FAILED",
          message: "Failed to add question",
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
