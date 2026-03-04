# Implementation Plan: Wits and Wagers Game Show

## Overview

This implementation plan breaks down the Wits and Wagers game show application into discrete coding tasks. The application uses Next.js with TypeScript, Drizzle ORM for PostgreSQL database access, Supabase for real-time synchronization, and Tailwind CSS for styling. The implementation follows a bottom-up approach: database schema → API routes → UI components → real-time integration → testing.

## Tasks

- [x] 1. Set up project infrastructure and database schema
  - [x] 1.1 Initialize Next.js project with TypeScript and configure dependencies
    - Create Next.js app with TypeScript template
    - Install dependencies: drizzle-orm, @supabase/supabase-js, fast-check, vitest, qrcode
    - Configure Tailwind CSS
    - Set up environment variables for database connection
    - _Requirements: 10.1_

  - [x] 1.2 Define Drizzle ORM schema for all database tables
    - Create schema file with games, questions, players, guesses, and bets tables
    - Define enums for answer_format and phase
    - Set up foreign key relationships and constraints
    - _Requirements: 1.7, 2.7, 3.6, 4.8, 5.8, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 1.3 Create database migration and seed scripts
    - Generate initial migration from schema
    - Create seed script for local development testing
    - Set up Supabase local development environment
    - _Requirements: 10.1_

  - [ ]\* 1.4 Write property test for database schema constraints
    - **Property 5: Game Creation Round Trip**
    - **Validates: Requirements 1.7, 10.2**

- [x] 2. Implement core utility functions and validation logic
  - [x] 2.1 Create join code generation utility
    - Implement function to generate unique 6-character alphanumeric codes
    - Add collision detection and retry logic
    - _Requirements: 1.6_

  - [ ]\* 2.2 Write property test for join code uniqueness
    - **Property 4: Join Code Uniqueness**
    - **Validates: Requirements 1.6**

  - [x] 2.3 Create number formatting utility
    - Implement formatNumber function supporting plain, currency, date, percentage
    - Handle edge cases for decimal precision
    - _Requirements: 1.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]\* 2.4 Write property test for number formatting
    - **Property 24: Number Formatting**
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6, 9.7**

  - [x] 2.5 Create validation utilities
    - Implement display name validation (1-30 characters)
    - Implement numerical guess validation
    - Implement required field validation for game creation
    - _Requirements: 1.3, 2.4, 3.4_

  - [ ]\* 2.6 Write property tests for validation logic
    - **Property 1: Required Field Validation**
    - **Property 2: Optional Field Acceptance**
    - **Property 7: Display Name Length Validation**
    - **Property 10: Guess Numerical Validation**
    - **Validates: Requirements 1.3, 1.4, 2.4, 3.4**

- [x] 3. Implement game creation API and logic
  - [x] 3.1 Create POST /api/games route for game creation
    - Validate request body (required fields, answer format types)
    - Generate unique join code
    - Insert game and questions into database using transaction
    - Return game ID, join code, and join URL
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]\* 3.2 Write property tests for game creation
    - **Property 3: Answer Format Type Support**
    - **Property 5: Game Creation Round Trip**
    - **Validates: Requirements 1.5, 1.7, 9.1, 10.2**

  - [ ]\* 3.3 Write unit tests for game creation API
    - Test successful game creation with all fields
    - Test validation errors for missing required fields
    - Test database transaction rollback on error
    - _Requirements: 1.1, 1.2, 1.3, 10.7_

- [x] 4. Implement player join API and QR code generation
  - [x] 4.1 Create POST /api/games/[code]/join route
    - Validate join code exists
    - Validate display name length
    - Generate unique player ID
    - Insert player into database with initial score of 0
    - Return player ID and game ID
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 6.3_

  - [ ]\* 4.2 Write property tests for player join
    - **Property 8: Player Join Round Trip**
    - **Property 9: Player ID Uniqueness**
    - **Property 20: Initial Score Value**
    - **Validates: Requirements 2.5, 2.6, 2.7, 6.3, 10.3**

  - [x] 4.3 Create QR code generation utility
    - Implement function to generate QR code from join URL
    - Return QR code as data URL for display
    - _Requirements: 2.1, 2.2_

  - [ ]\* 4.4 Write property test for QR code encoding
    - **Property 6: QR Code Encoding**
    - **Validates: Requirements 2.1**

  - [ ]\* 4.5 Write unit tests for player join API
    - Test successful join with valid display name
    - Test rejection of invalid display names
    - Test rejection of non-existent join codes
    - _Requirements: 2.3, 2.4_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement guess submission API
  - [x] 6.1 Create POST /api/games/[gameId]/guesses route
    - Validate player ID and question ID exist
    - Validate current phase is "guessing"
    - Validate guess is numerical
    - Check for duplicate guess from same player
    - Insert guess into database
    - Return guess ID
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

  - [ ]\* 6.2 Write property test for guess submission
    - **Property 11: Guess Submission Round Trip**
    - **Validates: Requirements 3.5, 3.6, 10.4**

  - [ ]\* 6.3 Write unit tests for guess submission API
    - Test successful guess submission
    - Test rejection of non-numerical guesses
    - Test rejection when not in guessing phase
    - Test rejection of duplicate guesses
    - _Requirements: 3.4, 3.5_

- [x] 7. Implement betting API and guess ordering
  - [x] 7.1 Create GET /api/games/[gameId]/questions/[questionId]/guesses route
    - Retrieve all guesses for question
    - Sort guesses in ascending numerical order
    - Always include zero as an option
    - Return formatted guess list
    - _Requirements: 4.1, 4.2_

  - [ ]\* 7.2 Write property tests for guess ordering
    - **Property 12: Guess Ordering**
    - **Property 13: Zero Betting Option**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 7.3 Create POST /api/games/[gameId]/bets route
    - Validate player ID and question ID exist
    - Validate current phase is "betting"
    - Validate guess ID exists or bet is on zero
    - Check for duplicate bet from same player
    - Insert bet into database
    - Return bet ID
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]\* 7.4 Write property tests for bet placement
    - **Property 14: Bet Placement Round Trip**
    - **Property 15: Self-Betting Permission**
    - **Validates: Requirements 4.5, 4.6, 4.8, 10.5**

  - [ ]\* 7.5 Write unit tests for betting API
    - Test successful bet placement on guess
    - Test successful bet placement on zero
    - Test self-betting allowed
    - Test rejection when not in betting phase
    - Test rejection of duplicate bets
    - _Requirements: 4.5, 4.6, 4.7_

- [x] 8. Implement scoring calculation and reveal logic
  - [x] 8.1 Create scoring calculation utility
    - Implement function to find closest guess (minimum absolute difference)
    - Implement tie-breaking rule (select lower guess)
    - Calculate score changes: +1 for closest guesser, +1 for each correct bettor
    - Return closest guess ID and score changes map
    - _Requirements: 5.2, 5.5, 5.6, 5.7_

  - [ ]\* 8.2 Write property tests for scoring logic
    - **Property 16: Closest Guess Calculation**
    - **Property 17: Scoring Correctness**
    - **Property 18: Tie-Breaking Rule**
    - **Validates: Requirements 5.2, 5.5, 5.6, 5.7**

  - [ ]\* 8.3 Write unit tests for scoring calculation
    - Test closest guess identification with specific examples
    - Test tie-breaking with equal distances
    - Test score calculation with multiple correct bettors
    - Test edge case: guess exactly equals correct answer
    - Test edge case: all players bet on zero
    - _Requirements: 5.2, 5.5, 5.6, 5.7_

- [x] 9. Implement phase advancement API
  - [x] 9.1 Create POST /api/games/[gameId]/advance route
    - Validate current phase and target phase follow state machine
    - When advancing to reveal: calculate scores and update player scores in database
    - Update game current phase in database
    - Return new phase and score changes (if reveal)
    - _Requirements: 5.8, 7.1, 7.2, 7.3, 7.4, 7.5, 10.6_

  - [ ]\* 9.2 Write property tests for phase advancement
    - **Property 19: Score Update Round Trip**
    - **Property 22: Phase Transition State Machine**
    - **Validates: Requirements 5.8, 7.3, 7.4, 7.5, 10.6**

  - [ ]\* 9.3 Write unit tests for phase advancement API
    - Test guessing → betting transition
    - Test betting → reveal transition with scoring
    - Test reveal → next question transition
    - Test rejection of invalid phase transitions
    - _Requirements: 7.3, 7.4, 7.5_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement game state retrieval API
  - [x] 11.1 Create GET /api/games/[gameId]/state route
    - Retrieve game, questions, players, guesses, bets from database
    - Calculate current scores from player records
    - Return complete game state object
    - _Requirements: 6.1, 6.4, 8.5, 10.1_

  - [ ]\* 11.2 Write property test for score retrieval
    - **Property 21: Score Retrieval Consistency**
    - **Validates: Requirements 6.4**

  - [ ]\* 11.3 Write unit tests for game state API
    - Test retrieval of complete game state
    - Test retrieval with no players
    - Test retrieval with no guesses/bets
    - _Requirements: 6.1, 6.4_

- [x] 12. Implement Supabase Realtime integration
  - [x] 12.1 Set up Supabase client and channel configuration
    - Create Supabase client with environment variables
    - Define channel naming convention: `game:{gameId}`
    - Create utility functions for broadcasting events
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 12.2 Add Realtime event broadcasting to API routes
    - Broadcast phase_change event in advance route
    - Broadcast player_joined event in join route
    - Broadcast guess_submitted event in guess route
    - Broadcast bet_placed event in bet route
    - Broadcast score_update event in advance route (reveal phase)
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 12.3 Create Realtime client hook for React components
    - Implement useGameChannel hook for subscribing to game events
    - Handle connection, disconnection, and reconnection
    - Implement exponential backoff for reconnection (max 5 attempts)
    - Fetch game state on successful reconnection
    - _Requirements: 8.4, 8.5_

  - [ ]\* 12.4 Write property test for reconnection state preservation
    - **Property 23: Reconnection State Preservation**
    - **Validates: Requirements 8.5**

- [x] 13. Implement host dashboard UI
  - [x] 13.1 Create host game creation page (/host/create)
    - Build form with game title input
    - Build dynamic question list with add/remove buttons
    - Add question fields: text, sub-text, correct answer, format, follow-up notes
    - Implement form validation
    - Call POST /api/games on submit
    - Redirect to host dashboard on success
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 13.2 Create host dashboard page (/host/[gameId])
    - Display game title and join code
    - Display QR code for player joining
    - Display current question with answer (hidden until reveal)
    - Display question list with current question highlighted
    - Display player count
    - _Requirements: 2.1, 2.2, 7.1, 7.6, 7.7_

  - [x] 13.3 Add phase control buttons to host dashboard
    - Implement "Next Phase" button
    - Implement "Previous Question" and "Next Question" buttons
    - Display current phase indicator
    - Display submission counts (guesses during guessing, bets during betting)
    - Call POST /api/games/[gameId]/advance on button clicks
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 13.4 Integrate Realtime updates in host dashboard
    - Subscribe to game channel on mount
    - Update player count on player_joined events
    - Update submission counts on guess_submitted and bet_placed events
    - Handle connection status display
    - _Requirements: 8.2, 8.3_

- [x] 14. Implement player join UI
  - [x] 14.1 Create join page (/join/[code])
    - Display game title
    - Build display name input form
    - Validate display name length (1-30 characters)
    - Call POST /api/games/[code]/join on submit
    - Store player ID in local storage
    - Redirect to player view on success
    - Display error messages for invalid codes or names
    - _Requirements: 2.3, 2.4, 2.5_

- [x] 15. Implement player view UI
  - [x] 15.1 Create player view page (/play/[gameId])
    - Display game title, player name, and current score
    - Fetch initial game state from GET /api/games/[gameId]/state
    - Subscribe to game channel for real-time updates
    - Display connection status indicator
    - _Requirements: 6.1, 6.2, 8.1, 8.4_

  - [x] 15.2 Implement guessing phase UI
    - Display question text and sub-text (if provided)
    - Build numerical input field with validation
    - Implement submit button
    - Call POST /api/games/[gameId]/guesses on submit
    - Display confirmation message after submission
    - Show waiting state after guess submitted
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7_

  - [x] 15.3 Implement betting phase UI
    - Display question text in smaller format
    - Fetch and display guesses in ascending order (including zero)
    - Build guess card grid with selectable cards
    - Call POST /api/games/[gameId]/bets on card selection
    - Display confirmation message after bet placed
    - Show waiting state after bet placed
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7_

  - [x] 15.4 Implement reveal phase UI
    - Display correct answer with formatting
    - Highlight closest guess visually
    - Display follow-up notes (if provided)
    - Update and display player's new score
    - Show waiting state for next question
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.2, 9.6, 9.7_

  - [x] 15.5 Integrate Realtime updates in player view
    - Update phase UI on phase_change events
    - Update score on score_update events
    - Refetch game state on reconnection
    - Handle connection loss with fallback polling (3 second interval)
    - _Requirements: 6.2, 8.1, 8.5_

- [x] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Implement error handling and logging
  - [x] 17.1 Add error handling to all API routes
    - Wrap database operations in try-catch blocks
    - Log errors with full context (request data, stack trace)
    - Return user-friendly error responses with error codes
    - Implement transaction rollback on failures
    - _Requirements: 10.7_

  - [ ]\* 17.2 Write property test for database error handling
    - **Property 25: Database Error Handling**
    - **Validates: Requirements 10.7**

  - [x] 17.3 Add client-side error handling
    - Display validation errors inline on forms
    - Show toast notifications for API errors
    - Display connection lost banner when Realtime disconnects
    - Implement graceful degradation with polling fallback
    - _Requirements: 8.5_

- [x] 18. Implement responsive styling with Tailwind CSS
  - [x] 18.1 Style host dashboard for desktop
    - Apply Tailwind classes for layout, typography, colors
    - Style QR code display
    - Style phase control buttons
    - Style question list and current question display
    - _Requirements: 1.1, 2.2, 7.1_

  - [x] 18.2 Style player view for mobile and desktop
    - Apply responsive Tailwind classes
    - Style guess input and betting cards
    - Style score display and connection indicator
    - Ensure touch-friendly button sizes for mobile
    - Test on multiple screen sizes
    - _Requirements: 3.1, 4.3, 6.1_

  - [x] 18.3 Style game creation form
    - Apply Tailwind classes for form layout
    - Style dynamic question list with add/remove buttons
    - Style validation error messages
    - _Requirements: 1.1_

- [x] 19. Final integration and end-to-end testing
  - [x] 19.1 Test complete game flow manually
    - Create game with multiple questions
    - Join with multiple players (test on different devices)
    - Progress through all phases for multiple questions
    - Verify scoring correctness
    - Verify real-time synchronization
    - _Requirements: All_

  - [ ]\* 19.2 Write integration tests for complete game flow
    - Test create → join → guess → bet → reveal → next question
    - Test multiple players joining simultaneously
    - Test phase transitions with partial submissions
    - Test database transaction rollback scenarios
    - _Requirements: All_

- [x] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and integration tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: infrastructure → API → UI → integration
- Supabase local development should be used for testing before deploying to production
- All 25 correctness properties from the design document are covered by property tests
