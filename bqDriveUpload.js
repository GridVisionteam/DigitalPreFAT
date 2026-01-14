// bqDriveUpload.js - Integrated version with Save & Continue
const JSON_FOLDER_ID = '1ciLbAkJkOjaWP0yvWzbpguKI73jICASj';  // JSON files folder
const TXT_PNG_FOLDER_ID = '1qg4cyMgdK1gpvHY-07BOZzb0YlzWDTDd';  // TXT and PNG files folder
const PDF_FOLDER_ID = '1yl-IuYckdZouFvNFep25rG8lJJ-Fd8yu';  // PDF files folder
let isDriveInitialized = false;
let driveStatusElement = null;

// Initialize Google Drive upload functionality
async function initDriveUpload() {
    console.log('Initializing Drive Upload...');
    
    // Check if our upload functions are available
    if (typeof uploadToDrive !== 'undefined') {
        isDriveInitialized = true;
        console.log('Google Drive functions already available');
        return true;
    }
    
    console.warn('Google Drive functions not loaded yet');
    return false;
}

// Main function to upload BQ files to Google Drive
async function uploadBQFiles() {
    try {
        const contractNo = localStorage.getItem('session_contractNo') || 'ContractNo';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'SerialNo';
        const now = new Date();
        const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        
        showDriveStatus('Starting Google Drive upload...', 'info');
        
        const filesToUpload = [];
        
        // 1. Generate JSON file
        const jsonData = await generateBQJsonData(contractNo, rtuSerial);
        if (jsonData) {
            const jsonFileName = `${dateformat}_BQ_BACKUP_${contractNo}_${rtuSerial}.json`;
            filesToUpload.push({
                name: jsonFileName,
                data: jsonData,
                mimeType: 'application/json',
                folderId: JSON_FOLDER_ID
            });
        }
        
        // 2. Generate TXT file
        if (typeof generateTXTContent === 'function') {
            try {
                const txtContent = generateTXTContent();
                if (txtContent) {
                    const txtFileName = `${dateformat}_QR_TXT_${contractNo}_${rtuSerial}.txt`;
                    filesToUpload.push({
                        name: txtFileName,
                        data: txtContent,
                        mimeType: 'text/plain',
                        folderId: TXT_PNG_FOLDER_ID
                    });
                }
            } catch (error) {
                console.error('Error generating TXT content:', error);
            }
        }
        
        // 3. Generate QR Code PNG
        if (typeof generateAndDownloadQRCode === 'function' && typeof generateTXTContent === 'function') {
            try {
                const txtContent = generateTXTContent();
                const qrDataUrl = await generateQRCodeDataURL(txtContent);
                if (qrDataUrl) {
                    const qrBlob = dataURLtoBlob(qrDataUrl);
                    const qrFileName = `${dateformat}_QR_CODE_${contractNo}_${rtuSerial}.png`;
                    filesToUpload.push({
                        name: qrFileName,
                        data: qrBlob,
                        mimeType: 'image/png',
                        folderId: TXT_PNG_FOLDER_ID
                    });
                }
            } catch (error) {
                console.error('Error generating QR code:', error);
            }
        }
        
        // 4. Generate PDF
        if (typeof generateAndDownloadPDF === 'function') {
            try {
                showDriveStatus('Generating PDF for upload...', 'info');
                
                // Generate PDF and get blob
                const pdfResult = await generateAndDownloadPDF(contractNo, rtuSerial, true);
                
                if (pdfResult && pdfResult.blob) {
                    const pdfFileName = `${dateformat}_RTU_SERIAL_NUMBER_LIST_${contractNo}_${rtuSerial}.pdf`;
                    filesToUpload.push({
                        name: pdfFileName,
                        data: pdfResult.blob,
                        mimeType: 'application/pdf',
                        folderId: PDF_FOLDER_ID
                    });
                    console.log('PDF prepared for upload:', pdfFileName);
                } else {
                    console.error('PDF generation returned null or no blob');
                }
            } catch (error) {
                console.error('Error generating PDF for upload:', error);
                showDriveStatus('Error generating PDF: ' + error.message, 'warning');
            }
        }
        
        console.log(`Prepared ${filesToUpload.length} files for upload:`, filesToUpload.map(f => `${f.name} -> ${f.folderId}`));
        
        if (filesToUpload.length === 0) {
            showDriveStatus('No files to upload', 'info');
            return { success: false, message: 'No files generated for upload' };
        }
        
        // Upload files
        const uploadResults = [];
        for (const file of filesToUpload) {
            try {
                showDriveStatus(`Uploading ${file.name}...`, 'info');
                
                // Check if file exists first
                let existingFile = null;
                if (typeof checkFileExists === 'function') {
                    existingFile = await checkFileExists(file.name, file.folderId);
                    if (existingFile) {
                        console.log(`File ${file.name} exists, will replace it`);
                    }
                }
                
                // Upload or replace file
                let result;
                if (typeof uploadOrReplaceFile === 'function') {
                    result = await uploadOrReplaceFile(file.data, file.name, file.mimeType, file.folderId);
                } else if (typeof uploadToDriveFolder === 'function') {
                    result = await uploadFileToDriveWithFolder(file.name, file.data, file.mimeType, file.folderId);
                } else {
                    result = await uploadFileToDrive(file.name, file.data, file.mimeType);
                }
                
                uploadResults.push({
                    success: true,
                    fileName: file.name,
                    folderId: file.folderId,
                    fileId: result.id,
                    action: existingFile ? 'replaced' : 'uploaded'
                });
                
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                uploadResults.push({
                    success: false,
                    fileName: file.name,
                    folderId: file.folderId,
                    error: error.message
                });
            }
        }
        
        const successful = uploadResults.filter(r => r.success);
        const failed = uploadResults.filter(r => !r.success);
        
        let statusMessage;
        if (failed.length > 0) {
            if (successful.length === 0) {
                statusMessage = 'All uploads failed';
                showDriveStatus(statusMessage, 'error');
                return { success: false, message: statusMessage, results: uploadResults };
            } else {
                const replacedCount = uploadResults.filter(r => r.action === 'replaced').length;
                const uploadedCount = uploadResults.filter(r => r.action === 'uploaded').length;
                
                statusMessage = `${successful.length}/${filesToUpload.length} files processed. `;
                if (replacedCount > 0) statusMessage += `${replacedCount} replaced, `;
                if (uploadedCount > 0) statusMessage += `${uploadedCount} uploaded. `;
                statusMessage += `${failed.length} failed.`;
                
                showDriveStatus(statusMessage, 'warning');
                return { success: true, partial: true, message: statusMessage, results: uploadResults };
            }
        } else {
            const replacedCount = uploadResults.filter(r => r.action === 'replaced').length;
            const uploadedCount = uploadResults.filter(r => r.action === 'uploaded').length;
            
            statusMessage = `Successfully processed ${successful.length} files! `;
            if (replacedCount > 0) statusMessage += `${replacedCount} replaced, `;
            if (uploadedCount > 0) statusMessage += `${uploadedCount} uploaded.`;
            
            showDriveStatus(statusMessage, 'success');
            return { success: true, message: statusMessage, results: uploadResults };
        }
        
    } catch (error) {
        console.error('Failed to upload BQ files:', error);
        showDriveStatus(`Upload failed: ${error.message}`, 'error');
        return { success: false, message: error.message };
    }
}

// Generate JSON data for upload
async function generateBQJsonData(contractNo, rtuSerial) {
    try {
        const exportData = {};
        
        // Copy all localStorage items
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                exportData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                exportData[key] = localStorage.getItem(key);
            }
        }
        
        // Add metadata
        exportData.metadata = {
            generationDate: new Date().toISOString(),
            rtuSerial: rtuSerial,
            contractNo: contractNo,
            testerName: localStorage.getItem('session_name') || 'N/A',
            uploadType: 'BQ_Configuration'
        };
        
        return JSON.stringify(exportData, null, 2);
        
    } catch (error) {
        console.error('Error generating JSON data:', error);
        return null;
    }
}

// Generate QR Code data URL
async function generateQRCodeDataURL(txtContent) {
    return new Promise((resolve) => {
        try {
            if (typeof qrcode === 'undefined') {
                console.error('qrcode library not loaded');
                resolve(null);
                return;
            }
            
            const typeNumber = 0;
            const errorCorrectionLevel = 'L';
            const qr = qrcode(typeNumber, errorCorrectionLevel);
            qr.addData(txtContent);
            qr.make();
            
            // Create canvas
            const canvas = document.createElement('canvas');
            const size = 400;
            const cellSize = size / qr.getModuleCount();
            const margin = 2;
            const totalSize = size + margin * 2 * cellSize;
            
            canvas.width = totalSize;
            canvas.height = totalSize;
            const ctx = canvas.getContext('2d');
            
            // Fill background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, totalSize, totalSize);
            
            // Draw QR code
            ctx.fillStyle = '#000000';
            for (let row = 0; row < qr.getModuleCount(); row++) {
                for (let col = 0; col < qr.getModuleCount(); col++) {
                    if (qr.isDark(row, col)) {
                        ctx.fillRect(
                            margin * cellSize + col * cellSize,
                            margin * cellSize + row * cellSize,
                            cellSize,
                            cellSize
                        );
                    }
                }
            }
            
            // Convert to data URL
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            resolve(null);
        }
    });
}

// Convert data URL to blob
function dataURLtoBlob(dataurl) {
    try {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    } catch (error) {
        console.error('Error converting data URL to blob:', error);
        return null;
    }
}

// Simple file upload function
async function uploadFileToDrive(fileName, fileData, mimeType) {
    try {
        if (!isDriveInitialized) {
            const initialized = await initDriveUpload();
            if (!initialized) {
                throw new Error('Google Drive not initialized');
            }
        }
        
        if (typeof uploadToDrive !== 'function') {
            throw new Error('uploadToDrive function not available');
        }
        
        console.log(`Uploading "${fileName}" to Google Drive...`);
        showDriveStatus(`Uploading ${fileName}...`, 'info');
        
        const result = await uploadToDrive(fileData, fileName, mimeType);
        
        console.log('Upload successful:', result);
        showDriveStatus(`${fileName} uploaded successfully!`, 'success');
        
        return result;
        
    } catch (error) {
        console.error(`Failed to upload "${fileName}":`, error);
        showDriveStatus(`Failed to upload ${fileName}: ${error.message}`, 'error');
        throw error;
    }
}

// Upload to specific folder
async function uploadFileToDriveWithFolder(fileName, fileData, mimeType, folderId) {
    try {
        if (!isDriveInitialized) {
            const initialized = await initDriveUpload();
            if (!initialized) {
                throw new Error('Google Drive not initialized');
            }
        }
        
        // Use uploadOrReplaceFile if available, otherwise fallback
        if (typeof uploadOrReplaceFile === 'function') {
            console.log(`Uploading/Replacing "${fileName}" to folder ${folderId}...`);
            
            const result = await uploadOrReplaceFile(fileData, fileName, mimeType, folderId);
            
            if (result && result.id) {
                console.log('Upload/Replace successful:', result);
                return result;
            } else {
                throw new Error('Upload failed - no file ID returned');
            }
        } else if (typeof uploadToDriveFolder === 'function') {
            // Fallback to original function
            console.log(`Uploading "${fileName}" (no replace check)...`);
            
            const result = await uploadToDriveFolder(fileData, fileName, mimeType, folderId);
            
            console.log('Upload successful:', result);
            return result;
        } else {
            throw new Error('No upload function available');
        }
        
    } catch (error) {
        console.error(`Failed to upload "${fileName}":`, error);
        throw error;
    }
}

// Show drive status
function showDriveStatus(message, type = 'info') {
    console.log(`Drive Status [${type}]: ${message}`);
    
    // Create or update status element
    if (!driveStatusElement || !document.body.contains(driveStatusElement)) {
        driveStatusElement = document.createElement('div');
        driveStatusElement.id = 'driveUploadStatus';
        document.body.appendChild(driveStatusElement);
    }
    
    // Set styles based on type
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: '10000',
        maxWidth: '300px',
        fontSize: '14px',
        transition: 'all 0.3s ease',
        backgroundColor: type === 'error' ? '#f8d7da' : 
                        type === 'success' ? '#d4edda' : 
                        type === 'warning' ? '#fff3cd' : '#d1ecf1',
        color: type === 'error' ? '#721c24' : 
               type === 'success' ? '#155724' : 
               type === 'warning' ? '#856404' : '#0c5460',
        border: type === 'error' ? '1px solid #f5c6cb' : 
                type === 'success' ? '1px solid #c3e6cb' : 
                type === 'warning' ? '1px solid #ffeaa7' : '1px solid #bee5eb'
    };
    
    Object.assign(driveStatusElement.style, styles);
    driveStatusElement.textContent = message;
    
    // Auto-remove after delay
    const delay = type === 'error' ? 8000 : type === 'success' ? 5000 : 4000;
    clearTimeout(driveStatusElement.hideTimeout);
    driveStatusElement.hideTimeout = setTimeout(() => {
        if (driveStatusElement && driveStatusElement.parentNode) {
            driveStatusElement.style.opacity = '0';
            driveStatusElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (driveStatusElement && driveStatusElement.parentNode) {
                    driveStatusElement.parentNode.removeChild(driveStatusElement);
                    driveStatusElement = null;
                }
            }, 300);
        }
    }, delay);
}

// Integrated goToNext function with Drive upload
async function goToNextWithDriveUpload() {
    // Prevent multiple executions
    if (window.isGoToNextRunning) {
        console.log('goToNextWithDriveUpload is already running');
        return;
    }
    
    window.isGoToNextRunning = true;
    
    try {
        console.log('Starting integrated goToNext with Drive upload...');
        
        // 1. Run validation
        if (typeof validateAllModuleFields === 'function') {
            if (!validateAllModuleFields()) {
                window.isGoToNextRunning = false;
                return;
            }
        }
        
        // 2. Save current data
        if (typeof saveCurrentBQCounts === 'function') {
            saveCurrentBQCounts();
        }
        
        // 3. Generate data for upload
        showDriveStatus('Generating data for upload...', 'info');
        const exportData = await window.goToNext(true);
        
        if (!exportData) {
            throw new Error('Failed to generate export data');
        }
        
        console.log('Data generated for Drive upload. Starting upload...');
        showDriveStatus('Data generated. Uploading to Google Drive...', 'info');
        
        // 4. Upload to Google Drive using the returned data
        const uploadResult = await uploadBQFilesFromData(exportData);
        
        if (uploadResult.success) {
            showDriveStatus(uploadResult.message, uploadResult.partial ? 'warning' : 'success');
            console.log('Google Drive upload completed:', uploadResult.message);
        } else {
            showDriveStatus(uploadResult.message, 'error');
            console.error('Google Drive upload failed:', uploadResult.message);
        }
        
        // 5. Redirect to next page
        setTimeout(() => {
            console.log('Redirecting to Pre-requisite.html');
            window.isGoToNextRunning = false;
            window.location.href = './Pre-requisite.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error in integrated goToNext:', error);
        showDriveStatus(`Error: ${error.message}`, 'error');
        window.isGoToNextRunning = false;
        
        // Fallback: try original goToNext without upload
        setTimeout(() => {
            if (typeof window.goToNext === 'function') {
                window.goToNext(false); // Use false to trigger local download
            }
        }, 2000);
    }
}

// Add this new function to upload from data instead of regenerating:
async function uploadBQFilesFromData(exportData) {
    try {
        const contractNo = localStorage.getItem('session_contractNo') || 'ContractNo';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'SerialNo';
        const now = new Date();
        const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        
        showDriveStatus('Uploading files to Google Drive...', 'info');
        
        const filesToUpload = [];
        
        // 1. JSON file from exportData
        if (exportData.jsonData) {
            const jsonFileName = `${dateformat}_BQ_BACKUP_${contractNo}_${rtuSerial}.json`;
            filesToUpload.push({
                name: jsonFileName,
                data: exportData.jsonData,
                mimeType: 'application/json',
                folderId: JSON_FOLDER_ID
            });
        }
        
        // 2. TXT file from exportData
        if (exportData.txtContent) {
            const txtFileName = `${dateformat}_QR_TXT_${contractNo}_${rtuSerial}.txt`;
            filesToUpload.push({
                name: txtFileName,
                data: exportData.txtContent,
                mimeType: 'text/plain',
                folderId: TXT_PNG_FOLDER_ID
            });
        }
        
        // 3. PDF blob from exportData
        if (exportData.pdfBlob && exportData.pdfBlob.blob) {
            const pdfFileName = `${dateformat}_RTU_SERIAL_NUMBER_LIST_${contractNo}_${rtuSerial}.pdf`;
            filesToUpload.push({
                name: pdfFileName,
                data: exportData.pdfBlob.blob,
                mimeType: 'application/pdf',
                folderId: PDF_FOLDER_ID
            });
        }
        
        // 4. QR Code (generate separately)
        if (exportData.txtContent) {
            const qrDataUrl = await generateQRCodeDataURL(exportData.txtContent);
            if (qrDataUrl) {
                const qrBlob = dataURLtoBlob(qrDataUrl);
                const qrFileName = `${dateformat}_QR_CODE_${contractNo}_${rtuSerial}.png`;
                filesToUpload.push({
                    name: qrFileName,
                    data: qrBlob,
                    mimeType: 'image/png',
                    folderId: TXT_PNG_FOLDER_ID
                });
            }
        }
        
        console.log(`Prepared ${filesToUpload.length} files for upload`);
        
        if (filesToUpload.length === 0) {
            return { success: false, message: 'No files to upload' };
        }
        
        // Upload files (use your existing upload logic)
        const uploadResults = [];
        for (const file of filesToUpload) {
            try {
                showDriveStatus(`Uploading ${file.name}...`, 'info');
                
                // Check if file exists first
                let existingFile = null;
                if (typeof checkFileExists === 'function') {
                    existingFile = await checkFileExists(file.name, file.folderId);
                }
                
                // Upload or replace file
                let result;
                if (typeof uploadOrReplaceFile === 'function') {
                    result = await uploadOrReplaceFile(file.data, file.name, file.mimeType, file.folderId);
                } else {
                    result = await uploadFileToDriveWithFolder(file.name, file.data, file.mimeType, file.folderId);
                }
                
                uploadResults.push({
                    success: true,
                    fileName: file.name,
                    action: existingFile ? 'replaced' : 'uploaded'
                });
                
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                uploadResults.push({
                    success: false,
                    fileName: file.name,
                    error: error.message
                });
            }
        }
        
        const successful = uploadResults.filter(r => r.success);
        const failed = uploadResults.filter(r => !r.success);
        
        let statusMessage;
        if (failed.length > 0) {
            if (successful.length === 0) {
                statusMessage = 'All uploads failed';
                showDriveStatus(statusMessage, 'error');
                return { success: false, message: statusMessage, results: uploadResults };
            } else {
                const replacedCount = uploadResults.filter(r => r.action === 'replaced').length;
                const uploadedCount = uploadResults.filter(r => r.action === 'uploaded').length;
                
                statusMessage = `${successful.length}/${filesToUpload.length} files processed. `;
                if (replacedCount > 0) statusMessage += `${replacedCount} replaced, `;
                if (uploadedCount > 0) statusMessage += `${uploadedCount} uploaded. `;
                statusMessage += `${failed.length} failed.`;
                
                showDriveStatus(statusMessage, 'warning');
                return { success: true, partial: true, message: statusMessage, results: uploadResults };
            }
        } else {
            const replacedCount = uploadResults.filter(r => r.action === 'replaced').length;
            const uploadedCount = uploadResults.filter(r => r.action === 'uploaded').length;
            
            statusMessage = `Successfully processed ${successful.length} files! `;
            if (replacedCount > 0) statusMessage += `${replacedCount} replaced, `;
            if (uploadedCount > 0) statusMessage += `${uploadedCount} uploaded.`;
            
            showDriveStatus(statusMessage, 'success');
            return { success: true, message: statusMessage, results: uploadResults };
        }
        
    } catch (error) {
        console.error('Failed to upload BQ files:', error);
        showDriveStatus(`Upload failed: ${error.message}`, 'error');
        return { success: false, message: error.message };
    }
}

// Initialize and override the submit button
// Initialize and override the submit button
async function initAndOverrideSubmit() {
    console.log('Initializing Drive upload and overriding submit button...');
    
    try {
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn) {
            console.error('Submit button not found');
            return;
        }
        
        // Initialize Drive upload
        const initialized = await initDriveUpload();
        if (!initialized) {
            console.warn('Google Drive not initialized. Submit button will work normally without upload.');
            return;
        }
        
        // Store original click handler
        const originalOnClick = submitBtn.onclick;
        
        // Remove any existing event listeners first
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        
        // Add new event listener to the new button
        newSubmitBtn.addEventListener('click', async function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('Submit button clicked with Drive upload handler');
            
            // Disable button during processing
            const originalText = newSubmitBtn.textContent;
            newSubmitBtn.disabled = true;
            newSubmitBtn.textContent = 'Processing...';
            
            try {
                // Save current data first
                if (typeof saveCurrentBQCounts === 'function') {
                    saveCurrentBQCounts();
                }
                
                // Validate before proceeding
                if (typeof validateAllModuleFields === 'function') {
                    if (!validateAllModuleFields()) {
                        newSubmitBtn.disabled = false;
                        newSubmitBtn.textContent = originalText;
                        return;
                    }
                }
                
                // Show processing message
                showDriveStatus('Starting process...', 'info');
                
                // Use integrated function with Drive upload
                await goToNextWithDriveUpload();
                
            } catch (error) {
                console.error('Error in submit:', error);
                showDriveStatus(`Error: ${error.message}`, 'error');
                
                // Fallback to original behavior (without duplicating)
                try {
                    if (typeof window.goToNext === 'function') {
                        await window.goToNext();
                    }
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                }
            } finally {
                // Re-enable button after a delay
                setTimeout(() => {
                    newSubmitBtn.disabled = false;
                    newSubmitBtn.textContent = originalText;
                }, 3000);
            }
        });
        
        console.log('Submit button overridden with Drive upload functionality');
        
    } catch (error) {
        console.error('Failed to initialize Drive upload override:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('BQ Drive Upload module loaded');
    
    // Initialize and override submit button after a short delay
    setTimeout(async () => {
        await initAndOverrideSubmit();
    }, 1500);
});

// Export functions
window.uploadBQFiles = uploadBQFiles;
window.goToNextWithDriveUpload = goToNextWithDriveUpload;
window.initDriveUpload = initDriveUpload;
window.uploadFileToDriveWithFolder = uploadFileToDriveWithFolder;
window.initAndOverrideSubmit = initAndOverrideSubmit;