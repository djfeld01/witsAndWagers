# Wits and Wagers Game Show

A real-time multiplayer trivia game application based on Wits and Wagers. Players submit numerical guesses to trivia questions and place bets on which guess is closest to the correct answer.

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

- Game host creates trivia sessions with numerical questions
- Players join via QR code or join code
- Three-phase gameplay: guessing, betting, reveal
- Real-time synchronization across all devices
- Automatic scoring and leaderboard

## Documentation

See `.kiro/specs/wits-wagers-game-show/` for detailed requirements, design, and implementation plan.
