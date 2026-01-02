// googleDrive.js - Google Drive Integration

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const GOOGLE_API_KEY = 'AIzaSyA9I3SyapNGGv3y26Jk-bo37XQ4zUKo5qs'; // Replace with your Google API Key
const GOOGLE_CLIENT_ID = '656211138338-35iq6or29q9ea6583v80ofq746hinlha.apps.googleusercontent.com'; // Replace with your Client ID
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_FOLDER_ID = '1EJpjHsWjmUHBMFRuELKMrrxickhqkFGC'; // Optional: Your Google Drive folder ID

// ============================================
// GLOBAL VARIABLES
// ============================================
let gapiLoaded = false;
let gisLoaded = false;
let tokenClient = null;
let isAuthenticating = false;
let cachedAccessToken = null; // Cache the access token
let authPromise = null; // Store the ongoing authentication promise

// ============================================
// GOOGLE API INITIALIZATION
// ============================================

/**
 * Load Google APIs and initialize
 */
function loadGoogleAPIs() {
    return new Promise((resolve, reject) => {
        if (gapiLoaded && gisLoaded) {
            resolve();
            return;
        }

        console.log('Loading Google APIs...');

        // Load gapi (Google APIs)
        if (typeof gapi === 'undefined') {
            reject(new Error('Google API library not loaded. Check internet connection.'));
            return;
        }

        gapi.load('client:picker', {
            callback: function() {
                gapi.client.init({
                    apiKey: GOOGLE_API_KEY,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
                }).then(() => {
                    console.log('Google API client initialized');
                    gapiLoaded = true;
                    if (gisLoaded) resolve();
                }).catch(error => {
                    console.error('Failed to initialize Google API client:', error);
                    reject(new Error('Failed to initialize Google APIs: ' + error.message));
                });
            },
            onerror: function(error) {
                console.error('Failed to load Google API:', error);
                reject(new Error('Failed to load Google API library'));
            }
        });

        // Load Google Identity Services
        if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
            reject(new Error('Google Identity Services not loaded. Check internet connection.'));
            return;
        }

        try {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: GOOGLE_SCOPES,
                callback: (response) => {
                    isAuthenticating = false;
                    if (response.error) {
                        console.error('Google OAuth error:', response);
                        updateDriveStatusIfAvailable('Authentication failed: ' + response.error, true);
                        // Reject any pending auth promises
                        if (authPromise && authPromise.reject) {
                            authPromise.reject(new Error(response.error));
                        }
                    } else {
                        // Cache the access token
                        cachedAccessToken = response.access_token;
                        console.log('Authentication successful, token cached');
                        // Resolve any pending auth promises
                        if (authPromise && authPromise.resolve) {
                            authPromise.resolve(cachedAccessToken);
                        }
                    }
                    // Reset auth promise
                    authPromise = null;
                },
            });
            
            gisLoaded = true;
            console.log('Google Identity Services initialized');
            
            if (gapiLoaded) resolve();
            
        } catch (error) {
            console.error('Failed to initialize Google Identity Services:', error);
            reject(new Error('Failed to initialize Google Identity Services'));
        }
    });
}

// ============================================
// AUTHENTICATION FUNCTIONS - SINGLE SIGN-IN
// ============================================

/**
 * Get access token with single sign-in
 * This ensures the sign-in popup only appears once
 */
async function getAccessToken() {
    // Check for valid cached token first
    if (cachedAccessToken && await isTokenValid(cachedAccessToken)) {
        console.log('Using cached access token');
        return cachedAccessToken;
    }
    
    // Check for existing token in browser storage
    const existingToken = await checkExistingToken();
    if (existingToken && await isTokenValid(existingToken)) {
        cachedAccessToken = existingToken;
        console.log('Using existing token from browser storage');
        return cachedAccessToken;
    }
    
    // If authentication is already in progress, wait for it
    if (authPromise) {
        console.log('Authentication already in progress, waiting...');
        return await authPromise.promise;
    }
    
    // Create a new authentication promise
    let resolveAuth, rejectAuth;
    const authPromiseObj = {
        promise: new Promise((resolve, reject) => {
            resolveAuth = resolve;
            rejectAuth = reject;
        }),
        resolve: resolveAuth,
        reject: rejectAuth
    };
    
    authPromise = authPromiseObj;
    
    try {
        // Load Google APIs if needed
        await loadGoogleAPIs();
        
        if (!tokenClient) {
            throw new Error('Google Identity Services not loaded');
        }
        
        // Set custom callback for this specific auth request
        const originalCallback = tokenClient.callback;
        tokenClient.callback = (response) => {
            isAuthenticating = false;
            if (response.error) {
                let errorMessage = 'Authentication failed';
                if (response.error === 'popup_closed_by_user') {
                    errorMessage = 'Authentication popup was closed. Please try again.';
                } else if (response.error_description) {
                    errorMessage = response.error_description;
                }
                rejectAuth(new Error(errorMessage));
            } else {
                cachedAccessToken = response.access_token;
                console.log('Authentication successful, token cached');
                resolveAuth(cachedAccessToken);
            }
            // Restore original callback
            tokenClient.callback = originalCallback;
            authPromise = null;
        };
        
        isAuthenticating = true;
        console.log('Requesting authentication...');
        updateDriveStatusIfAvailable('Please sign in to Google...', false);
        
        // Request access token (this will show the popup)
        tokenClient.requestAccessToken();
        
        // Wait for authentication to complete
        return await authPromiseObj.promise;
        
    } catch (error) {
        authPromise = null;
        throw error;
    }
}

/**
 * Check if token is valid
 */
async function isTokenValid(token) {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token);
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Check if user is already authenticated (browser storage)
 */
async function checkExistingToken() {
    try {
        const token = google.accounts.oauth2.getToken(GOOGLE_CLIENT_ID);
        if (token && token.access_token) {
            return token.access_token;
        }
    } catch (error) {
        console.log('No existing token found');
    }
    return null;
}

// ============================================
// GOOGLE DRIVE UPLOAD FUNCTIONS
// ============================================

/**
 * Upload file to Google Drive
 */
async function uploadToDrive(fileData, fileName, mimeType = 'application/pdf') {
    try {
        console.log('Starting Google Drive upload for:', fileName);
        
        // Load Google APIs if not already loaded
        await loadGoogleAPIs();
        
        // Get access token (single sign-in)
        const accessToken = await getAccessToken();
        
        updateDriveStatusIfAvailable('Preparing file for upload...', false);
        
        // Create form data
        const form = new FormData();
        
        // Prepare metadata
        const metadata = {
            name: fileName,
            mimeType: mimeType,
            description: 'RTU Test Report generated on ' + new Date().toLocaleDateString(),
            createdTime: new Date().toISOString()
        };
        
        // Add folder if specified
        if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID.trim() !== '') {
            metadata.parents = [DRIVE_FOLDER_ID];
        }
        
        form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form.append('file', new Blob([fileData], {type: mimeType}));
        
        updateDriveStatusIfAvailable('Uploading to Google Drive...', false);
        
        // Upload to Drive
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            },
            body: form
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Drive upload failed:', errorText);
            
            // Try to parse error message
            let errorMessage = 'Upload failed: ' + response.statusText;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error && errorJson.error.message) {
                    errorMessage = errorJson.error.message;
                }
            } catch (e) {
                // Use default error message
            }
            
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log('Upload successful, file ID:', result.id);
        
        return result;
        
    } catch (error) {
        console.error('Google Drive upload error:', error);
        
        // Provide more user-friendly error messages
        let userMessage = error.message;
        if (error.message.includes('Failed to fetch')) {
            userMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('invalid_client')) {
            userMessage = 'Invalid Google API configuration. Please check your Client ID and API Key.';
        } else if (error.message.includes('access_denied')) {
            userMessage = 'Access denied. Please make sure you have granted the necessary permissions.';
        }
        
        throw new Error(userMessage);
    }
}

/**
 * Create a shareable link for the uploaded file
 */
async function createShareableLink(fileId) {
    try {
        console.log('Creating shareable link for file:', fileId);
        
        // Use cached token - no need to re-authenticate
        const accessToken = await getAccessToken();
        
        // Make the file readable by anyone with the link
        const permission = {
            type: 'anyone',
            role: 'reader'
        };
        
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(permission)
        });
        
        if (!response.ok) {
            console.warn('Failed to create shareable link, but file was uploaded');
            return null;
        }
        
        // Get file details to return the webViewLink
        const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink,webContentLink`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        
        if (fileResponse.ok) {
            const fileDetails = await fileResponse.json();
            console.log('Shareable link created:', fileDetails.webViewLink);
            return fileDetails.webViewLink;
        }
        
        return null;
        
    } catch (error) {
        console.error('Error creating shareable link:', error);
        return null;
    }
}

/**
 * Batch upload multiple files with single authentication
 */
async function batchUploadToDrive(files) {
    try {
        console.log('Starting batch upload of', files.length, 'files');
        
        // Get access token once for all uploads
        const accessToken = await getAccessToken();
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            updateDriveStatusIfAvailable(`Uploading file ${i + 1} of ${files.length}: ${file.name}`, false);
            
            try {
                const result = await uploadFileWithToken(file.data, file.name, file.mimeType, accessToken);
                results.push(result);
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                results.push({ success: false, fileName: file.name, error: error.message });
            }
        }
        
        return results;
    } catch (error) {
        throw error;
    }
}

/**
 * Upload file using existing token (for batch operations)
 */
async function uploadFileWithToken(fileData, fileName, mimeType, accessToken) {
    // Create form data
    const form = new FormData();
    
    // Prepare metadata
    const metadata = {
        name: fileName,
        mimeType: mimeType,
        description: 'RTU Test Report generated on ' + new Date().toLocaleDateString(),
        createdTime: new Date().toISOString()
    };
    
    // Add folder if specified
    if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID.trim() !== '') {
        metadata.parents = [DRIVE_FOLDER_ID];
    }
    
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', new Blob([fileData], {type: mimeType}));
    
    // Upload to Drive
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
        body: form
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Upload failed: ' + response.statusText);
    }
    
    return await response.json();
}

/**
 * Clear cached authentication
 */
function clearAuthCache() {
    cachedAccessToken = null;
    authPromise = null;
    console.log('Authentication cache cleared');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Update drive status message if available
 */
function updateDriveStatusIfAvailable(message, isError = false, isSuccess = false) {
    if (typeof updateDriveStatus === 'function') {
        updateDriveStatus(message, isError, isSuccess);
    } else {
        console.log('Drive Status:', message);
    }
}

/**
 * Validate Google API configuration
 */
function validateGoogleConfig() {
    const errors = [];
    
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY.length < 20) {
        errors.push('Invalid Google API Key. Please update googleDrive.js with your API Key.');
    }
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
        errors.push('Invalid Google Client ID. Please update googleDrive.js with your Client ID.');
    }
    
    if (errors.length > 0) {
        console.error('Google Drive configuration errors:', errors);
        return {
            valid: false,
            errors: errors
        };
    }
    
    return {
        valid: true,
        errors: []
    };
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Google Drive module loaded');
    
    // Validate configuration
    const configCheck = validateGoogleConfig();
    if (!configCheck.valid) {
        console.warn('Google Drive configuration issues detected:', configCheck.errors);
        updateDriveStatusIfAvailable('⚠️ Google Drive configuration incomplete. Please update googleDrive.js with your credentials.', true);
    } else {
        console.log('Google Drive configuration valid');
        
        // Pre-load Google APIs in background
        setTimeout(() => {
            loadGoogleAPIs().catch(error => {
                console.log('Background Google API loading failed (will load on demand):', error.message);
            });
        }, 1000);
    }
});

// ============================================
// EXPORT FUNCTIONS
// ============================================
window.uploadToDrive = uploadToDrive;
window.createShareableLink = createShareableLink;
window.testDriveConnection = testDriveConnection;
window.validateGoogleConfig = validateGoogleConfig;
window.loadGoogleAPIs = loadGoogleAPIs;
window.batchUploadToDrive = batchUploadToDrive; // New function for batch uploads
window.clearAuthCache = clearAuthCache; // Optional: to clear auth if needed