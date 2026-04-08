CREATE TABLE "book_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(512) NOT NULL,
	"author" varchar(512),
	"cover_image" varchar(1024),
	"total_pages" integer,
	"isbn" varchar(64),
	"genre" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"author" varchar(255),
	"cover_image" varchar(1000),
	"total_pages" integer,
	"pdf_page_count" integer,
	"notes" text DEFAULT '',
	"file_url" varchar(1024),
	"current_page" integer DEFAULT 1,
	"user_id" uuid NOT NULL,
	"last_opened_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paper_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paper_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"original_text" text NOT NULL,
	"translated_text" text NOT NULL,
	"page_number" integer,
	"language" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "papers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(512) NOT NULL,
	"authors" varchar(512),
	"year" integer,
	"total_pages" integer,
	"pdf_page_count" integer,
	"file_url" varchar(1024),
	"notes" text DEFAULT '',
	"current_page" integer DEFAULT 1,
	"user_id" uuid NOT NULL,
	"last_opened_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"original_text" text NOT NULL,
	"translated_text" text NOT NULL,
	"page_number" integer,
	"language" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) DEFAULT '' NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"preferred_language" varchar(50) DEFAULT 'Tamil' NOT NULL,
	"gender" varchar(50) DEFAULT 'female' NOT NULL,
	"voice_rate" varchar(10) DEFAULT '0.8' NOT NULL,
	"voice_name" varchar(100),
	"is_researcher" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_translations" ADD CONSTRAINT "paper_translations_paper_id_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."papers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_translations" ADD CONSTRAINT "paper_translations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "papers" ADD CONSTRAINT "papers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "books_user_id_idx" ON "books" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "paper_translations_user_id_idx" ON "paper_translations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "paper_translations_paper_id_idx" ON "paper_translations" USING btree ("paper_id");--> statement-breakpoint
CREATE INDEX "papers_user_id_idx" ON "papers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "translations_user_id_idx" ON "translations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "translations_book_id_idx" ON "translations" USING btree ("book_id");