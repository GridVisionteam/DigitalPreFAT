// File: QualityInspectionPowerSupply.js
// Initialize with empty data structures
if (!window.powerTestResults) window.powerTestResults = {
    qualityInspections: {},
    functionalTests: {},
    voltageValues: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the power count from local storage
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;
    
    // Display the power count
    const powerCountDisplay = document.getElementById('PSNoInput');
    if (powerCountDisplay) {
        powerCountDisplay.textContent = powerCount;
    }

    // Load saved test results if available
    const savedResults = localStorage.getItem('powerTestResults');
    if (savedResults) {
        window.powerTestResults = JSON.parse(savedResults);
    }

    // Generate quality inspection rows based on power count
    generateQualityInspectionRows(powerCount);

    // Load any saved quality inspection data
    loadQualityInspectionData();
});

// Function to generate quality inspection rows
function generateQualityInspectionRows(count) {
    const qualityTbody = document.getElementById('qualityTableBody');
    if (!qualityTbody) return;

    qualityTbody.innerHTML = ''; // Clear existing rows

    if (count === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" style="text-align: center;">No power supply modules configured</td>
        `;
        qualityTbody.appendChild(row);
        return;
    }

    // Quality inspection items (same for all power supplies)
    const qualityItems = [
        "The module is free from defect e.g. scratches, deformities, corrosion, broken."
    ];

    // Generate rows for each power supply
    for (let i = 1; i <= count; i++) {
        qualityItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="text-align: center;">${i}</td>
                <td style="text-align: left;">${item}</td>
                <td style="text-align: center;">
                    <label class="toggle-button">
                        <input type="radio" name="quality_${i}" value="OK" checked>
                        <span class="toggle-text"></span>
                    </label>
                </td>
                <td style="text-align: center;">
                    <label class="toggle-button">
                        <input type="radio" name="quality_${i}" value="NO">
                        <span class="toggle-text"></span>
                    </label>
                </td>
            `;
            qualityTbody.appendChild(row);
        });
    }
}

// Save quality inspection data
function saveQualityInspectionData() {
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;
    
    // Ensure the test results object has the proper structure
    window.powerTestResults = window.powerTestResults || {};
    window.powerTestResults.qualityInspections = window.powerTestResults.qualityInspections || {};
    
    // Save quality inspection results
    for (let i = 1; i <= powerCount; i++) {
        const qualityOK = document.querySelector(`input[name="quality_${i}"][value="OK"]:checked`) !== null;
        window.powerTestResults.qualityInspections[`power_${i}`] = qualityOK ? 'OK' : 'NO';
    }

    // Save to local storage
    localStorage.setItem('powerTestResults', JSON.stringify(window.powerTestResults));
}

// Load quality inspection data
function loadQualityInspectionData() {
    // Ensure we have a valid powerTestResults object
    window.powerTestResults = window.powerTestResults || {};
    window.powerTestResults.qualityInspections = window.powerTestResults.qualityInspections || {};
    
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;

    // Load quality inspection results
    for (let i = 1; i <= powerCount; i++) {
        const qualityResult = window.powerTestResults.qualityInspections[`power_${i}`];
        if (qualityResult) {
            const radioToCheck = document.querySelector(`input[name="quality_${i}"][value="${qualityResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Select All button functionality for quality inspection
function selectAllQuality() {
    const qualityRadioButtons = document.querySelectorAll('.quality-inspection input[type="radio"][value="OK"]');
    qualityRadioButtons.forEach(radio => {
        radio.checked = true;
    });
}

// Clear All button functionality for quality inspection
function clearAllQuality() {
    const qualityRadioButtons = document.querySelectorAll('.quality-inspection input[type="radio"][value="NO"]');
    qualityRadioButtons.forEach(radio => {
        radio.checked = true;
    });
}

// Navigation functions
function goToSubrackPage() {
    saveQualityInspectionData();
    window.location.href = 'SubrackInspection.html';
}

function saveAndGoToFunctionality() {
    // First validate the quality inspection
    if (!validateQualityInspection()) {
        alert('Please complete all quality inspections before continuing. All inspections must be marked OK.');
        return;
    }
    
    // Save the quality inspection data
    saveQualityInspectionData();
    navigationGuard.markPageAsCompleted();
    
    // Navigate to functionality test page
    window.location.href = 'QualityInspectionProcessor.html';
}

// Validation function for quality inspection
function validateQualityInspection() {
    let isValid = true;
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;
    
    // Reset all error styles first
    for (let i = 1; i <= powerCount; i++) {
        const qualityOK = document.querySelector(`input[name="quality_${i}"][value="OK"]`);
        const qualityNO = document.querySelector(`input[name="quality_${i}"][value="NO"]`);
        
        if (qualityNO && qualityNO.checked) {
            qualityNO.parentElement.style.border = '1px solid red';
            isValid = false;
        } else if (qualityOK) {
            qualityOK.parentElement.style.border = '';
        }
    }
    
    return isValid;
}