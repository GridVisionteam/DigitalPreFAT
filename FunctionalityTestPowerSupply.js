// File: FunctionalityTestPowerSupply.js
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

    // Generate functionality test rows based on power count
    generateFunctionalityTestRows(powerCount);

    // Load any saved functionality test data
    loadFunctionalityTestData();
});

// Function to generate functionality test rows
function generateFunctionalityTestRows(count) {
    const functionalityTbody = document.getElementById('functionalityTableBody');
    if (!functionalityTbody) return;

    functionalityTbody.innerHTML = ''; // Clear existing rows

    if (count === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center;">No power supply modules configured</td>
        `;
        functionalityTbody.appendChild(row);
        return;
    }

    // Functionality Test items (same for all power supplies)
    const functionalityItems = [
        "Power Supply Module is in good condition. Both 5V and 3.3V LED light up."
    ];

    // Generate rows for each power supply
    for (let i = 1; i <= count; i++) {
        functionalityItems.forEach((item, index) => {
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
            functionalityTbody.appendChild(row);
        });
    }
}

// Save functionality test data
function saveFunctionalityTestData() {
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;
    
    // Ensure the test results object has the proper structure
    window.powerTestResults = window.powerTestResults || {};
    window.powerTestResults.functionalTests = window.powerTestResults.functionalTests || {};
    window.powerTestResults.voltageValues = window.powerTestResults.voltageValues || {};
    
    // Save functional test results and voltage values
    for (let i = 1; i <= powerCount; i++) {
        const functionalOK = document.querySelector(`input[name="functional_${i}"][value="OK"]:checked`) !== null;
        window.powerTestResults.functionalTests[`power_${i}`] = functionalOK ? 'OK' : 'NO';
        
        const voltageInput = document.querySelector(`input[name="voltage_${i}"]`);
        if (voltageInput) {
            window.powerTestResults.voltageValues[`power_${i}`] = voltageInput.value;
        }
    }

    // Save to local storage
    localStorage.setItem('powerTestResults', JSON.stringify(window.powerTestResults));
}

// Load functionality test data
function loadFunctionalityTestData() {
    // Ensure we have a valid powerTestResults object
    window.powerTestResults = window.powerTestResults || {};
    window.powerTestResults.functionalTests = window.powerTestResults.functionalTests || {};
    window.powerTestResults.voltageValues = window.powerTestResults.voltageValues || {};
    
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;

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

// Select All button functionality for functionality test
function selectAllFunctionality() {
    const functionalRadioButtons = document.querySelectorAll('.functional-test input[type="radio"][value="OK"]');
    functionalRadioButtons.forEach(radio => {
        radio.checked = true;
    });
}

// Clear All button functionality for functionality test
function clearAllFunctionality() {
    const functionalRadioButtons = document.querySelectorAll('.functional-test input[type="radio"][value="NO"]');
    functionalRadioButtons.forEach(radio => {
        radio.checked = true;
    });

    // Also clear voltage inputs
    const voltageInputs = document.querySelectorAll('.functional-test input[type="number"]');
    voltageInputs.forEach(input => {
        input.value = '';
    });
}

// Navigation functions
function goToQualityPage() {
    saveFunctionalityTestData();
    window.location.href = 'ParameterSettingIEC104.html';
}

function saveAndGoToProcessor() {
    // First validate the functionality test
    if (!validateFunctionalityTest()) {
        alert('Please complete all required fields before continuing. All tests must be marked OK and voltage values must be filled.');
        return;
    }
    
    // Save the functionality test data
    saveFunctionalityTestData();
    
    // Mark page as completed for navigation guard
    if (typeof navigationGuard !== 'undefined') {
        navigationGuard.markPageAsCompleted();
    }
    
    // Navigate to processor page
    window.location.href = 'FunctionalityTestProcessor.html';
}

// Validation function for functionality test
function validateFunctionalityTest() {
    let isValid = true;
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;
    
    // Reset all error styles first
    for (let i = 1; i <= powerCount; i++) {
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