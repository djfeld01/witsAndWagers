import { getGameChannel } from "./channels";
import type {
  PhaseChangeEvent,
  PlayerJoinedEvent,
  GuessSubmittedEvent,
  BetPlacedEvent,
  ScoreUpdateEvent,
} from "./channels";

/**
 * Broadcast a phase change event to all clients in a game
 */
export async function broadcastPhaseChange(
  gameId: string,
  questionId: string,
  phase: "guessing" | "betting" | "reveal",
): Promise<void> {
  const channel = getGameChannel(gameId);

  const event: PhaseChangeEvent = {
    type: "phase_change",
    questionId,
    phase,
    timestamp: new Date().toISOString(),
  };

  await channel.send({
    type: "broadcast",
    event: "game_event",
    payload: event,
  });
}

/**
 * Broadcast a player joined event to all clients in a game
 */
export async function broadcastPlayerJoined(
  gameId: string,
  playerId: string,
  displayName: string,
): Promise<void> {
  const channel = getGameChannel(gameId);

  const event: PlayerJoinedEvent = {
    type: "player_joined",
    player: {
      id: playerId,
      displayName,
    },
    timestamp: new Date().toISOString(),
  };

  await channel.send({
    type: "broadcast",
    event: "game_event",
    payload: event,
  });
}

/**
 * Broadcast a guess submitted event to all clients in a game
 */
export async function broadcastGuessSubmitted(
  gameId: string,
  questionId: string,
  guessCount: number,
): Promise<void> {
  const channel = getGameChannel(gameId);

  const event: GuessSubmittedEvent = {
    type: "guess_submitted",
    questionId,
    guessCount,
    timestamp: new Date().toISOString(),
  };

  await channel.send({
    type: "broadcast",
    event: "game_event",
    payload: event,
  });
}

/**
 * Broadcast a bet placed event to all clients in a game
 */
export async function broadcastBetPlaced(
  gameId: string,
  questionId: string,
  betCount: number,
): Promise<void> {
  const channel = getGameChannel(gameId);

  const event: BetPlacedEvent = {
    type: "bet_placed",
    questionId,
    betCount,
    timestamp: new Date().toISOString(),
  };

  await channel.send({
    type: "broadcast",
    event: "game_event",
    payload: event,
  });
}

/**
 * Broadcast a score update event to all clients in a game
 */
export async function broadcastScoreUpdate(
  gameId: string,
  scores: Record<string, number>,
  closestGuessId: string,
): Promise<void> {
  const channel = getGameChannel(gameId);

  const event: ScoreUpdateEvent = {
    type: "score_update",
    scores,
    closestGuessId,
    timestamp: new Date().toISOString(),
  };

  await channel.send({
    type: "broadcast",
    event: "game_event",
    payload: event,
  });
}
