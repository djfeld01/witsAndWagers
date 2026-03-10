ALTER TABLE "question_set_questions" ADD COLUMN "round_currency" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "round_currency" integer DEFAULT 1;