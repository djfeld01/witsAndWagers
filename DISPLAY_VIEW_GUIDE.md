# Display View Guide

## Overview

The Display View is a large-screen presentation mode optimized for projectors and TVs. It provides a cinematic experience for running your Wits and Wagers game show.

## How to Access

1. Create a game from the Host Dashboard
2. Click the **"Open Display View"** button in the top-right corner
3. The display view will open in a new tab/window
4. Project this window onto your screen/TV

## Features

### Visual Design

- **Dark gradient background** (blue to purple) for professional look
- **Large, bold text** optimized for viewing from a distance
- **Smooth animations** and transitions between phases
- **Fixed leaderboard** in the top-right corner

### Phase-by-Phase Display

#### Guessing Phase

- Full-screen question display
- Large, centered text (6xl font size)
- Sub-text displayed below question
- Status message: "Players are submitting their guesses..."

#### Betting Phase

- Question displayed at top (smaller, 4xl font)
- Grid of all guesses with player names
- Zero option highlighted in gray
- Player guesses in blue cards
- Status message: "Players are placing their bets..."

#### Reveal Phase

- Question at top
- **Massive correct answer** (8xl font) in green
- Follow-up notes displayed in blue box
- All guesses shown with winner highlighted:
  - Winner card: Green background with ⭐ WINNER ⭐
  - Winner card scales up (110%) for emphasis
  - Other guesses: Subtle white background

### Leaderboard

**Fixed Position**: Top-right corner, always visible

**Top 3 Display** (default):

- 🥇 1st place: Gold background
- 🥈 2nd place: Silver background
- 🥉 3rd place: Bronze background
- Shows player name and score

**Show All Button**:

- Click to expand and see all players
- Click again to collapse back to top 3
- Numbered list for 4th place and below

## Tips for Best Experience

1. **Use a second monitor/projector** - Keep the Host Dashboard on your laptop, project the Display View
2. **Full screen mode** - Press F11 (or Cmd+Ctrl+F on Mac) for immersive full-screen
3. **Test before the game** - Open the display view and advance through phases to ensure everything looks good
4. **Stable internet** - Display view uses real-time updates, ensure good connectivity
5. **Dark room** - The dark background looks best in a dimly lit room

## Keyboard Shortcuts

- **F11** (Windows/Linux) or **Cmd+Ctrl+F** (Mac): Toggle full screen
- **Esc**: Exit full screen

## Troubleshooting

**Display not updating?**

- Check that the Host Dashboard is advancing phases
- Refresh the display view page
- Check internet connection

**Text too small?**

- Use browser zoom (Cmd/Ctrl + Plus)
- Adjust projector resolution
- Move projector closer to screen

**Leaderboard blocking content?**

- The leaderboard is positioned to avoid blocking main content
- Collapse to "Top 3" if showing all players

## Technical Details

- **Route**: `/display/[gameId]`
- **Real-time**: Uses Supabase Realtime with 3-second polling fallback
- **Responsive**: Optimized for 16:9 widescreen displays
- **Performance**: Lightweight, minimal re-renders
