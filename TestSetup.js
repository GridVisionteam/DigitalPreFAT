// Navigation functions
function goToPreviousPage() {
    window.location.href = 'ProductDeclaration.html';
}

function goToNextPage() {
    // Validate all checkboxes are ticked before navigating
    if (!validateTestSetupCheckboxes()) {
        return; // Stop if validation fails
    }
    
    // Save checkbox states before navigating
    saveCheckboxStates();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'ElectronicAcc.html';
}

// Function to validate all test setup checkboxes are ticked
function validateTestSetupCheckboxes() {
    const check1 = document.getElementById('check1');
    const check2 = document.getElementById('check2');
    const check3 = document.getElementById('check3');
    const check4 = document.getElementById('check4');
    
    let allChecked = true;
    
    // Check each checkbox and apply error styling if not checked
    if (!check1.checked) {
        check1.parentElement.style.border = '1px solid red';
        allChecked = false;
    } else {
        check1.parentElement.style.border = '';
    }
    
    if (!check2.checked) {
        check2.parentElement.style.border = '1px solid red';
        allChecked = false;
    } else {
        check2.parentElement.style.border = '';
    }
    
    if (!check3.checked) {
        check3.parentElement.style.border = '1px solid red';
        allChecked = false;
    } else {
        check3.parentElement.style.border = '';
    }
    
    if (!check4.checked) {
        check4.parentElement.style.border = '1px solid red';
        allChecked = false;
    } else {
        check4.parentElement.style.border = '';
    }
    
    if (!allChecked) {
        alert('Please tick all checkboxes before continuing.');
        return false;
    }
    
    return true;
}

// Function to save checkbox states to localStorage in the required format
function saveCheckboxStates() {
    const testSetupResults = {
        connections: {
            connection_1: document.getElementById('check1').checked ? 'OK' : 'NO',
            connection_2: document.getElementById('check2').checked ? 'OK' : 'NO',
            connection_3: document.getElementById('check3').checked ? 'OK' : 'NO',
            connection_4: document.getElementById('check4').checked ? 'OK' : 'NO'
        }
    };
    
    // Save to localStorage
    localStorage.setItem('testSetupResults', JSON.stringify(testSetupResults));
}

// Function to load saved checkbox states
function loadCheckboxStates() {
    const savedResults = localStorage.getItem('testSetupResults');
    if (savedResults) {
        const results = JSON.parse(savedResults);
        document.getElementById('check1').checked = results.connections.connection_1 === 'OK';
        document.getElementById('check2').checked = results.connections.connection_2 === 'OK';
        document.getElementById('check3').checked = results.connections.connection_3 === 'OK';
        document.getElementById('check4').checked = results.connections.connection_4 === 'OK';
    }
    
    // Clear any existing error borders when loading
    clearCheckboxErrorBorders();
}

// Function to clear error borders from checkboxes
function clearCheckboxErrorBorders() {
    const check1 = document.getElementById('check1');
    const check2 = document.getElementById('check2');
    const check3 = document.getElementById('check3');
    const check4 = document.getElementById('check4');
    
    if (check1) check1.parentElement.style.border = '';
    if (check2) check2.parentElement.style.border = '';
    if (check3) check3.parentElement.style.border = '';
    if (check4) check4.parentElement.style.border = '';
}

// Add event listeners to checkboxes to clear error borders when checked
function setupCheckboxEventListeners() {
    const checkboxes = [
        document.getElementById('check1'),
        document.getElementById('check2'),
        document.getElementById('check3'),
        document.getElementById('check4')
    ];
    
    checkboxes.forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    this.parentElement.style.border = '';
                }
            });
        }
    });
}

// Load saved states when page loads
window.addEventListener('DOMContentLoaded', function() {
    loadCheckboxStates();
    setupCheckboxEventListeners();
});

// Make the image container responsive
function adjustCheckpointPositions() {
    const container = document.querySelector('.image-container');
    const img = document.getElementById('setupDiagram');
    const checkpoints = document.querySelectorAll('.checkpoint');
    
    // This ensures checkboxes maintain their relative positions
    // when the image size changes (responsive design)
    checkpoints.forEach(checkpoint => {
        const topPercent = checkpoint.style.top;
        const leftPercent = checkpoint.style.left;
        
        checkpoint.style.top = `${(parseFloat(topPercent) / 100) * img.offsetHeight}px`;
        checkpoint.style.left = `${(parseFloat(leftPercent) / 100) * img.offsetWidth}px`;
    });
}

// Adjust positions on load and resize
window.addEventListener('load', adjustCheckpointPositions);
window.addEventListener('resize', adjustCheckpointPositions);