# Google Drive OAuth Setup Guide

## Overview
ProxyPics uses your personal Google Drive account to store all property photos centrally. This one-time setup ensures all uploads go directly to your Google Drive with organized folder structure.

## Step 1: Create Google Cloud Project & OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Drive API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
   - For production: `https://your-domain.replit.app/auth/google/callback`

5. Copy the generated:
   - **Client ID** (looks like: 123456789-abc123def456.apps.googleusercontent.com)
   - **Client Secret** (looks like: GOCSPX-abcdef123456...)

## Step 2: Configure ProxyPics

1. When prompted by the app, provide:
   - `GOOGLE_CLIENT_ID`: Your OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your OAuth Client Secret

2. Visit the Admin Setup page at `/admin`
3. Click "Connect Google Drive"
4. Complete the Google OAuth flow

## Step 3: Test the Connection

1. Create a new property inspection
2. Upload a test photo
3. Check your Google Drive for the organized folder structure:
   ```
   📁 Adler Capital LLC
   └── 📁 Wholesaling Real Estate
       └── 📁 Property Photos
           └── 📁 [Property Address]
               └── 🖼️ Your uploaded photos
   ```

## How It Works

- **One-Time Setup**: You authenticate once with your Google account
- **Centralized Storage**: All property photos upload to YOUR Google Drive
- **No User Accounts**: Property photographers don't need Google accounts
- **Organized Structure**: Photos automatically organized by property address
- **Full Control**: You own and control all uploaded files

## Troubleshooting

- **"OAuth credentials not found"**: Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- **"Redirect URI mismatch"**: Check the authorized redirect URI matches your domain
- **"Access denied"**: Make sure Google Drive API is enabled in your project

## Security Notes

- Only you (the property owner) authenticate with Google
- Property photographers only access via unique upload tokens
- All files go to your personal Google Drive account
- You maintain full ownership and control of all uploaded content