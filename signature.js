// Initialize with empty data structure
if (!window.signatureData) window.signatureData = {
    signerName: '',
    signerTitle: '',
    signatureImagePath: ''  // Will store either data URL or blob URL
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const signerNameInput = document.getElementById('signerName');
    const signerTitleInput = document.getElementById('signerTitle');
    const signatureUpload = document.getElementById('signatureUpload');
    const signaturePreview = document.getElementById('signaturePreview');
    const uploadInstructions = document.getElementById('uploadInstructions');
    
    // Check if elements exist before using them
    if (!signerNameInput || !signerTitleInput || !signatureUpload || !signaturePreview || !uploadInstructions) {
        console.error('One or more required elements not found in the DOM');
        return;
    }

    // Load saved signature data if available
    const savedData = localStorage.getItem('signatureData');
    if (savedData) {
        window.signatureData = JSON.parse(savedData);
    }
    
    // Get name and title from localStorage if available
    const sessionName = localStorage.getItem('session_name');
    const sessionDesignation = localStorage.getItem('session_designation');
    
    // Prefer localStorage data over saved local data
    if (sessionName) {
        window.signatureData.signerName = sessionName;
        signerNameInput.value = sessionName;
    }
    
    if (sessionDesignation) {
        window.signatureData.signerTitle = sessionDesignation;
        signerTitleInput.value = sessionDesignation;
    }
    
    // Load the rest of the signature data
    loadSignatureData();

    // Set up file upload event listener
    signatureUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                // Store the image data as a data URL
                window.signatureData.signatureImagePath = event.target.result;
                
                // Create an image element for preview
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.maxWidth = '200px';
                img.style.maxHeight = '100px';
                
                // Clear previous content and add the new image
                signaturePreview.innerHTML = '';
                signaturePreview.appendChild(img);
                uploadInstructions.style.display = 'none';
                
                // Save the data
                saveSignatureData();
            };
            reader.readAsDataURL(file);
        }
    });

    // Set up drag and drop functionality
    signaturePreview.addEventListener('dragover', function(e) {
        e.preventDefault();
        signaturePreview.style.border = '2px dashed #4CAF50';
    });

    signaturePreview.addEventListener('dragleave', function() {
        signaturePreview.style.border = '2px dashed #ccc';
    });

    signaturePreview.addEventListener('drop', function(e) {
        e.preventDefault();
        signaturePreview.style.border = '2px dashed #ccc';
        
        if (e.dataTransfer.files.length) {
            signatureUpload.files = e.dataTransfer.files;
            const event = new Event('change');
            signatureUpload.dispatchEvent(event);
        }
    });
});

// Load saved signature data into the form
function loadSignatureData() {
    if (!window.signatureData) return;

    const signerNameInput = document.getElementById('signerName');
    const signerTitleInput = document.getElementById('signerTitle');
    const signaturePreview = document.getElementById('signaturePreview');
    const uploadInstructions = document.getElementById('uploadInstructions');

    if (!signerNameInput || !signerTitleInput || !signaturePreview || !uploadInstructions) return;

    // Load name and title
    signerNameInput.value = window.signatureData.signerName || '';
    signerTitleInput.value = window.signatureData.signerTitle || '';

    // Load signature image if available
    if (window.signatureData.signatureImagePath) {
        const img = document.createElement('img');
        img.src = window.signatureData.signatureImagePath;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '100px';
        
        signaturePreview.innerHTML = '';
        signaturePreview.appendChild(img);
        uploadInstructions.style.display = 'none';
    }
}

// Save signature data to localStorage
function saveSignatureData() {
    const signerNameInput = document.getElementById('signerName');
    const signerTitleInput = document.getElementById('signerTitle');

    if (signerNameInput && signerTitleInput) {
        window.signatureData.signerName = signerNameInput.value;
        window.signatureData.signerTitle = signerTitleInput.value;
        localStorage.setItem('signatureData', JSON.stringify(window.signatureData));
    }
}

// Handle form submission
function handleSignatureSubmission() {
    // Update data from form fields
    saveSignatureData();

    // Validate inputs
    if (!window.signatureData.signatureImagePath) {
        alert('Please upload your signature image');
        return false;
    }

    if (!window.signatureData.signerName) {
        alert('Name is required');
        return false;
    }

    if (!window.signatureData.signerTitle) {
        alert('Title is required');
        return false;
    }
    window.location.href = 'generatePDF.html';
    return true; // Allow form submission
}

// Clear all signature data
function clearSignature() {
    window.signatureData = {
        signerName: '',
        signerTitle: '',
        signatureImagePath: ''
    };
    localStorage.removeItem('signatureData');
    
    // Reset the form
    const signerNameInput = document.getElementById('signerName');
    const signerTitleInput = document.getElementById('signerTitle');
    const signatureUpload = document.getElementById('signatureUpload');
    const signaturePreview = document.getElementById('signaturePreview');
    const uploadInstructions = document.getElementById('uploadInstructions');

    if (signerNameInput) signerNameInput.value = '';
    if (signerTitleInput) signerTitleInput.value = '';
    if (signatureUpload) signatureUpload.value = '';
    if (signaturePreview) signaturePreview.innerHTML = '';
    if (uploadInstructions) uploadInstructions.style.display = 'block';
}

// Add this function to handle navigation
function goToPreviousPage() {
    window.location.href = 'LimitofAuthority.html';
}