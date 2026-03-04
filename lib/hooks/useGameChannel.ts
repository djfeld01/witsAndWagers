"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getGameChannel } from "@/lib/realtime/channels";
import type {
  PhaseChangeEvent,
  PlayerJoinedEvent,
  GuessSubmittedEvent,
  BetPlacedEvent,
  ScoreUpdateEvent,
} from "@/lib/realtime/channels";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type GameEvent =
  | PhaseChangeEvent
  | PlayerJoinedEvent
  | GuessSubmittedEvent
  | BetPlacedEvent
  | ScoreUpdateEvent;

export interface UseGameChannelOptions {
  gameId: string;
  onPhaseChange?: (event: PhaseChangeEvent) => void;
  onPlayerJoined?: (event: PlayerJoinedEvent) => void;
  onGuessSubmitted?: (event: GuessSubmittedEvent) => void;
  onBetPlaced?: (event: BetPlacedEvent) => void;
  onScoreUpdate?: (event: ScoreUpdateEvent) => void;
  onReconnect?: () => void;
  enabled?: boolean;
}

export interface UseGameChannelReturn {
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
  reconnectAttempts: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

/**
 * React hook for subscribing to game channel events with automatic reconnection
 *
 * Features:
 * - Automatic subscription to game channel
 * - Event handlers for all game event types
 * - Exponential backoff reconnection (max 5 attempts)
 * - Connection status tracking
 * - Automatic cleanup on unmount
 *
 * @param options - Configuration options
 * @returns Connection status and control functions
 */
export function useGameChannel(
  options: UseGameChannelOptions,
): UseGameChannelReturn {
  const {
    gameId,
    onPhaseChange,
    onPlayerJoined,
    onGuessSubmitted,
    onBetPlaced,
    onScoreUpdate,
    onReconnect,
    enabled = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubscribedRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (channelRef.current && isSubscribedRef.current) {
      channelRef.current.unsubscribe();
      isSubscribedRef.current = false;
    }

    channelRef.current = null;
  }, []);

  // Subscribe to channel
  const subscribe = useCallback(async () => {
    if (!enabled || isSubscribedRef.current) {
      return;
    }

    try {
      setError(null);

      // Get channel
      const channel = getGameChannel(gameId);
      channelRef.current = channel;

      // Subscribe to game events
      channel.on("broadcast", { event: "game_event" }, ({ payload }) => {
        const event = payload as GameEvent;

        // Route event to appropriate handler
        switch (event.type) {
          case "phase_change":
            onPhaseChange?.(event);
            break;
          case "player_joined":
            onPlayerJoined?.(event);
            break;
          case "guess_submitted":
            onGuessSubmitted?.(event);
            break;
          case "bet_placed":
            onBetPlaced?.(event);
            break;
          case "score_update":
            onScoreUpdate?.(event);
            break;
        }
      });

      // Subscribe to channel
      await channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          setIsReconnecting(false);
          setReconnectAttempts(0);
          isSubscribedRef.current = true;

          // Call reconnect callback if this is a reconnection
          if (reconnectAttempts > 0) {
            onReconnect?.();
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setIsConnected(false);
          isSubscribedRef.current = false;

          // Attempt reconnection with exponential backoff
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            setIsReconnecting(true);
            const delay =
              INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts);

            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectAttempts((prev) => prev + 1);
              cleanup();
              subscribe();
            }, delay);
          } else {
            setIsReconnecting(false);
            setError(
              new Error(
                `Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts`,
              ),
            );
          }
        } else if (status === "CLOSED") {
          setIsConnected(false);
          isSubscribedRef.current = false;
        }
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to subscribe to channel"),
      );
      setIsConnected(false);
      isSubscribedRef.current = false;
    }
  }, [
    enabled,
    gameId,
    onPhaseChange,
    onPlayerJoined,
    onGuessSubmitted,
    onBetPlaced,
    onScoreUpdate,
    onReconnect,
    reconnectAttempts,
    cleanup,
  ]);

  // Subscribe on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      subscribe();
    }

    return cleanup;
  }, [enabled, subscribe, cleanup]);

  return {
    isConnected,
    isReconnecting,
    error,
    reconnectAttempts,
  };
}
