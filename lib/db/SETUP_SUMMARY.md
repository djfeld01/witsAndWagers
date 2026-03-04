# Database Setup Summary

This document summarizes the database migration and seed infrastructure created for the Wits and Wagers game show application.

## Files Created

### Configuration Files

1. **`drizzle.config.ts`** (root)
   - Drizzle Kit configuration
   - Points to schema at `lib/db/schema.ts`
   - Outputs migrations to `drizzle/` directory
   - Uses PostgreSQL dialect

### Database Utilities

2. **`lib/db/client.ts`**
   - Database client setup using Drizzle ORM
   - Creates PostgreSQL connection pool
   - Exports configured `db` instance for use throughout the app

3. **`lib/db/migrate.ts`**
   - Programmatic migration runner
   - Can be executed with `npm run db:migrate`
   - Applies all pending migrations from `drizzle/` directory

4. **`lib/db/seed.ts`**
   - Seed script for local development
   - Creates sample game with join code `TEST01`
   - Includes 3 questions, 3 players, and sample guesses/bets
   - Can be executed with `npm run db:seed`

### Generated Migrations

5. **`drizzle/0000_military_fixer.sql`**
   - Initial migration generated from schema
   - Creates all tables: games, questions, players, guesses, bets
   - Creates enums: answer_format, phase
   - Sets up foreign key relationships

### Documentation

6. **`lib/db/README.md`**
   - Comprehensive database documentation
   - Explains all npm scripts
   - Covers local PostgreSQL and Supabase setup
   - Includes troubleshooting guide

7. **`SUPABASE_SETUP.md`** (root)
   - Complete Supabase local development guide
   - Step-by-step installation instructions
   - Realtime configuration
   - Common commands and troubleshooting

8. **`DATABASE_QUICKSTART.md`** (root)
   - Quick start guide for both PostgreSQL and Supabase
   - 5-minute setup instructions
   - Verification steps
   - Common issues and solutions

## NPM Scripts Added

The following scripts were added to `package.json`:

```json
{
  "db:generate": "drizzle-kit generate", // Generate migration from schema
  "db:migrate": "tsx lib/db/migrate.ts", // Run migrations
  "db:push": "drizzle-kit push", // Push schema directly (dev)
  "db:studio": "drizzle-kit studio", // Open Drizzle Studio
  "db:seed": "tsx lib/db/seed.ts" // Seed sample data
}
```

## Dependencies Installed

### Production Dependencies

- `pg` - PostgreSQL client for Node.js
- `nanoid` - ID generation for database records

### Development Dependencies

- `drizzle-kit` - Drizzle ORM CLI tools
- `tsx` - TypeScript execution for scripts
- `@types/pg` - TypeScript types for pg

## Database Schema

The migration creates the following structure:

### Tables

- **games**: Game sessions with join codes
- **questions**: Trivia questions with answers and formatting
- **players**: Players with scores
- **guesses**: Player guesses for questions
- **bets**: Player bets on guesses

### Enums

- **answer_format**: plain, currency, date, percentage
- **phase**: guessing, betting, reveal

### Relationships

- questions → games (many-to-one)
- players → games (many-to-one)
- guesses → questions, players (many-to-one each)
- bets → questions, players, guesses (many-to-one each)

## Sample Data

The seed script creates:

### Game

- **ID**: Generated with nanoid
- **Title**: "Sample Trivia Game"
- **Join Code**: "TEST01"
- **Phase**: guessing

### Questions

1. Tokyo population (plain number format)
2. Mona Lisa value (currency format)
3. iPhone release year (date format)

### Players

- Alice (score: 0)
- Bob (score: 0)
- Charlie (score: 0)

### Guesses (Question 1)

- Alice: 35 million
- Bob: 40 million
- Charlie: 38 million

### Bets (Question 1)

- All three players bet on Charlie's guess (38 million)

## Quick Start

### Option 1: Local PostgreSQL

```bash
createdb wits_wagers
cp .env.example .env.local
# Edit .env.local with DATABASE_URL
npm run db:push
npm run db:seed
npm run dev
```

### Option 2: Supabase Local

```bash
npm install -g supabase
supabase start
# Copy connection details to .env.local
npm run db:push
npm run db:seed
npm run dev
```

## Verification

After setup, verify by:

1. **Check database**: `npm run db:studio`
2. **View tables**: Should see 5 tables with data
3. **Test join code**: Use "TEST01" to join the sample game
4. **Check players**: Should see Alice, Bob, and Charlie

## Next Steps

1. Set up Supabase Realtime for live updates (see SUPABASE_SETUP.md)
2. Implement API routes that use the database client
3. Create UI components that interact with the database
4. Write tests for database operations

## Troubleshooting

### Common Issues

**"Cannot connect to database"**

- Verify DATABASE_URL in .env.local
- Check PostgreSQL/Supabase is running
- Test connection: `psql $DATABASE_URL`

**"Migration failed"**

- Ensure database exists
- Check for conflicting tables
- Try `npm run db:push` for development

**"Seed failed"**

- Run migrations first: `npm run db:push`
- Check for existing data conflicts
- Verify foreign key relationships

## References

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
