CREATE TYPE "public"."answer_format" AS ENUM('plain', 'currency', 'date', 'percentage');--> statement-breakpoint
CREATE TYPE "public"."phase" AS ENUM('guessing', 'betting', 'reveal');--> statement-breakpoint
CREATE TABLE "bets" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"player_id" text NOT NULL,
	"guess_id" text,
	"bet_on_zero" integer DEFAULT 0 NOT NULL,
	"placed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"join_code" text NOT NULL,
	"current_question_id" text,
	"current_phase" "phase" DEFAULT 'guessing' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "games_join_code_unique" UNIQUE("join_code")
);
--> statement-breakpoint
CREATE TABLE "guesses" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"player_id" text NOT NULL,
	"guess" numeric(20, 2) NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"display_name" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"order_index" integer NOT NULL,
	"text" text NOT NULL,
	"sub_text" text,
	"correct_answer" numeric(20, 2) NOT NULL,
	"answer_format" "answer_format" DEFAULT 'plain' NOT NULL,
	"follow_up_notes" text
);
--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;