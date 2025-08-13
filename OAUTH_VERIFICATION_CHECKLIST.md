# OAuth Configuration Verification Checklist

## Current Configuration Status

**Your Client ID**: `691557692182-7mp70e0m4njagco6sfkh3jpu3qlq4i9n.apps.googleusercontent.com`
**Required Redirect URI**: `http://localhost:5000/auth/google/callback`
**Required Scope**: `https://www.googleapis.com/auth/drive`

## ✅ What To Verify in Google Cloud Console

### 1. OAuth Consent Screen Configuration
Go to: https://console.cloud.google.com/apis/credentials/consent

**Check these settings:**
- [ ] App name: Should show "inspection-app" or similar
- [ ] User support email: Should be your email
- [ ] Publishing status: Should be "Testing" (this is correct for now)
- [ ] Test users section: Must include `stads98@gmail.com`

### 2. OAuth 2.0 Client ID Configuration  
Go to: https://console.cloud.google.com/apis/credentials

**Find your Client ID and verify:**
- [ ] Client ID matches: `691557692182-7mp70e0m4njagco6sfkh3jpu3qlq4i9n.apps.googleusercontent.com`
- [ ] Authorized redirect URIs includes: `http://localhost:5000/auth/google/callback`
- [ ] Authorized redirect URIs includes: `https://workspace-stads98.replit.app/auth/google/callback`

### 3. APIs & Services
Go to: https://console.cloud.google.com/apis/library

**Ensure these APIs are enabled:**
- [ ] Google Drive API - Must be enabled
- [ ] Google+ API (optional but helpful)

## 🔧 Server-Side Verification (Already Working)
- ✅ OAuth URL generation working
- ✅ Callback route responding correctly  
- ✅ Error handling implemented
- ✅ Proper scopes configured
- ✅ Environment variables loaded

## 🧪 Quick Tests You Can Do

### Test 1: Check OAuth URL Generation
Visit: http://localhost:5000/auth/google
- Should redirect to Google OAuth page
- URL should contain your correct Client ID
- Should request `drive` scope only

### Test 2: Manual Callback Test
Visit: http://localhost:5000/auth/test-callback
- Should show JSON response with server info
- Confirms callback route is accessible

### Test 3: Error Handling Test  
Visit: http://localhost:5000/auth/google/callback?error=access_denied
- Should redirect to homepage with error message
- Confirms error handling works

## 🎯 The Real Test

After verifying all checkboxes above:
1. Wait 10-15 minutes after making any Google Console changes
2. Click "Connect Now" button in ProxyPics
3. Should see Google OAuth consent screen
4. Click "Allow" 
5. Should redirect back with success

## 🚨 Common Issues

**"Access to localhost was denied"** = Redirect URI not properly configured
**"Error 403: access_denied"** = Test user not added or app not published for testing
**"invalid_scope"** = Scope mismatch (should be fixed in current config)

## 📋 Verification Results

Use this checklist to mark what you've verified:
- [ ] Test user `stads98@gmail.com` added to OAuth consent screen
- [ ] Both redirect URIs added to OAuth client
- [ ] Google Drive API enabled for project
- [ ] Client ID matches in both console and application
- [ ] Waited 10+ minutes after making console changes