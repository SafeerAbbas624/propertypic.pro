import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Determine the correct redirect URI based on environment
const getRedirectUri = () => {
  if (process.env.REPLIT_DEPLOYMENT === '1') {
    // Production - use Replit domain
    return `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.replit.app/auth/google/callback`;
  } else {
    // Development - use localhost
    return 'http://localhost:5000/auth/google/callback';
  }
};

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || getRedirectUri();

// Store owner's tokens (in production, store this in database)
let ownerTokens: any = null;

export class GoogleAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.warn('Google OAuth credentials not found. OAuth authentication will not work.');
    }
    
    this.oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
  }

  // Generate OAuth URL for user authentication
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      include_granted_scopes: true
    });
  }

  // Exchange authorization code for tokens and store as owner tokens
  async getTokens(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      // Store these as the owner's tokens for all uploads
      ownerTokens = tokens;
      console.log('Owner Google Drive tokens stored successfully');
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  // Get stored owner tokens
  getOwnerTokens() {
    return ownerTokens;
  }

  // Set owner tokens (for initialization)
  setOwnerTokens(tokens: any) {
    ownerTokens = tokens;
  }

  // Create authenticated Drive client
  getDriveClient(accessToken: string) {
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });
    
    return google.drive({ version: 'v3', auth: authClient });
  }

  // Refresh access token if needed
  async refreshToken(refreshToken: string) {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }
}

export const googleAuthService = new GoogleAuthService();