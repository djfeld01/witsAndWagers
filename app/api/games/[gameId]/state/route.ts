import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { games, questions, players, guesses, bets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/games/[gameId]/state
 * Retrieves the complete game state including all related data
 *
 * Response:
 * {
 *   game: {
 *     id: string;
 *     title: string;
 *     joinCode: string;
 *     currentQuestionId: string;
 *     currentPhase: "guessing" | "betting" | "reveal";
 *   };
 *   questions: Question[];
 *   players: Player[];
 *   guesses: Guess[];
 *   bets: Bet[];
 *   scores: Record<string, number>;
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) {
  try {
    const { gameId } = await params;

    // Retrieve game
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

    // Retrieve all questions for this game
    const gameQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.gameId, gameId));

    // Retrieve all players for this game
    const gamePlayers = await db
      .select()
      .from(players)
      .where(eq(players.gameId, gameId));

    // Retrieve all guesses for this game's questions
    const questionIds = gameQuestions.map((q) => q.id);
    let gameGuesses: any[] = [];
    if (questionIds.length > 0) {
      // Get guesses for all questions in this game
      for (const questionId of questionIds) {
        const questionGuesses = await db
          .select()
          .from(guesses)
          .where(eq(guesses.questionId, questionId));
        gameGuesses.push(...questionGuesses);
      }
    }

    // Retrieve all bets for this game's questions
    let gameBets: any[] = [];
    if (questionIds.length > 0) {
      // Get bets for all questions in this game
      for (const questionId of questionIds) {
        const questionBets = await db
          .select()
          .from(bets)
          .where(eq(bets.questionId, questionId));
        gameBets.push(...questionBets);
      }
    }

    // Calculate current scores from player records
    const scores: Record<string, number> = {};
    gamePlayers.forEach((player) => {
      scores[player.id] = player.score;
    });

    // Build response
    const response = {
      game: {
        id: game[0].id,
        title: game[0].title,
        joinCode: game[0].joinCode,
        currentQuestionId: game[0].currentQuestionId,
        currentPhase: game[0].currentPhase,
      },
      questions: gameQuestions.map((q) => ({
        id: q.id,
        gameId: q.gameId,
        orderIndex: q.orderIndex,
        text: q.text,
        subText: q.subText,
        correctAnswer: q.correctAnswer,
        answerFormat: q.answerFormat,
        followUpNotes: q.followUpNotes,
      })),
      players: gamePlayers.map((p) => ({
        id: p.id,
        gameId: p.gameId,
        displayName: p.displayName,
        score: p.score,
        joinedAt: p.joinedAt,
      })),
      guesses: gameGuesses.map((g) => ({
        id: g.id,
        questionId: g.questionId,
        playerId: g.playerId,
        guess: g.guess,
        submittedAt: g.submittedAt,
      })),
      bets: gameBets.map((b) => ({
        id: b.id,
        questionId: b.questionId,
        playerId: b.playerId,
        guessId: b.guessId,
        betOnZero: b.betOnZero,
        placedAt: b.placedAt,
      })),
      scores,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Log error for debugging
    console.error("Error retrieving game state:", error);

    // Return error response
    return NextResponse.json(
      {
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to retrieve game state. Please try again.",
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
