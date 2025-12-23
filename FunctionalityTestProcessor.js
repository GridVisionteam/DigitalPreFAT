// File: FunctionalityTestProcessor.js
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
        window.processorTestResults.functionalTests = window.processorTestResults.functionalTests || {};
        window.processorTestResults.iec101Tests = window.processorTestResults.iec101Tests || {};
        window.processorTestResults.iec104Tests = window.processorTestResults.iec104Tests || {};
    }

    // Generate functionality test sections
    generateProcessorSections(processorCount);
    generateIEC101InitializationRows();
    generateIEC104InitializationRows();

    // Load any saved functionality test data
    loadFunctionalityTestData();
});

// Function to generate sections for each processor (functionality only)
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
            <div class="functional-test">
                <label>Functionality Test - Processor ${i}:</label>
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

        // Generate functional rows for this processor
        generateFunctionalTestRows(i);
    }
}

// Function to generate functional test rows for a specific processor
function generateFunctionalTestRows(processorNum) {
    const tbody = document.getElementById(`functionalTbody_${processorNum}`);
    if (!tbody) return;

    // Functionality Test items
    const FunctionalTestItems = [
        "The PWR LED is permanently lights up.",
        "The RUN LED is blinking normally.",
        "Processor can be connected to maintenance tools.",
        `Firmware Version is <b>4.11.024 [24 Aug 2024]</b> for MCU-1-A or <b>4.02.008 [24 Nov 2023]</b> for MCU-4-A.`
    ];

    FunctionalTestItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="functional_${processorNum}_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="functional_${processorNum}_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate IEC101 Initialization rows
function generateIEC101InitializationRows() {
    const tbody = document.getElementById('IEC101Tbody');
    if (!tbody) return;
    
    // IEC101 Initialization items
    const IEC101InitializationItems = [
        "Send Link Status Request from ASE2000 to RTU. RTU should reply with Status of Link response.",
        "Send Reset Link Request from ASE2000 to RTU. RTU should reply with Ack/Fixed response.",
        "Send a Delay Acquisition Request from ASE2000 to RTU. RTU should reply with Delay Acquisition Response.",
        "Send a Clock Synchronization Request from ASE2000 to RTU. RTU should reply with Clock Synchronization Response.",
        "Send a Broadcast Clock Synchronization Request from ASE2000 to RTU using CASDU = 65535 and RTU should reply with Clock Synchronization Response.",
        "Send an Interrogation Request from ASE2000 to RTU. RTU shall report all signals mapped to Master (without time tag)."
    ];
    
    IEC101InitializationItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="IEC101_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="IEC101_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate IEC104 Initialization rows
function generateIEC104InitializationRows() {
    const tbody = document.getElementById('IEC104Tbody');
    if (!tbody) return;
    
    // IEC104 Initialization items
    const IEC104InitializationItems = [
        "Send STARTDT ACT from ASE2000 to RTU. RTU should reply with STARTDT CON.",
        "Send TESTFR ACT from ASE2000 to RTU. RTU should reply with TESTFR CON.",
        "Send a Clock Synchronization Request from ASE2000 to RTU. RTU should reply with Clock Synchronization Response.",
        "Send a Broadcast Clock Synchronization Request from ASE2000 to RTU using CASDU = 65535 and RTU should reply with Clock Synchronization Response.",
        "Send an Interrogation Request from ASE2000 to RTU. RTU shall report all signals mapped to Master (without time tag)."
    ];
    
    IEC104InitializationItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="IEC104_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="IEC104_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save functionality test data (including IEC tests)
function saveFunctionalityTestData() {
    const processorCount = parseInt(localStorage.getItem('processorCount')) || 0;
    
    // Ensure the test results object has the proper structure
    window.processorTestResults = window.processorTestResults || {};
    window.processorTestResults.functionalTests = window.processorTestResults.functionalTests || {};
    window.processorTestResults.iec101Tests = window.processorTestResults.iec101Tests || {};
    window.processorTestResults.iec104Tests = window.processorTestResults.iec104Tests || {};
    
    // Save functional test results for each processor
    for (let procNum = 1; procNum <= processorCount; procNum++) {
        // Functional test items (4 per processor)
        for (let itemNum = 1; itemNum <= 4; itemNum++) {
            const functionalOK = document.querySelector(`input[name="functional_${procNum}_${itemNum}"][value="OK"]:checked`) !== null;
            window.processorTestResults.functionalTests[`proc_${procNum}_${itemNum}`] = functionalOK ? 'OK' : 'NO';
        }
    }
    
    // Save IEC101 test data
    for (let itemNum = 1; itemNum <= 6; itemNum++) {
        const iec101OK = document.querySelector(`input[name="IEC101_${itemNum}"][value="OK"]:checked`) !== null;
        window.processorTestResults.iec101Tests[`item_${itemNum}`] = iec101OK ? 'OK' : 'NO';
    }
    
    // Save IEC104 test data
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const iec104OK = document.querySelector(`input[name="IEC104_${itemNum}"][value="OK"]:checked`) !== null;
        window.processorTestResults.iec104Tests[`item_${itemNum}`] = iec104OK ? 'OK' : 'NO';
    }

    // Save to local storage
    localStorage.setItem('processorTestResults', JSON.stringify(window.processorTestResults));
}

// Load functionality test data (including IEC tests)
function loadFunctionalityTestData() {
    // Ensure we have a valid processorTestResults object
    window.processorTestResults = window.processorTestResults || {};
    window.processorTestResults.functionalTests = window.processorTestResults.functionalTests || {};
    window.processorTestResults.iec101Tests = window.processorTestResults.iec101Tests || {};
    window.processorTestResults.iec104Tests = window.processorTestResults.iec104Tests || {};
    
    const processorCount = parseInt(localStorage.getItem('processorCount')) || 0;

    // Load functional test results for each processor
    for (let procNum = 1; procNum <= processorCount; procNum++) {
        // Functional test items (4 per processor)
        for (let itemNum = 1; itemNum <= 4; itemNum++) {
            const functionalResult = window.processorTestResults.functionalTests[`proc_${procNum}_${itemNum}`];
            if (functionalResult) {
                const radioToCheck = document.querySelector(`input[name="functional_${procNum}_${itemNum}"][value="${functionalResult}"]`);
                if (radioToCheck) radioToCheck.checked = true;
            }
        }
    }
    
    // Load IEC101 test data
    for (let itemNum = 1; itemNum <= 6; itemNum++) {
        const iec101Result = window.processorTestResults.iec101Tests[`item_${itemNum}`];
        if (iec101Result) {
            const radioToCheck = document.querySelector(`input[name="IEC101_${itemNum}"][value="${iec101Result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
    
    // Load IEC104 test data
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const iec104Result = window.processorTestResults.iec104Tests[`item_${itemNum}`];
        if (iec104Result) {
            const radioToCheck = document.querySelector(`input[name="IEC104_${itemNum}"][value="${iec104Result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Select All button functionality for functionality test
function selectAllFunctionality() {
    const functionalRadioButtons = document.querySelectorAll('.functional-test input[type="radio"][value="OK"]');
    functionalRadioButtons.forEach(radio => {
        radio.checked = true;
    });
    
    const iec101RadioButtons = document.querySelectorAll('.IEC101-Initialization input[type="radio"][value="OK"]');
    iec101RadioButtons.forEach(radio => {
        radio.checked = true;
    });
    
    const iec104RadioButtons = document.querySelectorAll('.IEC104-Initialization input[type="radio"][value="OK"]');
    iec104RadioButtons.forEach(radio => {
        radio.checked = true;
    });
}

// Clear All button functionality for functionality test
function clearAllFunctionality() {
    const functionalRadioButtons = document.querySelectorAll('.functional-test input[type="radio"][value="NO"]');
    functionalRadioButtons.forEach(radio => {
        radio.checked = true;
    });
    
    const iec101RadioButtons = document.querySelectorAll('.IEC101-Initialization input[type="radio"][value="NO"]');
    iec101RadioButtons.forEach(radio => {
        radio.checked = true;
    });
    
    const iec104RadioButtons = document.querySelectorAll('.IEC104-Initialization input[type="radio"][value="NO"]');
    iec104RadioButtons.forEach(radio => {
        radio.checked = true;
    });
}

// Navigation functions
function goToQualityPage() {
    saveFunctionalityTestData();
    window.location.href = 'FunctionalityTestPowerSupply.html';
}

function goToNext() {
    // First validate the functionality test
    if (!validateFunctionalityTest()) {
        alert('Please complete all required fields before continuing. All tests must be marked OK.');
        return;
    }
    
    // Save the functionality test data
    saveFunctionalityTestData();
    
    // Mark page as completed for navigation guard
    if (typeof navigationGuard !== 'undefined') {
        navigationGuard.markPageAsCompleted();
    }
    
    // Navigate to COM6 page
    window.location.href = 'FunctionalityTestCOM6.html';
}

// Validation function for functionality test (including IEC tests)
function validateFunctionalityTest() {
    let isValid = true;
    const processorCount = parseInt(localStorage.getItem('processorCount')) || 0;
    
    // Reset all error styles first
    for (let procNum = 1; procNum <= processorCount; procNum++) {
        // Check functional test items (4 per processor)
        for (let itemNum = 1; itemNum <= 4; itemNum++) {
            const functionalOK = document.querySelector(`input[name="functional_${procNum}_${itemNum}"][value="OK"]`);
            const functionalNO = document.querySelector(`input[name="functional_${procNum}_${itemNum}"][value="NO"]`);
            
            if (functionalNO && functionalNO.checked) {
                functionalNO.parentElement.style.border = '1px solid red';
                isValid = false;
            } else if (functionalOK) {
                functionalOK.parentElement.style.border = '';
            }
        }
    }
    
    // Check IEC101 tests (6 items)
    for (let itemNum = 1; itemNum <= 6; itemNum++) {
        const iec101OK = document.querySelector(`input[name="IEC101_${itemNum}"][value="OK"]`);
        const iec101NO = document.querySelector(`input[name="IEC101_${itemNum}"][value="NO"]`);
        
        if (iec101NO && iec101NO.checked) {
            iec101NO.parentElement.style.border = '1px solid red';
            isValid = false;
        } else if (iec101OK) {
            iec101OK.parentElement.style.border = '';
        }
    }
    
    // Check IEC104 tests (5 items)
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const iec104OK = document.querySelector(`input[name="IEC104_${itemNum}"][value="OK"]`);
        const iec104NO = document.querySelector(`input[name="IEC104_${itemNum}"][value="NO"]`);
        
        if (iec104NO && iec104NO.checked) {
            iec104NO.parentElement.style.border = '1px solid red';
            isValid = false;
        } else if (iec104OK) {
            iec104OK.parentElement.style.border = '';
        }
    }
    
    return isValid;
}