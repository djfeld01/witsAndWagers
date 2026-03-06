CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "question_set_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"question_set_id" text NOT NULL,
	"order_index" integer NOT NULL,
	"text" text NOT NULL,
	"sub_text" text,
	"correct_answer" numeric(20, 2) NOT NULL,
	"answer_format" "answer_format" DEFAULT 'plain' NOT NULL,
	"follow_up_notes" text
);
--> statement-breakpoint
CREATE TABLE "question_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"question_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_set_questions" ADD CONSTRAINT "question_set_questions_question_set_id_question_sets_id_fk" FOREIGN KEY ("question_set_id") REFERENCES "public"."question_sets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_sets" ADD CONSTRAINT "question_sets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;