# Implementation Plan: Game End and Display Improvements

## Overview

This implementation plan breaks down the game-end-and-display-improvements feature into discrete coding tasks. The feature adds responsive number sizing, submission tracking, and final results screen to the #Trivia game display page. All tasks build incrementally, with property-based tests integrated throughout to validate correctness properties early.

## Tasks

- [x] 1. Create responsive text sizing utility
  - [x] 1.1 Implement getResponsiveFontSize function in lib/display/responsiveText.ts
    - Calculate font size based on digit count
    - Handle edge cases (zero, negative numbers, decimals)
    - Enforce minimum font size of 24px
    - Scale proportionally for numbers with 7+ digits
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  - [x] 1.2 Implement getResponsiveTextStyle function in lib/display/responsiveText.ts
    - Return Tailwind-compatible style object
    - Use getResponsiveFontSize internally
    - _Requirements: 1.1, 1.2_
  - [ ]\* 1.3 Write property test for responsive font sizing
    - **Property 1: Responsive Font Sizing for Large Numbers**
    - **Validates: Requirements 1.1, 1.2, 1.4, 1.5**
    - Generate random numbers with 7-20 digits
    - Verify font size < base size and >= 24px
    - Use fast-check with 100+ iterations
  - [ ]\* 1.4 Write unit tests for responsiveText utility
    - Test specific digit thresholds (6, 7, 10, 15 digits)
    - Test edge cases (zero, negative, decimals)
    - Test minimum font size enforcement
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 2. Create submission counter component
  - [x] 2.1 Create SubmissionCounter component in app/display/[gameId]/components/SubmissionCounter.tsx
    - Accept phase, submittedCount, totalCount as props
    - Render "X/Y submitted" format
    - Apply conditional visibility based on phase
    - Style with semi-transparent background and prominent text
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6_
  - [ ]\* 2.2 Write property test for submission counter format
    - **Property 10: Submission Counter Format**
    - **Validates: Requirements 4.4**
    - Generate random submission and player counts
    - Verify output matches "X/Y submitted" pattern
    - Use fast-check with 100+ iterations
  - [ ]\* 2.3 Write property test for submission counter visibility
    - **Property 11: Submission Counter Visibility**
    - **Validates: Requirements 4.5**
    - Generate random game phases
    - Verify visibility only during guessing/betting
    - Use fast-check with 100+ iterations
  - [ ]\* 2.4 Write unit tests for SubmissionCounter component
    - Test rendering with various counts (0/0, 5/10, 10/10)
    - Test visibility based on phase
    - Test styling and positioning
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement final results screen
  - [x] 4.1 Create FinalResultsScreen component in app/display/[gameId]/components/FinalResultsScreen.tsx
    - Accept players array and gameId as props
    - Sort players by score in descending order
    - Highlight winner with distinct visual treatment (gold background, trophy icon)
    - Display full leaderboard with rank, name, and score
    - Add navigation button to return to host view
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]\* 4.2 Write property test for player score sorting
    - **Property 5: Player Score Sorting**
    - **Validates: Requirements 3.2**
    - Generate random player arrays with scores
    - Verify output is sorted descending
    - Verify highest score is first
    - Use fast-check with 100+ iterations
  - [ ]\* 4.3 Write property test for all players displayed
    - **Property 6: All Player Scores Displayed**
    - **Validates: Requirements 3.4**
    - Generate random player lists
    - Verify all players appear in rendered output
    - Use fast-check with 100+ iterations
  - [ ]\* 4.4 Write unit tests for FinalResultsScreen component
    - Test winner highlighting
    - Test leaderboard rendering
    - Test navigation button
    - Test with single player and multiple players
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 5. Modify display page to integrate new features
  - [x] 5.1 Add responsive sizing to guess boxes in app/display/[gameId]/page.tsx
    - Import getResponsiveTextStyle from lib/display/responsiveText
    - Apply style to guess box number rendering
    - Apply style to correct answer rendering in reveal phase
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 5.2 Add submission counting logic to app/display/[gameId]/page.tsx
    - Calculate submittedGuesses count for current question
    - Calculate submittedBets count for current question
    - Get totalPlayers from gameState.players.length
    - _Requirements: 4.1, 4.2_
  - [x] 5.3 Add SubmissionCounter component to display page
    - Import SubmissionCounter component
    - Pass phase, submittedCount, and totalCount props
    - Position in top-right area below phase indicator
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [x] 5.4 Add game completion detection logic to app/display/[gameId]/page.tsx
    - Calculate isLastQuestion by comparing orderIndex to max
    - Calculate showFinalResults based on phase and isLastQuestion
    - Handle edge cases (empty questions array, missing orderIndex)
    - _Requirements: 3.1, 3.6_
  - [x] 5.5 Add conditional rendering for final results screen
    - Import FinalResultsScreen component
    - Render FinalResultsScreen when showFinalResults is true
    - Render normal reveal content otherwise
    - Pass sorted players and gameId to FinalResultsScreen
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]\* 5.6 Write property test for final results conditional rendering
    - **Property 4: Final Results Screen on Last Question**
    - **Validates: Requirements 3.1**
    - Generate random game states with various question positions
    - Verify final results shown only on last question in reveal phase
    - Use fast-check with 100+ iterations
  - [ ]\* 5.7 Write property test for normal advancement on non-final questions
    - **Property 7: Normal Advancement on Non-Final Questions**
    - **Validates: Requirements 3.6**
    - Generate game states with non-final questions
    - Verify normal reveal content shown
    - Use fast-check with 100+ iterations
  - [ ]\* 5.8 Write property test for submission counter accuracy
    - **Property 8: Submission Counter Accuracy**
    - **Validates: Requirements 4.1, 4.2**
    - Generate random game states with varying submission counts
    - Verify counter shows correct ratio
    - Test both guessing and betting phases
    - Use fast-check with 100+ iterations
  - [ ]\* 5.9 Write property test for submission counter reactivity
    - **Property 9: Submission Counter Reactivity**
    - **Validates: Requirements 4.3**
    - Simulate state changes adding guesses/bets
    - Verify counter updates to reflect new count
    - Use fast-check with 100+ iterations

- [x] 6. Verify play page formatting consistency
  - [x] 6.1 Verify play page uses formatNumber utility in app/play/[gameId]/page.tsx
    - Check that formatNumber is imported and used
    - Verify no changes needed (already implemented)
    - Document verification in code comments
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]\* 6.2 Write property test for format consistency across views
    - **Property 3: Format Consistency Across Views**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - Generate random numbers and format types
    - Call formatNumber from different contexts
    - Verify outputs are identical
    - Use fast-check with 100+ iterations

- [x] 7. Add property test for consistent guess box dimensions
  - [ ]\* 7.1 Write property test for consistent guess box dimensions
    - **Property 2: Consistent Guess Box Dimensions**
    - **Validates: Requirements 1.3**
    - Generate sets of guesses with varying magnitudes
    - Verify all guess boxes maintain same width/height
    - Use fast-check with 100+ iterations

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check library with minimum 100 iterations
- All property tests are tagged with feature name and property number
- Checkpoints ensure incremental validation
- The play page already uses formatNumber utility, so task 6.1 is verification only
- Responsive sizing applies to both guess boxes and correct answer display
- Submission counter updates automatically via existing realtime hooks
