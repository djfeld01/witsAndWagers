# Requirements Document

## Introduction

This specification defines improvements to the #Trivia game (formerly Wits and Wagers) display and game flow functionality. The game is built with Next.js, React, and Supabase for realtime updates, featuring separate display pages for audience viewing and play pages for individual players. These improvements address visual display issues with large numbers, inconsistent formatting between views, missing game completion flow, and lack of submission progress visibility.

## Glossary

- **Display_Page**: The audience-facing view that shows questions, guesses, and leaderboard on a large screen
- **Play_Page**: The individual player interface used on personal devices to submit guesses and bets
- **Guess_Box**: A UI container that displays a player's numerical guess on the Display_Page
- **Number_Formatting**: The visual representation of numerical values using locale-specific separators and format types (plain, currency, date, percentage)
- **Game_Phase**: The current state of gameplay (guessing, betting, or reveal)
- **Final_Results_Screen**: A dedicated view shown when all questions have been completed, displaying final scores and winner
- **Submission_Counter**: A real-time indicator showing how many players have submitted their response out of the total player count
- **Question_Order**: The sequential position of questions in the game, used to determine when the last question is reached

## Requirements

### Requirement 1: Display Large Numbers Without Overflow

**User Story:** As a game host, I want large numbers to display properly in guess boxes, so that the audience can read all guesses clearly without visual overflow.

#### Acceptance Criteria

1. WHEN a guess value exceeds 1 million, THE Display_Page SHALL render the number within the Guess_Box boundaries without overflow
2. WHEN a guess value exceeds 1 million, THE Display_Page SHALL automatically reduce the font size to fit the number within the Guess_Box
3. WHEN multiple guesses of varying magnitudes are displayed, THE Display_Page SHALL maintain consistent Guess_Box dimensions
4. THE Display_Page SHALL apply responsive text sizing for numbers with 7 or more digits
5. WHEN the correct answer exceeds 1 million, THE Display_Page SHALL render it without overflow in the reveal phase

### Requirement 2: Consistent Number Formatting Across Views

**User Story:** As a player, I want to see numbers formatted the same way on my device as they appear on the display screen, so that I can easily recognize my guess.

#### Acceptance Criteria

1. WHEN a number is displayed on the Play_Page, THE Play_Page SHALL use the same Number_Formatting as the Display_Page
2. WHEN a number uses currency format, THE Play_Page SHALL display the currency symbol and formatting identically to the Display_Page
3. WHEN a number uses percentage format, THE Play_Page SHALL display the percentage symbol and formatting identically to the Display_Page
4. WHEN a number uses plain format, THE Play_Page SHALL display locale-specific separators identically to the Display_Page
5. THE Play_Page SHALL apply the formatNumber utility function to all displayed numerical values

### Requirement 3: Game Completion and Final Results

**User Story:** As a game host, I want the game to show a final results screen after the last question, so that players can see the final standings and celebrate the winner.

#### Acceptance Criteria

1. WHEN the Game_Phase is "reveal" AND the current question is the last in Question_Order, THE Display_Page SHALL show the Final_Results_Screen instead of advancing to the next question
2. THE Final_Results_Screen SHALL display all players sorted by score in descending order
3. THE Final_Results_Screen SHALL highlight the winning player with a distinct visual treatment
4. THE Final_Results_Screen SHALL display each player's final score
5. WHEN viewing the Final_Results_Screen, THE Display_Page SHALL provide a navigation option to restart the game or return to the host view
6. WHEN the Game_Phase is "reveal" AND the current question is NOT the last in Question_Order, THE Display_Page SHALL allow advancing to the next question as normal

### Requirement 4: Real-Time Submission Progress Indicator

**User Story:** As a game host, I want to see how many players have submitted their responses, so that I know when to advance to the next phase.

#### Acceptance Criteria

1. WHILE the Game_Phase is "guessing", THE Display_Page SHALL display a Submission_Counter showing the count of submitted guesses versus total player count
2. WHILE the Game_Phase is "betting", THE Display_Page SHALL display a Submission_Counter showing the count of placed bets versus total player count
3. THE Submission_Counter SHALL update in real-time as players submit responses
4. THE Submission_Counter SHALL display in the format "X/Y submitted" where X is submitted count and Y is total player count
5. WHILE the Game_Phase is "reveal", THE Display_Page SHALL NOT display the Submission_Counter
6. THE Submission_Counter SHALL be positioned prominently on the Display_Page for easy visibility
