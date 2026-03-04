# Changelog

## [Unreleased]

### Added - Display View Improvements

#### Navigation Controls

- Added hidden navigation button in bottom-left corner
- Click to reveal/hide navigation panel
- Advance phases directly from display view
- Works in parallel with Host Dashboard controls
- Perfect for single-screen setups

#### Improved Readability

- Increased card text size from 5xl to 7xl for betting and reveal phases
- Changed grid layout from 4 columns to 3 columns for larger cards
- Increased card padding from p-8 to p-12
- Increased border thickness from 2px to 4px
- Increased player name text from sm to xl
- Better visibility from distance

#### Leaderboard Improvements

- Reduced overall size for less screen space
- Added collapse/expand functionality
- Collapsed mode shows only top leader
- Expanded mode shows top 3 (or all players)
- Smaller text and padding for compact display

### Fixed

- Realtime connection fallback to polling (3-second interval)
- Removed persistent "Connection lost" banner
- Only shows "Reconnecting..." when actively reconnecting

## Previous Updates

### Initial Release

- Game creation with custom questions
- Player join via QR code
- Three-phase gameplay (guessing, betting, reveal)
- Real-time synchronization
- Host Dashboard
- Player View (mobile-optimized)
- Display View (projector-optimized)
