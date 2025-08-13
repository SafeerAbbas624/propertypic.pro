import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { googleDriveService } from "./googleDrive";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { z } from "zod";
import { insertPropertyLeadSchema, insertPropertyMediaSchema } from "@shared/schema";
import { googleAuthService } from "./googleAuth";

// Environment variables for OAuth verification
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback';

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Environment variables for Firebase (should be provided in production)
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "firebase_api_key";
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || "firebase_storage_bucket";

export async function registerRoutes(app: Express): Promise<Server> {
  // OAuth routes
  app.get('/auth/google', (req, res) => {
    const authUrl = googleAuthService.getAuthUrl();
    console.log('Generated OAuth URL:', authUrl);
    res.redirect(authUrl);
  });

  // Debug route to test callback functionality
  app.get('/auth/test-callback', (req, res) => {
    console.log('Test callback route accessed');
    res.json({ 
      message: 'Callback route is working',
      timestamp: new Date().toISOString(),
      query: req.query,
      host: req.headers.host,
      clientId: CLIENT_ID?.substring(0, 20) + '...',
      redirectUri: REDIRECT_URI
    });
  });

  // Verification route to check OAuth configuration
  app.get('/auth/verify-config', (req, res) => {
    const authUrl = googleAuthService.getAuthUrl();
    const urlParams = new URL(authUrl);
    
    res.json({
      message: 'OAuth Configuration Check',
      clientId: CLIENT_ID?.substring(0, 20) + '...',
      redirectUri: REDIRECT_URI,
      scope: urlParams.searchParams.get('scope'),
      authUrlValid: authUrl.includes('accounts.google.com'),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/auth/google/callback', async (req, res) => {
    try {
      console.log('OAuth callback received. Query params:', req.query);
      console.log('Request headers:', req.headers);
      
      const { code, error: oauthError, state } = req.query;
      
      if (oauthError) {
        console.error('OAuth error received:', oauthError);
        return res.redirect('/?auth=error&message=' + encodeURIComponent(oauthError as string));
      }
      
      if (!code || typeof code !== 'string') {
        console.error('No authorization code received');
        return res.status(400).json({ error: 'Missing authorization code' });
      }

      console.log('Exchanging authorization code for tokens...');
      const tokens = await googleAuthService.getTokens(code);
      
      // These are now stored as owner tokens for all future uploads
      console.log('Google Drive authentication completed for owner account');
      
      res.redirect('/?auth=success');
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/?auth=error&message=token_exchange_failed');
    }
  });

  app.get('/auth/status', (req, res) => {
    const ownerTokens = googleAuthService.getOwnerTokens();
    const hasTokens = !!ownerTokens?.access_token;
    res.json({ 
      authenticated: hasTokens,
      message: hasTokens ? 'Owner Google Drive connected' : 'Owner needs to authenticate Google Drive'
    });
  });

  app.post('/auth/logout', (req, res) => {
    googleAuthService.setOwnerTokens(null);
    res.json({ success: true, message: 'Owner Google Drive disconnected' });
  });

  // API routes
  app.get('/api/property-leads/:token', async (req, res) => {
    try {
      const token = req.params.token;
      const lead = await storage.getPropertyLeadByToken(token);
      
      if (!lead) {
        return res.status(404).json({ message: 'Property lead not found' });
      }
      
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/property-leads', async (req, res) => {
    try {
      // Generate a random token
      const token = randomUUID().replace(/-/g, '').substring(0, 8);

      // Check if request has form data
      const hasFormData = req.body && Object.keys(req.body).length > 0;
      
      let propertyData;
      
      if (hasFormData) {
        // Use provided property details from form
        try {
          const validatedData = insertPropertyLeadSchema.parse(req.body);
          propertyData = validatedData;
        } catch (validationError) {
          return res.status(400).json({ message: 'Invalid property data provided' });
        }
      } else {
        // Default to a Miami property for demo purposes
        propertyData = {
          name: "Brickell Bay Condo",
          address: "1200 Brickell Bay Dr",
          city: "Miami", 
          state: "FL",
          zipCode: "33131",
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 1250,
          propertyType: "Condo"
        };
      }
      
      // Create lead with property details
      const newLead = {
        ...propertyData,
        token
      };

      const lead = await storage.createPropertyLead(newLead);
      
      // Create Google Drive folder for this property
      try {
        const propertyAddress = `${lead.address}, ${lead.city}, ${lead.state}`.replace(/,\s*$/, '');
        console.log(`Attempting to create Google Drive folder for: ${propertyAddress}`);
        const driveFolder = await googleDriveService.createPropertyFolder(propertyAddress);
        
        // Update the lead with Google Drive information
        await storage.updatePropertyLeadDriveInfo(lead.id, driveFolder.folderId, driveFolder.shareableLink);
        
        // Return updated lead with Google Drive info
        const updatedLead = await storage.getPropertyLead(lead.id);
        console.log(`Google Drive folder created successfully: ${driveFolder.shareableLink}`);
        res.status(201).json(updatedLead);
      } catch (driveError) {
        console.error('Google Drive setup failed:', driveError);
        // Still return the lead even if Google Drive setup fails
        res.status(201).json(lead);
      }
    } catch (error) {
      console.error('Error creating property lead:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/property-leads/:token/complete', async (req, res) => {
    try {
      const token = req.params.token;
      const lead = await storage.getPropertyLeadByToken(token);
      
      if (!lead) {
        return res.status(404).json({ message: 'Property lead not found' });
      }
      
      const updatedLead = await storage.updatePropertyLeadStatus(lead.id, 'complete');
      res.json(updatedLead);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const { token, stepId, stepTitle } = req.body;
      
      if (!token || !stepId || !stepTitle) {
        return res.status(400).json({ message: 'Missing required fields: token, stepId, stepTitle' });
      }
      
      console.log(`Processing upload: ${stepTitle} for token ${token}`);
      
      const lead = await storage.getPropertyLeadByToken(token);
      if (!lead) {
        return res.status(404).json({ message: 'Invalid token' });
      }
      
      // Save file locally first (primary storage)
      const extension = path.extname(req.file.originalname) || (req.file.mimetype.includes('image') ? '.jpg' : '.mp4');
      const properFileName = `${stepTitle.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}${extension}`;

      // Create local directory structure
      const propertyFolder = `${lead.address.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}_${lead.city}`;
      const localDir = path.join(process.cwd(), 'uploads', propertyFolder);

      // Ensure directory exists
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }

      // Save file locally
      const localPath = path.join(localDir, properFileName);
      fs.writeFileSync(localPath, req.file.buffer);

      // Generate local file URL
      const fileUrl = `/uploads/${propertyFolder}/${properFileName}`;

      // Optional: Try to sync to Google Drive if connected
      let googleDriveFileId = null;
      let isSyncedToGoogleDrive = false;

      try {
        const ownerTokens = googleAuthService.getOwnerTokens();
        
        if (ownerTokens?.access_token) {
          console.log(`Syncing to owner's Google Drive: ${properFileName}`);

          // Create folder if needed using owner's tokens
          if (!lead.googleDriveFolderId) {
            const propertyAddress = `${lead.address}, ${lead.city}, ${lead.state}`.replace(/,\s*$/, '');
            const { folderId, shareLink } = await googleDriveService.createFolderWithOAuth(
              propertyAddress,
              ownerTokens.access_token
            );

            // Update the lead with Google Drive information
            await storage.updatePropertyLeadDriveInfo(lead.id, folderId, shareLink);
            lead.googleDriveFolderId = folderId;
          }

          // Upload file using owner's OAuth tokens
          const driveFileUrl = await googleDriveService.uploadFileWithOAuth(
            req.file.buffer,
            properFileName,
            lead.googleDriveFolderId,
            req.file.mimetype,
            ownerTokens.access_token
          );

          // Extract file ID from Google Drive URL for tracking
          const fileIdMatch = driveFileUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (fileIdMatch) {
            googleDriveFileId = fileIdMatch[1];
            isSyncedToGoogleDrive = true;
          }

          console.log(`Successfully synced to Google Drive: ${driveFileUrl}`);
        } else {
          console.log('Google Drive not connected - file saved locally only');
        }
      } catch (syncError) {
        console.log('Google Drive sync failed, file saved locally only:', syncError);
        // File is already saved locally, so this is not a critical error
      }
      
      // Save the media information in the database
      const fileType = req.file.mimetype.includes('image') ? 'photo' : 'video';
      const media = await storage.createPropertyMedia({
        propertyLeadId: lead.id,
        leadToken: token,
        step: stepId,
        stepTitle: stepTitle,
        fileName: properFileName,
        fileUrl,
        localPath: localPath,
        fileType,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        googleDriveFileId,
        isSyncedToGoogleDrive,
        metadata: {
          originalName: req.file.originalname,
          uploadedAt: new Date().toISOString()
        }
      });
      
      res.status(201).json({
        fileUrl,
        metadata: media.metadata
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Server error during upload' });
    }
  });

  app.get('/api/property-leads/:token/media', async (req, res) => {
    try {
      const token = req.params.token;
      const lead = await storage.getPropertyLeadByToken(token);

      if (!lead) {
        return res.status(404).json({ message: 'Property lead not found' });
      }

      const media = await storage.getPropertyMediaByToken(token);
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Search properties by address
  app.get('/api/property-search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const properties = await storage.searchPropertiesByAddress(query);
      res.json(properties);
    } catch (error) {
      console.error('Error searching properties:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // New API endpoints for file browser
  app.get('/api/property-folders', async (req, res) => {
    try {
      const folders = await storage.getAllPropertyLeadsWithMedia();

      // Augment counts with on-disk counts if DB shows zero
      const normalized = folders.map((f) => {
        const addressFolder = `${(f.address || '').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}_${f.city || ''}`;
        const addressDir = path.join(process.cwd(), 'uploads', addressFolder);
        const tokenDir = f.token ? path.join(process.cwd(), 'uploads', f.token) : '';
        let mediaCount = f.mediaCount;
        try {
          if ((!mediaCount || mediaCount === 0) && fs.existsSync(addressDir)) {
            mediaCount = fs.readdirSync(addressDir).length;
          } else if ((!mediaCount || mediaCount === 0) && f.token && fs.existsSync(tokenDir)) {
            mediaCount = fs.readdirSync(tokenDir).length;
          }
        } catch {}
        return { ...f, mediaCount };
      });

      res.json(normalized);
    } catch (error) {
      console.error('Error fetching property folders:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/property-media/:leadId', async (req, res) => {
    try {
      const idOrToken = req.params.leadId;

      // Try to resolve lead by: 1) UUID (property ID), 2) numeric ID, 3) token
      let lead = null;
      const isNumeric = /^\d+$/.test(idOrToken);
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrToken);

      if (isUUID) {
        lead = await storage.getPropertyLeadByUUID(idOrToken);
      } else if (isNumeric) {
        lead = await storage.getPropertyLeadById(parseInt(idOrToken, 10));
      } else {
        lead = await storage.getPropertyLeadByToken(idOrToken);
      }

      if (!lead) {
        // Fallback: if param is a token and there is a folder with that name, serve files directly
        if (!isNumeric) {
          const tokenFolder = path.join(process.cwd(), 'uploads', idOrToken);
          if (fs.existsSync(tokenFolder)) {
            try {
              const files = fs.readdirSync(tokenFolder);
              const mapped = files
                .map((fileName) => {
                  const localPath = path.join(tokenFolder, fileName);
                  const stat = fs.statSync(localPath);
                  if (!stat.isFile()) return null;
                  const ext = path.extname(fileName).toLowerCase();
                  const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
                  const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
                  const fileType = isImage ? 'photo' : isVideo ? 'video' : 'file';
                  if (fileType === 'file') return null;
                  return {
                    id: -1,
                    fileName,
                    fileType,
                    fileSize: stat.size,
                    fileUrl: `/uploads/${idOrToken}/${fileName}`,
                    stepTitle: fileName,
                    timestamp: new Date().toISOString(),
                    mimeType: undefined,
                    isSyncedToGoogleDrive: false,
                  };
                })
                .filter(Boolean);
              return res.json(mapped);
            } catch (e) {
              console.warn('Token-folder fallback failed:', e);
            }
          }
        }
        return res.status(404).json({ message: 'Property lead not found' });
      }

      const addressFolder = `${(lead.address || '').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}_${lead.city || ''}`;

      let media = await storage.getPropertyMediaWithDetails(lead.id);

      // Fallback: if DB is empty, scan uploads folder(s) and backfill
      if (!media || media.length === 0) {
        const addressDir = path.join(process.cwd(), 'uploads', addressFolder);
        const tokenDir = lead.token ? path.join(process.cwd(), 'uploads', lead.token) : '';
        const dirsToScan = [addressDir, tokenDir].filter((d) => !!d && fs.existsSync(d));

        for (const dir of dirsToScan) {
          try {
            const files = fs.readdirSync(dir);
            for (const fileName of files) {
              const localPath = path.join(dir, fileName);
              const stat = fs.statSync(localPath);
              if (!stat.isFile()) continue;
              const ext = path.extname(fileName).toLowerCase();
              const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
              const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
              const fileType = isImage ? 'photo' : isVideo ? 'video' : 'file';
              if (fileType === 'file') continue; // skip unknown types

              const folderName = path.basename(dir);
              const fileUrl = `/uploads/${folderName}/${fileName}`;

              // Avoid duplicates by file name
              if (media?.some((m) => m.fileName === fileName)) continue;

              await storage.createPropertyMedia({
                propertyLeadId: lead.id,
                leadToken: lead.token,
                step: 'legacy',
                stepTitle: fileName,
                fileName,
                fileUrl,
                localPath,
                fileType: fileType as any,
                fileSize: stat.size,
                mimeType: undefined,
                googleDriveFileId: null as any,
                isSyncedToGoogleDrive: false,
                metadata: { importedFrom: 'fs-scan' } as any,
              });
            }
          } catch (e) {
            console.warn('FS scan error:', e);
          }
        }

        // re-fetch after backfill
        media = await storage.getPropertyMediaWithDetails(lead.id);
      }

      // Normalize file URLs to whichever folder actually contains the file
      const normalized = media.map((m) => {
        let fileUrl = m.fileUrl;
        try {
          const fileName = m.fileName;
          const addrPath = path.join(process.cwd(), 'uploads', addressFolder, fileName);
          const tokenPath = lead.token ? path.join(process.cwd(), 'uploads', lead.token, fileName) : '';
          if (fs.existsSync(addrPath)) {
            fileUrl = `/uploads/${addressFolder}/${fileName}`;
          } else if (lead.token && fs.existsSync(tokenPath)) {
            fileUrl = `/uploads/${lead.token}/${fileName}`;
          }
        } catch {}
        return { ...m, fileUrl };
      });

      res.json(normalized);
    } catch (error) {
      console.error('Error fetching property media:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Serve uploaded files with proper headers and download options
  app.get('/uploads/:folderId/:fileName', (req, res) => {
    try {
      const { folderId, fileName } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', folderId, fileName);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Determine content type based on file extension
      const ext = path.extname(fileName).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.mp4') contentType = 'video/mp4';
      else if (ext === '.webm') contentType = 'video/webm';
      
      // Set headers for proper file serving
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      res.setHeader('Accept-Ranges', 'bytes');
      
      // Add download header if requested
      if (req.query.download === 'true') {
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      }
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ message: 'Error serving file' });
    }
  });

  // Delete a property folder and all its files
  app.delete('/api/property-folders/:id', async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }

      // Get property details first
      const property = await storage.getPropertyLeadById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Delete all media files for this property
      await storage.deleteAllPropertyMedia(propertyId);

      // Delete the property folder from filesystem
      const uploadDir = path.join(process.cwd(), 'uploads', property.token);
      if (fs.existsSync(uploadDir)) {
        fs.rmSync(uploadDir, { recursive: true, force: true });
      }

      // Delete the property lead record
      await storage.deletePropertyLead(propertyId);

      res.json({ message: 'Property folder and all files deleted successfully' });
    } catch (error) {
      console.error('Error deleting property folder:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete a specific media file
  app.delete('/api/property-media/:id', async (req, res) => {
    try {
      const mediaId = parseInt(req.params.id);
      if (isNaN(mediaId)) {
        return res.status(400).json({ message: 'Invalid media ID' });
      }

      // Get media file details first
      const mediaFile = await storage.getMediaFileById(mediaId);
      if (!mediaFile) {
        return res.status(404).json({ message: 'Media file not found' });
      }

      // Delete the physical file
      if (mediaFile.localPath && fs.existsSync(mediaFile.localPath)) {
        fs.unlinkSync(mediaFile.localPath);
      }

      // Delete the database record
      await storage.deleteMediaFile(mediaId);

      res.json({ message: 'Media file deleted successfully' });
    } catch (error) {
      console.error('Error deleting media file:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // File browser endpoint to list all uploaded files for a property
  app.get('/api/browse/:folderId', (req, res) => {
    try {
      const { folderId } = req.params;
      const uploadDir = path.join(process.cwd(), 'uploads', folderId);

      if (!fs.existsSync(uploadDir)) {
        return res.json({ files: [], message: 'No files uploaded yet' });
      }
      
      const files = fs.readdirSync(uploadDir).map(fileName => {
        const filePath = path.join(uploadDir, fileName);
        const stats = fs.statSync(filePath);
        const ext = path.extname(fileName).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
        
        return {
          name: fileName,
          size: stats.size,
          sizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`,
          modified: stats.mtime,
          type: isImage ? 'image' : isVideo ? 'video' : 'file',
          url: `/uploads/${folderId}/${fileName}`,
          downloadUrl: `/uploads/${folderId}/${fileName}?download=true`
        };
      });
      
      res.json({ files, count: files.length, folderId });
    } catch (error) {
      console.error('Error browsing files:', error);
      res.status(500).json({ message: 'Error browsing files' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  return httpServer;
}
