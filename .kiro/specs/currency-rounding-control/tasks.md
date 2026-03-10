# Implementation Plan: Currency Rounding Control

## Overview

This implementation adds per-question control over currency rounding in the #Trivia game. The work involves database schema changes, UI component updates, display logic modifications, and comprehensive testing. All tasks build incrementally to ensure the feature integrates smoothly with existing functionality.

## Tasks

- [x] 1. Database schema and migration
  - [x] 1.1 Add roundCurrency field to database schema
    - Add `roundCurrency: integer("round_currency").default(1)` to `questions` table in `lib/db/schema.ts`
    - Add `roundCurrency: integer("round_currency").default(1)` to `questionSetQuestions` table in `lib/db/schema.ts`
    - Use integer type (1=true, 0=false, null=default to true) for PostgreSQL compatibility
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 1.2 Create and run database migration
    - Generate migration file using Drizzle Kit
    - Review generated SQL to ensure `round_currency` column is added to both tables with default value 1
    - Run migration against development database
    - Verify columns exist and accept null values for backward compatibility
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ]\* 1.3 Write property test for default roundCurrency value
    - **Property 1: Default roundCurrency on question creation**
    - **Validates: Requirements 1.3**
    - Generate random question data without `roundCurrency` field
    - Create question via API and verify stored value defaults to true (or 1)

- [ ] 2. Checkpoint - Verify database changes
  - Ensure migration completed successfully and schema is updated. Ask the user if questions arise.

- [x] 3. Update TypeScript interfaces and types
  - [x] 3.1 Add roundCurrency to Question type definitions
    - Locate Question interface/type definitions used across the application
    - Add `roundCurrency: boolean | null` field to Question types
    - Add `roundCurrency: boolean | null` field to QuestionSetQuestion types
    - Ensure type definitions support null for backward compatibility
    - _Requirements: 1.1, 1.2, 1.4_

- [x] 4. Update API endpoints to handle roundCurrency
  - [x] 4.1 Update question creation endpoint
    - Modify POST `/api/games/[gameId]/questions` to accept `roundCurrency` in request body
    - Convert boolean to integer (1/0) before database insert
    - Default to true if not provided
    - _Requirements: 1.3, 2.7_
  - [x] 4.2 Update question update endpoint
    - Modify PATCH `/api/games/[gameId]/questions/[questionId]` to accept `roundCurrency` in request body
    - Convert boolean to integer (1/0) before database update
    - Allow partial updates that don't include `roundCurrency`
    - _Requirements: 2.7_
  - [x] 4.3 Update game state endpoint
    - Ensure GET `/api/games/[gameId]/state` includes `roundCurrency` in question objects
    - Convert integer (1/0/null) to boolean (true/false/null) in response
    - _Requirements: 3.1, 3.2_
  - [ ]\* 4.4 Write unit tests for API endpoints
    - Test creating question with `roundCurrency=true`
    - Test creating question with `roundCurrency=false`
    - Test creating question without `roundCurrency` (defaults to true)
    - Test updating question's `roundCurrency` value
    - Test partial updates without `roundCurrency`

- [ ] 5. Checkpoint - Verify API changes
  - Ensure all API endpoints handle roundCurrency correctly. Ask the user if questions arise.

- [x] 6. Update QuestionCustomizationEditor component
  - [x] 6.1 Add roundCurrency state and checkbox to QuestionCustomizationEditor
    - Open `components/game-creation/QuestionCustomizationEditor.tsx`
    - Add `roundCurrency` field to component state (default: true)
    - Add checkbox input with label "Round currency to whole dollars"
    - Position checkbox below Answer Format dropdown
    - Show checkbox only when `answerFormat === "currency"`
    - Set checkbox to checked by default for new questions
    - Update form submission to include `roundCurrency` value
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7_
  - [ ]\* 6.2 Write property test for checkbox visibility
    - **Property 2: Checkbox visibility based on answer format**
    - **Validates: Requirements 2.5, 2.6**
    - Generate random questions with various answer formats
    - Render QuestionCustomizationEditor and verify checkbox visibility matches format being "currency"
  - [ ]\* 6.3 Write property test for default checkbox state
    - **Property 3: Default checkbox state for new questions**
    - **Validates: Requirements 2.4**
    - Generate random new currency questions
    - Render QuestionCustomizationEditor and verify checkbox is checked by default
  - [ ]\* 6.4 Write property test for checkbox toggle
    - **Property 4: Checkbox toggle updates question data**
    - **Validates: Requirements 2.7**
    - Generate random question states
    - Simulate checkbox toggle events and verify question data updates correctly

- [x] 7. Update AddQuestionButton component
  - [x] 7.1 Add roundCurrency state and checkbox to AddQuestionButton
    - Open `app/host/[gameId]/components/AddQuestionButton.tsx`
    - Add `roundCurrency` state variable (default: true)
    - Add checkbox input with label "Round currency to whole dollars"
    - Position checkbox below Answer Format dropdown
    - Show checkbox only when `answerFormat === "currency"`
    - Include `roundCurrency` in API request body when creating questions
    - _Requirements: 2.2, 2.4, 2.5, 2.6, 2.7_
  - [ ]\* 7.2 Write unit tests for AddQuestionButton
    - Test checkbox appears for currency format
    - Test checkbox hidden for non-currency formats
    - Test checkbox default state is checked
    - Test form submission includes `roundCurrency` value

- [x] 8. Update QuestionListEditor component
  - [x] 8.1 Add roundCurrency state and checkbox to QuestionListEditor
    - Open `app/host/[gameId]/components/QuestionListEditor.tsx`
    - Add `roundCurrency` to edit state
    - Add checkbox input with label "Round currency to whole dollars" in edit mode
    - Show checkbox only when question has currency format
    - Include `roundCurrency` in PATCH request when updating questions
    - Display current rounding setting in view mode for currency questions
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7_
  - [ ]\* 8.2 Write unit tests for QuestionListEditor
    - Test checkbox appears in edit mode for currency questions
    - Test checkbox updates edit state on toggle
    - Test PATCH request includes `roundCurrency` value

- [ ] 9. Checkpoint - Verify UI components
  - Ensure all three editor components display and handle the roundCurrency checkbox correctly. Ask the user if questions arise.

- [x] 10. Update display page to use roundCurrency
  - [x] 10.1 Pass roundCurrency to formatNumber in display page
    - Open `app/display/[gameId]/page.tsx`
    - Locate all `formatNumber` calls for currency values
    - Update betting phase: pass `roundCurrency ?? true` when formatting player guesses
    - Update reveal phase: pass `roundCurrency ?? true` when formatting correct answer
    - Update reveal phase: pass `roundCurrency ?? true` when formatting player guesses in grid
    - Default to true if `roundCurrency` is null or undefined
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]\* 10.2 Write property test for display component passing roundCurrency
    - **Property 5: Display components pass roundCurrency to formatNumber**
    - **Validates: Requirements 3.1, 3.2**
    - Generate random questions with various `roundCurrency` values
    - Mock `formatNumber` function
    - Render display page and verify `formatNumber` is called with correct `roundCurrency` parameter
  - [ ]\* 10.3 Write property test for null roundCurrency default
    - **Property 6: Null roundCurrency defaults to true**
    - **Validates: Requirements 3.3, 4.3**
    - Generate random questions with `roundCurrency=null`
    - Mock `formatNumber` function
    - Render display page and verify `formatNumber` receives true

- [x] 11. Update play page to use roundCurrency
  - [x] 11.1 Pass roundCurrency to formatNumber in play page
    - Open `app/play/[gameId]/page.tsx`
    - Locate all `formatNumber` calls for currency values
    - Update betting phase: pass `roundCurrency ?? true` when formatting betting options
    - Update reveal phase: pass `roundCurrency ?? true` when formatting correct answer
    - Default to true if `roundCurrency` is null or undefined
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]\* 11.2 Write unit tests for play page formatNumber calls
    - Test formatNumber called with correct roundCurrency value
    - Test null roundCurrency defaults to true

- [ ] 12. Checkpoint - Verify display logic
  - Ensure both display and play pages correctly pass roundCurrency to formatNumber. Ask the user if questions arise.

- [x] 13. Verify formatNumber function behavior
  - [x] 13.1 Review formatNumber implementation
    - Locate `formatNumber` function (likely in `lib/utils` or similar)
    - Verify it already supports `roundCurrency` parameter
    - Confirm behavior: when true, no decimal places; when false, two decimal places
    - No changes needed if function already works correctly
    - _Requirements: 3.4, 3.5_
  - [ ]\* 13.2 Write property test for formatNumber rounding behavior
    - **Property 7: formatNumber rounds when roundCurrency is true**
    - **Validates: Requirements 3.4**
    - Generate random currency values
    - Call `formatNumber` with `roundCurrency=true`
    - Verify output contains no decimal point
  - [ ]\* 13.3 Write property test for formatNumber cents behavior
    - **Property 8: formatNumber shows cents when roundCurrency is false**
    - **Validates: Requirements 3.5**
    - Generate random currency values
    - Call `formatNumber` with `roundCurrency=false`
    - Verify output contains exactly two decimal places

- [ ] 14. Integration testing and final verification
  - [ ]\* 14.1 Write end-to-end integration tests
    - Test complete flow: create question with roundCurrency=false via UI
    - Verify stored correctly in database
    - Load game and verify currency displays with cents
    - Test editing existing question's roundCurrency setting
    - Verify change persists and display updates
  - [ ] 14.2 Manual testing verification
    - Create new game with currency questions
    - Toggle roundCurrency checkbox in all three editor components
    - Save questions and verify settings persist
    - Play game and verify currency displays correctly (rounded vs. with cents)
    - Test backward compatibility with existing questions (should default to rounded)

- [ ] 15. Final checkpoint - Complete feature verification
  - Ensure all tests pass and feature works end-to-end. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests should run minimum 100 iterations for comprehensive coverage
- All property tests must include comment tag: `// Feature: currency-rounding-control, Property N: [Title]`
- Database uses integer type (1/0/null) for PostgreSQL compatibility, converted to boolean in application layer
- Null values default to true for backward compatibility with existing questions
- The formatNumber function already supports roundCurrency parameter, so no changes needed there
