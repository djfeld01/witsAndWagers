// Export Supabase client
export { getSupabaseClient, supabase } from "./supabase-client";

// Export channel utilities
export { getGameChannelName, getGameChannel } from "./channels";

// Export event types
export type {
  RealtimeEvent,
  PhaseChangeEvent,
  PlayerJoinedEvent,
  GuessSubmittedEvent,
  BetPlacedEvent,
  ScoreUpdateEvent,
} from "./channels";

// Export broadcast functions
export {
  broadcastPhaseChange,
  broadcastPlayerJoined,
  broadcastGuessSubmitted,
  broadcastBetPlaced,
  broadcastScoreUpdate,
} from "./broadcast";
