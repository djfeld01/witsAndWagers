# Requirements Document

## Introduction

This document specifies UX improvements for the Trivia game display page to enhance the host experience and game flow. The improvements focus on making phase transitions smoother, providing automatic advance button visibility when all players complete their actions, and optimizing the pre-game screen layout for smaller displays.

## Glossary

- **Display_Page**: The web page shown on a large screen/projector during gameplay that displays game state, questions, guesses, and results
- **Advance_Button**: The UI control that allows the host to progress the game from one phase to the next
- **Navigation_Panel**: The collapsible menu in the bottom-right corner containing the Advance_Button
- **Game_Phase**: One of the distinct stages of gameplay: pre-game, guessing, betting, reveal, or final results
- **Player_Action**: A submission made by a player during a phase (guess during guessing phase, bet during betting phase)
- **Submission_Count**: The number of players who have completed their action in the current phase
- **Phase_Transition**: The change from one Game_Phase to another
- **Pre-Game_Display**: The landing screen shown before the game starts, displaying the join code and QR code
- **Transition_Animation**: Visual effects that play when the Display_Page changes between Game_Phases

## Requirements

### Requirement 1: Auto-Show Advance Button

**User Story:** As a game host, I want the advance button to automatically appear when all players have completed their actions, so that I can quickly move the game forward without hunting for the hidden navigation menu.

#### Acceptance Criteria

1. WHEN all players have submitted guesses during the guessing phase, THE Navigation_Panel SHALL automatically expand and become visible
2. WHEN all players have placed bets during the betting phase, THE Navigation_Panel SHALL automatically expand and become visible
3. WHILE the Navigation_Panel is auto-expanded, THE Advance_Button SHALL be prominently displayed
4. WHEN the host advances to the next phase, THE Navigation_Panel SHALL collapse back to its default hidden state
5. THE Navigation_Panel SHALL remain manually toggleable via the bottom-right corner button regardless of auto-show state
6. WHEN at least one player has not completed their action, THE Navigation_Panel SHALL remain in its default collapsed state unless manually opened
7. THE Display_Page SHALL display the submission count (e.g., "5/8 guessed") to provide visual feedback on player progress

### Requirement 2: Phase Transition Animations

**User Story:** As a game host, I want smooth animations when transitioning between game phases, so that the experience feels polished and players can clearly understand when the game state changes.

#### Acceptance Criteria

1. WHEN transitioning from guessing phase to betting phase, THE Display_Page SHALL animate the content change with a smooth visual effect
2. WHEN transitioning from betting phase to reveal phase, THE Display_Page SHALL animate the content change with a smooth visual effect
3. WHEN transitioning from reveal phase to the next question's guessing phase, THE Display_Page SHALL animate the content change with a smooth visual effect
4. THE Transition_Animation SHALL complete within 300ms to 800ms to maintain game flow
5. THE Transition_Animation SHALL use CSS transitions or animations for optimal performance
6. WHILE a Transition_Animation is playing, THE Display_Page SHALL prevent user interaction with the Advance_Button to avoid double-clicks
7. THE Transition_Animation SHALL be visually distinct enough that players can perceive the phase change
8. WHEN transitioning to the final results screen, THE Display_Page SHALL animate the content change with a smooth visual effect

### Requirement 3: Compact Pre-Game Display

**User Story:** As a game host, I want the pre-game join screen to be more compact, so that it fits better on smaller screens and projectors without requiring scrolling.

#### Acceptance Criteria

1. THE Pre-Game_Display SHALL reduce vertical spacing between elements compared to the current implementation
2. THE Pre-Game_Display SHALL display the QR code at a size no larger than 200px × 200px
3. THE Pre-Game_Display SHALL display the join code in a font size that is readable but does not exceed 6rem
4. THE Pre-Game_Display SHALL display the "Join Now!" heading in a font size that does not exceed 4rem
5. THE Pre-Game_Display SHALL fit all content (heading, QR code, join code, player count, start button) within a standard 1080p viewport (1920×1080) without vertical scrolling
6. THE Pre-Game_Display SHALL maintain visual hierarchy and readability while reducing overall size
7. THE Pre-Game_Display SHALL use responsive spacing that adapts to viewport height using viewport units or media queries
