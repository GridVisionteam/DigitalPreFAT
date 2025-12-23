// File: FunctionalityTestCOM6.js
// Initialize with empty data structures
if (!window.com6TestResults) window.com6TestResults = {
    qualityInspections: {},
    functionalTests: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the COM-6-A count from local storage
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
        // Ensure functional tests object exists
        window.com6TestResults.functionalTests = window.com6TestResults.functionalTests || {};
    }

    // Generate functionality test sections
    generateCom6Sections(com6Count);

    // Load any saved functionality test data
    loadFunctionalityTestData();
});

// Function to generate sections for each COM-6-A module (functionality only)
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
            <div class="functional-test">
                <label>Functionality Test - COM-6-A ${i}:</label>
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

        // Generate functional rows for this COM-6-A module
        generateFunctionalTestRows(i);
    }
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

// Save functionality test data only
function saveFunctionalityTestData() {
    const com6Count = parseInt(localStorage.getItem('comCount')) || 0;
    
    // Ensure the test results object has the proper structure
    window.com6TestResults = window.com6TestResults || {};
    window.com6TestResults.functionalTests = window.com6TestResults.functionalTests || {};
    
    // Save functional test results for each COM-6-A module
    for (let moduleNum = 1; moduleNum <= com6Count; moduleNum++) {
        // Functional test items (2 per module)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const functionalOK = document.querySelector(`input[name="functional_${moduleNum}_${itemNum}"][value="OK"]:checked`) !== null;
            window.com6TestResults.functionalTests[`com6_${moduleNum}_${itemNum}`] = functionalOK ? 'OK' : 'NO';
        }
    }

    // Save to local storage
    localStorage.setItem('com6TestResults', JSON.stringify(window.com6TestResults));
}

// Load functionality test data only
function loadFunctionalityTestData() {
    // Ensure we have a valid com6TestResults object
    window.com6TestResults = window.com6TestResults || {};
    window.com6TestResults.functionalTests = window.com6TestResults.functionalTests || {};
    
    const com6Count = parseInt(localStorage.getItem('comCount')) || 0;

    // Load functional test results for each COM-6-A module
    for (let moduleNum = 1; moduleNum <= com6Count; moduleNum++) {
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
}

// Navigation functions
function goToQualityPage() {
    saveFunctionalityTestData();
    window.location.href = 'FunctionalityTestProcessor.html';
}

function saveAndGoToDI() {
    // First validate the functionality test
    if (!validateFunctionalityTest()) {
        alert('Please complete all functionality tests before continuing. All tests must be marked OK.');
        return;
    }
    
    // Save the functionality test data
    saveFunctionalityTestData();
    
    // Mark page as completed for navigation guard
    if (typeof navigationGuard !== 'undefined') {
        navigationGuard.markPageAsCompleted();
    }
    
    // Navigate to DI page
    window.location.href = 'FunctionalityDIPage.html';
}

// Validation function for functionality test only
function validateFunctionalityTest() {
    let isValid = true;
    const com6Count = parseInt(localStorage.getItem('comCount')) || 0;
    
    // Reset all error styles first
    for (let moduleNum = 1; moduleNum <= com6Count; moduleNum++) {
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
    
    return isValid;
}