// Initialize with empty data structures
if (!window.powerTestResults) window.powerTestResults = {
    qualityInspections: {},
    functionalTests: {},
    voltageValues: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the power count from session storage
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

    // Load any saved data
    loadPowerTestData();
});

// Function to generate quality inspection rows
function generateQualityInspectionRows(count) {
    // Quality inspection table
    const qualityTbody = document.querySelector('.quality-inspection tbody');
    if (!qualityTbody) return;

    qualityTbody.innerHTML = ''; // Clear existing rows

    if (count === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" style="text-align: center;">No power supply modules configured</td>
        `;
        qualityTbody.appendChild(row);
        
        // Also handle the functional test table
        const functionalTbody = document.querySelector('.functional-test tbody');
        if (functionalTbody) {
            functionalTbody.innerHTML = `
                <td colspan="5" style="text-align: center;">No power supply modules configured</td>
            `;
        }
        return;
    }

    // Quality inspection items (same for all power supplies)
    const qualityItems = [
        "The module is free from defect e.g. scratches, deformities, corrosion, broken."
    ];

    // Generate rows for each power supply in quality inspection table
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

    // Functional test table
    const functionalTbody = document.querySelector('.functional-test tbody');
    if (functionalTbody) {
        functionalTbody.innerHTML = ''; // Clear existing rows

        // Functionality Test items (same for all power supplies)
        const FunctionalTestItems = [
            "Power Supply Module is in good condition. Both 5V and 3.3V LED light up."
        ];

        for (let i = 1; i <= count; i++) {
            FunctionalTestItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="text-align: center;">${i}</td>
                    <td>
                        <input type="number" name="voltage_${i}" style="width: 60px; text-align: right;" required> VDC
                    </td>
                    <td style="text-align: left;">${item}</td>
                    <td style="text-align: center;">
                        <label class="toggle-button">
                            <input type="radio" name="functional_${i}" value="OK" checked>
                            <span class="toggle-text"></span>
                        </label>
                    </td>
                    <td style="text-align: center;">
                        <label class="toggle-button">
                            <input type="radio" name="functional_${i}" value="NO">
                            <span class="toggle-text"></span>
                        </label>
                    </td>
                `;
                functionalTbody.appendChild(row);
            });
        }
    }
}

// Save power test data
function savePowerTestData() {
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;
    
    // Ensure the test results object has the proper structure
    window.powerTestResults = window.powerTestResults || {};
    window.powerTestResults.qualityInspections = window.powerTestResults.qualityInspections || {};
    window.powerTestResults.functionalTests = window.powerTestResults.functionalTests || {};
    window.powerTestResults.voltageValues = window.powerTestResults.voltageValues || {};

    // Save quality inspection results
    for (let i = 1; i <= powerCount; i++) {
        const qualityOK = document.querySelector(`input[name="quality_${i}"][value="OK"]:checked`) !== null;
        window.powerTestResults.qualityInspections[`power_${i}`] = qualityOK ? 'OK' : 'NO';
    }

    // Save functional test results and voltage values
    for (let i = 1; i <= powerCount; i++) {
        const functionalOK = document.querySelector(`input[name="functional_${i}"][value="OK"]:checked`) !== null;
        window.powerTestResults.functionalTests[`power_${i}`] = functionalOK ? 'OK' : 'NO';
        
        const voltageInput = document.querySelector(`input[name="voltage_${i}"]`);
        if (voltageInput) {
            window.powerTestResults.voltageValues[`power_${i}`] = voltageInput.value;
        }
    }

    // Save to session storage
    localStorage.setItem('powerTestResults', JSON.stringify(window.powerTestResults));
}

// Load power test data
function loadPowerTestData() {
    // Ensure we have a valid powerTestResults object with the expected structure
    window.powerTestResults = window.powerTestResults || {};
    window.powerTestResults.qualityInspections = window.powerTestResults.qualityInspections || {};
    window.powerTestResults.functionalTests = window.powerTestResults.functionalTests || {};
    window.powerTestResults.voltageValues = window.powerTestResults.voltageValues || {};
    
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;

    // Load quality inspection results
    for (let i = 1; i <= powerCount; i++) {
        const qualityResult = window.powerTestResults.qualityInspections[`power_${i}`];
        if (qualityResult) {
            const radioToCheck = document.querySelector(`input[name="quality_${i}"][value="${qualityResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }

    // Load functional test results and voltage values
    for (let i = 1; i <= powerCount; i++) {
        const functionalResult = window.powerTestResults.functionalTests[`power_${i}`];
        if (functionalResult) {
            const radioToCheck = document.querySelector(`input[name="functional_${i}"][value="${functionalResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }

        const savedVoltage = window.powerTestResults.voltageValues[`power_${i}`];
        if (savedVoltage) {
            const voltageInput = document.querySelector(`input[name="voltage_${i}"]`);
            if (voltageInput) voltageInput.value = savedVoltage;
        }
    }
}

// Select All button functionality
window.SelectAll = function() {
    const qualityRadioButtons = document.querySelectorAll('.quality-inspection input[type="radio"][value="OK"]');
    qualityRadioButtons.forEach(radio => {
        radio.checked = true;
    });

    const functionalRadioButtons = document.querySelectorAll('.functional-test input[type="radio"][value="OK"]');
    functionalRadioButtons.forEach(radio => {
        radio.checked = true;
    });
};

// Clear All button functionality
window.clearAll = function() {
    const qualityRadioButtons = document.querySelectorAll('.quality-inspection input[type="radio"][value="NO"]');
    qualityRadioButtons.forEach(radio => {
        radio.checked = true;
    });

    const functionalRadioButtons = document.querySelectorAll('.functional-test input[type="radio"][value="NO"]');
    functionalRadioButtons.forEach(radio => {
        radio.checked = true;
    });

    // Also clear voltage inputs
    const voltageInputs = document.querySelectorAll('.functional-test input[type="number"]');
    voltageInputs.forEach(input => {
        input.value = '';
    });
};

// Back button functionality
function goToPreviousPage() {
    savePowerTestData();
    window.location.href = 'SubrackInspection.html';
}

function goToNext() {
    // First validate the form
    if (!validatePowerSupplyInspection()) {
        alert('Please complete all required fields before continuing. All inspections must be marked OK and voltage values must be filled.');
        return; // Stop navigation if validation fails
    }
    
    // Save the data
    savePowerTestData();
    
    navigationGuard.markPageAsCompleted();
    window.location.href = 'FunctionalityProcessor.html';
}

// Validation function for power supply inspection
function validatePowerSupplyInspection() {
    let isValid = true;
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;
    
    // Reset all error styles first
    for (let i = 1; i <= powerCount; i++) {
        // Check quality inspection
        const qualityOK = document.querySelector(`input[name="quality_${i}"][value="OK"]`);
        const qualityNO = document.querySelector(`input[name="quality_${i}"][value="NO"]`);
        
        if (qualityNO && qualityNO.checked) {
            qualityNO.parentElement.style.border = '1px solid red';
            isValid = false;
        } else if (qualityOK) {
            qualityOK.parentElement.style.border = '';
        }
        
        // Check functional test
        const functionalOK = document.querySelector(`input[name="functional_${i}"][value="OK"]`);
        const functionalNO = document.querySelector(`input[name="functional_${i}"][value="NO"]`);
        
        if (functionalNO && functionalNO.checked) {
            functionalNO.parentElement.style.border = '1px solid red';
            isValid = false;
        } else if (functionalOK) {
            functionalOK.parentElement.style.border = '';
        }
        
        // Check voltage input
        const voltageInput = document.querySelector(`input[name="voltage_${i}"]`);
        if (voltageInput) {
            if (!voltageInput.value.trim()) {
                voltageInput.style.border = '1px solid red';
                isValid = false;
            } else {
                voltageInput.style.border = '';
            }
        }
    }
    
    return isValid;
}

// Remove the showCustomAlert function since we're using standard alert() now