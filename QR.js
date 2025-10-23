// --- QR SCANNER LOGIC (add this to your script) ---

let html5QrCodeInstance; // To hold the Html5Qrcode instance
const qrReaderModalElement = document.getElementById('qr-reader-modal');
const qrScannerModalElement = document.getElementById('qrScannerModal');
const cancelScanModalButton = document.getElementById('cancelScanButtonModal');
let currentScanTargetInputElement = null; // To store which input field to populate

// Initialize the Html5Qrcode instance once
if (qrReaderModalElement) {
    html5QrCodeInstance = new Html5Qrcode(qrReaderModalElement.id);
} else {
    console.error("Error: QR Reader element with ID 'qr-reader-modal' not found in HTML.");
}

function qrScanSuccess(decodedText, decodedResult) {
    console.log(`Scan Success! Decoded text: ${decodedText}`, decodedResult);
    if (currentScanTargetInputElement) {
        currentScanTargetInputElement.value = decodedText; // Populate the targeted input field
    }
    stopQrScan(); // Stop scanning and hide modal
    // You can add a small success alert here if you like
    // showCustomAlert(`Scanned: ${decodedText}`); // Using your existing alert function
}

function qrScanFailure(error) {
    // This function is called frequently, so keep logging minimal or conditional
    // console.log(`QR Scan Failure: ${error}`);
}

function startQrScan() {

    console.log("DEBUG: startQrScan CALLED");
    if (!html5QrCodeInstance) {
        showCustomAlert("QR Scanner not initialized. Check for HTML element 'qr-reader-modal'.");
        return;
    }
    if (!currentScanTargetInputElement) {
        showCustomAlert("No target field specified for QR scan."); // Should not happen if called correctly
        return;
    }

    const scannerConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 } // This is relative to the 'qr-reader-modal' div
    };

    // Configuration to prefer the back camera
    const cameraConfig = { facingMode: "environment" };

    html5QrCodeInstance.start(
        cameraConfig,
        scannerConfig,
        qrScanSuccess,
        qrScanFailure
    ).catch(err => {
        console.warn("Could not start QR scanner with back camera:", err);
        // Fallback: Try starting with any available camera
        Html5Qrcode.getCameras().then(cameras => { // Html5Qrcode.getCameras is a static method
            if (cameras && cameras.length) {
                html5QrCodeInstance.start(
                    cameras[0].id, // Use the first available camera
                    scannerConfig,
                    qrScanSuccess,
                    qrScanFailure
                ).catch(fallbackErr => {
                    console.error("Error starting QR scanner with fallback camera:", fallbackErr);
                    showCustomAlert("Error starting QR scanner. " + fallbackErr);
                    stopQrScan(); // Hide modal if it fails completely
                });
            } else {
                showCustomAlert("No cameras found on this device.");
                stopQrScan(); // Hide modal
            }
        }).catch(camErr => {
            console.error("Error getting camera list for fallback:", camErr);
            showCustomAlert("Error accessing cameras: " + camErr);
            stopQrScan(); // Hide modal
        });
    });
}

function stopQrScan() {
    if (html5QrCodeInstance && html5QrCodeInstance.isScanning) {
        html5QrCodeInstance.stop().then(() => {
            console.log("QR Code scanning stopped.");
        }).catch(err => {
            console.error("Error stopping QR Code scanner:", err);
        });
    }
    if (qrScannerModalElement) {
        qrScannerModalElement.style.display = 'none'; // Hide the modal
    }
    currentScanTargetInputElement = null; // Reset the target input
}

function initiateScanForField(targetInput) {
    console.log("DEBUG: initiateScanForField CALLED. Target exists:", !!targetInput);
    if (!html5QrCodeInstance) { // Double check initialization
        if (qrReaderModalElement) {
            html5QrCodeInstance = new Html5Qrcode(qrReaderModalElement.id);
        } else {
             showCustomAlert("QR scanner not ready. HTML element 'qr-reader-modal' might be missing.");
             return;
        }
    }
    currentScanTargetInputElement = targetInput; // Set which input field will receive the data
    if (qrScannerModalElement) {
        qrScannerModalElement.style.display = 'flex'; // Show the modal
        startQrScan(); // Start the camera and scanning process
    } else {
        showCustomAlert("Error: QR Scanner Modal element not found in HTML.");
    }
}

// Add event listener for the cancel button in the modal
if (cancelScanModalButton) {
    cancelScanModalButton.addEventListener('click', stopQrScan);
}