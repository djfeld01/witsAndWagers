import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { games, players, questions, guesses, bets } from "@/lib/db/schema";
import { calculateScoring } from "@/lib/utils";
import {
  broadcastPhaseChange,
  broadcastScoreUpdate,
} from "@/lib/realtime/broadcast";
import { eq, and, asc } from "drizzle-orm";

/**
 * Valid phase transitions in the game state machine
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  guessing: ["betting"],
  betting: ["reveal"],
  reveal: ["guessing"], // When moving to next question
};

/**
 * POST /api/games/[gameId]/advance
 * Advances the game to the next phase
 *
 * Request body:
 * {
 *   targetPhase: "guessing" | "betting" | "reveal";
 * }
 *
 * Response:
 * {
 *   currentPhase: string;
 *   scores?: Record<string, number>; // Included when advancing to reveal
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
    const { targetPhase } = body;

    // Validate required fields
    if (!targetPhase) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "targetPhase is required",
          },
        },
        { status: 400 },
      );
    }

    // Validate targetPhase is a valid phase
    const validPhases = ["guessing", "betting", "reveal"];
    if (!validPhases.includes(targetPhase)) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: `targetPhase must be one of: ${validPhases.join(", ")}`,
          },
        },
        { status: 400 },
      );
    }

    // Get current game state
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

    const currentPhase = game[0].currentPhase;
    const currentQuestionId = game[0].currentQuestionId;

    // Special case: Starting the game for the first time
    // Allow "guessing" -> "guessing" transition when no question is set
    const isStartingGame = !currentQuestionId && targetPhase === "guessing";

    // Validate phase transition follows state machine (unless starting game)
    if (!isStartingGame) {
      const allowedTransitions = VALID_TRANSITIONS[currentPhase];
      if (!allowedTransitions || !allowedTransitions.includes(targetPhase)) {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_PHASE",
              message: `Cannot transition from ${currentPhase} to ${targetPhase}. Valid transitions: ${allowedTransitions?.join(", ") || "none"}`,
            },
          },
          { status: 400 },
        );
      }
    }

    // If advancing to reveal, calculate scores
    let scoreChanges: Record<string, number> | undefined;
    let closestGuessId: string | null | undefined;

    if (targetPhase === "reveal") {
      if (!currentQuestionId) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "No current question set for the game",
            },
          },
          { status: 400 },
        );
      }

      // Get the current question to retrieve correct answer
      const question = await db
        .select()
        .from(questions)
        .where(eq(questions.id, currentQuestionId))
        .limit(1);

      if (question.length === 0) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Current question not found",
            },
          },
          { status: 404 },
        );
      }

      const correctAnswer = parseFloat(question[0].correctAnswer);

      // Get all guesses for this question
      const questionGuesses = await db
        .select()
        .from(guesses)
        .where(eq(guesses.questionId, currentQuestionId));

      // Get all bets for this question
      const questionBets = await db
        .select()
        .from(bets)
        .where(eq(bets.questionId, currentQuestionId));

      // Convert to the format expected by calculateScoring
      const guessesForScoring = questionGuesses.map((g) => ({
        id: g.id,
        playerId: g.playerId,
        guess: parseFloat(g.guess),
      }));

      const betsForScoring = questionBets.map((b) => ({
        id: b.id,
        playerId: b.playerId,
        guessId: b.guessId,
        betOnZero: b.betOnZero,
      }));

      // Calculate scoring
      const scoringResult = calculateScoring(
        guessesForScoring,
        betsForScoring,
        correctAnswer,
      );

      scoreChanges = scoringResult.scoreChanges;
      closestGuessId = scoringResult.closestGuessId;

      // Update player scores in database
      for (const [playerId, scoreChange] of Object.entries(scoreChanges)) {
        // Get current player score
        const player = await db
          .select()
          .from(players)
          .where(eq(players.id, playerId))
          .limit(1);

        if (player.length > 0) {
          const newScore = player[0].score + scoreChange;

          // Update player score
          await db
            .update(players)
            .set({ score: newScore })
            .where(eq(players.id, playerId));
        }
      }
    }

    // Update game phase in database
    // If transitioning from reveal to guessing, move to next question
    if (currentPhase === "reveal" && targetPhase === "guessing") {
      // Get all questions for this game, ordered by orderIndex
      const allQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.gameId, gameId))
        .orderBy(asc(questions.orderIndex));

      if (allQuestions.length === 0) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "No questions found for this game",
            },
          },
          { status: 400 },
        );
      }

      // Find the current question index
      const currentIndex = allQuestions.findIndex(
        (q) => q.id === currentQuestionId,
      );

      // Move to next question (or loop back to first if at end)
      const nextIndex = (currentIndex + 1) % allQuestions.length;
      const nextQuestionId = allQuestions[nextIndex].id;

      await db
        .update(games)
        .set({
          currentPhase: targetPhase,
          currentQuestionId: nextQuestionId,
        })
        .where(eq(games.id, gameId));
    } else if (!currentQuestionId && targetPhase === "guessing") {
      // Starting the game for the first time - set first question
      const allQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.gameId, gameId))
        .orderBy(asc(questions.orderIndex));

      if (allQuestions.length === 0) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "No questions found for this game",
            },
          },
          { status: 400 },
        );
      }

      const firstQuestionId = allQuestions[0].id;

      await db
        .update(games)
        .set({
          currentPhase: targetPhase,
          currentQuestionId: firstQuestionId,
        })
        .where(eq(games.id, gameId));
    } else {
      await db
        .update(games)
        .set({ currentPhase: targetPhase })
        .where(eq(games.id, gameId));
    }

    // Broadcast phase change event (non-blocking)
    try {
      if (currentQuestionId) {
        await broadcastPhaseChange(gameId, currentQuestionId, targetPhase);
      }

      // Broadcast score update event if we calculated scores
      if (scoreChanges && closestGuessId) {
        await broadcastScoreUpdate(gameId, scoreChanges, closestGuessId);
      }
    } catch (error) {
      // Log but don't fail the request if broadcasting fails
      console.error("Failed to broadcast phase change/score update:", error);
    }

    // Build response
    const response: {
      currentPhase: string;
      scores?: Record<string, number>;
    } = {
      currentPhase: targetPhase,
    };

    if (scoreChanges) {
      response.scores = scoreChanges;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Log error for debugging
    console.error("Error advancing phase:", error);

    // Return error response
    return NextResponse.json(
      {
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to advance phase. Please try again.",
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
