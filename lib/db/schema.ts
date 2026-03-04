import {
  pgTable,
  text,
  integer,
  timestamp,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const answerFormatEnum = pgEnum("answer_format", [
  "plain",
  "currency",
  "date",
  "percentage",
]);

export const phaseEnum = pgEnum("phase", ["guessing", "betting", "reveal"]);

// Games table
export const games = pgTable("games", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  joinCode: text("join_code").notNull().unique(),
  currentQuestionId: text("current_question_id"),
  currentPhase: phaseEnum("current_phase").notNull().default("guessing"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  gameId: text("game_id")
    .notNull()
    .references(() => games.id),
  orderIndex: integer("order_index").notNull(),
  text: text("text").notNull(),
  subText: text("sub_text"),
  correctAnswer: decimal("correct_answer", {
    precision: 20,
    scale: 2,
  }).notNull(),
  answerFormat: answerFormatEnum("answer_format").notNull().default("plain"),
  followUpNotes: text("follow_up_notes"),
});

// Players table
export const players = pgTable("players", {
  id: text("id").primaryKey(),
  gameId: text("game_id")
    .notNull()
    .references(() => games.id),
  displayName: text("display_name").notNull(),
  score: integer("score").notNull().default(0),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Guesses table
export const guesses = pgTable("guesses", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  guess: decimal("guess", { precision: 20, scale: 2 }).notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// Bets table
export const bets = pgTable("bets", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  guessId: text("guess_id"), // Null if betting on zero
  betOnZero: integer("bet_on_zero").notNull().default(0), // 1 if betting on zero, 0 otherwise
  placedAt: timestamp("placed_at").notNull().defaultNow(),
});
