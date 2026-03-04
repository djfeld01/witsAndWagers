# Supabase Local Development Setup

This guide walks you through setting up Supabase for local development of the Wits and Wagers game show application.

## Prerequisites

- Docker Desktop installed and running
- Node.js and npm installed
- Supabase CLI installed

## Installation

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

Or using Homebrew (macOS):

```bash
brew install supabase/tap/supabase
```

### 2. Initialize Supabase

In your project root, run:

```bash
supabase init
```

This creates a `supabase/` directory with configuration files.

### 3. Start Supabase Local Stack

```bash
supabase start
```

This will:

- Start PostgreSQL database
- Start Supabase Studio (database UI)
- Start Supabase Auth, Storage, and Realtime services
- Display connection details

**Note**: First run may take a few minutes to download Docker images.

### 4. Get Connection Details

After starting, you'll see output like:

```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

### 5. Update Environment Variables

Copy the connection details to your `.env.local`:

```env
# Database connection
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # Use the anon key from output
```

## Database Setup

### 1. Push Schema to Database

```bash
npm run db:push
```

This applies your Drizzle schema to the local Supabase database.

### 2. Seed Sample Data

```bash
npm run db:seed
```

This creates sample game data for testing.

## Using Supabase Studio

Open Supabase Studio in your browser:

```
http://localhost:54323
```

From Studio, you can:

- Browse tables and data
- Run SQL queries
- View logs
- Test Realtime subscriptions
- Manage authentication

## Realtime Setup

The application uses Supabase Realtime for live updates. To enable Realtime on your tables:

### Option 1: Using Supabase Studio

1. Open Studio at `http://localhost:54323`
2. Go to Database → Replication
3. Enable replication for these tables:
   - `games`
   - `questions`
   - `players`
   - `guesses`
   - `bets`

### Option 2: Using SQL

Run this SQL in Studio or via psql:

```sql
-- Enable Realtime for all game tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE guesses;
ALTER PUBLICATION supabase_realtime ADD TABLE bets;
```

## Common Commands

### Start Supabase

```bash
supabase start
```

### Stop Supabase

```bash
supabase stop
```

### Check Status

```bash
supabase status
```

### View Logs

```bash
supabase logs
```

### Reset Database

```bash
supabase db reset
```

This drops all data and re-runs migrations.

## Development Workflow

1. **Start Supabase**:

   ```bash
   supabase start
   ```

2. **Push schema changes**:

   ```bash
   npm run db:push
   ```

3. **Seed data** (optional):

   ```bash
   npm run db:seed
   ```

4. **Start Next.js dev server**:

   ```bash
   npm run dev
   ```

5. **Open Studio** to view data:
   ```
   http://localhost:54323
   ```

## Troubleshooting

### Docker Issues

If Supabase won't start:

- Ensure Docker Desktop is running
- Check for port conflicts (54321, 54322, 54323)
- Try `supabase stop` then `supabase start`

### Connection Issues

If the app can't connect:

- Verify `DATABASE_URL` in `.env.local` matches `supabase status` output
- Check that Supabase is running: `supabase status`
- Ensure port 54322 is accessible

### Realtime Not Working

If live updates aren't working:

- Verify Realtime is enabled for tables (see Realtime Setup above)
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Verify Supabase client is properly initialized in your app

### Reset Everything

If you need a fresh start:

```bash
supabase stop
supabase start
npm run db:push
npm run db:seed
```

## Production Deployment

When ready to deploy to production:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your production connection details from project settings
3. Update production environment variables
4. Run migrations on production database
5. Enable Realtime on production tables

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
