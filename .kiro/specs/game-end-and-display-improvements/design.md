# Design Document: Game End and Display Improvements

## Overview

This design addresses four key improvements to the #Trivia game's display and game flow:

1. **Responsive number sizing** - Prevents visual overflow when displaying large numbers (7+ digits) in guess boxes
2. **Consistent formatting** - Ensures numbers appear identically on both display and play pages
3. **Game completion flow** - Adds a final results screen when all questions are completed
4. **Submission tracking** - Shows real-time progress of player submissions during guessing and betting phases

The implementation focuses on minimal changes to existing components while adding new UI elements and logic to detect game completion. All features integrate with the existing Next.js/React/Supabase architecture and maintain the current realtime update patterns.

## Architecture

### High-Level Component Structure

```
Display Page (app/display/[gameId]/page.tsx)
├── Responsive Number Display (new utility)
├── Submission Counter Component (new)
└── Final Results Screen (new conditional render)

Play Page (app/play/[gameId]/page.tsx)
└── Uses existing formatNumber utility (no changes needed)

Shared Utilities
├── lib/format.ts (existing - already used consistently)
└── lib/hooks/useGameChannel.ts (existing - handles realtime updates)
```

### Data Flow

The game state already contains all necessary data:

- `questions` array with `orderIndex` field for determining last question
- `guesses` and `bets` arrays for counting submissions
- `players` array for total player count and final scores
- `game.currentPhase` for determining when to show submission counter

No database schema changes are required. All features use existing data structures.

## Components and Interfaces

### 1. Responsive Number Sizing Utility

**Location**: `lib/display/responsiveText.ts` (new file)

**Purpose**: Calculate appropriate font size based on number length to prevent overflow

**Interface**:

```typescript
/**
 * Calculate responsive font size for displaying numbers in guess boxes
 * @param value - The number to display
 * @param baseSize - Base font size in pixels (default: 56 for text-7xl)
 * @param maxDigits - Maximum digits before scaling (default: 6)
 * @returns Font size in pixels
 */
export function getResponsiveFontSize(
  value: number,
  baseSize: number = 56,
  maxDigits: number = 6,
): number;

/**
 * Get Tailwind-compatible inline style for responsive text
 * @param value - The number to display
 * @returns Style object with fontSize property
 */
export function getResponsiveTextStyle(value: number): { fontSize: string };
```

**Algorithm**:

- Count digits in the number (including separators visually)
- If digits <= maxDigits: return baseSize
- If digits > maxDigits: scale down proportionally
- Minimum font size: 24px (to maintain readability)
- Scale factor: baseSize \* (maxDigits / digitCount)

**Example**:

- 1,234 (4 digits) → 56px (no scaling)
- 1,234,567 (7 digits) → 48px (scaled down)
- 12,345,678,900 (11 digits) → 30px (scaled down, above minimum)

### 2. Submission Counter Component

**Location**: `app/display/[gameId]/components/SubmissionCounter.tsx` (new file)

**Purpose**: Display real-time count of player submissions

**Props**:

```typescript
interface SubmissionCounterProps {
  phase: "guessing" | "betting" | "reveal";
  submittedCount: number;
  totalCount: number;
}
```

**Rendering Logic**:

- Only render when phase is "guessing" or "betting"
- Display format: "X/Y submitted"
- Position: Top-right of display page, below phase indicator
- Styling: Prominent, easy to read, non-intrusive

**Visual Design**:

- Background: Semi-transparent dark overlay
- Text: Large, white, bold
- Icon: Checkmark or progress indicator
- Animation: Smooth count updates

### 3. Final Results Screen

**Location**: Inline in `app/display/[gameId]/page.tsx` (conditional render)

**Purpose**: Show final standings when game completes

**Detection Logic**:

```typescript
const isLastQuestion =
  currentQuestion &&
  gameState.questions.length > 0 &&
  currentQuestion.orderIndex ===
    Math.max(...gameState.questions.map((q) => q.orderIndex));

const showFinalResults =
  gameState.game.currentPhase === "reveal" && isLastQuestion;
```

**Display Elements**:

- Title: "Final Results" or "Game Over"
- Winner highlight: Top player with distinct visual treatment (gold background, trophy icon)
- Full leaderboard: All players sorted by score (descending)
- Each entry shows: Rank, Player name, Final score
- Navigation: Button to return to host view or restart game

**Visual Hierarchy**:

1. Winner announcement (large, centered)
2. Winner's score (prominent)
3. Full leaderboard (scrollable if many players)
4. Navigation options (bottom)

### 4. Modified Display Page Logic

**Changes to `app/display/[gameId]/page.tsx`**:

1. **Add submission counting**:

```typescript
const submittedGuesses = gameState.guesses.filter(
  (g) => g.questionId === gameState.game.currentQuestionId,
).length;

const submittedBets = gameState.bets.filter(
  (b) => b.questionId === gameState.game.currentQuestionId,
).length;

const totalPlayers = gameState.players.length;
```

2. **Add game completion detection**:

```typescript
const isLastQuestion =
  currentQuestion &&
  gameState.questions.length > 0 &&
  currentQuestion.orderIndex ===
    Math.max(...gameState.questions.map((q) => q.orderIndex));

const showFinalResults =
  gameState.game.currentPhase === "reveal" && isLastQuestion;
```

3. **Apply responsive sizing to guess boxes**:

```typescript
import { getResponsiveTextStyle } from "@/lib/display/responsiveText";

// In guess box rendering:
<div style={getResponsiveTextStyle(guess.numericGuess)}>
  {formatNumber(guess.numericGuess, currentQuestion.answerFormat)}
</div>
```

4. **Conditional rendering for final results**:

```typescript
{showFinalResults ? (
  <FinalResultsScreen players={sortedPlayers} gameId={gameId} />
) : (
  // Existing reveal phase content
)}
```

## Data Models

No new database tables or schema changes required. All features use existing data structures:

### Existing Models Used

**Game State** (from `/api/games/[gameId]/state`):

```typescript
{
  game: {
    currentPhase: "guessing" | "betting" | "reveal";
    currentQuestionId: string | null;
  }
  questions: Array<{
    id: string;
    orderIndex: number; // Used to detect last question
    correctAnswer: string;
    answerFormat: "plain" | "currency" | "date" | "percentage";
  }>;
  players: Array<{
    id: string;
    displayName: string;
    score: number; // Used for final results
  }>;
  guesses: Array<{
    questionId: string;
    playerId: string;
    guess: string;
  }>;
  bets: Array<{
    questionId: string;
    playerId: string;
  }>;
}
```

### Derived Data

**Submission Counts** (calculated in component):

```typescript
const submissionData = {
  guessing: {
    submitted: guesses.filter((g) => g.questionId === currentQuestionId).length,
    total: players.length,
  },
  betting: {
    submitted: bets.filter((b) => b.questionId === currentQuestionId).length,
    total: players.length,
  },
};
```

**Game Completion Status** (calculated in component):

```typescript
const gameCompletion = {
  isLastQuestion: currentQuestion?.orderIndex === maxOrderIndex,
  showFinalResults: currentPhase === "reveal" && isLastQuestion,
};
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Responsive Font Sizing for Large Numbers

_For any_ number with 7 or more digits, the calculated font size should be smaller than the base font size and should ensure the rendered text fits within the guess box boundaries without overflow.

**Validates: Requirements 1.1, 1.2, 1.4, 1.5**

### Property 2: Consistent Guess Box Dimensions

_For any_ set of guesses with varying magnitudes, all guess boxes should maintain the same width and height dimensions regardless of the font size applied to their content.

**Validates: Requirements 1.3**

### Property 3: Format Consistency Across Views

_For any_ number and format type (plain, currency, date, percentage), calling formatNumber with the same inputs should produce identical output strings regardless of where it's called (display page or play page).

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 4: Final Results Screen on Last Question

_For any_ game state where currentPhase is "reveal" and the current question's orderIndex equals the maximum orderIndex in the questions array, the display page should render the final results screen instead of the normal reveal content.

**Validates: Requirements 3.1**

### Property 5: Player Score Sorting

_For any_ list of players with scores, the final results screen should display them in descending order by score, with the highest score first.

**Validates: Requirements 3.2**

### Property 6: All Player Scores Displayed

_For any_ list of players, the final results screen should include every player's name and score in the rendered output.

**Validates: Requirements 3.4**

### Property 7: Normal Advancement on Non-Final Questions

_For any_ game state where currentPhase is "reveal" and the current question's orderIndex is less than the maximum orderIndex, the display page should show normal reveal content and allow advancing to the next question.

**Validates: Requirements 3.6**

### Property 8: Submission Counter Accuracy

_For any_ game state in "guessing" or "betting" phase, the submission counter should display a count equal to the number of submissions (guesses or bets) for the current question divided by the total number of players.

**Validates: Requirements 4.1, 4.2**

### Property 9: Submission Counter Reactivity

_For any_ game state change that adds a new guess or bet for the current question, the submission counter should update to reflect the new count.

**Validates: Requirements 4.3**

### Property 10: Submission Counter Format

_For any_ submission count X and total player count Y, the submission counter should display the string in the format "X/Y submitted".

**Validates: Requirements 4.4**

### Property 11: Submission Counter Visibility

_For any_ game state, the submission counter should be visible when currentPhase is "guessing" or "betting", and should not be visible when currentPhase is "reveal".

**Validates: Requirements 4.5**

## Error Handling

### Input Validation

**Responsive Font Size Calculation**:

- Handle negative numbers (use absolute value for digit counting)
- Handle zero (treat as 1 digit)
- Handle decimal numbers (count all digits including decimals)
- Handle very large numbers (enforce minimum font size of 24px)

**Submission Counter**:

- Handle zero players (display "0/0 submitted")
- Handle missing current question (don't render counter)
- Handle mismatched data (if submissions > players, still display accurately)

**Final Results Detection**:

- Handle empty questions array (don't show final results)
- Handle missing orderIndex values (use array length as fallback)
- Handle null currentQuestionId (don't show final results)

### Edge Cases

**Large Number Display**:

- Numbers with 15+ digits should still be readable (minimum 24px font)
- Scientific notation numbers should be formatted before sizing
- Negative numbers should include the minus sign in width calculations

**Game Completion**:

- Single question games should show final results after first question
- Games with no questions should not crash
- Games with duplicate orderIndex values should use the highest value

**Submission Tracking**:

- Players who join mid-game should be included in total count
- Duplicate submissions (if they occur) should only count once per player
- Submissions from previous questions should not affect current count

### Error Recovery

**Display Page**:

- If responsive sizing calculation fails, fall back to base font size
- If final results detection fails, show normal reveal screen
- If submission counting fails, hide the counter rather than showing incorrect data

**Realtime Updates**:

- If websocket disconnects, fall back to polling (already implemented)
- If state fetch fails, retry with exponential backoff
- If state is inconsistent, log error but continue rendering with available data

## Testing Strategy

### Unit Testing Approach

Unit tests will focus on specific examples, edge cases, and error conditions for individual functions and components. Property-based tests will handle comprehensive input coverage.

**Responsive Font Sizing** (`lib/display/responsiveText.ts`):

- Test specific digit thresholds (6, 7, 10, 15 digits)
- Test edge cases (zero, negative numbers, decimals)
- Test minimum font size enforcement
- Test with different base sizes

**Submission Counter Component** (`app/display/[gameId]/components/SubmissionCounter.tsx`):

- Test rendering with various counts (0/0, 5/10, 10/10)
- Test visibility based on phase
- Test format string generation

**Final Results Detection**:

- Test with single question game
- Test with multi-question game on last question
- Test with multi-question game on middle question
- Test with empty questions array

**Integration Tests**:

- Test display page renders correctly with large numbers
- Test submission counter updates when state changes
- Test final results screen appears at game end
- Test navigation from final results screen

### Property-Based Testing Approach

Property tests will verify universal properties across randomized inputs using a property-based testing library (fast-check for TypeScript/JavaScript).

**Configuration**:

- Minimum 100 iterations per property test
- Each test tagged with: **Feature: game-end-and-display-improvements, Property {number}: {property_text}**

**Property Test Suite**:

1. **Responsive Font Sizing** (Property 1):
   - Generate random numbers with 7-20 digits
   - Verify calculated font size < base font size
   - Verify calculated font size >= minimum (24px)
   - Tag: **Feature: game-end-and-display-improvements, Property 1: Responsive Font Sizing for Large Numbers**

2. **Format Consistency** (Property 3):
   - Generate random numbers and format types
   - Call formatNumber from different contexts
   - Verify outputs are identical
   - Tag: **Feature: game-end-and-display-improvements, Property 3: Format Consistency Across Views**

3. **Score Sorting** (Property 5):
   - Generate random player arrays with scores
   - Verify output is sorted descending
   - Verify highest score is first
   - Tag: **Feature: game-end-and-display-improvements, Property 5: Player Score Sorting**

4. **Submission Counter Accuracy** (Property 8):
   - Generate random game states with varying submission counts
   - Verify counter shows correct ratio
   - Test both guessing and betting phases
   - Tag: **Feature: game-end-and-display-improvements, Property 8: Submission Counter Accuracy**

5. **Submission Counter Format** (Property 10):
   - Generate random submission and player counts
   - Verify output matches "X/Y submitted" pattern
   - Tag: **Feature: game-end-and-display-improvements, Property 10: Submission Counter Format**

6. **Final Results Conditional Rendering** (Properties 4, 7):
   - Generate random game states with various question positions
   - Verify final results shown only on last question in reveal phase
   - Verify normal content shown otherwise
   - Tag: **Feature: game-end-and-display-improvements, Property 4: Final Results Screen on Last Question**

**Test Data Generators**:

- Large numbers: Generate integers with 1-20 digits
- Player lists: Generate 0-50 players with random names and scores (0-1000)
- Game states: Generate valid game state objects with random phase, question position
- Submission data: Generate random guess/bet arrays matching player counts

**Property Test Examples**:

```typescript
// Example property test structure
describe("Property 1: Responsive Font Sizing", () => {
  it("should scale down font size for numbers with 7+ digits", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000000, max: 999999999999 }), // 7-12 digits
        (largeNumber) => {
          const fontSize = getResponsiveFontSize(largeNumber);
          const baseSize = 56;

          expect(fontSize).toBeLessThan(baseSize);
          expect(fontSize).toBeGreaterThanOrEqual(24);
        },
      ),
      { numRuns: 100 },
    );
  });
});
```

### Testing Balance

- **Unit tests**: Focus on specific examples (e.g., "7 digits triggers scaling", "final results shown on last question")
- **Property tests**: Focus on universal rules (e.g., "all large numbers scale appropriately", "sorting always produces descending order")
- **Integration tests**: Focus on component interactions (e.g., "display page updates when state changes")

This dual approach ensures both concrete correctness (unit tests) and comprehensive coverage (property tests) without redundancy.
