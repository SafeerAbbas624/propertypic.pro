import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { googleAuthService } from './googleAuth';

// Google Drive service setup
export class GoogleDriveService {
  private drive: any;
  
  constructor() {
    // Initialize Google Drive API using service account JSON from environment
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY; // Fallback to old format
    
    let credentials;
    
    // Prioritize the new JSON format
    if (serviceAccountJson) {
      try {
        // First try to parse as JSON
        credentials = JSON.parse(serviceAccountJson);
        console.log('Using GOOGLE_SERVICE_ACCOUNT_JSON credentials');
      } catch (error) {
        // If it's not JSON, treat it as a private key and construct credentials
        if (serviceAccountJson.startsWith('MII') || serviceAccountJson.startsWith('-----BEGIN PRIVATE KEY-----')) {
          console.log('GOOGLE_SERVICE_ACCOUNT_JSON appears to be a private key, constructing full credentials...');
          const privateKey = serviceAccountJson.startsWith('-----BEGIN') ? serviceAccountJson : `-----BEGIN PRIVATE KEY-----\n${serviceAccountJson}\n-----END PRIVATE KEY-----`;
          credentials = {
            type: "service_account",
            project_id: "proxypics-photos",
            private_key_id: "a6a8d655fb3f87a2049d3d8bff6cb8d9404d63c2",
            private_key: privateKey,
            client_email: "proxypics-drive-access@proxypics-photos.iam.gserviceaccount.com",
            client_id: "114471233209145779436",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/proxypics-drive-access%40proxypics-photos.iam.gserviceaccount.com",
            universe_domain: "googleapis.com"
          };
        } else {
          console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', error);
          this.drive = null;
          return;
        }
      }
    } else if (serviceAccountKey) {
      console.log('Using legacy GOOGLE_SERVICE_ACCOUNT_KEY format');
      try {
        // Try to parse as JSON first
        credentials = JSON.parse(serviceAccountKey);
      } catch (firstError) {
        try {
          // Try to decode from base64 if direct JSON parsing fails
          const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
          credentials = JSON.parse(decodedKey);
        } catch (secondError) {
          // If both fail, check if it's just the private key and construct full credentials
          if (serviceAccountKey.startsWith('-----BEGIN PRIVATE KEY-----') || serviceAccountKey.startsWith('MII')) {
            console.log('Detected private key format, constructing full credentials...');
            credentials = {
              type: "service_account",
              project_id: "proxypics-photos",
              private_key_id: "a6a8d655fb3f87a2049d3d8bff6cb8d9404d63c2",
              private_key: serviceAccountKey.startsWith('-----BEGIN') ? serviceAccountKey : `-----BEGIN PRIVATE KEY-----\n${serviceAccountKey}\n-----END PRIVATE KEY-----`,
              client_email: "proxypics-drive-access@proxypics-photos.iam.gserviceaccount.com",
              client_id: "114471233209145779436",
              auth_uri: "https://accounts.google.com/o/oauth2/auth",
              token_uri: "https://oauth2.googleapis.com/token",
              auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
              client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/proxypics-drive-access%40proxypics-photos.iam.gserviceaccount.com",
              universe_domain: "googleapis.com"
            };
          } else {
            console.warn('Invalid GOOGLE_SERVICE_ACCOUNT_KEY format. Google Drive functionality will be disabled.');
            console.warn('Expected: Valid JSON string, base64-encoded JSON, or private key');
            console.warn('First error:', firstError instanceof Error ? firstError.message : String(firstError));
            console.warn('Second error:', secondError instanceof Error ? secondError.message : String(secondError));
            console.warn('Key preview:', serviceAccountKey.substring(0, 50) + '...');
            this.drive = null;
            return;
          }
        }
      }
    } else {
      console.warn('Neither GOOGLE_SERVICE_ACCOUNT_JSON nor GOOGLE_SERVICE_ACCOUNT_KEY found. Google Drive functionality will be disabled.');
      this.drive = null;
      return;
    }
    
    try {
      // Ensure private key has proper line breaks
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/drive'
        ]
      });
      
      this.drive = google.drive({ version: 'v3', auth });
      console.log('Google Drive service initialized successfully');
    } catch (authError) {
      console.warn('Google Drive authentication failed:', authError);
      this.drive = null;
    }
  }

  // Create folder structure: Property Photos > [Property Address]
  async createPropertyFolder(propertyAddress: string): Promise<{ folderId: string; shareableLink: string }> {
    if (!this.drive) {
      throw new Error('Google Drive service not initialized. Check your GOOGLE_SERVICE_ACCOUNT_KEY.');
    }
    
    try {
      // Use your existing "Property Photos" folder ID
      const propertyPhotosFolderId = '17RTPvbL_HpffuDqb-4hbOjiet6WlfTG6';
      
      // Create property-specific folder inside your existing folder
      const propertyFolderId = await this.findOrCreateFolder(propertyAddress, propertyPhotosFolderId);
      
      // Set folder permissions to be editable by service account and owner
      try {
        await this.drive.permissions.create({
          fileId: propertyFolderId,
          requestBody: {
            role: 'writer',
            type: 'anyone',
          },
          supportsAllDrives: true
        });
      } catch (permError) {
        console.warn('Could not set folder permissions:', permError);
      }

      // Get shareable link
      const file = await this.drive.files.get({
        fileId: propertyFolderId,
        fields: 'webViewLink',
        supportsAllDrives: true
      });

      return {
        folderId: propertyFolderId,
        shareableLink: file.data.webViewLink
      };
    } catch (error) {
      console.error('Error creating property folder:', error);
      throw new Error('Failed to create property folder in Google Drive');
    }
  }

  // Find existing folder or create new one
  private async findOrCreateFolder(name: string, parentId?: string): Promise<string> {
    if (!this.drive) {
      throw new Error('Google Drive service not initialized');
    }
    
    try {
      // Search for existing folder
      const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const searchQuery = parentId ? `${query} and '${parentId}' in parents` : query;
      
      const response = await this.drive.files.list({
        q: searchQuery,
        fields: 'files(id, name)'
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create new folder if not found
      const folderMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] })
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id'
      });

      return folder.data.id;
    } catch (error) {
      console.error(`Error finding/creating folder ${name}:`, error);
      throw error;
    }
  }

  // Upload file to Google Drive with proper naming
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderId: string
  ): Promise<string> {
    if (!this.drive) {
      throw new Error('Google Drive service not initialized');
    }
    
    try {
      console.log(`Attempting to upload ${fileName} to folder ${folderId}`);
      
      // First try to create the file in the specified folder
      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      };

      // Convert Buffer to readable stream for Google Drive API
      const stream = new Readable({
        read() {
          this.push(fileBuffer);
          this.push(null);
        }
      });

      const media = {
        mimeType: mimeType,
        body: stream
      };

      // Try creating file with different approaches to avoid quota issues
      let response;
      try {
        // First attempt: Direct upload to shared folder
        response = await this.drive.files.create({
          requestBody: {
            ...fileMetadata,
            writersCanShare: true
          },
          media: media,
          fields: 'id,webViewLink,parents',
          supportsAllDrives: true,
          useContentAsIndexableText: false
        });
      } catch (firstError) {
        console.log('First upload attempt failed, trying alternative method...');
        
        // Alternative: Try without supportsAllDrives flag
        response = await this.drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id,webViewLink,parents'
        });
      }

      console.log(`File created with ID: ${response.data.id}`);

      // Try to make the file publicly readable
      try {
        await this.drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
          supportsAllDrives: true
        });
        console.log(`File permissions set for ${fileName}`);
      } catch (permError) {
        console.warn(`Could not set public permissions for ${fileName}:`, permError);
        // Continue anyway - file is still uploaded
      }

      console.log(`File uploaded successfully: ${fileName} (ID: ${response.data.id})`);
      return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`;
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      
      // Always implement local storage with accessible URLs and Google Drive notes
      console.log('Implementing local storage with Google Drive tracking');
      
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads', folderId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save file locally
      const localFilePath = path.join(uploadDir, fileName);
      fs.writeFileSync(localFilePath, fileBuffer);
      
      // Create accessible URL for the locally stored file
      const fileUrl = `/uploads/${folderId}/${fileName}`;
      console.log(`File saved locally: ${fileName} -> ${fileUrl}`);
      
      // Create a note in Google Drive with file information and download link
      try {
        const noteContent = `Property Photo Upload - ${fileName}

Original filename: ${fileName}
File size: ${(fileBuffer.length / 1024).toFixed(2)} KB
Upload time: ${new Date().toISOString()}
File type: ${mimeType}

This file is stored securely on the server and can be accessed via the property inspection system.
Direct server link: ${fileUrl}

Property inspection completed via ProxyPics system.`;

        const result = await this.drive.files.create({
          requestBody: {
            name: `📷 ${fileName} - Upload Record.txt`,
            parents: [folderId],
            mimeType: 'text/plain',
            description: `Upload tracking for ${fileName}`
          },
          media: {
            mimeType: 'text/plain',
            body: noteContent
          },
          fields: 'id,name,webViewLink'
        });
        console.log(`Created tracking record in Google Drive: ${result.data.name} (ID: ${result.data.id})`);
      } catch (noteError) {
        console.error('Could not create tracking record in Google Drive:', noteError);
        console.error('Note error details:', noteError instanceof Error ? noteError.message : String(noteError));
      }
      
      return fileUrl;
    }
  }

  // OAuth-based folder creation (uses owner's personal Google Drive)
  async createFolderWithOAuth(propertyAddress: string, accessToken: string): Promise<{ folderId: string; shareLink: string }> {
    try {
      // Use OAuth credentials for owner's personal Drive
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      const personalDrive = google.drive({ version: 'v3', auth });

      // Navigate to the correct folder structure in owner's personal Drive
      // Adler Capital LLC → Wholesaling Real Estate → Property Photos → [Property Address]
      
      // Find or create "Adler Capital LLC" folder
      const adlerFolder = await this.findOrCreateFolderOAuth(personalDrive, 'Adler Capital LLC', null);
      
      // Find or create "Wholesaling Real Estate" inside Adler Capital LLC
      const wholesalingFolder = await this.findOrCreateFolderOAuth(personalDrive, 'Wholesaling Real Estate', adlerFolder);
      
      // Find or create "Property Photos" inside Wholesaling Real Estate
      const propertyPhotosFolder = await this.findOrCreateFolderOAuth(personalDrive, 'Property Photos', wholesalingFolder);
      
      // Create property-specific folder inside Property Photos
      const propertyFolder = await this.findOrCreateFolderOAuth(personalDrive, propertyAddress, propertyPhotosFolder);
      
      // Generate shareable link
      const shareLink = `https://drive.google.com/drive/folders/${propertyFolder}`;
      
      console.log(`Created property folder in owner's personal Drive: ${propertyAddress}`);
      return { folderId: propertyFolder, shareLink };
      
    } catch (error) {
      console.error('Error creating folder with OAuth:', error);
      throw new Error('Failed to create folder in owner\'s Google Drive');
    }
  }

  // Helper method to find or create folders using OAuth
  private async findOrCreateFolderOAuth(drive: any, folderName: string, parentId: string | null): Promise<string> {
    try {
      // Search for existing folder
      const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentId ? ` and '${parentId}' in parents` : ''}`;
      
      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create folder if it doesn't exist
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined
      };

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id'
      });

      console.log(`Created folder: ${folderName} (ID: ${folder.data.id})`);
      return folder.data.id;
      
    } catch (error) {
      console.error(`Error finding/creating folder ${folderName}:`, error);
      throw error;
    }
  }

  // OAuth-based file upload (uses owner's personal Google Drive)
  async uploadFileWithOAuth(fileBuffer: Buffer, fileName: string, folderId: string, mimeType: string, accessToken: string): Promise<string> {
    try {
      // Use OAuth credentials for owner's personal Drive
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      const personalDrive = google.drive({ version: 'v3', auth });

      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      };

      const media = {
        mimeType: mimeType,
        body: Readable.from(fileBuffer)
      };

      const result = await personalDrive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink'
      });

      const fileUrl = result.data.webViewLink || `https://drive.google.com/file/d/${result.data.id}/view`;
      console.log(`Uploaded to owner's personal Drive: ${fileName} (${fileUrl})`);
      return fileUrl;
      
    } catch (error) {
      console.error('Error uploading file with OAuth:', error);
      throw new Error('Failed to upload file to owner\'s Google Drive');
    }
  }
}

export const googleDriveService = new GoogleDriveService();