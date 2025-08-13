# Create New OAuth Client - Complete Fix

## The Problem
Your current OAuth client (`691557692182-7mp70e0m4njagco6sfkh3jpu3qlq4i9n`) has a configuration issue that's causing persistent 403 errors even after 15+ minutes. This usually means:

1. The redirect URI isn't properly saved in Google Console
2. The client is in the wrong Google Cloud project
3. There's a mismatch between the console settings and what's actually configured

## Complete Solution: Create New OAuth Client

### Step 1: Create New OAuth 2.0 Client
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth 2.0 Client ID"**

### Step 2: Configure the New Client
- **Application type**: Web application
- **Name**: `ProxyPics Development`
- **Authorized JavaScript origins**: Leave empty
- **Authorized redirect URIs**: Add exactly these two:
  - `http://localhost:5000/auth/google/callback`
  - `https://workspace-stads98.replit.app/auth/google/callback`

### Step 3: Copy New Credentials
After clicking "CREATE", you'll get:
- **Client ID**: (copy this)
- **Client Secret**: (copy this)

### Step 4: Update OAuth Consent Screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Add test user: `stads98@gmail.com`
3. Make sure app is in "Testing" status
4. Save changes

### Step 5: Update ProxyPics with New Credentials
You'll need to update these environment variables with the new values:
- `GOOGLE_CLIENT_ID`: (new client ID from step 3)
- `GOOGLE_CLIENT_SECRET`: (new client secret from step 3)

## Why This Will Fix the Issue

The new OAuth client will be properly configured from scratch with:
✅ Correct redirect URIs
✅ Proper test user configuration  
✅ No legacy configuration conflicts
✅ Immediate effect (no waiting period)

## Expected Result
After creating the new OAuth client and updating the credentials:
1. Click "Connect Now" in ProxyPics
2. Google OAuth screen appears immediately
3. You can authenticate successfully
4. All photos upload to your personal Google Drive

This approach bypasses any configuration issues with the current OAuth client and gives you a clean, working setup.