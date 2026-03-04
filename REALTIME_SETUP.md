# Supabase Realtime Setup

## Current Status

The application uses Supabase Realtime for live updates, but includes automatic fallback to polling if Realtime is unavailable.

## How It Works

### With Realtime (Optimal)

- Instant updates when players join, submit guesses, place bets, or when phases change
- Low latency, efficient bandwidth usage
- Requires Realtime to be enabled in Supabase project

### Without Realtime (Fallback)

- Automatic polling every 3 seconds when Realtime connection fails
- Still functional, but with slight delay
- No configuration needed - works automatically

## Enabling Realtime in Supabase (Optional)

If you want to enable Realtime for instant updates:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Scroll to **Realtime** section
4. Enable Realtime for your project
5. No code changes needed - the app will automatically connect

## Current Behavior

- **Connection Banner**: Only shows "Reconnecting..." when actively trying to reconnect
- **Fallback Polling**: Automatically polls for updates every 3 seconds if Realtime is unavailable
- **No User Impact**: The game works perfectly fine with or without Realtime enabled

## Testing

To test Realtime functionality:

1. Enable Realtime in Supabase dashboard
2. Open the game on multiple devices
3. Changes should appear instantly across all devices
4. If Realtime is disabled, changes will appear within 3 seconds (polling interval)
