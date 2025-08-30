# LinkMark Chrome Extension - Deployment Guide

## Prerequisites

1. **Google Cloud Console Setup**
2. **Chrome Web Store Developer Account** (if publishing)
3. **Backend API** (see BACKEND.md for options)

## Step 1: Google OAuth Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API** and **OAuth2 API**

### 1.2 Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** (for public use) or **Internal** (for organization only)
3. Fill out required fields:
   - App name: "LinkMark"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Save and continue

### 1.3 Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Choose **Chrome Extension** as application type
4. Add your extension ID (get this after uploading to Chrome Web Store or use the unpacked extension ID)
5. Copy the **Client ID**

### 1.4 Update Extension Configuration

1. Open `manifest.json`
2. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:
   ```json
   "oauth2": {
     "client_id": "your-actual-client-id.apps.googleusercontent.com",
     "scopes": ["openid", "email", "profile"]
   }
   ```

## Step 2: Backend Configuration

1. Set up your backend API (see BACKEND.md for options)
2. Update the API URL in `popup.js`:
   ```javascript
   this.apiBaseUrl = 'https://your-actual-backend-api.com/api';
   ```
3. Update `host_permissions` in `manifest.json`:
   ```json
   "host_permissions": [
     "https://your-actual-backend-api.com/*"
   ]
   ```

## Step 3: Local Testing

### 3.1 Load Extension in Chrome (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `linkmark` folder
5. Note the **Extension ID** (you'll need this for OAuth setup)

### 3.2 Test the Extension

1. Click the LinkMark icon in the browser toolbar
2. Test Gmail OAuth login
3. Navigate to any website and test bookmarking
4. Check browser console for any errors

### 3.3 Update OAuth Credentials (if needed)

1. Go back to Google Cloud Console > Credentials
2. Edit your OAuth client
3. Update the extension ID if it changed
4. Reload the extension in Chrome

## Step 4: Create Icons

Create icon files in the `icons/` directory:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

You can use tools like:
- [Canva](https://canva.com) for simple designs
- [GIMP](https://gimp.org) for advanced editing
- [Online Icon Generators](https://favicon.io/favicon-generator/)

## Step 5: Publishing to Chrome Web Store

### 5.1 Prepare for Submission

1. **Create a ZIP file** of your extension folder (excluding any development files)
2. **Test thoroughly** in multiple scenarios
3. **Prepare store assets**:
   - Screenshots (1280x800 or 640x400)
   - Promotional images
   - Detailed description

### 5.2 Chrome Web Store Submission

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Pay the one-time $5 developer registration fee
3. Click **Add new item**
4. Upload your ZIP file
5. Fill out the store listing:
   - **Name**: LinkMark - Smart Bookmark Manager
   - **Description**: Save bookmarks with categories using Gmail authentication
   - **Category**: Productivity
   - **Language**: English
6. Upload screenshots and promotional images
7. Set privacy practices and permissions
8. Submit for review

### 5.3 Update OAuth After Publishing

1. After your extension is published, get the final Extension ID
2. Update Google Cloud Console OAuth credentials with the production Extension ID
3. Update and republish if needed

## Step 6: Distribution Alternatives

### 6.1 Enterprise Distribution

For internal company use:
1. Package extension as CRX file
2. Use Chrome Enterprise policies
3. Deploy via Group Policy or MDM

### 6.2 Self-hosted Distribution

1. Host the extension files on your website
2. Provide installation instructions for developer mode
3. Consider automatic updates via `update_url` in manifest

## Troubleshooting

### Common Issues

1. **OAuth not working**:
   - Check Client ID in manifest.json
   - Verify extension ID in Google Cloud Console
   - Ensure OAuth consent screen is configured

2. **API calls failing**:
   - Check backend URL in popup.js
   - Verify host_permissions in manifest.json
   - Check CORS settings on backend

3. **Extension not loading**:
   - Check manifest.json syntax
   - Verify all file paths exist
   - Check browser console for errors

### Testing Checklist

- [ ] OAuth login works
- [ ] User info displays correctly
- [ ] Current page info loads
- [ ] Category input works
- [ ] Bookmark saves successfully
- [ ] Logout works
- [ ] Extension works on different websites
- [ ] Error handling works properly

## Production Recommendations

1. **Error Logging**: Implement proper error tracking
2. **Analytics**: Add usage analytics if needed
3. **Backup**: Implement bookmark export/import
4. **Sync**: Consider Chrome sync for categories
5. **Security**: Validate all inputs on backend
6. **Performance**: Optimize for large bookmark collections

## Support and Updates

1. Monitor Chrome Web Store reviews
2. Track error reports
3. Plan regular updates for new Chrome features
4. Maintain backward compatibility

For backend setup options, see `BACKEND.md`.
