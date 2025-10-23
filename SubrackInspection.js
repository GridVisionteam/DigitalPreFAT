// Initialize with empty data structures
if (!window.subrackTestResults) window.subrackTestResults = {
    qualityInspections: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const subrackCount = parseInt(localStorage.getItem('session_subrackCount')) || 0;
    
    // Display the power count
    const subrackCountDisplay = document.getElementById('SubrackNoInput');
    if (subrackCountDisplay) {
        subrackCountDisplay.textContent = subrackCount;
    }

    // Generate sections for subrack inspection
    generateSubrackSections();

    // Load saved test results if available
    const savedResults = localStorage.getItem('subrackTestResults');
    if (savedResults) {
        window.subrackTestResults = JSON.parse(savedResults);
    }

    // Load any saved data
    loadSubrackTestData();
});

// Function to generate sections for subrack inspection
function generateSubrackSections() {
    const container = document.getElementById('SubrackInspectionSections');
    if (!container) return;

    container.innerHTML = ''; // Clear existing sections

    // Get subrack count from session storage
    const subrackCount = parseInt(localStorage.getItem('session_subrackCount')) || 0;
    
    if (subrackCount === 0) {
        container.innerHTML = '<p>No subracks to inspect</p>';
        return;
    }

    const section = document.createElement('div');
    section.className = 'subrack-section';
    section.innerHTML = `
        <div class="quality-inspections">
            <label>Quality Inspections</label>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">Subrack No.</th>
                        <th style="text-align: center;">Inspection</th>
                        <th style="text-align: center;">OK</th>
                        <th style="text-align: center;">NO</th>
                    </tr>
                </thead>
                <tbody id="qualityTbody"></tbody>
            </table>
        </div>
    `;
    container.appendChild(section);

    // Generate rows for subrack inspection
    generateQualityInspectionRows(subrackCount);
}

// Function to generate quality inspection rows for subrack
function generateQualityInspectionRows(subrackCount) {
    const tbody = document.getElementById('qualityTbody');
    if (!tbody) return;

    // Quality inspection items for subrack
    const qualityItems = [
        "The subrack is free from defect e.g. scratches, deformities, corrosion, broken."
    ];

    // Generate rows for each subrack
    for (let subrackNo = 1; subrackNo <= subrackCount; subrackNo++) {
        qualityItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="text-align: center;">${subrackNo}</td>
                <td style="text-align: left;">${item}</td>
                <td style="text-align: center;">
                    <label class="toggle-button">
                        <input type="radio" name="quality_${subrackNo}" value="OK" checked>
                        <span class="toggle-text"></span>
                    </label>
                </td>
                <td style="text-align: center;">
                    <label class="toggle-button">
                        <input type="radio" name="quality_${subrackNo}" value="NO">
                        <span class="toggle-text"></span>
                    </label>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Save subrack test data
function saveSubrackTestData() {
    // Get subrack count from session storage
    const subrackCount = parseInt(localStorage.getItem('session_subrackCount')) || 0;
    
    // Ensure the test results object has the proper structure
    window.subrackTestResults = window.subrackTestResults || {};
    window.subrackTestResults.qualityInspections = window.subrackTestResults.qualityInspections || {};
    
    // Save quality test results for each subrack
    for (let subrackNo = 1; subrackNo <= subrackCount; subrackNo++) {
        const qualityOK = document.querySelector(`input[name="quality_${subrackNo}"][value="OK"]:checked`) !== null;
        window.subrackTestResults.qualityInspections[`subrack_${subrackNo}`] = qualityOK ? 'OK' : 'NO';
    }

    // Save to session storage
    localStorage.setItem('subrackTestResults', JSON.stringify(window.subrackTestResults));
}

// Load subrack test data
function loadSubrackTestData() {
    // Get subrack count from session storage
    const subrackCount = parseInt(localStorage.getItem('session_subrackCount')) || 0;
    
    // Ensure we have a valid subrackTestResults object with the expected structure
    window.subrackTestResults = window.subrackTestResults || {};
    window.subrackTestResults.qualityInspections = window.subrackTestResults.qualityInspections || {};
    
    // Load quality test results for each subrack
    for (let subrackNo = 1; subrackNo <= subrackCount; subrackNo++) {
        const qualityResult = window.subrackTestResults.qualityInspections[`subrack_${subrackNo}`];
        if (qualityResult) {
            const radioToCheck = document.querySelector(`input[name="quality_${subrackNo}"][value="${qualityResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Navigation functions
function goToPreviousPage() {
    // Save the data before navigating away
    saveSubrackTestData();
    window.location.href = 'PanelInformation.html';
}

function goToNextPage() {
    // First validate the form
    if (!validateSubrackInspection()) {
        alert('Please complete all required fields before continuing. All inspections must be marked OK.');
        return; // Stop navigation if validation fails
    }
    
    // Save the data
    saveSubrackTestData();
    
    navigationGuard.markPageAsCompleted();
    window.location.href = 'FunctionalityPowerSupply.html';
}

// Button functions
function SelectAll() {
    // Get subrack count from session storage
    const subrackCount = parseInt(localStorage.getItem('session_subrackCount')) || 0;
    
    for (let subrackNo = 1; subrackNo <= subrackCount; subrackNo++) {
        const radioButton = document.querySelector(`input[name="quality_${subrackNo}"][value="OK"]`);
        if (radioButton) radioButton.checked = true;
    }
}

function clearAll() {
    // Get subrack count from session storage
    const subrackCount = parseInt(localStorage.getItem('session_subrackCount')) || 0;
    
    for (let subrackNo = 1; subrackNo <= subrackCount; subrackNo++) {
        const radioButton = document.querySelector(`input[name="quality_${subrackNo}"][value="NO"]`);
        if (radioButton) radioButton.checked = true;
    }
}

// Validation function for subrack inspection
function validateSubrackInspection() {
    let isValid = true;
    
    // Get subrack count from session storage
    const subrackCount = parseInt(localStorage.getItem('session_subrackCount')) || 0;
    
    // Reset all error styles first
    for (let subrackNo = 1; subrackNo <= subrackCount; subrackNo++) {
        const radioOK = document.querySelector(`input[name="quality_${subrackNo}"][value="OK"]`);
        const radioNO = document.querySelector(`input[name="quality_${subrackNo}"][value="NO"]`);
        
        if (radioNO && radioNO.checked) {
            radioNO.parentElement.style.border = '1px solid red';
            isValid = false;
        } else if (radioOK) {
            radioOK.parentElement.style.border = '';
        }
    }
    
    return isValid;
}