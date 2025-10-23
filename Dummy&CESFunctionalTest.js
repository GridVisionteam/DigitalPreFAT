// Initialize with empty data structures
if (!window.dummyCesTestResults) window.dummyCesTestResults = {
    DummyBreakerCESFunctionalTest: {},
    BuzzerTest: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('dummyCesTestResults');
    if (savedResults) {
        window.dummyCesTestResults = JSON.parse(savedResults);
    }

    // Generate sections for Dummy Breaker & CES Functional Test
    generateDummyCesSections();

    // Load any saved data
    loadDummyCesTestData();
});

// Function to generate sections for Dummy Breaker & CES Functional Test
function generateDummyCesSections() {
    const container = document.getElementById('Dummy&CESFunctionalTestsection');
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    const section = document.createElement('div');
    section.className = 'dummy-ces-section';
    section.innerHTML = `
        <div class="dummy-ces-functional-test">
            <label>Dummy Breaker and CES Functional Test:</label>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">No.</th>
                        <th style="text-align: center;">Inspection</th>
                        <th style="text-align: center;">OK</th>
                        <th style="text-align: center;">NO</th>
                    </tr>
                </thead>
                <tbody id="DummyCesFunctionalTestTbody"></tbody>
            </table>
        </div>
        <div class="buzzer-test">
            <label>Buzzer Test</label>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">No.</th>
                        <th style="text-align: center;">Inspection</th>
                        <th style="text-align: center;">OK</th>
                        <th style="text-align: center;">NO</th>
                    </tr>
                </thead>
                <tbody id="BuzzerTestTbody"></tbody>
            </table>
        </div>
    `;
    container.appendChild(section);

    // Generate rows for both sections
    generateDummyCesFunctionalTestRows();
    generateBuzzerTestRows();
}

// Function to generate Dummy Breaker & CES Functional Test rows
function generateDummyCesFunctionalTestRows() {
    const tbody = document.getElementById('DummyCesFunctionalTestTbody');
    if (!tbody) return;

    // Test items for Dummy Breaker & CES Functional Test
    const testItems = [
        "<b>During CES ON:</b><br>Dummy Breaker LED turns GREEN when Dummy CB Open command is sent.",
        "<b>During CES ON:</b><br>Dummy Breaker LED turns RED when Dummy CB Close command is sent.",
        "<b>During CES OFF:</b><br>Dummy Breaker LED remain unchanged when Dummy CB Open command is sent.",
        "<b>During CES OFF:</b><br>Dummy Breaker LED remain unchanged when Dummy CB Close command is sent."
    ];

    testItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="dummy_ces_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="dummy_ces_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate Buzzer Test rows
function generateBuzzerTestRows() {
    const tbody = document.getElementById('BuzzerTestTbody');
    if (!tbody) return;

    // Test items for Buzzer Test
    const testItems = [
        "<b>During CES ON:</b><br>Close the Panel Door. No Buzzer should be triggered.",
        "<b>During CES OFF:</b><br>Close the Panel Door. Buzzer should be triggered."
    ];

    testItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="buzzer_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="buzzer_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save Dummy & CES test data
function saveDummyCesTestData() {
    // Ensure the test results object has the proper structure
    window.dummyCesTestResults = window.dummyCesTestResults || {
        DummyBreakerCESFunctionalTest: {},
        BuzzerTest: {}
    };

    // Save Dummy Breaker & CES Functional Test results (4 items)
    for (let itemNum = 1; itemNum <= 4; itemNum++) {
        const result = document.querySelector(`input[name="dummy_ces_${itemNum}"][value="OK"]:checked`) !== null ? 'OK' : 'NO';
        window.dummyCesTestResults.DummyBreakerCESFunctionalTest[`item_${itemNum}`] = result;
    }
    
    // Save Buzzer Test results (2 items)
    for (let itemNum = 1; itemNum <= 2; itemNum++) {
        const result = document.querySelector(`input[name="buzzer_${itemNum}"][value="OK"]:checked`) !== null ? 'OK' : 'NO';
        window.dummyCesTestResults.BuzzerTest[`item_${itemNum}`] = result;
    }

    // Save to session storage
    localStorage.setItem('dummyCesTestResults', JSON.stringify(window.dummyCesTestResults));
}

// Load Dummy & CES test data
function loadDummyCesTestData() {
    // Ensure we have a valid dummyCesTestResults object with the expected structure
    window.dummyCesTestResults = window.dummyCesTestResults || {
        DummyBreakerCESFunctionalTest: {},
        BuzzerTest: {}
    };

    // Load Dummy Breaker & CES Functional Test results (4 items) - Fixed from 7 to 4
    for (let itemNum = 1; itemNum <= 4; itemNum++) {
        const result = window.dummyCesTestResults.DummyBreakerCESFunctionalTest[`item_${itemNum}`];
        if (result) {
            const radioToCheck = document.querySelector(`input[name="dummy_ces_${itemNum}"][value="${result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
    
    // Load Buzzer Test results (2 items) - Fixed from 4 to 2
    for (let itemNum = 1; itemNum <= 2; itemNum++) {
        const result = window.dummyCesTestResults.BuzzerTest[`item_${itemNum}`];
        if (result) {
            const radioToCheck = document.querySelector(`input[name="buzzer_${itemNum}"][value="${result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Navigation functions
function goToPreviousPage() {
    saveDummyCesTestData();
    
    // Reset the DO module counter to the last DO module before navigating back
    const doModulesToTest = parseInt(localStorage.getItem('doModulesToTest')) || 0;
    window.currentDOModule = doModulesToTest;
    localStorage.setItem('currentDOModule', window.currentDOModule);
    
    window.location.href = 'FunctionalityDOPage.html';
}

function goToFunctionalityAI() {
    // First validate the form
    if (!validateDummyCesInspection()) {
        return;
    }
    
    saveDummyCesTestData();
    
    // Check if there are any AI modules to test
    const aiCount = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    
    if (aiCount > 0) {
        // Reset to first AI module
        window.currentAIModule = 1;
        localStorage.setItem('currentAIModule', window.currentAIModule);
        
        // Manually mark current page as completed
        localStorage.setItem('Dummy&CESFunctionalTest.html_completed', 'true');
        window.location.href = 'FunctionalityAIPage.html';
    } else {
        // Skip AI page if no AI modules
        // Manually mark both current page and AI page as completed
        localStorage.setItem('Dummy&CESFunctionalTest.html_completed', 'true');
        localStorage.setItem('FunctionalityAIPage.html_completed', 'true');
        window.location.href = 'RTUPowerUp.html';
    }
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

function validateDummyCesInspection() {
    let isValid = true;
    
    // Check Dummy Breaker & CES Functional Test items (4 items)
    for (let itemNum = 1; itemNum <= 4; itemNum++) {
        const dummyOK = document.querySelector(`input[name="dummy_ces_${itemNum}"][value="OK"]`);
        const dummyNO = document.querySelector(`input[name="dummy_ces_${itemNum}"][value="NO"]`);
        
        if (dummyNO && dummyNO.checked) {
            dummyNO.parentElement.style.border = '1px solid red';
            isValid = false;
        } else if (dummyOK) {
            dummyOK.parentElement.style.border = '';
        }
    }
    
    // Check Buzzer Test items (2 items)
    for (let itemNum = 1; itemNum <= 2; itemNum++) {
        const buzzerOK = document.querySelector(`input[name="buzzer_${itemNum}"][value="OK"]`);
        const buzzerNO = document.querySelector(`input[name="buzzer_${itemNum}"][value="NO"]`);
        
        if (buzzerNO && buzzerNO.checked) {
            buzzerNO.parentElement.style.border = '1px solid red';
            isValid = false;
        } else if (buzzerOK) {
            buzzerOK.parentElement.style.border = '';
        }
    }
    
    if (!isValid) {
        alert('Please complete all required fields before continuing. All inspections must be marked OK.');
    }
    
    return isValid;
}