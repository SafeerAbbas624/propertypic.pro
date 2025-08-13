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
  getPropertyLeadById(id: number): Promise<PropertyLead | undefined>;
  getPropertyLeadByToken(token: string): Promise<PropertyLead | undefined>;
  createPropertyLead(lead: InsertPropertyLead & { token: string }): Promise<PropertyLead>;
  updatePropertyLeadStatus(id: number, status: string): Promise<PropertyLead>;
  updatePropertyLeadDriveInfo(id: number, folderId: string, shareLink: string): Promise<PropertyLead>;
  deletePropertyLead(id: number): Promise<void>;
  // Property Media methods
  createPropertyMedia(media: InsertPropertyMedia): Promise<PropertyMedia>;
  getPropertyMediaByLeadId(leadId: number): Promise<PropertyMedia[]>;
  getPropertyMediaByToken(token: string): Promise<PropertyMedia[]>;
  getMediaFileById(id: number): Promise<PropertyMedia | undefined>;
  deleteMediaFile(id: number): Promise<void>;
  deleteAllPropertyMedia(leadId: number): Promise<void>;
  // File browsing methods
  getAllPropertyLeadsWithMedia(): Promise<(PropertyLead & { mediaCount: number })[]>;
  getPropertyMediaWithDetails(leadId: number): Promise<PropertyMedia[]>;
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
    const [lead] = await db.select().from(propertyLeads).where(eq(propertyLeads.id, id));
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
      mediaStatus: "incomplete"
    }).returning();
    
    return lead;
  }

  async updatePropertyLeadStatus(id: number, status: string): Promise<PropertyLead> {
    const now = new Date();
    const [updatedLead] = await db
      .update(propertyLeads)
      .set({ 
        mediaStatus: status,
        updatedAt: now
      })
      .where(eq(propertyLeads.id, id))
      .returning();
    
    if (!updatedLead) {
      throw new Error("Property lead not found");
    }
    
    return updatedLead;
  }

  async updatePropertyLeadDriveInfo(id: number, folderId: string, shareLink: string): Promise<PropertyLead> {
    const now = new Date();
    const [updatedLead] = await db
      .update(propertyLeads)
      .set({ 
        googleDriveFolderId: folderId,
        googleDriveShareLink: shareLink,
        updatedAt: now
      })
      .where(eq(propertyLeads.id, id))
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

  async getPropertyMediaByLeadId(leadId: number): Promise<PropertyMedia[]> {
    return db.select().from(propertyMedia).where(eq(propertyMedia.propertyLeadId, leadId));
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
  async getAllPropertyLeadsWithMedia(): Promise<(PropertyLead & { mediaCount: number })[]> {
    const leads = await db.select().from(propertyLeads);
    const result = [];

    for (const lead of leads) {
      const mediaFiles = await db.select().from(propertyMedia).where(eq(propertyMedia.propertyLeadId, lead.id));
      result.push({
        ...lead,
        mediaCount: mediaFiles.length
      });
    }

    return result;
  }

  async getPropertyMediaWithDetails(leadId: number): Promise<PropertyMedia[]> {
    return await db.select().from(propertyMedia).where(eq(propertyMedia.propertyLeadId, leadId));
  }

  // Additional methods for delete functionality
  async getPropertyLeadById(id: number): Promise<PropertyLead | undefined> {
    const [lead] = await db.select().from(propertyLeads).where(eq(propertyLeads.id, id));
    return lead;
  }

  async deletePropertyLead(id: number): Promise<void> {
    await db.delete(propertyLeads).where(eq(propertyLeads.id, id));
  }

  async getMediaFileById(id: number): Promise<PropertyMedia | undefined> {
    const [media] = await db.select().from(propertyMedia).where(eq(propertyMedia.id, id));
    return media;
  }

  async deleteMediaFile(id: number): Promise<void> {
    await db.delete(propertyMedia).where(eq(propertyMedia.id, id));
  }

  async deleteAllPropertyMedia(leadId: number): Promise<void> {
    await db.delete(propertyMedia).where(eq(propertyMedia.propertyLeadId, leadId));
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
