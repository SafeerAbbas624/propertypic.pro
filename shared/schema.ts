import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Property leads table to store lead information
export const propertyLeads = pgTable("property_leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address").notNull(),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  squareFeet: integer("square_feet"),
  token: text("token").notNull().unique(),
  propertyType: text("property_type").default("SFR").notNull(),
  hasPool: boolean("has_pool").default(false),
  hasBasement: boolean("has_basement").default(false),
  hasGarage: boolean("has_garage").default(false),
  notes: text("notes"),
  mediaStatus: text("media_status").default("incomplete").notNull(),
  googleDriveFolderId: text("google_drive_folder_id"),
  googleDriveShareLink: text("google_drive_share_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPropertyLeadSchema = createInsertSchema(propertyLeads).omit({
  id: true,
  token: true, // token will be generated server-side
  mediaStatus: true,
  googleDriveFolderId: true,
  googleDriveShareLink: true,
  createdAt: true, 
  updatedAt: true
});

export type InsertPropertyLead = z.infer<typeof insertPropertyLeadSchema>;
export type PropertyLead = typeof propertyLeads.$inferSelect;

// Property media table to store media uploads
export const propertyMedia = pgTable("property_media", {
  id: serial("id").primaryKey(),
  propertyLeadId: integer("property_lead_id").notNull(),
  leadToken: text("lead_token").notNull(),
  step: text("step").notNull(),
  stepTitle: text("step_title").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  localPath: text("local_path"), // Local file system path
  fileType: text("file_type").notNull(), // photo or video
  fileSize: integer("file_size"), // File size in bytes
  mimeType: text("mime_type"), // MIME type
  googleDriveFileId: text("google_drive_file_id"), // Google Drive file ID if synced
  isSyncedToGoogleDrive: boolean("is_synced_to_google_drive").default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: json("metadata"),
});

export const insertPropertyMediaSchema = createInsertSchema(propertyMedia).omit({
  id: true,
  timestamp: true,
});

export type InsertPropertyMedia = z.infer<typeof insertPropertyMediaSchema>;
export type PropertyMedia = typeof propertyMedia.$inferSelect;
