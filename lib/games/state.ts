import { db } from "../db/client";
import { games, players, questions } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";

/**
 * Checks if a game is considered "active".
 * A game is active if:
 * - It has at least one player joined, OR
 * - The current phase is not "guessing", OR
 * - The currentQuestionId is not the first question
 */
export async function isGameActive(gameId: string): Promise<boolean> {
  // Check if game has any players
  const playerCount = await db
    .select()
    .from(players)
    .where(eq(players.gameId, gameId));

  if (playerCount.length > 0) {
    return true;
  }

  // Get game details
  const game = await db
    .select()
    .from(games)
    .where(eq(games.id, gameId))
    .limit(1);

  if (game.length === 0) {
    throw new Error("Game not found");
  }

  const gameData = game[0];

  // Check if phase is not "guessing"
  if (gameData.currentPhase !== "guessing") {
    return true;
  }

  // Check if currentQuestionId is not the first question
  if (gameData.currentQuestionId) {
    const firstQuestion = await db
      .select()
      .from(questions)
      .where(eq(questions.gameId, gameId))
      .orderBy(asc(questions.orderIndex))
      .limit(1);

    if (firstQuestion.length > 0 && gameData.currentQuestionId !== firstQuestion[0].id) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if questions can be edited for a game.
 * Questions can only be edited if the game is not active.
 */
export async function canEditQuestions(gameId: string): Promise<boolean> {
  const active = await isGameActive(gameId);
  return !active;
}
