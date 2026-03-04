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
- **Extra large text** optimized for viewing from a distance (7xl font size for numbers)
- **3-column grid layout** for better readability on widescreen displays
- **Smooth animations** and transitions between phases
- **Compact, collapsible leaderboard** in the top-right corner
- **Hidden navigation controls** for advancing phases

### Navigation Controls (NEW)

**Hidden Menu Button** (bottom-left corner):

- Small circular button with menu icon
- Click to reveal/hide navigation panel
- Navigation panel shows:
  - Current phase indicator
  - Advance button (Start Betting / Reveal Answer / Next Question)
- Allows advancing phases directly from display view
- Works in parallel with Host Dashboard controls
- Perfect for single-screen setups

### Leaderboard (IMPROVED)

**Compact Design**: Smaller footprint in top-right corner

**Two Display Modes**:

1. **Collapsed**: Shows only the top leader with gold medal 🥇
2. **Expanded**: Shows top 3 with medals (🥇🥈🥉), option to show all players

**Toggle Button**: Click "Collapse"/"Expand" to switch between modes

### Phase-by-Phase Display

#### Guessing Phase

- Full-screen question display
- Large, centered text (6xl font size)
- Sub-text displayed below question
- Status message: "Players are submitting their guesses..."

#### Betting Phase

- Question displayed at top (smaller, 4xl font)
- **3-column grid** of all guesses with player names
- **Extra large numbers** (7xl font) for easy reading from distance
- Zero option highlighted in gray
- Player guesses in blue cards with thicker borders
- Status message: "Players are placing their bets..."

#### Reveal Phase

- Question at top
- **Massive correct answer** (8xl font) in green
- Follow-up notes displayed in blue box
- **3-column grid** of all guesses with winner highlighted:
  - Winner card: Green background with ⭐ WINNER ⭐
  - Winner card scales up (110%) for emphasis
  - Extra large numbers (7xl font) for visibility
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

1. **Single-screen setup** - Use the hidden navigation controls to advance phases directly from the display
2. **Dual-screen setup** - Keep Host Dashboard on your laptop, project Display View, control from either
3. **Full screen mode** - Press F11 (or Cmd+Ctrl+F on Mac) for immersive full-screen
4. **Collapse leaderboard** - Click "Collapse" to show only the leader and maximize content space
5. **Test before the game** - Open the display view and advance through phases to ensure everything looks good
6. **Stable internet** - Display view uses real-time updates, ensure good connectivity
7. **Dark room** - The dark background looks best in a dimly lit room

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
