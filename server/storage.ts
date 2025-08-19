import { users, type User, type InsertUser, propertyLeads, propertyMedia, type PropertyLead, type InsertPropertyLead, type PropertyMedia, type InsertPropertyMedia } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Property Lead methods
  getPropertyLead(id: number): Promise<PropertyLead | undefined>;
  getPropertyLeadById(id: string): Promise<PropertyLead | undefined>;
  getPropertyLeadByToken(token: string): Promise<PropertyLead | undefined>;
  createPropertyLead(lead: InsertPropertyLead & { token: string }): Promise<PropertyLead>;
  updatePropertyLeadStatus(id: string, status: string): Promise<PropertyLead>;
  updatePropertyLeadDriveInfo(id: string, folderId: string, shareLink: string): Promise<PropertyLead>;
  deletePropertyLead(id: string): Promise<void>;
  // Property Media methods
  createPropertyMedia(media: InsertPropertyMedia): Promise<PropertyMedia>;
  getPropertyMediaByLeadId(leadId: string): Promise<PropertyMedia[]>;
  getPropertyMediaByToken(token: string): Promise<PropertyMedia[]>;
  getMediaFileById(id: string): Promise<PropertyMedia | undefined>;
  deleteMediaFile(id: string): Promise<void>;
  deleteAllPropertyMedia(leadId: string): Promise<void>;
  // File browsing methods
  getAllPropertyLeadsWithMedia(): Promise<(PropertyLead & { mediaCount: number; isCompleted: boolean })[]>;
  getPropertyMediaWithDetails(leadId: string): Promise<PropertyMedia[]>;
}

// Database storage implementation for PostgreSQL
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Property Lead methods
  async getPropertyLead(id: number): Promise<PropertyLead | undefined> {
    const [lead] = await db.select().from(propertyLeads).where(eq(propertyLeads.id, id as any));
    return lead;
  }

  async getPropertyLeadByToken(token: string): Promise<PropertyLead | undefined> {
    const [lead] = await db.select().from(propertyLeads).where(eq(propertyLeads.token, token));
    return lead;
  }

  async createPropertyLead(insertLead: InsertPropertyLead & { token: string }): Promise<PropertyLead> {
    const [lead] = await db.insert(propertyLeads).values({
      name: insertLead.name,
      email: insertLead.email,
      phone: insertLead.phone,
      address: insertLead.address,
      city: insertLead.city,
      state: insertLead.state,
      zipCode: insertLead.zipCode,
      bedrooms: insertLead.bedrooms,
      bathrooms: insertLead.bathrooms,
      squareFeet: insertLead.squareFeet,
      token: insertLead.token,
      propertyType: insertLead.propertyType || "SFR",
      hasPool: insertLead.hasPool ?? false,
      hasBasement: insertLead.hasBasement ?? false,
      hasGarage: insertLead.hasGarage ?? false,
      notes: insertLead.notes ?? null,
      mediaStatus: "incomplete"
    }).returning();

    return lead;
  }

  async updatePropertyLeadStatus(id: string, status: string): Promise<PropertyLead> {
    const now = new Date();
    const [updatedLead] = await db
      .update(propertyLeads)
      .set({ 
        mediaStatus: status,
        updatedAt: now
      })
      .where(eq(propertyLeads.id, id as any))
      .returning();
    
    if (!updatedLead) {
      throw new Error("Property lead not found");
    }
    
    return updatedLead;
  }

  async updatePropertyLeadDriveInfo(id: string, folderId: string, shareLink: string): Promise<PropertyLead> {
    const now = new Date();
    const [updatedLead] = await db
      .update(propertyLeads)
      .set({ 
        googleDriveFolderId: folderId,
        googleDriveShareLink: shareLink,
        updatedAt: now
      })
      .where(eq(propertyLeads.id, id as any))
      .returning();
    
    if (!updatedLead) {
      throw new Error("Property lead not found");
    }
    
    return updatedLead;
  }

  // Property Media methods
  async createPropertyMedia(insertMedia: InsertPropertyMedia): Promise<PropertyMedia> {
    const [media] = await db.insert(propertyMedia).values({
      propertyLeadId: insertMedia.propertyLeadId,
      leadToken: insertMedia.leadToken,
      step: insertMedia.step,
      stepTitle: insertMedia.stepTitle,
      fileName: insertMedia.fileName,
      fileUrl: insertMedia.fileUrl,
      localPath: insertMedia.localPath,
      fileType: insertMedia.fileType,
      fileSize: insertMedia.fileSize,
      mimeType: insertMedia.mimeType,
      googleDriveFileId: insertMedia.googleDriveFileId,
      isSyncedToGoogleDrive: insertMedia.isSyncedToGoogleDrive || false,
      metadata: insertMedia.metadata
    }).returning();

    return media;
  }

  async getPropertyMediaByLeadId(leadId: string): Promise<PropertyMedia[]> {
    return db.select().from(propertyMedia).where(eq(propertyMedia.propertyLeadId, leadId as any));
  }

  async getPropertyMediaByToken(token: string): Promise<PropertyMedia[]> {
    return db.select().from(propertyMedia).where(eq(propertyMedia.leadToken, token));
  }

  // Search properties by address
  async searchPropertiesByAddress(query: string): Promise<Array<{id: number, name: string, address: string, token: string}>> {
    const leads = await db.select({
      id: propertyLeads.id,
      name: propertyLeads.name,
      address: propertyLeads.address,
      city: propertyLeads.city,
      state: propertyLeads.state,
      zipCode: propertyLeads.zipCode,
      token: propertyLeads.token
    })
    .from(propertyLeads)
    .where(
      or(
        ilike(propertyLeads.name, `%${query}%`),
        ilike(propertyLeads.address, `%${query}%`),
        ilike(propertyLeads.city, `%${query}%`),
        ilike(propertyLeads.state, `%${query}%`)
      )
    )
    .limit(10);

    return leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      address: `${lead.address}, ${lead.city}, ${lead.state} ${lead.zipCode}`,
      token: lead.token
    }));
  }

  // File browsing methods
  async getAllPropertyLeadsWithMedia(): Promise<(PropertyLead & { mediaCount: number; isCompleted: boolean })[]> {
    const leads = await db.select().from(propertyLeads);
    const result = [];

    for (const lead of leads) {
      const mediaFiles = await db.select().from(propertyMedia).where(eq(propertyMedia.propertyLeadId, lead.id as any));
      result.push({
        ...lead,
        mediaCount: mediaFiles.length,
        isCompleted: lead.mediaStatus === 'complete'
      });
    }

    return result;
  }

  async getPropertyMediaWithDetails(leadId: string): Promise<PropertyMedia[]> {
    return await db.select().from(propertyMedia).where(eq(propertyMedia.propertyLeadId, leadId as any));
  }

  // Additional methods for delete functionality
  async getPropertyLeadById(id: string): Promise<PropertyLead | undefined> {
    const [lead] = await db.select().from(propertyLeads).where(eq(propertyLeads.id, id as any));
    return lead;
  }

  async getPropertyLeadByUUID(uuid: string): Promise<PropertyLead | undefined> {
    // Since there's no UUID field, we'll use the token field for UUID-like lookups
    const [lead] = await db.select().from(propertyLeads).where(eq(propertyLeads.token, uuid));
    return lead;
  }

  async deletePropertyLead(id: string): Promise<void> {
    await db.delete(propertyLeads).where(eq(propertyLeads.id, id as any));
  }

  async getMediaFileById(id: string): Promise<PropertyMedia | undefined> {
    const [media] = await db.select().from(propertyMedia).where(eq(propertyMedia.id, id as any));
    return media;
  }

  async deleteMediaFile(id: string): Promise<void> {
    await db.delete(propertyMedia).where(eq(propertyMedia.id, id as any));
  }

  async deleteAllPropertyMedia(leadId: string): Promise<void> {
    await db.delete(propertyMedia).where(eq(propertyMedia.propertyLeadId, leadId as any));
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
