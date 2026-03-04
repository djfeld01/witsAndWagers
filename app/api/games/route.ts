import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { games, questions } from "@/lib/db/schema";
import {
  generateUniqueJoinCode,
  validateGameCreation,
  type AnswerFormat,
} from "@/lib/utils";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

/**
 * POST /api/games
 * Creates a new game session with questions
 *
 * Request body:
 * {
 *   title: string;
 *   questions: Array<{
 *     text: string;
 *     subText?: string;
 *     correctAnswer: number;
 *     answerFormat?: "plain" | "currency" | "date" | "percentage";
 *     followUpNotes?: string;
 *   }>;
 * }
 *
 * Response:
 * {
 *   gameId: string;
 *   joinCode: string;
 *   joinUrl: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
    const validation = validateGameCreation(body);
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

    // Generate unique join code
    const joinCode = await generateUniqueJoinCode();

    // Generate game ID
    const gameId = randomUUID();

    // Start transaction to insert game and questions
    await db.transaction(async (tx) => {
      // Insert game
      await tx.insert(games).values({
        id: gameId,
        title: body.title,
        joinCode: joinCode,
        currentPhase: "guessing",
      });

      // Insert questions (if any)
      if (body.questions && body.questions.length > 0) {
        const questionValues = body.questions.map((q: any, index: number) => ({
          id: randomUUID(),
          gameId: gameId,
          orderIndex: index,
          text: q.text,
          subText: q.subText || null,
          correctAnswer: String(q.correctAnswer),
          answerFormat: (q.answerFormat || "plain") as AnswerFormat,
          followUpNotes: q.followUpNotes || null,
        }));

        await tx.insert(questions).values(questionValues);

        // Set the first question as current question
        await tx
          .update(games)
          .set({ currentQuestionId: questionValues[0].id })
          .where(eq(games.id, gameId));
      }
    });

    // Generate join URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
    const joinUrl = `${baseUrl}/join/${joinCode}`;

    // Return success response
    return NextResponse.json(
      {
        gameId,
        joinCode,
        joinUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    // Log error for debugging
    console.error("Error creating game:", error);

    // Return error response
    return NextResponse.json(
      {
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to create game. Please try again.",
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
