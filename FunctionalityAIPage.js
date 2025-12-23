// File: FunctionalityAIPage.js
// Initialize with empty data structures
if (!window.aiTestResults) window.aiTestResults = {
    functionalTests: {}
};

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
            `Analog Input Module (${window.currentAIModule} of ${window.aiModulesToTest}) - Functionality Test`;
    }

    // Generate rows if not already present
    generateAIRows();

    // Load existing data if available
    if (window.aiTestResults[window.currentAIModule]) {
        loadAITestData(window.currentAIModule);
    } else {
        clearAllFunctionality();
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

        // Current test inputs - CHECKBOX
        row.innerHTML += `
            <td style="text-align: center;"><input type="checkbox" class="ai-test-input" name="AI_${window.currentAIModule}_0mA_${i + 1}"></td>
            <td style="text-align: center;"><input type="checkbox" class="ai-test-input" name="AI_${window.currentAIModule}_4mA_${i + 1}"></td>
            <td style="text-align: center;"><input type="checkbox" class="ai-test-input" name="AI_${window.currentAIModule}_8mA_${i + 1}"></td>
            <td style="text-align: center;"><input type="checkbox" class="ai-test-input" name="AI_${window.currentAIModule}_12mA_${i + 1}"></td>
            <td style="text-align: center;"><input type="checkbox" class="ai-test-input" name="AI_${window.currentAIModule}_16mA_${i + 1}"></td>
            <td style="text-align: center;"><input type="checkbox" class="ai-test-input" name="AI_${window.currentAIModule}_20mA_${i + 1}"></td>
        `;

        // Protocol inputs (keep as number type)
        row.innerHTML += `
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_IEC101_${i + 1}"></td>
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_IEC104_${i + 1}"></td>
            <td><input type="number" class="ai-test-input" name="AI_${window.currentAIModule}_DNP3_${i + 1}"></td>
        `;

        tableBody.appendChild(row);
    }
}

async function saveAndGoToNext() {
    // Validate all required inputs are filled
    if (!validateAIInputs()) {
        return;
    }

    // Validate IOA index fields for IEC101 and IEC104
    if (!validateAIIOAIndexFields()) {
        return; // Stop if validation fails
    }

    // Save the current module's test data
    saveAITestData(window.currentAIModule);
    
    // Move to next AI module
    window.currentAIModule++;
    localStorage.setItem('currentAIModule', window.currentAIModule);
    
    // Check if we have more AI modules to test
    if (window.currentAIModule > window.aiModulesToTest) {
        // All AI modules tested, go to next page
        try {
            // Reset to last module for consistency
            window.currentAIModule = window.aiModulesToTest;
            localStorage.setItem('currentAIModule', window.currentAIModule);
            
            // Mark AI page as completed
            if (typeof navigationGuard !== 'undefined') {
                navigationGuard.markPageAsCompleted();
            } else {
                localStorage.setItem('FunctionalityAIPage.html_completed', 'true');
            }
            
            // Go to next page
            window.location.href = 'VirtualAlarmTest.html';
        } catch (error) {
            console.error("Navigation failed:", error);
            showCustomAlert("Navigation failed: " + error.message);
        }
    } else {
        // More AI modules to test - show next AI module
        showFunctionalityAIPage();
    }
}

function saveAITestData(moduleNumber) {
    if (!window.aiTestResults[moduleNumber]) {
        window.aiTestResults[moduleNumber] = {
            currentValues: {},
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {}
        };
    }

    // Save all inputs
    const inputs = document.querySelectorAll("#tableBody input");
    
    // Save current test values (checkboxes)
    for (let i = 1; i <= 8; i++) {
        // Current test values (checkboxes)
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_0mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_0mA_${i}"]`)?.checked || false;
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_4mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_4mA_${i}"]`)?.checked || false;
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_8mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_8mA_${i}"]`)?.checked || false;
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_12mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_12mA_${i}"]`)?.checked || false;
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_16mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_16mA_${i}"]`)?.checked || false;
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_20mA_${i}`] = 
            document.querySelector(`input[name="AI_${moduleNumber}_20mA_${i}"]`)?.checked || false;
        
        // Protocol values (numbers)
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

    // Load current test values (checkboxes)
    for (let i = 1; i <= 8; i++) {
        // Current test values (checkboxes)
        const checkbox0mA = document.querySelector(`input[name="AI_${moduleNumber}_0mA_${i}"]`);
        const checkbox4mA = document.querySelector(`input[name="AI_${moduleNumber}_4mA_${i}"]`);
        const checkbox8mA = document.querySelector(`input[name="AI_${moduleNumber}_8mA_${i}"]`);
        const checkbox12mA = document.querySelector(`input[name="AI_${moduleNumber}_12mA_${i}"]`);
        const checkbox16mA = document.querySelector(`input[name="AI_${moduleNumber}_16mA_${i}"]`);
        const checkbox20mA = document.querySelector(`input[name="AI_${moduleNumber}_20mA_${i}"]`);
        
        if (checkbox0mA && saved.currentValues[`AI_${moduleNumber}_0mA_${i}`] !== undefined) {
            checkbox0mA.checked = saved.currentValues[`AI_${moduleNumber}_0mA_${i}`];
        }
        if (checkbox4mA && saved.currentValues[`AI_${moduleNumber}_4mA_${i}`] !== undefined) {
            checkbox4mA.checked = saved.currentValues[`AI_${moduleNumber}_4mA_${i}`];
        }
        if (checkbox8mA && saved.currentValues[`AI_${moduleNumber}_8mA_${i}`] !== undefined) {
            checkbox8mA.checked = saved.currentValues[`AI_${moduleNumber}_8mA_${i}`];
        }
        if (checkbox12mA && saved.currentValues[`AI_${moduleNumber}_12mA_${i}`] !== undefined) {
            checkbox12mA.checked = saved.currentValues[`AI_${moduleNumber}_12mA_${i}`];
        }
        if (checkbox16mA && saved.currentValues[`AI_${moduleNumber}_16mA_${i}`] !== undefined) {
            checkbox16mA.checked = saved.currentValues[`AI_${moduleNumber}_16mA_${i}`];
        }
        if (checkbox20mA && saved.currentValues[`AI_${moduleNumber}_20mA_${i}`] !== undefined) {
            checkbox20mA.checked = saved.currentValues[`AI_${moduleNumber}_20mA_${i}`];
        }
        
        // Protocol values (numbers)
        const inputIEC101 = document.querySelector(`input[name="AI_${moduleNumber}_IEC101_${i}"]`);
        const inputIEC104 = document.querySelector(`input[name="AI_${moduleNumber}_IEC104_${i}"]`);
        const inputDNP3 = document.querySelector(`input[name="AI_${moduleNumber}_DNP3_${i}"]`);
        
        if (inputIEC101 && saved.iec101Values[`AI_${moduleNumber}_IEC101_${i}`] !== undefined) {
            inputIEC101.value = saved.iec101Values[`AI_${moduleNumber}_IEC101_${i}`];
        }
        if (inputIEC104 && saved.iec104Values[`AI_${moduleNumber}_IEC104_${i}`] !== undefined) {
            inputIEC104.value = saved.iec104Values[`AI_${moduleNumber}_IEC104_${i}`];
        }
        if (inputDNP3 && saved.dnp3Values[`AI_${moduleNumber}_DNP3_${i}`] !== undefined) {
            inputDNP3.value = saved.dnp3Values[`AI_${moduleNumber}_DNP3_${i}`];
        }
    }
}

function goToPrevious() {
    // Save current test data before navigating
    saveAITestData(window.currentAIModule);
    
    // If we're on the first AI module, go back to previous page
    if (window.currentAIModule === 1) {
        if (typeof navigationGuard !== 'undefined') {
            navigationGuard.markPageAsCompleted();
        }
        window.location.href = 'Dummy&CESFunctionalTest.html';
        return;
    }
    
    // Go to previous AI module
    window.currentAIModule--;
    localStorage.setItem('currentAIModule', window.currentAIModule);
    
    // Show the previous AI module
    showFunctionalityAIPage();
}

function validateAIInputs() {
    let isValid = true;
    const inputs = document.querySelectorAll('.ai-test-input');
    const emptyInputs = [];
    
    inputs.forEach(input => {
        // Skip validation for DNP3 inputs
        if (input.name.includes('_DNP3_')) {
            // Remove any existing error styling
            input.parentElement.style.backgroundColor = '';
            input.parentElement.style.border = '';
            return;
        }
        
        // For checkbox inputs - validate if they are checked
        if (input.type === 'checkbox') {
            if (!input.checked) {
                // Apply more visible error styling to the parent cell
                input.parentElement.style.backgroundColor = '#ffebee';
                input.parentElement.style.border = '2px solid red';
                emptyInputs.push(input.name);
                isValid = false;
            } else {
                // Clear error styling
                input.parentElement.style.backgroundColor = '';
                input.parentElement.style.border = '';
            }
        }
        // For number inputs (protocol) - validate they have values
        else if (input.type === 'number' && !input.value.trim()) {
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#ffebee';
            emptyInputs.push(input.name);
            isValid = false;
        } else {
            input.style.border = '';
            input.style.backgroundColor = '';
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields before continuing. All checkboxes must be ticked and number fields must be filled.');
    }
    
    return isValid;
}

// Validate IOA index fields for IEC101 and IEC104 only
function validateAIIOAIndexFields() {
    // Get all IEC101 and IEC104 input fields
    const iec101Inputs = document.querySelectorAll('input[class*="ai-test-input"][name*="IEC101"]');
    const iec104Inputs = document.querySelectorAll('input[class*="ai-test-input"][name*="IEC104"]');
    
    let isValid = true;
    let duplicateFields = [];

    // Reset previous red borders
    [...iec101Inputs, ...iec104Inputs].forEach(input => {
        input.style.border = ''; // clear border
        input.style.backgroundColor = ''; // clear background
    });

    // Check for duplicate values in IEC101 column
    const iec101Values = Array.from(iec101Inputs).map(input => input.value.trim()).filter(val => val !== '');
    const iec101Duplicates = findDuplicates(iec101Values);
    if (iec101Duplicates.length > 0) {
        isValid = false;
        iec101Inputs.forEach(input => {
            if (iec101Duplicates.includes(input.value.trim())) {
                input.style.border = '2px solid red';
                input.style.backgroundColor = '#ffebee';
            }
        });
        duplicateFields.push(`IEC101: Duplicate values found (${iec101Duplicates.join(', ')})`);
    }

    // Check for duplicate values in IEC104 column
    const iec104Values = Array.from(iec104Inputs).map(input => input.value.trim()).filter(val => val !== '');
    const iec104Duplicates = findDuplicates(iec104Values);
    if (iec104Duplicates.length > 0) {
        isValid = false;
        iec104Inputs.forEach(input => {
            if (iec104Duplicates.includes(input.value.trim())) {
                input.style.border = '2px solid red';
                input.style.backgroundColor = '#ffebee';
            }
        });
        duplicateFields.push(`IEC104: Duplicate values found (${iec104Duplicates.join(', ')})`);
    }

    if (duplicateFields.length > 0) {
        alert(`Duplicate IOA index values found:\n${duplicateFields.join('\n')}\n\n`);
        return false;
    }

    return true;
}

// Helper function to find duplicate values in an array
function findDuplicates(arr) {
    const duplicates = [];
    const seen = {};
    
    arr.forEach(value => {
        if (seen[value]) {
            if (!duplicates.includes(value)) {
                duplicates.push(value);
            }
        } else {
            seen[value] = true;
        }
    });
    
    return duplicates;
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

    // Initialize module tracking
    window.aiModulesToTest = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    window.currentAIModule = parseInt(localStorage.getItem('currentAIModule')) || 1;
    
    // Initialize with AI page
    showFunctionalityAIPage();
});