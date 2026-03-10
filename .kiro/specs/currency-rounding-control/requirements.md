# Requirements Document

## Introduction

This feature adds per-question control over currency rounding in the #Trivia game. Currently, the `formatNumber` function supports a `roundCurrency` option, but it's hardcoded and not configurable per question. This enhancement allows game creators to choose whether currency values should be rounded to whole dollars or display cents, with rounding enabled by default.

## Glossary

- **Question**: A trivia question entity that can be part of a game, stored in either the `questions` table (game-specific) or `questionSetQuestions` table (pre-made sets)
- **Currency_Format**: An answer format type that displays numeric values as USD currency (e.g., $1,234 or $1,234.56)
- **Round_Currency_Option**: A boolean field that controls whether currency values are rounded to whole dollars (true) or display cents (false)
- **Question_Editor**: UI components that allow users to create or modify questions (QuestionCustomizationEditor, AddQuestionButton, QuestionListEditor)
- **Display_Component**: UI components that render formatted answers during gameplay (play page, display page)
- **Database_Schema**: The Drizzle ORM schema definition for database tables

## Requirements

### Requirement 1: Store Round Currency Preference

**User Story:** As a game creator, I want to specify whether currency answers should be rounded to whole dollars, so that I can control the precision of displayed values per question.

#### Acceptance Criteria

1. THE Database_Schema SHALL include a `roundCurrency` boolean field in the `questions` table with a default value of true
2. THE Database_Schema SHALL include a `roundCurrency` boolean field in the `questionSetQuestions` table with a default value of true
3. WHEN a new question is created without specifying `roundCurrency`, THE Database SHALL store true as the default value
4. THE Database SHALL allow null values for the `roundCurrency` field to support backward compatibility with existing questions

### Requirement 2: Edit Round Currency Setting

**User Story:** As a game creator, I want to toggle the currency rounding option when creating or editing questions, so that I can customize how currency values appear.

#### Acceptance Criteria

1. WHEN editing a question from a pre-made set, THE QuestionCustomizationEditor SHALL display a checkbox labeled "Round currency to whole dollars"
2. WHEN adding a manual question, THE AddQuestionButton_Form SHALL display a checkbox labeled "Round currency to whole dollars"
3. WHEN editing an existing question, THE QuestionListEditor SHALL display a checkbox labeled "Round currency to whole dollars"
4. THE Question_Editor SHALL set the checkbox to checked by default for new questions
5. WHEN a question has `answerFormat` set to "currency", THE Question_Editor SHALL display the round currency checkbox
6. WHEN a question has `answerFormat` set to "plain", "date", or "percentage", THE Question_Editor SHALL hide the round currency checkbox
7. WHEN the user toggles the checkbox, THE Question_Editor SHALL update the question's `roundCurrency` value

### Requirement 3: Apply Round Currency Setting During Display

**User Story:** As a player, I want to see currency values formatted according to the question's rounding preference, so that answers are displayed with appropriate precision.

#### Acceptance Criteria

1. WHEN displaying a player's guess with currency format, THE Display_Component SHALL pass the question's `roundCurrency` value to the `formatNumber` function
2. WHEN displaying the correct answer with currency format, THE Display_Component SHALL pass the question's `roundCurrency` value to the `formatNumber` function
3. WHEN a question's `roundCurrency` field is null, THE Display_Component SHALL pass true as the default value to `formatNumber`
4. WHEN `roundCurrency` is true, THE formatNumber_Function SHALL display currency without cents (e.g., $1,234)
5. WHEN `roundCurrency` is false, THE formatNumber_Function SHALL display currency with cents (e.g., $1,234.56)

### Requirement 4: Migrate Existing Questions

**User Story:** As a system administrator, I want existing questions to use the default rounding behavior, so that the feature addition doesn't break existing games.

#### Acceptance Criteria

1. WHEN the database schema is updated, THE Migration SHALL add the `roundCurrency` column to both `questions` and `questionSetQuestions` tables
2. THE Migration SHALL set the default value to true for the new columns
3. WHEN existing questions have null `roundCurrency` values, THE Display_Component SHALL treat them as true
4. THE Migration SHALL complete without requiring manual data updates for existing questions
