// Initialize with empty data structures
if (!window.aiTestResults) window.aiTestResults = {};

function showFunctionalityAIPage() {
    // Initialize module tracking
    window.aiModulesToTest = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    window.currentAIModule = parseInt(localStorage.getItem('currentAIModule')) || 1;
    
    // Set module info
    document.getElementById("aiNoInput").textContent = window.currentAIModule;
    
    // Update the title
    const titleElement = document.querySelector("#functionalityAIPage h1");
    if (titleElement) {
        titleElement.textContent = 
            `Analog Input Module (${window.currentAIModule} of ${window.aiModulesToTest})`;
    }

    // Generate rows if not already present
    generateAIRows();

    // Load existing data if available
    if (window.aiTestResults[window.currentAIModule]) {
        loadAITestData(window.currentAIModule);
    } else {
        clearAll();
    }
}

function generateAIRows() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        console.error("Table body not found - check HTML structure");
        return;
    }

    tableBody.innerHTML = '';

    for (let i = 0; i < 8; i++) {
        const row = document.createElement("tr");

        // Point number
        row.innerHTML += `<td>${i + 1}</td>`;

        // Add rowspan cell only for first row (will span 9 rows)
        if (i === 0) {
            row.innerHTML += `<td rowspan="9" style="text-align: center; vertical-align: middle;">Result</td>`;
        }

        // Current test inputs
        row.innerHTML += `
            <td ><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_0mA_${i + 1}"></td>
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_4mA_${i + 1}"></td>
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_8mA_${i + 1}"></td>
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_12mA_${i + 1}"></td>
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_16mA_${i + 1}"></td>
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_20mA_${i + 1}"></td>
        `;

        // Protocol inputs
        row.innerHTML += `
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_IEC101_${i + 1}"></td>
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_IEC104_${i + 1}"></td>
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_DNP3_${i + 1}"></td>
        `;

        tableBody.appendChild(row);
    }
}

async function handleAITestSubmission() {
    // First validate the quality inspection
    if (!validateAIQualityInspection()) {
        return; // Stop if validation fails
    }

    // Validate all required inputs are filled
    /*if (!validateAIInputs()) {
        return;
    }*/

    // Save the current module's test data
    saveAITestData(window.currentAIModule);
    
    window.currentAIModule++;
    localStorage.setItem('currentAIModule', window.currentAIModule);
    
    if (window.currentAIModule > window.aiModulesToTest) {
        try {            
            window.currentAIModule = window.aiModulesToTest;
            localStorage.setItem('currentAIModule', window.currentAIModule);
            
            // Manually mark AI page as completed
            localStorage.setItem('FunctionalityAIPage.html_completed', 'true');
            window.location.href = 'RTUPowerUp.html';
        } catch (error) {
            console.error("Navigation failed:", error);
            showCustomAlert("Navigation failed: " + error.message);
        }
    } else {
        showFunctionalityAIPage();
    }
}

function clearAll() {
    // Clear all inputs
    const inputs = document.querySelectorAll('.ai-test-input');
    inputs.forEach(input => {
        input.value = '';
    });
}

function saveAITestData(moduleNumber) {
    if (!window.aiTestResults[moduleNumber]) {
        window.aiTestResults[moduleNumber] = {
            inputs: [],
            currentValues: {},
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {},
            qualityInspections: {}
        };
    }

    // Save quality inspection results
    const quality1 = document.querySelector('input[name="quality1"][value="OK"]:checked') ? 'OK' : 'NO';
    const quality2 = document.querySelector('input[name="quality2"][value="OK"]:checked') ? 'OK' : 'NO';
    
    window.aiTestResults[moduleNumber].qualityInspections = {
        quality1,
        quality2
    };

    // Save all inputs
    const inputs = document.querySelectorAll("#tableBody input");
    window.aiTestResults[moduleNumber].inputs = Array.from(inputs).map(input => input.value);

    // Save current test values
    for (let i = 1; i <= 8; i++) {
        // Current test values
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_0mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_0mA_${i}"]`)?.value || '';
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_4mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_4mA_${i}"]`)?.value || '';
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_8mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_8mA_${i}"]`)?.value || '';
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_12mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_12mA_${i}"]`)?.value || '';
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_16mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_16mA_${i}"]`)?.value || '';
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_20mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_20mA_${i}"]`)?.value || '';
        
        // Protocol values
        window.aiTestResults[moduleNumber].iec101Values[`AI_${moduleNumber}_IEC101_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_IEC101_${i}"]`)?.value || '';
        window.aiTestResults[moduleNumber].iec104Values[`AI_${moduleNumber}_IEC104_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_IEC104_${i}"]`)?.value || '';
        window.aiTestResults[moduleNumber].dnp3Values[`AI_${moduleNumber}_DNP3_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_DNP3_${i}"]`)?.value || '';
    }

    localStorage.setItem('aiTestResults', JSON.stringify(window.aiTestResults));
}

function loadAITestData(moduleNumber) {
    const saved = window.aiTestResults[moduleNumber];
    if (!saved) return;

    // Load quality inspection values
    if (saved.qualityInspections) {
        const quality1OK = document.querySelector('input[name="quality1"][value="OK"]');
        const quality1NO = document.querySelector('input[name="quality1"][value="NO"]');
        const quality2OK = document.querySelector('input[name="quality2"][value="OK"]');
        const quality2NO = document.querySelector('input[name="quality2"][value="NO"]');
        
        if (quality1OK && quality1NO) {
            quality1OK.checked = saved.qualityInspections.quality1 === 'OK';
            quality1NO.checked = saved.qualityInspections.quality1 === 'NO';
        }
        
        if (quality2OK && quality2NO) {
            quality2OK.checked = saved.qualityInspections.quality2 === 'OK';
            quality2NO.checked = saved.qualityInspections.quality2 === 'NO';
        }
    }

    // Load all inputs
    const inputs = document.querySelectorAll("#tableBody input");
    saved.inputs.forEach((value, idx) => {
        const input = inputs[idx];
        if (input) input.value = value;
    });
}

function goToPreviousPage() {
    // Save current test data before navigating
    saveAITestData(window.currentAIModule);

    // If we're on the first module, go back to DO page
    if (window.currentAIModule === 1) {
        // Reset DO module counter to the last DO module
        const doModulesToTest = parseInt(localStorage.getItem('doModulesToTest')) || 0;
        window.currentDOModule = doModulesToTest;
        localStorage.setItem('currentDOModule', window.currentDOModule);
        
        window.location.href = 'Dummy&CESFunctionalTest.html';
        return;
    }

    // Go to previous module but ensure we don't go below 1
    window.currentAIModule = Math.max(1, window.currentAIModule - 1);
    localStorage.setItem('currentAIModule', window.currentAIModule);

    // Show the previous module
    showFunctionalityAIPage();
}

// Add validation functions similar to FunctionalityDIPage.js
function validateAIQualityInspection() {
    let isValid = true;
    
    // Reset all error styles first
    const quality1OK = document.querySelector('input[name="quality1"][value="OK"]');
    const quality1NO = document.querySelector('input[name="quality1"][value="NO"]');
    const quality2OK = document.querySelector('input[name="quality2"][value="OK"]');
    const quality2NO = document.querySelector('input[name="quality2"][value="NO"]');
    
    // Check if any quality inspection is not OK
    if ((quality1NO && quality1NO.checked) || !quality1OK?.checked) {
        if (quality1NO) quality1NO.parentElement.style.border = '1px solid red';
        isValid = false;
    } else {
        if (quality1OK) quality1OK.parentElement.style.border = '';
        if (quality1NO) quality1NO.parentElement.style.border = '';
    }
    
    if ((quality2NO && quality2NO.checked) || !quality2OK?.checked) {
        if (quality2NO) quality2NO.parentElement.style.border = '1px solid red';
        isValid = false;
    } else {
        if (quality2OK) quality2OK.parentElement.style.border = '';
        if (quality2NO) quality2NO.parentElement.style.border = '';
    }
    
    if (!isValid) {
        alert('Please complete all required fields before continuing. All quality inspections must be marked OK.');
    }
    
    return isValid;
}

function validateAIInputs() {
    let isValid = true;
    const inputs = document.querySelectorAll('.ai-test-input');
    const emptyInputs = [];
    
    // Check all inputs except DNP3
    inputs.forEach(input => {
        // Skip validation if this is a DNP3 input
        if (input.name.includes('_DNP3_')) {
            input.style.border = '';
            return; // skip this input
        }
        
        if (!input.value.trim()) {
            input.style.border = '1px solid red';
            emptyInputs.push(input.name);
            isValid = false;
        } else {
            input.style.border = '';
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields before continuing.');
    }
    
    return isValid;
}

function showCustomAlert(message) {
    const existingAlert = document.getElementById('customAlertBox');
    if (existingAlert) existingAlert.remove();
    const messageBox = document.createElement('div');
    messageBox.id = 'customAlertBox';
    messageBox.textContent = message;
    messageBox.style.cssText = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index:1001; text-align: center;";
    document.body.appendChild(messageBox);
    setTimeout(() => messageBox.remove(), 3000);
}

// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('aiTestResults');
    if (savedResults) {
        window.aiTestResults = JSON.parse(savedResults);
    }

    // Initialize with AI page
    showFunctionalityAIPage();
});