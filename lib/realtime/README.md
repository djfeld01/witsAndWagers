# Realtime Utilities

This directory contains utilities for real-time communication using Supabase Realtime.

## Overview

The Wits and Wagers game uses Supabase Realtime to synchronize game state between the host and players. Each game session has its own isolated channel following the naming convention: `game:{gameId}`.

## Files

- **supabase-client.ts**: Lazy-loaded Supabase client initialization
- **channels.ts**: Channel naming and management utilities
- **broadcast.ts**: Event broadcasting functions
- **index.ts**: Public API exports

## Channel Naming Convention

All game channels follow the pattern: `game:{gameId}`

Example: `game:abc123`

This ensures each game session has its own isolated communication channel.

## Event Types

The system supports five types of real-time events:

### 1. Phase Change Event

Broadcast when the game host advances to a new phase (guessing → betting → reveal).

```typescript
{
  type: "phase_change",
  questionId: string,
  phase: "guessing" | "betting" | "reveal",
  timestamp: string
}
```

### 2. Player Joined Event

Broadcast when a new player joins the game.

```typescript
{
  type: "player_joined",
  player: {
    id: string,
    displayName: string
  },
  timestamp: string
}
```

### 3. Guess Submitted Event

Broadcast when a player submits a guess during the guessing phase.

```typescript
{
  type: "guess_submitted",
  questionId: string,
  guessCount: number,
  timestamp: string
}
```

### 4. Bet Placed Event

Broadcast when a player places a bet during the betting phase.

```typescript
{
  type: "bet_placed",
  questionId: string,
  betCount: number,
  timestamp: string
}
```

### 5. Score Update Event

Broadcast when scores are calculated during the reveal phase.

```typescript
{
  type: "score_update",
  scores: Record<string, number>,
  closestGuessId: string,
  timestamp: string
}
```

## Usage

### Broadcasting Events

```typescript
import {
  broadcastPhaseChange,
  broadcastPlayerJoined,
  broadcastGuessSubmitted,
  broadcastBetPlaced,
  broadcastScoreUpdate,
} from "@/lib/realtime";

// Broadcast a phase change
await broadcastPhaseChange(gameId, questionId, "betting");

// Broadcast a new player
await broadcastPlayerJoined(gameId, playerId, "Alice");

// Broadcast a guess submission
await broadcastGuessSubmitted(gameId, questionId, 5);

// Broadcast a bet placement
await broadcastBetPlaced(gameId, questionId, 3);

// Broadcast score updates
await broadcastScoreUpdate(gameId, { player1: 10, player2: 5 }, "guess123");
```

### Subscribing to Events (Client-side)

```typescript
import { getGameChannel } from "@/lib/realtime";

const channel = getGameChannel(gameId);

channel
  .on("broadcast", { event: "game_event" }, (payload) => {
    const event = payload.payload;

    switch (event.type) {
      case "phase_change":
        // Handle phase change
        break;
      case "player_joined":
        // Handle new player
        break;
      case "guess_submitted":
        // Handle guess submission
        break;
      case "bet_placed":
        // Handle bet placement
        break;
      case "score_update":
        // Handle score update
        break;
    }
  })
  .subscribe();

// Clean up when done
channel.unsubscribe();
```

## Environment Variables

The Supabase client requires the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

These should be set in your `.env.local` file.

## Requirements Validated

This implementation validates the following requirements:

- **8.1**: Phase changes update all player interfaces within 2 seconds
- **8.2**: New players update the host interface within 2 seconds
- **8.3**: Guess submissions update the host interface within 2 seconds
- **8.4**: Persistent connections between player devices and server

## Testing

Run the tests with:

```bash
npm test -- lib/realtime
```
