// File: QualityInspectionProcessor.js
// Initialize with empty data structures
if (!window.processorTestResults) window.processorTestResults = {
    qualityInspections: {},
    functionalTests: {},
    iec101Tests: {},
    iec104Tests: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the processor count from local storage
    const processorCount = parseInt(localStorage.getItem('processorCount')) || 0;
    
    // Display the processor count
    const processorCountDisplay = document.getElementById('ProcNoInput');
    if (processorCountDisplay) {
        processorCountDisplay.textContent = processorCount;
    }

    // Load saved test results if available
    const savedResults = localStorage.getItem('processorTestResults');
    if (savedResults) {
        window.processorTestResults = JSON.parse(savedResults);
        // Ensure all required objects exist
        window.processorTestResults.qualityInspections = window.processorTestResults.qualityInspections || {};
    }

    // Generate quality inspection sections
    generateProcessorSections(processorCount);

    // Load any saved quality inspection data
    loadQualityInspectionData();
});

// Function to generate sections for each processor (quality only)
function generateProcessorSections(count) {
    const container = document.getElementById('processorSections');
    if (!container) return;

    container.innerHTML = ''; // Clear existing sections

    if (count === 0) {
        container.innerHTML = '<p style="text-align: center;">No processor modules configured</p>';
        return;
    }

    // Create a section for each processor
    for (let i = 1; i <= count; i++) {
        const section = document.createElement('div');
        section.className = 'processor-section';
        section.innerHTML = `
            <h2>Processor ${i}</h2>
            <div class="quality-inspection">
                <label>Quality Inspection:</label>
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: center;">No.</th>
                            <th style="text-align: center;">Quality Inspection</th>
                            <th style="text-align: center;">OK</th>
                            <th style="text-align: center;">NO</th>
                        </tr>
                    </thead>
                    <tbody id="qualityTbody_${i}"></tbody>
                </table>
            </div>
        `;
        container.appendChild(section);

        // Generate quality rows for this processor
        generateQualityInspectionRows(i);
    }
}

// Function to generate quality inspection rows for a specific processor
function generateQualityInspectionRows(processorNum) {
    const tbody = document.getElementById(`qualityTbody_${processorNum}`);
    if (!tbody) return;

    // Quality inspection items
    const qualityItems = [
        "The module is free from defect e.g. scratches, deformities, corrosion, broken.",
        "The jumper is set as per approved drawing."
    ];

    qualityItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="quality_${processorNum}_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="quality_${processorNum}_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save quality inspection data only
function saveQualityInspectionData() {
    const processorCount = parseInt(localStorage.getItem('processorCount')) || 0;
    
    // Ensure the test results object has the proper structure
    window.processorTestResults = window.processorTestResults || {};
    window.processorTestResults.qualityInspections = window.processorTestResults.qualityInspections || {};
    
    // Save quality inspection results for each processor
    for (let procNum = 1; procNum <= processorCount; procNum++) {
        // Quality inspection items (2 per processor)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const qualityOK = document.querySelector(`input[name="quality_${procNum}_${itemNum}"][value="OK"]:checked`) !== null;
            window.processorTestResults.qualityInspections[`proc_${procNum}_${itemNum}`] = qualityOK ? 'OK' : 'NO';
        }
    }

    // Save to local storage
    localStorage.setItem('processorTestResults', JSON.stringify(window.processorTestResults));
}

// Load quality inspection data only
function loadQualityInspectionData() {
    // Ensure we have a valid processorTestResults object
    window.processorTestResults = window.processorTestResults || {};
    window.processorTestResults.qualityInspections = window.processorTestResults.qualityInspections || {};
    
    const processorCount = parseInt(localStorage.getItem('processorCount')) || 0;

    // Load quality inspection results for each processor
    for (let procNum = 1; procNum <= processorCount; procNum++) {
        // Quality inspection items (2 per processor)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const qualityResult = window.processorTestResults.qualityInspections[`proc_${procNum}_${itemNum}`];
            if (qualityResult) {
                const radioToCheck = document.querySelector(`input[name="quality_${procNum}_${itemNum}"][value="${qualityResult}"]`);
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
function goToPowerSupplyPage() {
    saveQualityInspectionData();
    window.location.href = 'QualityInspectionPowerSupply.html';
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
    window.location.href = 'QualityInspectionCOM6.html';
}

// Validation function for quality inspection only
function validateQualityInspection() {
    let isValid = true;
    const processorCount = parseInt(localStorage.getItem('processorCount')) || 0;
    
    // Reset all error styles first
    for (let procNum = 1; procNum <= processorCount; procNum++) {
        // Check quality inspection items (2 per processor)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const qualityOK = document.querySelector(`input[name="quality_${procNum}_${itemNum}"][value="OK"]`);
            const qualityNO = document.querySelector(`input[name="quality_${procNum}_${itemNum}"][value="NO"]`);
            
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