-- Add new columns for property features
ALTER TABLE "property_leads" ADD COLUMN "has_pool" boolean DEFAULT false;
ALTER TABLE "property_leads" ADD COLUMN "has_basement" boolean DEFAULT false;
ALTER TABLE "property_leads" ADD COLUMN "has_garage" boolean DEFAULT false;
ALTER TABLE "property_leads" ADD COLUMN "notes" text;
