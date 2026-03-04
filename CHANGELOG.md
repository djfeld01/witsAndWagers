# Changelog

## [Unreleased]

### Added - Game Management Features

#### Simplified Game Creation

- Create games with just a title (no questions required initially)
- Add questions later using bulk import or manual entry
- Streamlined workflow for faster game setup

#### Bulk Question Import

- Import questions from CSV files
- Import questions from JSON files
- Validation before import (fail-fast with detailed errors)
- Transaction safety (all or nothing import)
- Sample CSV file included (`sample-questions.csv`)

#### Question Editing

- Inline editing of question text and answers
- Delete individual questions
- Drag-and-drop reordering
- State-based access control (editing disabled when game is active)
- Visual feedback during operations

#### Game Reset

- Reset game to initial state for practice runs
- Removes all players, guesses, and bets
- Preserves all questions
- Confirmation dialog to prevent accidents
- Perfect for testing before presentations

#### Authorization & Security

- Host-only access to management features
- State-based editing restrictions
- Transaction safety for data integrity

### Changed

- Game creation now allows empty questions array
- Host dashboard shows Question Management section by default
- Updated validation to support games without initial questions

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
