// googleDrive.js - Google Drive Integration

// ============================================
/*
// CONFIGURATION - UPDATE THESE VALUES  (amin99boyz@gmail.com)
// ============================================
const GOOGLE_API_KEY = 'AIzaSyA9I3SyapNGGv3y26Jk-bo37XQ4zUKo5qs';
const GOOGLE_CLIENT_ID = '656211138338-35iq6or29q9ea6583v80ofq746hinlha.apps.googleusercontent.com';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';
*/
//------------------------------------------------------------------------------------------------------------
// CONFIGURATION - UPDATE THESE VALUES  (testingdigitalform@gmail.com)
// ============================================
const GOOGLE_API_KEY = 'AIzaSyDmEfrpPBRaPvQO6LrDLw2SOuUGCW17DxY';
const GOOGLE_CLIENT_ID = '266459609799-r2daskhooeeboqgaq58pr8u8nsei3vdf.apps.googleusercontent.com';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';

//--------------------------------------------------------------------------------------------------------------


// FOLDER IDs FOR DIFFERENT FILE TYPES
const JSON_FOLDER_ID = '1c2tPDiI2gX29Uh40n_vRDeqe7A_AChUA';  // JSON files folder
const TXT_PNG_FOLDER_ID = '1iygtU_4YlLvM_Kx0XUQsGnbBsiZmCKTW';  // TXT and PNG files folder
const PDF_FOLDER_ID = '1enQcRQDoiNXMf4La1VANdybHFvzFzMHZ';  // PDF files folder
const GENERATED_PDF_FOLDER_ID = '1Wnl9fF4V7ZKDiAjDDkNwI3ILdP7i3TjX'; // PDF RTU Report

// ============================================
// GLOBAL VARIABLES
// ============================================
let gapiLoaded = false;
let gisLoaded = false;
let tokenClient = null;
let isAuthenticating = false;
let cachedAccessToken = null;
let authPromise = null;

// ============================================
// GOOGLE API INITIALIZATION
// ============================================

function loadGoogleAPIs() {
    return new Promise((resolve, reject) => {
        if (gapiLoaded && gisLoaded) {
            resolve();
            return;
        }

        console.log('Loading Google APIs...');

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
                        if (authPromise && authPromise.reject) {
                            authPromise.reject(new Error(response.error));
                        }
                    } else {
                        cachedAccessToken = response.access_token;
                        console.log('Authentication successful, token cached');
                        if (authPromise && authPromise.resolve) {
                            authPromise.resolve(cachedAccessToken);
                        }
                    }
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
// AUTHENTICATION FUNCTIONS
// ============================================

async function getAccessToken() {
    if (cachedAccessToken && await isTokenValid(cachedAccessToken)) {
        console.log('Using cached access token');
        return cachedAccessToken;
    }
    
    const existingToken = await checkExistingToken();
    if (existingToken && await isTokenValid(existingToken)) {
        cachedAccessToken = existingToken;
        console.log('Using existing token from browser storage');
        return cachedAccessToken;
    }
    
    if (authPromise) {
        console.log('Authentication already in progress, waiting...');
        return await authPromise.promise;
    }
    
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
        await loadGoogleAPIs();
        
        if (!tokenClient) {
            throw new Error('Google Identity Services not loaded');
        }
        
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
            tokenClient.callback = originalCallback;
            authPromise = null;
        };
        
        isAuthenticating = true;
        console.log('Requesting authentication...');
        updateDriveStatusIfAvailable('Please sign in to Google...', false);
        
        tokenClient.requestAccessToken();
        
        return await authPromiseObj.promise;
        
    } catch (error) {
        authPromise = null;
        throw error;
    }
}

async function isTokenValid(token) {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token);
        return response.ok;
    } catch (error) {
        return false;
    }
}

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
// FOLDER MANAGEMENT FUNCTIONS
// ============================================

async function findFolderByName(folderName, parentFolderId = null) {
    try {
        const accessToken = await getAccessToken();
        
        let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        
        if (parentFolderId) {
            query += ` and '${parentFolderId}' in parents`;
        }
        
        console.log('Searching for folder with query:', query);
        
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        if (!response.ok) {
            console.error('Failed to search for folder:', await response.text());
            return null;
        }
        
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            console.log(`Found existing folder: ${folderName}, ID: ${data.files[0].id}`);
            return data.files[0];
        }
        
        return null;
        
    } catch (error) {
        console.error('Error searching for folder:', error);
        return null;
    }
}

async function createFolder(folderName, parentFolderId = null) {
    try {
        const accessToken = await getAccessToken();
        
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            description: `RTU Test Reports for Contract ${folderName}`,
            createdTime: new Date().toISOString()
        };
        
        if (parentFolderId) {
            folderMetadata.parents = [parentFolderId];
        }
        
        console.log('Creating folder:', folderName, 'in parent:', parentFolderId);
        
        const response = await fetch(
            'https://www.googleapis.com/drive/v3/files',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(folderMetadata)
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create folder:', errorText);
            throw new Error('Failed to create folder');
        }
        
        const folderData = await response.json();
        console.log(`Folder created: ${folderName}, ID: ${folderData.id}`);
        
        return folderData;
        
    } catch (error) {
        console.error('Error creating folder:', error);
        throw error;
    }
}

async function getContractFolderInParent(contractNo, parentFolderId) {
    try {
        if (!contractNo || contractNo.trim() === '') {
            console.log('No contract number provided, using parent folder directly');
            return parentFolderId;
        }
        
        const cleanContractNo = contractNo.replace(/[^a-zA-Z0-9_-]/g, '_').trim();
        
        if (!cleanContractNo) {
            return parentFolderId;
        }
        
        console.log('Looking for contract folder:', cleanContractNo, 'in parent:', parentFolderId);
        
        const existingFolder = await findFolderByName(cleanContractNo, parentFolderId);
        
        if (existingFolder) {
            console.log(`Using existing folder for contract ${cleanContractNo} in parent ${parentFolderId}`);
            return existingFolder.id;
        }
        
        console.log(`Creating new folder for contract ${cleanContractNo} inside parent ${parentFolderId}`);
        const newFolder = await createFolder(cleanContractNo, parentFolderId);
        
        return newFolder.id;
        
    } catch (error) {
        console.error('Error getting contract folder in parent:', error);
        return parentFolderId;
    }
}

// ============================================
// UPLOAD FUNCTIONS WITH CONTRACT FOLDERS
// ============================================

async function uploadToDriveFolder(fileData, fileName, mimeType = 'application/pdf', folderId = null) {
    try {
        console.log('Starting Google Drive upload for:', fileName, 'to folder:', folderId);
        
        await loadGoogleAPIs();
        
        const accessToken = await getAccessToken();
        
        updateDriveStatusIfAvailable('Preparing file for upload...', false);
        
        const form = new FormData();
        
        const metadata = {
            name: fileName,
            mimeType: mimeType,
            description: 'RTU Test Report generated on ' + new Date().toLocaleDateString(),
            createdTime: new Date().toISOString()
        };
        
        if (folderId && folderId.trim() !== '') {
            metadata.parents = [folderId];
        }
        
        form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form.append('file', new Blob([fileData], {type: mimeType}));
        
        updateDriveStatusIfAvailable('Uploading to Google Drive...', false);
        
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
            
            let errorMessage = 'Upload failed: ' + response.statusText;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error && errorJson.error.message) {
                    errorMessage = errorJson.error.message;
                }
            } catch (e) {}
            
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log('Upload successful, file ID:', result.id);
        
        return result;
        
    } catch (error) {
        console.error('Google Drive upload error:', error);
        
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

async function uploadToContractFolderBasedOnType(fileData, fileName, mimeType) {
    try {
        const contractNo = localStorage.getItem('session_contractNo') || '';
        const cleanContractNo = contractNo.replace(/"/g, '').trim();
        
        if (!cleanContractNo) {
            console.log('No contract number found in session');
            return null;
        }
        
        console.log('Uploading for contract:', cleanContractNo, 'File:', fileName);
        
        let targetFolderId;
        
        // Determine which folder to use based on file type
        if (fileName.endsWith('.json')) {
            // JSON files go to JSON_FOLDER_ID -> contract folder
            const contractFolderId = await getContractFolderInParent(cleanContractNo, JSON_FOLDER_ID);
            targetFolderId = contractFolderId;
        } else if (fileName.endsWith('.txt') || fileName.endsWith('.png')) {
            // TXT and PNG files go to TXT_PNG_FOLDER_ID -> contract folder
            const contractFolderId = await getContractFolderInParent(cleanContractNo, TXT_PNG_FOLDER_ID);
            targetFolderId = contractFolderId;
        } else if (fileName.endsWith('.pdf')) {
            // PDF files go to PDF_FOLDER_ID -> contract folder
            const contractFolderId = await getContractFolderInParent(cleanContractNo, PDF_FOLDER_ID);
            targetFolderId = contractFolderId;
        } else {
            // Default to JSON folder if file type unknown
            const contractFolderId = await getContractFolderInParent(cleanContractNo, JSON_FOLDER_ID);
            targetFolderId = contractFolderId;
        }
        
        if (!targetFolderId) {
            throw new Error('Could not determine target folder');
        }
        
        console.log(`Uploading ${fileName} to contract folder in appropriate main folder`);
        return await uploadToDriveFolder(fileData, fileName, mimeType, targetFolderId);
        
    } catch (error) {
        console.error('Error uploading to contract folder:', error);
        throw error;
    }
}

async function checkFileExists(fileName, folderId = null) {
    try {
        const accessToken = await getAccessToken();
        
        let query = `name='${fileName}' and trashed=false`;
        
        if (folderId) {
            query += ` and '${folderId}' in parents`;
        }
        
        console.log('Searching for existing file with query:', query);
        
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,createdTime)`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        if (!response.ok) {
            console.error('Failed to search for existing file:', await response.text());
            return null;
        }
        
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            console.log(`Found existing file: ${fileName}, ID: ${data.files[0].id}`);
            return data.files[0];
        }
        
        return null;
        
    } catch (error) {
        console.error('Error checking for existing file:', error);
        return null;
    }
}

async function deleteFile(fileId) {
    try {
        const accessToken = await getAccessToken();
        
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        if (!response.ok && response.status !== 204) {
            console.error('Failed to delete file:', await response.text());
            return false;
        }
        
        console.log(`Successfully deleted file ID: ${fileId}`);
        return true;
        
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}

async function uploadOrReplaceFile(fileData, fileName, mimeType = 'application/pdf', folderId = null) {
    try {
        console.log('Starting upload or replace for:', fileName);
        
        // Check if file already exists in the target folder
        const existingFile = await checkFileExists(fileName, folderId);
        
        if (existingFile) {
            console.log(`File "${fileName}" already exists, will replace it.`);
            updateDriveStatusIfAvailable(`Replacing existing file: ${fileName}`, false);
            
            const deleted = await deleteFile(existingFile.id);
            if (!deleted) {
                console.warn('Could not delete existing file, will try to upload new version anyway');
            }
        }
        
        // Upload the new file
        return await uploadToDriveFolder(fileData, fileName, mimeType, folderId);
        
    } catch (error) {
        console.error('Error in uploadOrReplaceFile:', error);
        throw error;
    }
}

async function uploadOrReplaceInContractFolder(fileData, fileName, mimeType = 'application/pdf') {
    try {
        const contractNo = localStorage.getItem('session_contractNo') || '';
        const cleanContractNo = contractNo.replace(/"/g, '').trim();
        
        if (!cleanContractNo) {
            throw new Error('No contract number found');
        }
        
        console.log('Upload/Replace for contract:', cleanContractNo, 'File:', fileName);
        
        // Determine target folder based on file type
        let mainFolderId;
        if (fileName.endsWith('.json')) {
            mainFolderId = JSON_FOLDER_ID;
        } else if (fileName.endsWith('.txt') || fileName.endsWith('.png')) {
            mainFolderId = TXT_PNG_FOLDER_ID;
        } else if (fileName.endsWith('.pdf')) {
            mainFolderId = PDF_FOLDER_ID;
        } else {
            mainFolderId = JSON_FOLDER_ID; // Default
        }
        
        // Get or create contract folder inside the main folder
        const contractFolderId = await getContractFolderInParent(cleanContractNo, mainFolderId);
        
        if (!contractFolderId) {
            throw new Error('Could not determine target folder');
        }
        
        // Check if file exists in the contract folder
        const existingFile = await checkFileExists(fileName, contractFolderId);
        
        if (existingFile) {
            console.log(`File "${fileName}" already exists in contract folder, replacing it.`);
            updateDriveStatusIfAvailable(`Replacing existing file: ${fileName}`, false);
            
            const deleted = await deleteFile(existingFile.id);
            if (!deleted) {
                console.warn('Could not delete existing file, will try to upload new version anyway');
            }
        }
        
        // Upload the file to the contract folder
        return await uploadToDriveFolder(fileData, fileName, mimeType, contractFolderId);
        
    } catch (error) {
        console.error('Error in uploadOrReplaceInContractFolder:', error);
        throw error;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function updateDriveStatusIfAvailable(message, isError = false, isSuccess = false) {
    if (typeof updateDriveStatus === 'function') {
        updateDriveStatus(message, isError, isSuccess);
    } else {
        console.log('Drive Status:', message);
    }
}

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

document.addEventListener('DOMContentLoaded', function() {
    console.log('Google Drive module loaded');
    
    const configCheck = validateGoogleConfig();
    if (!configCheck.valid) {
        console.warn('Google Drive configuration issues detected:', configCheck.errors);
        updateDriveStatusIfAvailable('⚠️ Google Drive configuration incomplete. Please update googleDrive.js with your credentials.', true);
    } else {
        console.log('Google Drive configuration valid');
        
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
window.validateGoogleConfig = validateGoogleConfig;
window.loadGoogleAPIs = loadGoogleAPIs;
window.batchUploadToDrive = batchUploadToDrive;
window.clearAuthCache = clearAuthCache;
window.checkFileExists = checkFileExists;
window.deleteFile = deleteFile;
window.uploadOrReplaceFile = uploadOrReplaceFile;
window.getContractFolderInParent = getContractFolderInParent;
window.uploadToDriveFolder = uploadToDriveFolder;
window.uploadToContractFolderBasedOnType = uploadToContractFolderBasedOnType;
window.uploadOrReplaceInContractFolder = uploadOrReplaceInContractFolder;