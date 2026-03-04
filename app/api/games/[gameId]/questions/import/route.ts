import { NextRequest, NextResponse } from "next/server";
import { parseCSV, parseJSON } from "@/lib/questions/parser";
import { validateQuestionBatch } from "@/lib/questions/validator";
import { canEditQuestions } from "@/lib/games/state";
import { verifyGameHost } from "@/lib/auth/host";
import { db } from "@/lib/db/client";
import { questions } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { eq, max } from "drizzle-orm";

/**
 * POST /api/games/[gameId]/questions/import
 * Imports multiple questions from a CSV or JSON file
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
            message: "Only the game host can import questions",
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
            message: "Cannot import questions for active game",
          },
        },
        { status: 409 },
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "No file provided",
          },
        },
        { status: 400 },
      );
    }

    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message: "File size exceeds 5MB limit",
          },
        },
        { status: 400 },
      );
    }

    // Read file content
    const content = await file.text();

    // Determine file type and parse
    let parseResult;
    if (file.name.endsWith(".csv")) {
      parseResult = await parseCSV(content);
    } else if (file.name.endsWith(".json")) {
      parseResult = await parseJSON(content);
    } else {
      return NextResponse.json(
        {
          error: {
            code: "UNSUPPORTED_FILE_TYPE",
            message: "File must be CSV or JSON format",
          },
        },
        { status: 400 },
      );
    }

    // Check parse result
    if (!parseResult.success || !parseResult.questions) {
      return NextResponse.json(
        {
          error: {
            code: "PARSE_ERROR",
            message: "Failed to parse file",
            details: parseResult.errors,
          },
        },
        { status: 400 },
      );
    }

    // Validate all questions
    const validationErrors = validateQuestionBatch(parseResult.questions);
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

    const startIndex = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

    // Insert questions in transaction
    const insertedQuestions = await db.transaction(async (tx) => {
      const questionValues = parseResult.questions!.map((q, index) => ({
        id: randomUUID(),
        gameId: gameId,
        orderIndex: startIndex + index,
        text: q.text,
        subText: q.subText || null,
        correctAnswer: String(q.correctAnswer),
        answerFormat: q.answerFormat || ("plain" as const),
        followUpNotes: q.followUpNotes || null,
      }));

      await tx.insert(questions).values(questionValues);

      return questionValues;
    });

    return NextResponse.json(
      {
        success: true,
        imported: insertedQuestions.length,
        questions: insertedQuestions.map((q) => ({
          id: q.id,
          text: q.text,
          orderIndex: q.orderIndex,
        })),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error importing questions:", error);

    return NextResponse.json(
      {
        error: {
          code: "IMPORT_FAILED",
          message: "Failed to import questions",
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
