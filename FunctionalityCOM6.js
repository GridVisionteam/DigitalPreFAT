// Initialize with empty data structures
if (!window.com6TestResults) window.com6TestResults = {
    qualityInspections: {},
    functionalTests: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the COM-6-A count from session storage
    const com6Count = parseInt(localStorage.getItem('comCount')) || 0;
    
    // Display the COM-6-A count
    const com6CountDisplay = document.getElementById('Com6NoInput');
    if (com6CountDisplay) {
        com6CountDisplay.textContent = com6Count;
    }

    // Load saved test results if available
    const savedResults = localStorage.getItem('com6TestResults');
    if (savedResults) {
        window.com6TestResults = JSON.parse(savedResults);
    }

    // Generate sections for each COM-6-A module
    generateCom6Sections(com6Count);

    // Load any saved data
    loadCom6TestData();
});

// Function to generate sections for each COM-6-A module
function generateCom6Sections(count) {
    const container = document.getElementById('com6Sections');
    if (!container) return;

    container.innerHTML = ''; // Clear existing sections

    if (count === 0) {
        container.innerHTML = '<p style="text-align: center;">No COM-6-A modules configured</p>';
        return;
    }

    // Create a section for each COM-6-A module
    for (let i = 1; i <= count; i++) {
        const section = document.createElement('div');
        section.className = 'com6-section';
        section.innerHTML = `
            <h2>COM-6-A Module ${i}</h2>
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
            <div class="functional-test">
                <label>Functionality Test - COM-6-A: ${i}</label>
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: center;">No.</th>
                            <th style="text-align: center;">Inspection</th>
                            <th style="text-align: center;">OK</th>
                            <th style="text-align: center;">NO</th>
                        </tr>
                    </thead>
                    <tbody id="functionalTbody_${i}"></tbody>
                </table>
            </div>
        `;
        container.appendChild(section);

        // Generate rows for this COM-6-A module
        generateQualityInspectionRows(i);
        generateFunctionalTestRows(i);
    }
}

// Function to generate quality inspection rows for a specific COM-6-A module
function generateQualityInspectionRows(moduleNum) {
    const tbody = document.getElementById(`qualityTbody_${moduleNum}`);
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
                    <input type="radio" name="quality_${moduleNum}_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="quality_${moduleNum}_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate functional test rows for a specific COM-6-A module
function generateFunctionalTestRows(moduleNum) {
    const tbody = document.getElementById(`functionalTbody_${moduleNum}`);
    if (!tbody) return;

    // Functionality Test items
    const functionalTestItems = [
        "The LED lights up based on which port we configured.",
        "The Tx and Rx for the used port is blinking."
    ];

    functionalTestItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="functional_${moduleNum}_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="functional_${moduleNum}_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save COM-6-A test data
function saveCom6TestData() {
    const com6Count = parseInt(localStorage.getItem('comCount')) || 0;
    
    // Ensure the test results object has the proper structure
    window.com6TestResults = window.com6TestResults || {};
    window.com6TestResults.qualityInspections = window.com6TestResults.qualityInspections || {};
    window.com6TestResults.functionalTests = window.com6TestResults.functionalTests || {};

    // Save quality inspection results for each COM-6-A module
    for (let moduleNum = 1; moduleNum <= com6Count; moduleNum++) {
        // Quality inspection items (2 per module)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const qualityOK = document.querySelector(`input[name="quality_${moduleNum}_${itemNum}"][value="OK"]:checked`) !== null;
            window.com6TestResults.qualityInspections[`com6_${moduleNum}_${itemNum}`] = qualityOK ? 'OK' : 'NO';
        }
        
        // Functional test items (2 per module)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const functionalOK = document.querySelector(`input[name="functional_${moduleNum}_${itemNum}"][value="OK"]:checked`) !== null;
            window.com6TestResults.functionalTests[`com6_${moduleNum}_${itemNum}`] = functionalOK ? 'OK' : 'NO';
        }
    }

    // Save to session storage
    localStorage.setItem('com6TestResults', JSON.stringify(window.com6TestResults));
}

// Load COM-6-A test data
function loadCom6TestData() {
    // Ensure we have a valid com6TestResults object with the expected structure
    window.com6TestResults = window.com6TestResults || {};
    window.com6TestResults.qualityInspections = window.com6TestResults.qualityInspections || {};
    window.com6TestResults.functionalTests = window.com6TestResults.functionalTests || {};
    
    const com6Count = parseInt(localStorage.getItem('comCount')) || 0;

    // Load quality inspection results for each COM-6-A module
    for (let moduleNum = 1; moduleNum <= com6Count; moduleNum++) {
        // Quality inspection items (2 per module)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const qualityResult = window.com6TestResults.qualityInspections[`com6_${moduleNum}_${itemNum}`];
            if (qualityResult) {
                const radioToCheck = document.querySelector(`input[name="quality_${moduleNum}_${itemNum}"][value="${qualityResult}"]`);
                if (radioToCheck) radioToCheck.checked = true;
            }
        }
        
        // Functional test items (2 per module)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const functionalResult = window.com6TestResults.functionalTests[`com6_${moduleNum}_${itemNum}`];
            if (functionalResult) {
                const radioToCheck = document.querySelector(`input[name="functional_${moduleNum}_${itemNum}"][value="${functionalResult}"]`);
                if (radioToCheck) radioToCheck.checked = true;
            }
        }
    }
}

// Validation function for COM6 inspection
function validateCom6Inspection() {
    let isValid = true;
    const com6Count = parseInt(localStorage.getItem('comCount')) || 0;
    
    // Reset all error styles first
    for (let moduleNum = 1; moduleNum <= com6Count; moduleNum++) {
        // Check quality inspection items (2 per module)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const qualityOK = document.querySelector(`input[name="quality_${moduleNum}_${itemNum}"][value="OK"]`);
            const qualityNO = document.querySelector(`input[name="quality_${moduleNum}_${itemNum}"][value="NO"]`);
            
            if (qualityNO && qualityNO.checked) {
                qualityNO.parentElement.style.border = '1px solid red';
                isValid = false;
            } else if (qualityOK) {
                qualityOK.parentElement.style.border = '';
            }
        }
        
        // Check functional test items (2 per module)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const functionalOK = document.querySelector(`input[name="functional_${moduleNum}_${itemNum}"][value="OK"]`);
            const functionalNO = document.querySelector(`input[name="functional_${moduleNum}_${itemNum}"][value="NO"]`);
            
            if (functionalNO && functionalNO.checked) {
                functionalNO.parentElement.style.border = '1px solid red';
                isValid = false;
            } else if (functionalOK) {
                functionalOK.parentElement.style.border = '';
            }
        }
    }
    
    if (!isValid) {
        alert('Please complete all required fields before continuing. All inspections must be marked OK.');
    }
    
    return isValid;
}

// Navigation functions
function goToPreviousPage() {
    saveCom6TestData();
    window.location.href = 'FunctionalityProcessor.html';
}

function goToFunctionalityDI() {
    // First validate the form
    if (!validateCom6Inspection()) {
        return; // Stop navigation if validation fails
    }
    
    saveCom6TestData();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'FunctionalityDIPage.html';
}

// Button functions
function SelectAll() {
    const radioButtons = document.querySelectorAll('input[type="radio"][value="OK"]');
    radioButtons.forEach(radio => {
        radio.checked = true;
    });
}

function clearAll() {
    const radioButtons = document.querySelectorAll('input[type="radio"][value="NO"]');
    radioButtons.forEach(radio => {
        radio.checked = true;
    });
}