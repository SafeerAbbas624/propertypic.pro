CREATE TABLE "property_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text NOT NULL,
	"city" text,
	"state" text,
	"zip_code" text,
	"bedrooms" integer,
	"bathrooms" integer,
	"square_feet" integer,
	"token" text NOT NULL,
	"property_type" text DEFAULT 'SFR' NOT NULL,
	"has_pool" boolean DEFAULT false,
	"has_basement" boolean DEFAULT false,
	"has_garage" boolean DEFAULT false,
	"notes" text,
	"media_status" text DEFAULT 'incomplete' NOT NULL,
	"google_drive_folder_id" text,
	"google_drive_share_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "property_leads_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "property_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_lead_id" integer NOT NULL,
	"lead_token" text NOT NULL,
	"step" text NOT NULL,
	"step_title" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"local_path" text,
	"file_type" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"google_drive_file_id" text,
	"is_synced_to_google_drive" boolean DEFAULT false,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
