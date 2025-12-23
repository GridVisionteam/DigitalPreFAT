// File: QualityInspectionAI.js
// Initialize with empty data structures
if (!window.aiTestResults) window.aiTestResults = {
    qualityInspections: {},
    functionalTests: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize module tracking
    window.aiModulesToTest = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    
    // Display the AI module count
    const aiCountDisplay = document.getElementById('aiNoInput');
    if (aiCountDisplay) {
        aiCountDisplay.textContent = aiModulesToTest;
    }

    // Load saved test results if available
    const savedResults = localStorage.getItem('aiTestResults');
    if (savedResults) {
        window.aiTestResults = JSON.parse(savedResults);
        // Ensure all required objects exist
        window.aiTestResults.qualityInspections = window.aiTestResults.qualityInspections || {};
    }

    // Generate quality inspection sections for ALL AI modules
    generateAISections(window.aiModulesToTest);

    // Load any saved quality inspection data
    loadQualityInspectionData();
});

// Function to generate sections for each AI module (quality only)
function generateAISections(count) {
    const container = document.getElementById('aiSections');
    if (!container) return;

    container.innerHTML = ''; // Clear existing sections

    if (count === 0) {
        container.innerHTML = '<p style="text-align: center;">No AI modules configured</p>';
        return;
    }

    // Create a section for each AI module
    for (let i = 1; i <= count; i++) {
        const section = document.createElement('div');
        section.className = 'ai-section';
        
        section.innerHTML = `
            <h2 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                AI Module ${i}
            </h2>
            <div class="quality-inspection">
                <label style="font-weight: bold; display: block; margin-bottom: 10px; color: #555;">
                    Quality Inspection:
                </label>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #eaeaea;">
                            <th style="text-align: center; padding: 8px; border: 1px solid #ccc;">No.</th>
                            <th style="text-align: center; padding: 8px; border: 1px solid #ccc;">Quality Inspection</th>
                            <th style="text-align: center; padding: 8px; border: 1px solid #ccc;">OK</th>
                            <th style="text-align: center; padding: 8px; border: 1px solid #ccc;">NO</th>
                        </tr>
                    </thead>
                    <tbody id="qualityTbody_${i}"></tbody>
                </table>
            </div>
        `;
        container.appendChild(section);

        // Generate quality rows for this AI module
        generateQualityInspectionRows(i);
    }
}

// Function to generate quality inspection rows for a specific AI module
function generateQualityInspectionRows(aiModuleNum) {
    const tbody = document.getElementById(`qualityTbody_${aiModuleNum}`);
    if (!tbody) return;

    // Quality inspection items (same as in Processor)
    const qualityItems = [
        "The module is free from defect e.g. scratches, deformities, corrosion, broken.",
        "The jumper is set as per approved drawing."
    ];

    qualityItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #eee';
        row.innerHTML = `
            <td style="text-align: center; padding: 8px; border: 1px solid #eee;">${rowNumber}</td>
            <td style="text-align: left; padding: 8px; border: 1px solid #eee;">${item}</td>
            <td style="text-align: center; padding: 8px; border: 1px solid #eee;">
                <label class="toggle-button">
                    <input type="radio" name="quality_${aiModuleNum}_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center; padding: 8px; border: 1px solid #eee;">
                <label class="toggle-button">
                    <input type="radio" name="quality_${aiModuleNum}_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save quality inspection data only
function saveQualityInspectionData() {
    const aiModulesToTest = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    
    // Ensure the test results object has the proper structure
    window.aiTestResults = window.aiTestResults || {};
    window.aiTestResults.qualityInspections = window.aiTestResults.qualityInspections || {};
    
    // Save quality inspection results for each AI module
    for (let aiNum = 1; aiNum <= aiModulesToTest; aiNum++) {
        // Quality inspection items (2 per AI module)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const qualityOK = document.querySelector(`input[name="quality_${aiNum}_${itemNum}"][value="OK"]:checked`) !== null;
            window.aiTestResults.qualityInspections[`ai_${aiNum}_${itemNum}`] = qualityOK ? 'OK' : 'NO';
        }
    }

    // Save to local storage
    localStorage.setItem('aiTestResults', JSON.stringify(window.aiTestResults));
}

// Load quality inspection data only
function loadQualityInspectionData() {
    // Ensure we have a valid aiTestResults object
    window.aiTestResults = window.aiTestResults || {};
    window.aiTestResults.qualityInspections = window.aiTestResults.qualityInspections || {};
    
    const aiModulesToTest = parseInt(localStorage.getItem('aiModulesToTest')) || 0;

    // Load quality inspection results for each AI module
    for (let aiNum = 1; aiNum <= aiModulesToTest; aiNum++) {
        // Quality inspection items (2 per AI module)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const qualityResult = window.aiTestResults.qualityInspections[`ai_${aiNum}_${itemNum}`];
            if (qualityResult) {
                const radioToCheck = document.querySelector(`input[name="quality_${aiNum}_${itemNum}"][value="${qualityResult}"]`);
                if (radioToCheck) radioToCheck.checked = true;
            }
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
function goToPreviousPage() {
    saveQualityInspectionData();
    
    // Go back to DO page
    const doModulesToTest = parseInt(localStorage.getItem('doModulesToTest')) || 0;
    window.currentDOModule = doModulesToTest;
    localStorage.setItem('currentDOModule', window.currentDOModule);
    window.location.href = 'QualityInspectionDO.html';
}

function goToNext() {
    // First validate the quality inspection
    if (!validateQualityInspection()) {
        alert('Please complete all quality inspections before continuing. All inspections must be marked OK.');
        return;
    }
    
    // Save the quality inspection data
    saveQualityInspectionData();
    navigationGuard.markPageAsCompleted();
    // Navigate to functionality test page
    window.location.href = 'RTUPowerUp.html';
}

// Validation function for quality inspection only
function validateQualityInspection() {
    let isValid = true;
    const aiModulesToTest = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    
    // Reset all error styles first
    for (let aiNum = 1; aiNum <= aiModulesToTest; aiNum++) {
        // Check quality inspection items (2 per AI module)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const qualityOK = document.querySelector(`input[name="quality_${aiNum}_${itemNum}"][value="OK"]`);
            const qualityNO = document.querySelector(`input[name="quality_${aiNum}_${itemNum}"][value="NO"]`);
            
            if (qualityNO && qualityNO.checked) {
                qualityNO.parentElement.style.border = '1px solid red';
                isValid = false;
            } else if (qualityOK) {
                qualityOK.parentElement.style.border = '';
            }
        }
    }
    
    return isValid;
}