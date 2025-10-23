// Initialize with empty data structures
if (!window.processorTestResults) window.processorTestResults = {
    qualityInspections: {},
    functionalTests: {},
    iec101Tests: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the processor count from session storage
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
        window.processorTestResults.functionalTests = window.processorTestResults.functionalTests || {};
        window.processorTestResults.iec101Tests = window.processorTestResults.iec101Tests || {};
        window.processorTestResults.iec104Tests = window.processorTestResults.iec104Tests || {};
    } else {
        // Initialize fresh structure if no saved results
        window.processorTestResults = {
            qualityInspections: {},
            functionalTests: {},
            iec101Tests: {},
            iec104Tests: {}
        };
    }

    // Generate sections
    generateProcessorSections(processorCount);
    generateIEC101InitializationRows();
    generateIEC104InitializationRows();

    // Load any saved data
    loadProcessorTestData();
});

// Function to generate sections for each processor
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

        // Generate rows for this processor
        generateQualityInspectionRows(i);
        generateFunctionalTestRows(i);
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
    const tbody = document.getElementById(`IEC101Tbody`);
    if (!tbody) return;
    // IEC101 Initialization items
    const IEC101InitializationItems = [
        "Send Link Status Request from ASE2000 to RTU. RTU should reply with Status of Link response. ",
        "Send Reset Link Request from ASE2000 to RTU. RTU should reply with Ack/Fixed response.",
        "Send a Delay Acquisition Request from ASE2000 to RTU. RTU should reply with Delay Acquisition Response. ",
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
    const tbody = document.getElementById(`IEC104Tbody`);
    if (!tbody) return;
    // IEC104 Initialization items
    const IEC104InitializationItems = [
        "Send STARTDT ACT from ASE2000 to RTU. RTU should reply with STARTDT CON. ",
        "Send TESTFR ACT from ASE2000 to RTU. RTU should reply with TESTFR CON. ",
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

// Save processor test data
function saveProcessorTestData() {
    const processorCount = parseInt(localStorage.getItem('processorCount')) || 0;
    
    // Ensure the test results object has the proper structure
    window.processorTestResults = window.processorTestResults || {};
    window.processorTestResults.qualityInspections = window.processorTestResults.qualityInspections || {};
    window.processorTestResults.functionalTests = window.processorTestResults.functionalTests || {};
    window.processorTestResults.iec101Tests = window.processorTestResults.iec101Tests || {};
    window.processorTestResults.iec104Tests = window.processorTestResults.iec104Tests || {};

    // Save quality inspection results for each processor
    for (let procNum = 1; procNum <= processorCount; procNum++) {
        // Quality inspection items (2 per processor)
        for (let itemNum = 1; itemNum <= 2; itemNum++) {
            const qualityOK = document.querySelector(`input[name="quality_${procNum}_${itemNum}"][value="OK"]:checked`) !== null;
            window.processorTestResults.qualityInspections[`proc_${procNum}_${itemNum}`] = qualityOK ? 'OK' : 'NO';
        }
        
        // Functional test items (4 per processor)
        for (let itemNum = 1; itemNum <= 4; itemNum++) {
            const functionalOK = document.querySelector(`input[name="functional_${procNum}_${itemNum}"][value="OK"]:checked`) !== null;
            window.processorTestResults.functionalTests[`proc_${procNum}_${itemNum}`] = functionalOK ? 'OK' : 'NO';
        }
    }
    saveIEC101TestData();
    saveIEC104TestData(); 
    // Save to session storage
    localStorage.setItem('processorTestResults', JSON.stringify(window.processorTestResults));
}

function saveIEC101TestData() {
    window.processorTestResults.iec101Tests = window.processorTestResults.iec101Tests || {};
    
    // IEC101 Initialization has 6 items
    for (let itemNum = 1; itemNum <= 6; itemNum++) {
        const iec101OK = document.querySelector(`input[name="IEC101_${itemNum}"][value="OK"]:checked`) !== null;
        window.processorTestResults.iec101Tests[`item_${itemNum}`] = iec101OK ? 'OK' : 'NO';
    }
}

function saveIEC104TestData() {
    window.processorTestResults.iec104Tests = window.processorTestResults.iec104Tests || {};
    
    // IEC104 Initialization has 5 items
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const iec104OK = document.querySelector(`input[name="IEC104_${itemNum}"][value="OK"]:checked`) !== null;
        window.processorTestResults.iec104Tests[`item_${itemNum}`] = iec104OK ? 'OK' : 'NO';
    }
}

// Load processor test data
function loadProcessorTestData() {
    // Ensure we have a valid processorTestResults object with the expected structure
    window.processorTestResults = window.processorTestResults || {};
    window.processorTestResults.qualityInspections = window.processorTestResults.qualityInspections || {};
    window.processorTestResults.functionalTests = window.processorTestResults.functionalTests || {};
    window.processorTestResults.iec101Tests = window.processorTestResults.iec101Tests || {}; 
    window.processorTestResults.iec104Tests = window.processorTestResults.iec104Tests || {};
    
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
        
        // Functional test items (4 per processor)
        for (let itemNum = 1; itemNum <= 4; itemNum++) {
            const functionalResult = window.processorTestResults.functionalTests[`proc_${procNum}_${itemNum}`];
            if (functionalResult) {
                const radioToCheck = document.querySelector(`input[name="functional_${procNum}_${itemNum}"][value="${functionalResult}"]`);
                if (radioToCheck) radioToCheck.checked = true;
            }
        }
    }
    loadIEC101TestData();
    loadIEC104TestData();
}

function loadIEC101TestData() {
    window.processorTestResults.iec101Tests = window.processorTestResults.iec101Tests || {};
    
    // IEC101 Initialization has 6 items
    for (let itemNum = 1; itemNum <= 6; itemNum++) {
        const iec101Result = window.processorTestResults.iec101Tests[`item_${itemNum}`];
        if (iec101Result) {
            const radioToCheck = document.querySelector(`input[name="IEC101_${itemNum}"][value="${iec101Result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

function loadIEC104TestData() {
    window.processorTestResults.iec104Tests = window.processorTestResults.iec104Tests || {};
    
    // IEC104 Initialization has 5 items
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const iec104Result = window.processorTestResults.iec104Tests[`item_${itemNum}`];
        if (iec104Result) {
            const radioToCheck = document.querySelector(`input[name="IEC104_${itemNum}"][value="${iec104Result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Update navigation functions
function goToPreviousPage() {
    saveProcessorTestData();
    window.location.href = 'FunctionalityPowerSupply.html';
}

function validateProcessorInspection() {
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
    
    if (!isValid) {
        alert('Please complete all required fields before continuing. All inspections must be marked OK.');
    }
    
    return isValid;
}

// Update the goToNext function to include validation
function goToNext() {
    // First validate the form
    if (!validateProcessorInspection()) {
        return; // Stop navigation if validation fails
    }
    
    // Save the data
    saveProcessorTestData();
    
    navigationGuard.markPageAsCompleted();
    window.location.href = 'FunctionalityCOM6.html';
}

// You'll need to update these functions to handle multiple processors
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
