# Requirements Document

## Introduction

This document specifies the requirements for a Wits and Wagers-style game show application. The system enables a game host to create trivia games with numerical answers, where players submit guesses and place bets on which guess is closest to the correct answer. The application supports real-time multiplayer gameplay through a web interface, with separate views for the presenter (game host) and players.

## Glossary

- **Game_Host**: The user who creates and manages a game session
- **Player**: A participant who joins a game, submits guesses, and places bets
- **Game_Session**: A single instance of a game with a unique set of questions and players
- **Question**: A trivia prompt with a numerical answer
- **Guess**: A numerical answer submitted by a player for a question
- **Bet**: A player's selection of which guess they believe is closest to the correct answer
- **Closest_Guess**: The guess with the smallest absolute difference from the correct answer
- **Question_Phase**: The current stage of a question (guessing, betting, or reveal)
- **Game_Application**: The complete web application system

## Requirements

### Requirement 1: Game Session Creation

**User Story:** As a Game_Host, I want to create a new game session with multiple questions, so that I can run a trivia game for my team.

#### Acceptance Criteria

1. THE Game_Application SHALL provide an interface for the Game_Host to create a new Game_Session
2. WHEN creating a Game_Session, THE Game_Application SHALL allow the Game_Host to add multiple questions
3. FOR EACH question, THE Game_Application SHALL require the Game_Host to provide question text and a numerical answer
4. FOR EACH question, THE Game_Application SHALL allow the Game_Host to optionally provide sub-text, answer formatting type, and follow-up notes
5. THE Game_Application SHALL support answer formatting types including dollars, dates, percentages, and plain numbers
6. WHEN the Game_Host completes question entry, THE Game_Application SHALL generate a unique join code for the Game_Session
7. THE Game_Application SHALL persist the Game_Session and all questions to the database

### Requirement 2: Player Join and Registration

**User Story:** As a Player, I want to join a game session by scanning a QR code or entering a code, so that I can participate in the trivia game.

#### Acceptance Criteria

1. WHEN a Game_Session is created, THE Game_Application SHALL generate a QR code containing the join URL
2. THE Game_Application SHALL display the QR code to the Game_Host
3. WHEN a Player scans the QR code or visits the join URL, THE Game_Application SHALL prompt the Player to enter a display name
4. THE Game_Application SHALL accept display names between 1 and 30 characters
5. WHEN a Player submits a valid display name, THE Game_Application SHALL add the Player to the Game_Session
6. THE Game_Application SHALL assign each Player a unique identifier within the Game_Session
7. THE Game_Application SHALL persist Player information to the database

### Requirement 3: Question Display and Guess Submission

**User Story:** As a Player, I want to see each question and submit my numerical guess, so that I can participate in the guessing phase.

#### Acceptance Criteria

1. WHEN the Question_Phase is guessing, THE Game_Application SHALL display the question text to all players
2. WHERE sub-text is provided, THE Game_Application SHALL display the sub-text below the question text
3. THE Game_Application SHALL provide an input field for the Player to enter a numerical guess
4. THE Game_Application SHALL validate that the guess is a valid number
5. WHEN a Player submits a valid guess, THE Game_Application SHALL persist the guess to the database
6. THE Game_Application SHALL associate each guess with the Player and question
7. WHEN a Player has submitted a guess, THE Game_Application SHALL display a confirmation message

### Requirement 4: Guess Display and Betting

**User Story:** As a Player, I want to see all submitted guesses in numerical order and place a bet on which one I think is correct, so that I can earn points.

#### Acceptance Criteria

1. WHEN the Question_Phase is betting, THE Game_Application SHALL display all submitted guesses in ascending numerical order
2. THE Game_Application SHALL automatically include zero as a betting option
3. THE Game_Application SHALL display the question text in a smaller format during the betting phase
4. THE Game_Application SHALL present each guess as a selectable card
5. WHEN a Player selects a guess, THE Game_Application SHALL record the bet
6. THE Game_Application SHALL allow a Player to bet on their own guess
7. WHEN a Player has placed a bet, THE Game_Application SHALL display a confirmation message
8. THE Game_Application SHALL persist each bet to the database

### Requirement 5: Answer Reveal and Scoring

**User Story:** As a Player, I want to see the correct answer and which guess was closest, so that I know if I earned points.

#### Acceptance Criteria

1. WHEN the Question_Phase is reveal, THE Game_Application SHALL display the correct answer
2. THE Game_Application SHALL calculate the Closest_Guess by finding the guess with minimum absolute difference from the correct answer
3. THE Game_Application SHALL visually highlight the Closest_Guess
4. WHERE follow-up notes are provided, THE Game_Application SHALL display the follow-up notes
5. THE Game_Application SHALL award 1 point to the Player who submitted the Closest_Guess
6. THE Game_Application SHALL award 1 point to each Player who bet on the Closest_Guess
7. IF multiple guesses have equal distance from the correct answer, THEN THE Game_Application SHALL select the lower guess as the Closest_Guess
8. THE Game_Application SHALL persist updated point totals to the database

### Requirement 6: Player Score Display

**User Story:** As a Player, I want to see my current point total on my device, so that I can track my performance throughout the game.

#### Acceptance Criteria

1. THE Game_Application SHALL display the Player's current point total on the player interface
2. WHEN a Player earns points, THE Game_Application SHALL update the displayed point total within 2 seconds
3. THE Game_Application SHALL initialize each Player's point total to zero when they join
4. THE Game_Application SHALL retrieve the current point total from the database when the Player loads their interface

### Requirement 7: Game Host Control Interface

**User Story:** As a Game_Host, I want to control the progression through question phases, so that I can manage the game flow during the session.

#### Acceptance Criteria

1. THE Game_Application SHALL provide controls for the Game_Host to advance the Question_Phase
2. THE Game_Application SHALL display the current Question_Phase to the Game_Host
3. WHEN the Game_Host advances from guessing to betting, THE Game_Application SHALL transition all Player interfaces to the betting phase
4. WHEN the Game_Host advances from betting to reveal, THE Game_Application SHALL calculate scores and transition all Player interfaces to the reveal phase
5. WHEN the Game_Host advances from reveal to the next question, THE Game_Application SHALL transition all Player interfaces to the guessing phase for the next question
6. THE Game_Application SHALL display the number of players who have submitted guesses during the guessing phase
7. THE Game_Application SHALL display the number of players who have placed bets during the betting phase

### Requirement 8: Real-Time State Synchronization

**User Story:** As a Player, I want my interface to automatically update when the game host changes phases, so that I stay synchronized with the game.

#### Acceptance Criteria

1. WHEN the Question_Phase changes, THE Game_Application SHALL update all Player interfaces within 2 seconds
2. WHEN a new Player joins, THE Game_Application SHALL update the Game_Host interface to show the new player count within 2 seconds
3. WHEN guesses are submitted, THE Game_Application SHALL update the Game_Host interface to show the updated submission count within 2 seconds
4. THE Game_Application SHALL maintain persistent connections between Player devices and the server
5. IF a Player's connection is interrupted, THEN THE Game_Application SHALL restore the Player's state when the connection is re-established

### Requirement 9: Question Answer Formatting

**User Story:** As a Game_Host, I want to specify how numerical answers should be formatted, so that questions and answers are displayed appropriately.

#### Acceptance Criteria

1. THE Game_Application SHALL support formatting types: plain number, currency, date, and percentage
2. WHEN the formatting type is currency, THE Game_Application SHALL display values with a dollar sign and two decimal places
3. WHEN the formatting type is date, THE Game_Application SHALL display values as years
4. WHEN the formatting type is percentage, THE Game_Application SHALL display values with a percent sign
5. WHEN the formatting type is plain number, THE Game_Application SHALL display values without additional formatting
6. THE Game_Application SHALL apply the specified formatting to the correct answer during the reveal phase
7. THE Game_Application SHALL apply the specified formatting to all guesses during the betting and reveal phases

### Requirement 10: Data Persistence

**User Story:** As a Game_Host, I want all game data to be saved to a database, so that the game state is preserved and can be recovered if needed.

#### Acceptance Criteria

1. THE Game_Application SHALL persist Game_Session data to the PostgreSQL database using Drizzle ORM
2. THE Game_Application SHALL persist all questions with their associated metadata to the database
3. THE Game_Application SHALL persist all Player registrations to the database
4. THE Game_Application SHALL persist all guesses with timestamps to the database
5. THE Game_Application SHALL persist all bets with timestamps to the database
6. THE Game_Application SHALL persist all point totals to the database
7. WHEN a database write operation fails, THEN THE Game_Application SHALL log the error and display an error message to the user
