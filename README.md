# #Trivia Game Show

A real-time multiplayer trivia game application. Players submit numerical guesses to trivia questions and place bets on which guess is closest to the correct answer.

## Tech Stack

- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Supabase Realtime
- **Testing**: Vitest + fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Supabase account (for real-time features)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your database and Supabase credentials:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Project Structure

- `/app` - Next.js app directory (pages and layouts)
- `/lib` - Utility functions and shared code
- `/db` - Database schema and migrations (Drizzle ORM)
- `/api` - API routes

## Features

- **Game Creation**: Host creates trivia sessions with numerical questions
- **Player Join**: Players join via QR code or join code
- **Three-Phase Gameplay**:
  - Guessing: Players submit numerical guesses
  - Betting: Players bet on which guess is closest
  - Reveal: Show correct answer and award points
- **Real-time Synchronization**: Live updates across all devices
- **Multiple Views**:
  - Host Dashboard: Control panel for managing the game
  - Player View: Mobile-optimized interface for players
  - Display View: Large-screen presentation mode for projectors
- **Automatic Scoring**: Points awarded to closest guesser and correct bettors

## Views

### Host Dashboard (`/host/[gameId]`)

Control panel with:

- QR code for player joining
- Phase advancement controls
- Player list and scores
- Question navigation
- Link to open Display View

### Player View (`/play/[gameId]`)

Mobile-optimized interface:

- Submit guesses during guessing phase
- Place bets during betting phase
- View results during reveal phase
- Real-time score updates

### Display View (`/display/[gameId]`)

Large-screen presentation mode (NEW):

- Full-screen question display during guessing
- Visual guess board during betting
- Dramatic answer reveal with winner highlighting
- Live leaderboard with top 3 (expandable to show all)
- Optimized for widescreen displays and projectors

## Documentation

See `.kiro/specs/wits-wagers-game-show/` for detailed requirements, design, and implementation plan.
