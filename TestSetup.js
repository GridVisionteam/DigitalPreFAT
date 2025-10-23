// Navigation functions
function goToPreviousPage() {
    window.location.href = 'ProductDeclaration.html';
}

function goToNextPage() {
    // Save checkbox states before navigating
    saveCheckboxStates();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'ElectronicAcc.html';
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
}

// Load saved states when page loads
window.addEventListener('DOMContentLoaded', loadCheckboxStates);

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