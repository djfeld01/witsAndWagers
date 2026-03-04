# Database Setup

This directory contains the database schema, migrations, and seed scripts for the Wits and Wagers game show application.

## Prerequisites

- PostgreSQL database (local or Supabase)
- Node.js and npm installed

## Environment Setup

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Update the `DATABASE_URL` in `.env.local` with your PostgreSQL connection string:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/wits_wagers
   ```

## Database Scripts

### Generate Migration

Generate a new migration from schema changes:

```bash
npm run db:generate
```

### Run Migrations

Apply migrations to your database:

```bash
npm run db:migrate
```

### Push Schema (Development)

Push schema changes directly to the database without generating migration files (useful for rapid development):

```bash
npm run db:push
```

### Seed Database

Populate the database with sample data for local development:

```bash
npm run db:seed
```

This will create:

- A sample game with join code `TEST01`
- 3 trivia questions with different answer formats
- 3 players (Alice, Bob, Charlie)
- Sample guesses and bets for the first question

### Drizzle Studio

Open Drizzle Studio to browse and edit your database:

```bash
npm run db:studio
```

## Local Development with Supabase

If you're using Supabase for local development:

1. Install Supabase CLI:

   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase:

   ```bash
   supabase init
   ```

3. Start local Supabase:

   ```bash
   supabase start
   ```

4. Get your local database URL:

   ```bash
   supabase status
   ```

5. Update your `.env.local` with the local database URL

6. Run migrations:

   ```bash
   npm run db:push
   ```

7. Seed the database:
   ```bash
   npm run db:seed
   ```

## Schema Overview

### Tables

- **games**: Game sessions with join codes and current state
- **questions**: Trivia questions with correct answers and formatting
- **players**: Players who have joined games with their scores
- **guesses**: Numerical guesses submitted by players
- **bets**: Bets placed by players on guesses

### Enums

- **answer_format**: `plain`, `currency`, `date`, `percentage`
- **phase**: `guessing`, `betting`, `reveal`

## Troubleshooting

### Connection Issues

If you get connection errors, verify:

- PostgreSQL is running
- DATABASE_URL is correct in `.env.local`
- Database exists and user has proper permissions

### Migration Issues

If migrations fail:

- Check the migration SQL in `drizzle/` directory
- Verify schema changes are valid
- Try `npm run db:push` for development

### Seed Issues

If seeding fails:

- Ensure migrations have been run first
- Check that the database is empty or drop existing data
- Verify all foreign key relationships are correct
