# Getting Started with Wits & Wagers

## Quick Start Options

You have three options to run this application:

### Option 1: Use Supabase Cloud (Recommended - Easiest)

This is the fastest way to get started without installing anything locally.

1. **Create a free Supabase account**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get your connection details**:
   - In your Supabase project dashboard, go to Settings → Database
   - Copy the connection string (URI format)
   - Go to Settings → API
   - Copy the `URL` and `anon public` key

3. **Update `.env.local`**:

   ```env
   # Use the connection string from Supabase
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

   # Use the API URL and anon key from Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   ```

4. **Push the database schema**:

   ```bash
   npm run db:push
   ```

5. **Seed sample data** (optional):

   ```bash
   npm run db:seed
   ```

6. **Start the development server**:

   ```bash
   npm run dev
   ```

7. **Open the app**:
   - Navigate to [http://localhost:3000](http://localhost:3000)

### Option 2: Use Supabase Local (Requires Docker)

If you want to run everything locally:

1. **Install Docker Desktop**:
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Install and start Docker Desktop

2. **Start Supabase**:

   ```bash
   supabase start
   ```

3. **Copy the connection details** from the output and update `.env.local`:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-from-output]
   ```

4. **Push schema and seed data**:

   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start the dev server**:
   ```bash
   npm run dev
   ```

### Option 3: Use PostgreSQL Directly (No Realtime)

If you have PostgreSQL installed locally:

1. **Create a database**:

   ```bash
   createdb wits_wagers
   ```

2. **Update `.env.local`**:

   ```env
   DATABASE_URL=postgresql://localhost:5432/wits_wagers
   # Leave Supabase vars as placeholders - realtime won't work
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
   ```

3. **Push schema and seed**:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start the dev server**:

   ```bash
   npm run dev
   ```

   **Note**: Real-time updates won't work without Supabase, but the core game functionality will work.

## Testing the Application

Once running, you can test the complete game flow:

1. **Create a game**:
   - Go to [http://localhost:3000](http://localhost:3000)
   - Click "Host a Game"
   - Fill in game title and questions
   - Click "Create Game"

2. **Join as players**:
   - Open the app on multiple devices/browsers
   - Use the join code or scan the QR code
   - Enter player names

3. **Play through the phases**:
   - **Guessing**: Players submit numerical guesses
   - **Betting**: Players bet on which guess is closest
   - **Reveal**: See the correct answer and updated scores

4. **Host controls**:
   - Use the "Next Phase" button to advance
   - Watch player submissions in real-time
   - See the leaderboard update

## Troubleshooting

### "Failed to connect to database"

- Verify your `DATABASE_URL` is correct in `.env.local`
- Make sure your database is running
- Try running `npm run db:push` again

### "Missing Supabase environment variables"

- This warning is expected if not using Supabase
- Real-time features won't work, but the game will still function
- To enable real-time, use Option 1 or 2 above

### Port already in use

- If port 3000 is taken, Next.js will suggest an alternative
- Or stop the process using port 3000

### Tests failing

- Run `npm test` to verify all tests pass
- All 191 tests should pass

## Next Steps

- Customize questions for your event
- Test with multiple players
- Deploy to production (see deployment guide)

## Need Help?

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Next.js documentation](https://nextjs.org/docs)
- See `SUPABASE_SETUP.md` for detailed Supabase setup
- See `DATABASE_QUICKSTART.md` for database details
