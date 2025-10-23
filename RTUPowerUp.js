// Initialize with empty data structures
if (!window.rtuPowerUpTestResults) window.rtuPowerUpTestResults = {
    RTUPowerUpTest: {},
    RTUPowerUpInspection: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('rtuPowerUpTestResults');
    if (savedResults) {
        window.rtuPowerUpTestResults = JSON.parse(savedResults);
    }

    // Generate sections for RTU Power Up Test
    generateRTUPowerUpSections();

    // Load any saved data
    loadRTUPowerUpTestData();
});

// Function to generate sections for RTU Power Up Test
function generateRTUPowerUpSections() {
    const container = document.getElementById('RTUPowerUpsection');
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    const section = document.createElement('div');
    section.className = 'rtu-powerup-section';
    section.innerHTML = `
        <div class="rtu-powerup-test">
            <label>RTU Power Up:</label>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">No.</th>
                        <th style="text-align: center;">Test Parameter</th>
                        <th style="text-align: center;">Actual Reading</th>
                        <th style="text-align: center;">OK</th>
                        <th style="text-align: center;">NO</th>
                    </tr>
                </thead>
                <tbody id="RTUPowerUpTestTbody"></tbody>
            </table>
        </div>
        <div class="rtu-powerup-inspection">
            <label>RTU Power Up Inspection:</label>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">No.</th>
                        <th style="text-align: center;">Inspection</th>
                        <th style="text-align: center;">OK</th>
                        <th style="text-align: center;">NO</th>
                    </tr>
                </thead>
                <tbody id="RTUPowerUpInspectionTbody"></tbody>
            </table>
        </div>
    `;
    container.appendChild(section);

    // Generate rows for both sections
    generateRTUPowerUpTestRows();
    generateRTUPowerUpInspectionRows();
}

// Function to generate RTU Power Up Test rows (voltage measurements)
function generateRTUPowerUpTestRows() {
    const tbody = document.getElementById('RTUPowerUpTestTbody');
    if (!tbody) return;

    const testItems = [
        "Panel Input Voltage (DC) = 110/48/30/24 Vdc",
        "Panel Input Voltage (AC) = 240 Vac"
    ];

    testItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <input type="number" id="voltage_${rowNumber}" name="voltage_${rowNumber}" class="voltage-input">
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="rtu_powerup_test_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="rtu_powerup_test_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate RTU Power Up Inspection rows (visual checks)
function generateRTUPowerUpInspectionRows() {
    const tbody = document.getElementById('RTUPowerUpInspectionTbody');
    if (!tbody) return;

    const testItems = [
        "The DC Lamp indication is 'ON' with GREEN LED.",
        "The Alarm Lamp indication is 'ON' with RED LED.",
        "The Dummy Breaker LED is 'OPEN = GREEN' or 'CLOSE = RED'.",
        "The panel light is 'ON' when door panel is opened. Panel light is 'OFF' when Door Switch is pressed.",
        "The 3 Pin 13A Socket is functional and can be used."
    ];

    testItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="rtu_powerup_inspect_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="rtu_powerup_inspect_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save RTU Power Up test data
function saveRTUPowerUpTestData() {
    // Ensure the test results object has the proper structure
    window.rtuPowerUpTestResults = window.rtuPowerUpTestResults || {
        RTUPowerUpTest: {},
        RTUPowerUpInspection: {}
    };

    // Save voltage test results (2 items)
    for (let itemNum = 1; itemNum <= 2; itemNum++) {
        const result = document.querySelector(`input[name="rtu_powerup_test_${itemNum}"][value="OK"]:checked`) !== null ? 'OK' : 'NO';
        const voltageValue = document.querySelector(`input[name="voltage_${itemNum}"]`)?.value || '';
        
        window.rtuPowerUpTestResults.RTUPowerUpTest[`item_${itemNum}`] = {
            result: result,
            voltage: voltageValue
        };
    }
    
    // Save inspection results (5 items)
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const result = document.querySelector(`input[name="rtu_powerup_inspect_${itemNum}"][value="OK"]:checked`) !== null ? 'OK' : 'NO';
        window.rtuPowerUpTestResults.RTUPowerUpInspection[`item_${itemNum}`] = result;
    }

    // Save to session storage
    localStorage.setItem('rtuPowerUpTestResults', JSON.stringify(window.rtuPowerUpTestResults));
}

// Load RTU Power Up test data
function loadRTUPowerUpTestData() {
    // Ensure we have a valid rtuPowerUpTestResults object with the expected structure
    window.rtuPowerUpTestResults = window.rtuPowerUpTestResults || {
        RTUPowerUpTest: {},
        RTUPowerUpInspection: {}
    };

    // Load voltage test results (2 items)
    for (let itemNum = 1; itemNum <= 2; itemNum++) {
        const savedItem = window.rtuPowerUpTestResults.RTUPowerUpTest[`item_${itemNum}`];
        if (savedItem) {
            const radioToCheck = document.querySelector(`input[name="rtu_powerup_test_${itemNum}"][value="${savedItem.result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
            
            const voltageInput = document.querySelector(`input[name="voltage_${itemNum}"]`);
            if (voltageInput && savedItem.voltage) voltageInput.value = savedItem.voltage;
        }
    }
    
    // Load inspection results (5 items)
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const result = window.rtuPowerUpTestResults.RTUPowerUpInspection[`item_${itemNum}`];
        if (result) {
            const radioToCheck = document.querySelector(`input[name="rtu_powerup_inspect_${itemNum}"][value="${result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Navigation functions
function goToPreviousPage() {
    saveRTUPowerUpTestData();

    // Check if there are any AI modules to test
    const aiCount = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    
    if (aiCount > 0) {
        // Reset AI module counter to the last AI module
        window.currentAIModule = aiCount;
        localStorage.setItem('currentAIModule', window.currentAIModule);
        
        // Manually mark current page as not completed (since we're going back)
        localStorage.removeItem('RTUPowerUp.html_completed');
        window.location.href = 'FunctionalityAIPage.html';
    } else {
        // If no AI modules, go directly to Dummy&CES page
        // Manually mark current page as not completed
        localStorage.removeItem('RTUPowerUp.html_completed');
        window.location.href = 'Dummy&CESFunctionalTest.html';
    }
}

function goToNext() {
    // First validate the form
    if (!validateRTUPowerUp()) {
        return; // Stop navigation if validation fails
    }
    
    saveRTUPowerUpTestData();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'ParameterSettingProc.html';
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
    
    // Also clear voltage input fields
    const voltageInputs = document.querySelectorAll('.voltage-input');
    voltageInputs.forEach(input => {
        input.value = '';
    });
}

function validateRTUPowerUp() {
    let isValid = true;
    
    // Reset all error styles first
    const allInputs = document.querySelectorAll('input[type="radio"], input[type="number"]');
    allInputs.forEach(input => {
        input.parentElement.style.border = '';
    });

    // Check voltage test items (2 items)
    for (let itemNum = 1; itemNum <= 2; itemNum++) {
        const voltageInput = document.querySelector(`input[name="voltage_${itemNum}"]`);
        const testOK = document.querySelector(`input[name="rtu_powerup_test_${itemNum}"][value="OK"]`);
        const testNO = document.querySelector(`input[name="rtu_powerup_test_${itemNum}"][value="NO"]`);
        
        // Check if voltage reading is provided if marked OK
        if (testOK && testOK.checked) {
            if (!voltageInput.value) {
                voltageInput.style.border = '1px solid red';
                isValid = false;
            }
        }
        
        // Highlight NO selections
        if (testNO && testNO.checked) {
            testNO.parentElement.style.border = '1px solid red';
            isValid = false;
        }
    }
    
    // Check inspection items (5 items)
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const inspectOK = document.querySelector(`input[name="rtu_powerup_inspect_${itemNum}"][value="OK"]`);
        const inspectNO = document.querySelector(`input[name="rtu_powerup_inspect_${itemNum}"][value="NO"]`);
        
        if (inspectNO && inspectNO.checked) {
            inspectNO.parentElement.style.border = '1px solid red';
            isValid = false;
        }
    }
    
    if (!isValid) {
        alert('Please complete all required fields before continuing. All tests must be marked OK and voltage readings must be provided.');
    }
    
    return isValid;
}