# Design Document: Game Management Features

## Overview

This design document specifies the technical architecture for game management features in the Wits and Wagers game show application. These features enable hosts to efficiently prepare games through bulk question import, edit questions before gameplay, and reset games for practice runs.

The design focuses on three core subsystems:

- **Question Import System**: Handles bulk upload and validation of questions from CSV/JSON files
- **Question Editor**: Provides pre-game question management with state-based access control
- **Game Reset System**: Resets game state while preserving questions for reuse

### Key Design Principles

1. **State-Based Access Control**: Question editing is only allowed for inactive games (no players joined, game not started)
2. **Transactional Integrity**: All multi-step operations (import, reset) use database transactions
3. **Validation-First**: All input is validated before any database modifications
4. **Preserve Questions**: Reset operations clear gameplay data but preserve question content
5. **Host Authorization**: All management operations verify the requesting user is the game host

### Technology Stack

- **Framework**: Next.js 16 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **File Parsing**: Native Node.js (csv-parse for CSV, JSON.parse for JSON)
- **Testing**: Vitest with fast-check for property-based testing
- **File Upload**: Next.js API routes with FormData handling

## Architecture

### System Context

The game management features integrate with the existing Wits and Wagers application:

```
┌─────────────────────────────────────────────────────────────┐
│                     Host Dashboard UI                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Question     │  │ File Upload  │  │ Game Reset   │     │
│  │ Editor       │  │ Component    │  │ Button       │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PATCH        │  │ POST         │  │ POST         │     │
│  │ /questions   │  │ /import      │  │ /reset       │     │
│  │ /:id         │  │              │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Question     │  │ File Parser  │  │ Game Reset   │     │
│  │ Validator    │  │ & Validator  │  │ Service      │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Database Layer (Drizzle ORM)                    │
│                    PostgreSQL                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  games   │  │questions │  │ players  │  │ guesses  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Bulk Question Import Flow

```
1. Host uploads CSV/JSON file
   ↓
2. API receives file via FormData
   ↓
3. Parse file content based on content type
   ↓
4. Validate all questions (fail fast if any invalid)
   ↓
5. Check game state (must be inactive)
   ↓
6. Check authorization (must be host)
   ↓
7. Begin database transaction
   ↓
8. Insert all questions with correct orderIndex
   ↓
9. Commit transaction
   ↓
10. Return success with question count
```

#### Question Edit Flow

```
1. Host modifies question in UI
   ↓
2. API receives PATCH request
   ↓
3. Validate question data
   ↓
4. Check game state (must be inactive)
   ↓
5. Check authorization (must be host)
   ↓
6. Update question in database
   ↓
7. Return updated question
```

#### Game Reset Flow

```
1. Host clicks reset button
   ↓
2. API receives POST request
   ↓
3. Check authorization (must be host)
   ↓
4. Begin database transaction
   ↓
5. Delete all guesses for game
   ↓
6. Delete all bets for game
   ↓
7. Reset all player scores to 0
   ↓
8. Remove all players from game
   ↓
9. Reset game phase to "guessing"
   ↓
10. Reset currentQuestionId to first question
   ↓
11. Commit transaction (or rollback on error)
   ↓
12. Return success confirmation
```

## Components and Interfaces

### API Endpoints

#### POST /api/games/[gameId]/questions/import

Imports multiple questions from a CSV or JSON file.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'file' field

**CSV Format:**

```csv
text,subText,correctAnswer,answerFormat,followUpNotes
"What is the population of Tokyo?","As of 2023",37400000,plain,"Tokyo is the world's largest metropolitan area"
"What year was the first iPhone released?","",2007,date,"It revolutionized the smartphone industry"
```

**JSON Format:**

```json
[
  {
    "text": "What is the population of Tokyo?",
    "subText": "As of 2023",
    "correctAnswer": 37400000,
    "answerFormat": "plain",
    "followUpNotes": "Tokyo is the world's largest metropolitan area"
  },
  {
    "text": "What year was the first iPhone released?",
    "correctAnswer": 2007,
    "answerFormat": "date",
    "followUpNotes": "It revolutionized the smartphone industry"
  }
]
```

**Response (Success):**

```json
{
  "success": true,
  "imported": 2,
  "questions": [
    {
      "id": "uuid",
      "text": "What is the population of Tokyo?",
      "orderIndex": 0
    }
  ]
}
```

**Response (Validation Error):**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid question data",
    "details": [
      {
        "index": 1,
        "field": "correctAnswer",
        "message": "Answer must be a number"
      }
    ]
  }
}
```

**Response (State Error):**

```json
{
  "error": {
    "code": "INVALID_STATE",
    "message": "Cannot import questions for active game"
  }
}
```

#### PATCH /api/games/[gameId]/questions/[questionId]

Updates a single question (only for inactive games).

**Request:**

```json
{
  "text": "Updated question text",
  "subText": "Updated sub-text",
  "correctAnswer": 42,
  "answerFormat": "plain",
  "followUpNotes": "Updated notes"
}
```

**Response (Success):**

```json
{
  "id": "uuid",
  "gameId": "game-uuid",
  "text": "Updated question text",
  "subText": "Updated sub-text",
  "correctAnswer": "42",
  "answerFormat": "plain",
  "followUpNotes": "Updated notes",
  "orderIndex": 0
}
```

**Response (State Error):**

```json
{
  "error": {
    "code": "INVALID_STATE",
    "message": "Cannot edit questions for active game. Questions can only be edited before the game starts and before any players join."
  }
}
```

#### DELETE /api/games/[gameId]/questions/[questionId]

Deletes a question (only for inactive games).

**Response (Success):**

```json
{
  "success": true,
  "deletedId": "uuid"
}
```

#### PATCH /api/games/[gameId]/questions/reorder

Reorders questions (only for inactive games).

**Request:**

```json
{
  "questionIds": ["uuid1", "uuid3", "uuid2"]
}
```

**Response (Success):**

```json
{
  "success": true,
  "reordered": 3
}
```

#### POST /api/games/[gameId]/reset

Resets a game to its initial state.

**Response (Success):**

```json
{
  "success": true,
  "gameId": "uuid",
  "message": "Game reset successfully"
}
```

**Response (Error):**

```json
{
  "error": {
    "code": "RESET_FAILED",
    "message": "Failed to reset game"
  }
}
```

### UI Components

#### QuestionListEditor Component

Location: `app/host/[gameId]/components/QuestionListEditor.tsx`

**Props:**

```typescript
interface QuestionListEditorProps {
  gameId: string;
  questions: Question[];
  isActive: boolean;
  onQuestionsChange: () => void;
}
```

**Features:**

- Display all questions in a list
- Inline editing for question text and answer
- Delete button for each question
- Drag-and-drop reordering
- Disabled state when game is active
- Visual feedback for save operations

#### FileUploadButton Component

Location: `app/host/[gameId]/components/FileUploadButton.tsx`

**Props:**

```typescript
interface FileUploadButtonProps {
  gameId: string;
  onImportComplete: (count: number) => void;
  disabled: boolean;
}
```

**Features:**

- File input for CSV/JSON files
- Accept attribute: `.csv,.json`
- Upload progress indicator
- Error display for validation failures
- Success message with import count

#### GameResetButton Component

Location: `app/host/[gameId]/components/GameResetButton.tsx`

**Props:**

```typescript
interface GameResetButtonProps {
  gameId: string;
  onResetComplete: () => void;
}
```

**Features:**

- Confirmation dialog before reset
- Loading state during reset
- Success/error feedback
- Disabled state during operation

### Utility Functions

#### File Parser

Location: `lib/questions/parser.ts`

```typescript
interface ParsedQuestion {
  text: string;
  subText?: string;
  correctAnswer: number;
  answerFormat?: "plain" | "currency" | "date" | "percentage";
  followUpNotes?: string;
}

interface ParseResult {
  success: boolean;
  questions?: ParsedQuestion[];
  errors?: Array<{
    index: number;
    field: string;
    message: string;
  }>;
}

export async function parseCSV(content: string): Promise<ParseResult>;
export async function parseJSON(content: string): Promise<ParseResult>;
export function serializeToCSV(questions: ParsedQuestion[]): string;
export function serializeToJSON(questions: ParsedQuestion[]): string;
```

#### Question Validator

Location: `lib/questions/validator.ts`

```typescript
interface ValidationError {
  field: string;
  message: string;
}

export function validateQuestion(question: ParsedQuestion): ValidationError[];
export function validateQuestionBatch(questions: ParsedQuestion[]): Array<{
  index: number;
  errors: ValidationError[];
}>;
```

#### Game State Checker

Location: `lib/games/state.ts`

```typescript
export async function isGameActive(gameId: string): Promise<boolean>;
export async function canEditQuestions(gameId: string): Promise<boolean>;
```

A game is considered "active" if:

- It has at least one player joined, OR
- The current phase is not "guessing", OR
- The currentQuestionId is not the first question

#### Authorization Helper

Location: `lib/auth/host.ts`

```typescript
export async function verifyGameHost(
  gameId: string,
  userId: string,
): Promise<boolean>;
```

Note: For the initial implementation, we'll use a simple session-based approach. The userId can be stored in a cookie or session when the game is created.

## Data Models

### Existing Schema (No Changes Required)

The existing database schema already supports all required operations:

```typescript
// games table
{
  id: string (PK)
  title: string
  joinCode: string (unique)
  currentQuestionId: string (FK to questions.id)
  currentPhase: 'guessing' | 'betting' | 'reveal'
  createdAt: timestamp
}

// questions table
{
  id: string (PK)
  gameId: string (FK to games.id)
  orderIndex: number
  text: string
  subText: string | null
  correctAnswer: decimal(20,2)
  answerFormat: 'plain' | 'currency' | 'date' | 'percentage'
  followUpNotes: string | null
}

// players table
{
  id: string (PK)
  gameId: string (FK to games.id)
  displayName: string
  score: number (default 0)
  joinedAt: timestamp
}

// guesses table
{
  id: string (PK)
  questionId: string (FK to questions.id)
  playerId: string (FK to players.id)
  guess: decimal(20,2)
  submittedAt: timestamp
}

// bets table
{
  id: string (PK)
  questionId: string (FK to questions.id)
  playerId: string (FK to players.id)
  guessId: string | null
  betOnZero: number (0 or 1)
  placedAt: timestamp
}
```

### Type Definitions

Location: `lib/types/questions.ts`

```typescript
export type AnswerFormat = "plain" | "currency" | "date" | "percentage";

export interface Question {
  id: string;
  gameId: string;
  orderIndex: number;
  text: string;
  subText: string | null;
  correctAnswer: string; // Stored as string in DB (decimal)
  answerFormat: AnswerFormat;
  followUpNotes: string | null;
}

export interface QuestionInput {
  text: string;
  subText?: string;
  correctAnswer: number;
  answerFormat?: AnswerFormat;
  followUpNotes?: string;
}

export interface ImportResult {
  success: boolean;
  imported?: number;
  questions?: Question[];
  errors?: ValidationError[];
}

export interface ValidationError {
  index?: number;
  field: string;
  message: string;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: File Format Acceptance

_For any_ valid question data, the Question_Import_System should successfully parse and accept both CSV and JSON file formats containing that data.

**Validates: Requirements 1.1, 1.2**

### Property 2: Validation Before Import

_For any_ Question_File with at least one invalid question, if validation fails, then no questions should be imported into the database (atomicity).

**Validates: Requirements 1.3**

### Property 3: Error Message Contains Question Index

_For any_ Question_File containing invalid data, the error response should include the index or line number of each question that failed validation.

**Validates: Requirements 1.4, 2.3**

### Property 4: Complete Import on Success

_For any_ valid Question_File with N questions, successful import should result in exactly N questions being added to the database with the correct gameId.

**Validates: Requirements 1.5, 1.7**

### Property 5: Order Preservation

_For any_ ordered list of questions in a Question_File, the orderIndex values in the database after import should preserve the original sequence.

**Validates: Requirements 1.6**

### Property 6: Required Field Validation

_For any_ question missing required fields (text or correctAnswer) or with non-numeric correctAnswer, the validation should reject it.

**Validates: Requirements 2.1, 2.2**

### Property 7: Edit Permissions on Inactive Games

_For any_ inactive game (no players joined, phase is "guessing", currentQuestionId is first question), all question modification operations (update text, update answer, delete, reorder) should succeed.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 8: Edit Restrictions on Active Games

_For any_ active game (has players OR phase is not "guessing" OR currentQuestionId is not first question), all question modification operations should be rejected with an appropriate error message.

**Validates: Requirements 3.5, 3.6**

### Property 9: Reset Preserves Questions

_For any_ game with N questions, after reset, the game should still have exactly N questions with the same text, answers, and order.

**Validates: Requirements 4.1, 4.2**

### Property 10: Reset Clears Game Data

_For any_ game with guesses, bets, player scores, and players, after reset, all of these should be cleared (guesses deleted, bets deleted, players removed).

**Validates: Requirements 4.3, 4.4, 4.5, 4.8**

### Property 11: Reset Restores Initial State

_For any_ game at any question index and phase, after reset, the currentQuestionId should be the first question and the phase should be "guessing".

**Validates: Requirements 4.6, 4.7**

### Property 12: Reset Atomicity

_For any_ game, if an error occurs during reset, then either all reset operations complete successfully or none do (the game returns to its pre-reset state).

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 13: Serialization Round-Trip

_For any_ valid list of Question objects, serializing to CSV then parsing, or serializing to JSON then parsing, should produce equivalent Question objects.

**Validates: Requirements 7.1, 7.2, 7.4, 7.5, 7.6**

### Property 14: Parser Error Handling

_For any_ malformed file (invalid CSV structure, invalid JSON syntax, missing required fields), the parser should return descriptive error messages rather than throwing exceptions.

**Validates: Requirements 7.3**

### Property 15: Authorization for Management Operations

_For any_ user who is not the host of a game, all management operations (question edit, question import, game reset) should be rejected with an authorization error.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

## Error Handling

### Error Categories

1. **Validation Errors** (400 Bad Request)
   - Invalid file format
   - Missing required fields
   - Non-numeric answer values
   - Empty question text

2. **State Errors** (409 Conflict)
   - Attempting to edit questions in active game
   - Attempting to import questions for active game

3. **Authorization Errors** (403 Forbidden)
   - Non-host attempting management operations
   - Missing authentication

4. **Database Errors** (500 Internal Server Error)
   - Transaction failures
   - Connection issues
   - Constraint violations

### Error Response Format

All errors follow a consistent format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### Error Handling Strategy

1. **Input Validation**: Validate all input before database operations
2. **Transaction Wrapping**: Wrap multi-step operations in transactions
3. **Rollback on Failure**: Automatically rollback transactions on error
4. **Descriptive Messages**: Provide clear, actionable error messages
5. **Error Logging**: Log all errors for debugging (development mode only)
6. **Graceful Degradation**: Return partial results when possible (e.g., list which questions failed)

### Specific Error Scenarios

#### File Upload Errors

```typescript
// File too large
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 5MB limit"
  }
}

// Unsupported file type
{
  "error": {
    "code": "UNSUPPORTED_FILE_TYPE",
    "message": "File must be CSV or JSON format"
  }
}

// Parse error
{
  "error": {
    "code": "PARSE_ERROR",
    "message": "Failed to parse CSV file",
    "details": {
      "line": 5,
      "reason": "Unexpected end of quoted field"
    }
  }
}
```

#### Question Validation Errors

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid question data",
    "details": [
      {
        "index": 0,
        "field": "text",
        "message": "Question text is required"
      },
      {
        "index": 2,
        "field": "correctAnswer",
        "message": "Answer must be a number"
      }
    ]
  }
}
```

#### State Errors

```typescript
{
  "error": {
    "code": "INVALID_STATE",
    "message": "Cannot edit questions for active game. Questions can only be edited before the game starts and before any players join."
  }
}
```

#### Reset Errors

```typescript
{
  "error": {
    "code": "RESET_FAILED",
    "message": "Failed to reset game",
    "details": {
      "reason": "Database transaction failed"
    }
  }
}
```

## Testing Strategy

### Dual Testing Approach

This feature will use both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property tests**: Verify universal properties across all inputs through randomization

Unit tests focus on concrete scenarios and edge cases, while property tests validate general correctness across a wide range of inputs. Together, they provide complementary coverage.

### Property-Based Testing

We will use **fast-check** for property-based testing in TypeScript/JavaScript. Fast-check is a mature property-based testing library that integrates well with Vitest.

**Configuration:**

- Minimum 100 iterations per property test (to ensure thorough randomization)
- Each property test references its design document property via comment tag
- Tag format: `// Feature: game-management-features, Property {number}: {property_text}`

**Example Property Test Structure:**

```typescript
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

describe("Question Import System", () => {
  it("should preserve question order after import", async () => {
    // Feature: game-management-features, Property 5: Order Preservation
    await fc.assert(
      fc.asyncProperty(
        fc.array(questionArbitrary(), { minLength: 1, maxLength: 20 }),
        async (questions) => {
          const gameId = await createTestGame();
          const result = await importQuestions(gameId, questions);

          const imported = await getQuestions(gameId);
          expect(imported.map((q) => q.text)).toEqual(
            questions.map((q) => q.text),
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
```

### Unit Testing

Unit tests will cover:

1. **Specific Examples**
   - Import a 3-question CSV file
   - Edit a question's text
   - Reset a game with 2 players and 5 guesses

2. **Edge Cases**
   - Empty file upload
   - Single question import
   - Reset game with no players
   - Edit question with very long text (boundary testing)

3. **Error Conditions**
   - Malformed CSV (missing quotes, wrong delimiter)
   - Invalid JSON syntax
   - Non-numeric answer values
   - Unauthorized access attempts

4. **Integration Points**
   - API endpoint request/response format
   - Database transaction behavior
   - File upload handling

### Test Coverage Goals

- **API Routes**: 100% coverage of all endpoints
- **Business Logic**: 100% coverage of parser, validator, and state checker
- **Error Handling**: All error paths tested
- **Properties**: All 15 correctness properties implemented as property tests

### Testing Tools

- **Vitest**: Test runner and assertion library
- **fast-check**: Property-based testing library
- **Drizzle ORM**: Database operations in tests
- **Test Database**: Separate PostgreSQL database for testing

### Test Data Generation

For property-based tests, we'll create custom arbitraries:

```typescript
// Arbitrary for generating valid questions
const questionArbitrary = () =>
  fc.record({
    text: fc.string({ minLength: 1, maxLength: 200 }),
    subText: fc.option(fc.string({ maxLength: 200 })),
    correctAnswer: fc.double({ min: -1e10, max: 1e10, noNaN: true }),
    answerFormat: fc.constantFrom("plain", "currency", "date", "percentage"),
    followUpNotes: fc.option(fc.string({ maxLength: 500 })),
  });

// Arbitrary for generating invalid questions
const invalidQuestionArbitrary = () =>
  fc.oneof(
    fc.record({ text: fc.constant(""), correctAnswer: fc.double() }), // Empty text
    fc.record({ text: fc.string(), correctAnswer: fc.constant(NaN) }), // NaN answer
    fc.record({ text: fc.string() }), // Missing answer
  );
```

### Continuous Integration

All tests will run on every commit:

- Unit tests: `npm test`
- Property tests: Included in `npm test` (same command)
- Coverage report: Generated after test run
- Minimum coverage threshold: 90%
