# Database Quick Start Guide

Get your database up and running in 5 minutes.

## Option 1: Local PostgreSQL (Simplest)

### Prerequisites

- PostgreSQL installed locally

### Steps

1. **Create database**:

   ```bash
   createdb wits_wagers
   ```

2. **Set environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```env
   DATABASE_URL=postgresql://localhost:5432/wits_wagers
   ```

3. **Run migrations**:

   ```bash
   npm run db:push
   ```

4. **Seed sample data**:

   ```bash
   npm run db:seed
   ```

5. **Start the app**:
   ```bash
   npm run dev
   ```

✅ Done! Your database is ready.

## Option 2: Supabase Local (Recommended for Full Features)

### Prerequisites

- Docker Desktop installed and running

### Steps

1. **Install Supabase CLI**:

   ```bash
   npm install -g supabase
   ```

2. **Start Supabase**:

   ```bash
   supabase start
   ```

   Wait for it to finish (first time takes ~2 minutes).

3. **Copy connection details**:

   After `supabase start` completes, copy the output to `.env.local`:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from output>
   ```

4. **Push schema**:

   ```bash
   npm run db:push
   ```

5. **Seed sample data**:

   ```bash
   npm run db:seed
   ```

6. **Enable Realtime** (for live updates):

   Open Supabase Studio: http://localhost:54323

   Run this SQL in the SQL Editor:

   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE games;
   ALTER PUBLICATION supabase_realtime ADD TABLE questions;
   ALTER PUBLICATION supabase_realtime ADD TABLE players;
   ALTER PUBLICATION supabase_realtime ADD TABLE guesses;
   ALTER PUBLICATION supabase_realtime ADD TABLE bets;
   ```

7. **Start the app**:
   ```bash
   npm run dev
   ```

✅ Done! Your database with Realtime is ready.

## Verify Setup

After seeding, you should have:

- ✓ A game with join code `TEST01`
- ✓ 3 players: Alice, Bob, Charlie
- ✓ 3 trivia questions
- ✓ Sample guesses and bets

### Test the Seed Data

1. Open the app: http://localhost:3000
2. Try joining with code: `TEST01`
3. Or browse the database:
   - **Supabase**: http://localhost:54323
   - **Drizzle Studio**: `npm run db:studio`

## Common Issues

### "Connection refused"

- **Local PostgreSQL**: Make sure PostgreSQL is running
- **Supabase**: Run `supabase status` to check if it's running

### "Database does not exist"

- **Local PostgreSQL**: Run `createdb wits_wagers`
- **Supabase**: Run `supabase start`

### "Permission denied"

- Check your DATABASE_URL has correct username/password
- For local PostgreSQL, you may need to create a user

## Next Steps

- See `lib/db/README.md` for detailed database documentation
- See `SUPABASE_SETUP.md` for complete Supabase guide
- Run `npm run db:studio` to explore your database visually

## Available Scripts

```bash
npm run db:generate  # Generate migration from schema changes
npm run db:migrate   # Run migrations
npm run db:push      # Push schema directly (dev only)
npm run db:seed      # Seed sample data
npm run db:studio    # Open Drizzle Studio
```
