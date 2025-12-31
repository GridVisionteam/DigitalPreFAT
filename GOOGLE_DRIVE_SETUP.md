# Google Drive Integration Setup Guide

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name it (e.g., "RTU PDF Uploader")
4. Click "Create"

## Step 2: Enable Google Drive API
1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and click "Enable"

## Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Select "Web application" as Application type
4. Name it (e.g., "RTU Web Client")
5. Add Authorized JavaScript origins:
   - For local testing: `http://localhost:8000` (or your local port)
   - For production: `https://yourdomain.com`
6. Add Authorized redirect URIs:
   - `http://localhost:8000` (or your local port)
   - `https://yourdomain.com`
7. Click "Create"
8. Copy the "Client ID"

## Step 4: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API Key

## Step 5: Get Google Drive Folder ID (Optional)
1. Open Google Drive in your browser
2. Navigate to the folder where you want to upload files
3. The folder ID is in the URL:
   `https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE`

## Step 6: Update Configuration
Open `googleDrive.js` and update these values:

```javascript
const GOOGLE_API_KEY = 'YOUR_API_KEY_HERE';
const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // Leave as empty string '' for root folder