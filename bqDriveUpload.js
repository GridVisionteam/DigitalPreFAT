// bqDriveUpload.js - Integrated version with Save & Continue
let isDriveInitialized = false;
let driveStatusElement = null;

// Initialize Google Drive upload functionality
async function initDriveUpload() {
    console.log('Initializing Drive Upload...');
    
    if (typeof uploadToDrive !== 'undefined' && typeof uploadOrReplaceInContractFolder !== 'undefined') {
        isDriveInitialized = true;
        console.log('Google Drive functions available');
        return true;
    }
    
    console.warn('Google Drive functions not loaded yet');
    return false;
}

// Main function to upload BQ files to Google Drive with contract folders
async function uploadBQFiles() {
    try {
        console.log('=== STARTING UPLOAD PROCESS ===');
        
        const contractNo = localStorage.getItem('session_contractNo') || 'ContractNo';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'SerialNo';
        const now = new Date();
        const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        
        console.log('Contract:', contractNo, 'RTU Serial:', rtuSerial);
        
        showDriveStatus('Starting Google Drive upload...', 'info');
        
        // 1. Generate JSON file
        const jsonData = await generateBQJsonData(contractNo, rtuSerial);
        if (!jsonData) {
            throw new Error('Failed to generate JSON data');
        }
        
        // 2. Generate TXT file
        let txtContent = '';
        if (typeof generateTXTContent === 'function') {
            txtContent = generateTXTContent();
            if (!txtContent) {
                console.warn('Failed to generate TXT content');
            }
        }
        
        // 3. Generate PDF
        let pdfBlob = null;
        if (typeof generateAndDownloadPDF === 'function') {
            try {
                showDriveStatus('Generating PDF...', 'info');
                const pdfResult = await generateAndDownloadPDF(contractNo, rtuSerial, true);
                if (pdfResult && pdfResult.blob) {
                    pdfBlob = pdfResult.blob;
                }
            } catch (error) {
                console.error('Error generating PDF:', error);
            }
        }
        
        // Upload files one by one to ensure they all get uploaded
        const uploadResults = [];
        
        // UPLOAD JSON FILE
        if (jsonData) {
            try {
                const jsonFileName = `${dateformat}_BQ_BACKUP_${contractNo}_${rtuSerial}.json`;
                showDriveStatus(`Uploading ${jsonFileName}...`, 'info');
                console.log('Uploading JSON file:', jsonFileName);
                
                const jsonBlob = new Blob([jsonData], { type: 'application/json' });
                const result = await uploadOrReplaceInContractFolder(jsonBlob, jsonFileName, 'application/json');
                
                uploadResults.push({
                    success: true,
                    fileName: jsonFileName,
                    fileId: result.id,
                    action: 'uploaded'
                });
                console.log('JSON uploaded successfully');
            } catch (error) {
                console.error('Failed to upload JSON:', error);
                uploadResults.push({
                    success: false,
                    fileName: 'JSON file',
                    error: error.message
                });
            }
        }
        
        // UPLOAD TXT FILE
        if (txtContent) {
            try {
                const txtFileName = `${dateformat}_QR_TXT_${contractNo}_${rtuSerial}.txt`;
                showDriveStatus(`Uploading ${txtFileName}...`, 'info');
                console.log('Uploading TXT file:', txtFileName);
                
                const txtBlob = new Blob([txtContent], { type: 'text/plain' });
                const result = await uploadOrReplaceInContractFolder(txtBlob, txtFileName, 'text/plain');
                
                uploadResults.push({
                    success: true,
                    fileName: txtFileName,
                    fileId: result.id,
                    action: 'uploaded'
                });
                console.log('TXT uploaded successfully');
            } catch (error) {
                console.error('Failed to upload TXT:', error);
                uploadResults.push({
                    success: false,
                    fileName: 'TXT file',
                    error: error.message
                });
            }
        }
        
        // UPLOAD PDF FILE
        if (pdfBlob) {
            try {
                const pdfFileName = `${dateformat}_RTU_SERIAL_NUMBER_LIST_${contractNo}_${rtuSerial}.pdf`;
                showDriveStatus(`Uploading ${pdfFileName}...`, 'info');
                console.log('Uploading PDF file:', pdfFileName);
                
                const result = await uploadOrReplaceInContractFolder(pdfBlob, pdfFileName, 'application/pdf');
                
                uploadResults.push({
                    success: true,
                    fileName: pdfFileName,
                    fileId: result.id,
                    action: 'uploaded'
                });
                console.log('PDF uploaded successfully');
            } catch (error) {
                console.error('Failed to upload PDF:', error);
                uploadResults.push({
                    success: false,
                    fileName: 'PDF file',
                    error: error.message
                });
            }
        }
        
        // UPLOAD QR CODE PNG
        if (txtContent && typeof qrcode !== 'undefined') {
            try {
                const qrDataUrl = await generateQRCodeDataURL(txtContent);
                if (qrDataUrl) {
                    const qrBlob = dataURLtoBlob(qrDataUrl);
                    const qrFileName = `${dateformat}_QR_CODE_${contractNo}_${rtuSerial}.png`;
                    showDriveStatus(`Uploading ${qrFileName}...`, 'info');
                    console.log('Uploading QR Code:', qrFileName);
                    
                    const result = await uploadOrReplaceInContractFolder(qrBlob, qrFileName, 'image/png');
                    
                    uploadResults.push({
                        success: true,
                        fileName: qrFileName,
                        fileId: result.id,
                        action: 'uploaded'
                    });
                    console.log('QR Code uploaded successfully');
                }
            } catch (error) {
                console.error('Failed to upload QR Code:', error);
                uploadResults.push({
                    success: false,
                    fileName: 'QR Code',
                    error: error.message
                });
            }
        }
        
        console.log('Upload results:', uploadResults);
        
        const successful = uploadResults.filter(r => r.success);
        const failed = uploadResults.filter(r => !r.success);
        
        if (successful.length === 0) {
            throw new Error('All uploads failed');
        }
        
        let statusMessage = `${successful.length} file(s) uploaded successfully`;
        if (failed.length > 0) {
            statusMessage += `, ${failed.length} failed`;
        }
        
        return { 
            success: true, 
            partial: failed.length > 0,
            message: statusMessage, 
            results: uploadResults 
        };
        
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
            
            // Match the exact dimensions from BQ.js
            const qrSize = 400; // QR code size
            const cellSize = qrSize / qr.getModuleCount();
            const margin = 2;
            const qrTotalSize = qrSize + margin * 2 * cellSize;
            
            // Add space for label (40px for text) - same as BQ.js
            const labelHeight = 40;
            const totalHeight = qrTotalSize + labelHeight;
            
            // Create canvas with extra height for label
            const canvas = document.createElement('canvas');
            canvas.width = qrTotalSize;
            canvas.height = totalHeight;
            const ctx = canvas.getContext('2d');
            
            // Fill background (white)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
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
            
            // Add label below QR code - MATCHING BQ.js STYLE
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            // Create a filename for the label (similar to BQ.js)
            const contractNo = localStorage.getItem('session_contractNo') || 'ContractNo';
            const rtuSerial = localStorage.getItem('session_rtuSerial') || 'SerialNo';
            const now = new Date();
            const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
            const filename = `${dateformat}_QR_CODE_${contractNo}_${rtuSerial}.png`;
            
            // Draw the label text (filename without .png extension)
            const labelText = filename.replace('.png', '');
            ctx.fillText(labelText, canvas.width / 2, qrTotalSize + 10);
            
            // Optional: Add a light gray border around the QR code section
            ctx.strokeStyle = '#CCCCCC';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, qrTotalSize, qrTotalSize);
            
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

// Show drive status
function showDriveStatus(message, type = 'info') {
    console.log(`Drive Status [${type}]: ${message}`);
    
    if (!driveStatusElement || !document.body.contains(driveStatusElement)) {
        driveStatusElement = document.createElement('div');
        driveStatusElement.id = 'driveUploadStatus';
        document.body.appendChild(driveStatusElement);
    }
    
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

// SIMPLE, WORKING VERSION - Override the submit button
async function overrideSubmitButton() {
    console.log('=== OVERRIDING SUBMIT BUTTON ===');
    
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) {
        console.error('Submit button not found');
        return;
    }
    
    // Clone and replace button to remove old event listeners
    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    
    newSubmitBtn.addEventListener('click', async function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('=== SUBMIT BUTTON CLICKED ===');
        
        // Disable button
        const originalText = newSubmitBtn.textContent;
        newSubmitBtn.disabled = true;
        newSubmitBtn.textContent = 'Processing...';
        
        try {
            // 1. Validate
            if (typeof validateAllModuleFields === 'function') {
                if (!validateAllModuleFields()) {
                    newSubmitBtn.disabled = false;
                    newSubmitBtn.textContent = originalText;
                    return;
                }
            }
            
            // 2. Save data
            if (typeof saveCurrentBQCounts === 'function') {
                saveCurrentBQCounts();
            }
            
            // 3. Generate and save local files FIRST
            console.log('Generating local files...');
            showDriveStatus('Generating local backup files...', 'info');
            
            // Call original goToNext with returnOnly = true to get data but not redirect
            let exportData = null;
            if (typeof window.goToNext === 'function') {
                exportData = await window.goToNext(true);
            }
            
            // Generate local files immediately
            await generateLocalFiles();
            
            // 4. Now upload to Google Drive
            console.log('Starting Google Drive upload...');
            showDriveStatus('Uploading to Google Drive...', 'info');
            
            // Try Drive upload
            let uploadSuccess = false;
            let uploadMessage = '';
            
            try {
                // Initialize Drive
                await initDriveUpload();
                
                // Upload files
                const uploadResult = await uploadBQFiles();
                
                if (uploadResult.success) {
                    uploadSuccess = true;
                    uploadMessage = uploadResult.message;
                } else {
                    uploadMessage = 'Drive upload failed: ' + uploadResult.message;
                }
            } catch (uploadError) {
                console.error('Drive upload error:', uploadError);
                uploadMessage = 'Drive upload error: ' + uploadError.message;
            }
            
            // 5. Show final status
            if (uploadSuccess) {
                showDriveStatus(uploadMessage, 'success');
                showCustomAlert('✅ Files saved locally and uploaded to Google Drive!');
            } else {
                showDriveStatus(uploadMessage, 'warning');
                showCustomAlert('⚠️ Files saved locally but Drive upload had issues. Check console for details.');
            }
            
            // 6. Wait a moment then redirect
            setTimeout(() => {
                // Mark page as completed in navigation guard
                if (window.navigationGuard && typeof window.navigationGuard.markPageAsCompleted === 'function') {
                    window.navigationGuard.markPageAsCompleted();
                }
                console.log('Redirecting to Pre-requisite.html');
                window.location.href = './Pre-requisite.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error in submit process:', error);
            showDriveStatus(`Error: ${error.message}`, 'error');
            showCustomAlert('❌ Error during save process. Please try again.');
            
            // Re-enable button
            newSubmitBtn.disabled = false;
            newSubmitBtn.textContent = originalText;
        }
    });
    
    console.log('Submit button overridden successfully');
}

// Helper function to generate local files
async function generateLocalFiles() {
    try {
        console.log('Generating local files...');
        
        const contractNo = localStorage.getItem('session_contractNo') || 'ContractNo';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'SerialNo';
        const now = new Date();
        const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        
        // 1. Generate and download JSON
        /*const jsonData = await generateBQJsonData(contractNo, rtuSerial);
        if (jsonData) {
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(jsonData);
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', `${dateformat}_BQ_BACKUP_${contractNo}_${rtuSerial}.json`);
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);
        }*/
        
        // 2. Generate and download TXT
        /*if (typeof generateTXTContent === 'function') {
            const txtContent = generateTXTContent();
            if (txtContent) {
                const txtDataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txtContent);
                const txtLinkElement = document.createElement('a');
                txtLinkElement.setAttribute('href', txtDataUri);
                txtLinkElement.setAttribute('download', `${dateformat}_QR_TXT_${contractNo}_${rtuSerial}.txt`);
                document.body.appendChild(txtLinkElement);
                txtLinkElement.click();
                document.body.removeChild(txtLinkElement);
            }
        }*/
        
        // 3. Generate and download PDF
        if (typeof generateAndDownloadPDF === 'function') {
            setTimeout(async () => {
                await generateAndDownloadPDF(contractNo, rtuSerial, false);
            }, 500);
        }
        
        // 4. Generate QR Code
        if (typeof generateAndDownloadQRCode === 'function' && typeof generateTXTContent === 'function') {
            const txtContent = generateTXTContent();
            if (txtContent) {
                setTimeout(async () => {
                    await generateAndDownloadQRCode(txtContent, dateformat, contractNo, rtuSerial);
                }, 1000);
            }
        }
        
        console.log('Local files generated');
        return true;
        
    } catch (error) {
        console.error('Error generating local files:', error);
        throw error;
    }
}

// Simple alert function
function showCustomAlert(message) {
    const existingAlert = document.getElementById('customAlertBox');
    if (existingAlert) existingAlert.remove();
    
    const messageBox = document.createElement('div');
    messageBox.id = 'customAlertBox';
    messageBox.textContent = message;
    messageBox.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 1001;
        text-align: center;
    `;
    document.body.appendChild(messageBox);
    setTimeout(() => messageBox.remove(), 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== BQ DRIVE UPLOAD MODULE LOADED ===');
    
    // Override submit button after a short delay
    setTimeout(async () => {
        await overrideSubmitButton();
    }, 1000);
});

// Export functions
window.uploadBQFiles = uploadBQFiles;
window.initDriveUpload = initDriveUpload;
window.overrideSubmitButton = overrideSubmitButton;
window.showCustomAlert = showCustomAlert;