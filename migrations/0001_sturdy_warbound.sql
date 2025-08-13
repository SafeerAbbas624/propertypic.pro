CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"success" boolean NOT NULL,
	"error_message" text,
	"ip_address" text,
	"user_agent" text,
	"metadata" json,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_expires" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "data_expires_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_drive_connected" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_drive_refresh_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");