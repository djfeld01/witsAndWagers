import { getSupabaseClient } from "./supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Channel naming convention: game:{gameId}
 * This ensures each game session has its own isolated channel
 */
export function getGameChannelName(gameId: string): string {
  return `game:${gameId}`;
}

/**
 * Get or create a Realtime channel for a specific game
 */
export function getGameChannel(gameId: string): RealtimeChannel {
  const channelName = getGameChannelName(gameId);
  const supabase = getSupabaseClient();
  return supabase.channel(channelName);
}

/**
 * Event types for real-time communication
 */
export type RealtimeEvent =
  | PhaseChangeEvent
  | PlayerJoinedEvent
  | GuessSubmittedEvent
  | BetPlacedEvent
  | ScoreUpdateEvent;

export interface PhaseChangeEvent {
  type: "phase_change";
  questionId: string;
  phase: "guessing" | "betting" | "reveal";
  timestamp: string;
}

export interface PlayerJoinedEvent {
  type: "player_joined";
  player: {
    id: string;
    displayName: string;
  };
  timestamp: string;
}

export interface GuessSubmittedEvent {
  type: "guess_submitted";
  questionId: string;
  guessCount: number;
  timestamp: string;
}

export interface BetPlacedEvent {
  type: "bet_placed";
  questionId: string;
  betCount: number;
  timestamp: string;
}

export interface ScoreUpdateEvent {
  type: "score_update";
  scores: Record<string, number>;
  closestGuessId: string;
  timestamp: string;
}
