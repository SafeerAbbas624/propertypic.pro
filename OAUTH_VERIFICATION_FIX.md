# Fix OAuth "Access Blocked" Error

You're getting a 403 error because the OAuth app needs proper configuration in Google Cloud Console.

## Fix Steps:

### 1. Add Test User (Required)
1. Go to [Google Cloud Console OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Select your project
3. Scroll down to "Test users" section
4. Click "+ ADD USERS" 
5. Add your email: `stads98@gmail.com`
6. Click "SAVE"

### 2. Add Redirect URIs (Required)
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. In "Authorized redirect URIs" section, add:
   - `http://localhost:5000/auth/google/callback` (for development)
   - `https://workspace-stads98.replit.app/auth/google/callback` (for production)
4. Click "SAVE"

**Important**: You must add BOTH URIs - the OAuth callback will fail without the correct redirect URI configured.

### 3. Test Authentication
1. Return to ProxyPics homepage
2. Click "Connect Now" button
3. Should now work with Google Drive authentication

## Current Issue:
The 403 "Access to localhost was denied" error occurs because:
- Your OAuth app is in testing mode (needs test user)
- Missing redirect URI configuration
- Both issues must be fixed for OAuth to work

## After Fix:
✅ OAuth authentication will work
✅ Photos will upload to your personal Google Drive
✅ Organized in: Adler Capital LLC → Wholesaling Real Estate → Property Photos → [Address]