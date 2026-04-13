// File: FunctionalityAIPage.js
// Initialize with empty data structures
if (!window.aiTestResults) window.aiTestResults = {
    functionalTests: {}
};

function showFunctionalityAIPage() {
    // Initialize module tracking
    window.aiModulesToTest = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    window.currentAIModule = parseInt(localStorage.getItem('currentAIModule')) || 1;
    
    // Ensure aiTestResults exists for the current module
    if (!window.aiTestResults[window.currentAIModule]) {
        window.aiTestResults[window.currentAIModule] = {
            numericValues: {},
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {}
        };
    }
    
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
    
    // Add input restrictions for IOA fields
    addAIIOAInputRestrictions();
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
        row.innerHTML += `<td style="font-weight: bold;">${i + 1}</td>`;

        // Add rowspan cell only for first row (will span 9 rows)
        if (i === 0) {
            row.innerHTML += `<td rowspan="9" style="text-align: center; vertical-align: middle;">Result</td>`;
        }

        // Current test inputs - NUMBER INPUTS (replacing checkboxes)
        row.innerHTML += `
            <td style="text-align: center;"><input type="number" step="any" class="ai-test-input ai-number-input" name="AI_${window.currentAIModule}_0mA_${i + 1}" placeholder="Value"></td>
            <td style="text-align: center;"><input type="number" step="any" class="ai-test-input ai-number-input" name="AI_${window.currentAIModule}_4mA_${i + 1}" placeholder="Value"></td>
            <td style="text-align: center;"><input type="number" step="any" class="ai-test-input ai-number-input" name="AI_${window.currentAIModule}_8mA_${i + 1}" placeholder="Value"></td>
            <td style="text-align: center;"><input type="number" step="any" class="ai-test-input ai-number-input" name="AI_${window.currentAIModule}_12mA_${i + 1}" placeholder="Value"></td>
            <td style="text-align: center;"><input type="number" step="any" class="ai-test-input ai-number-input" name="AI_${window.currentAIModule}_16mA_${i + 1}" placeholder="Value"></td>
            <td style="text-align: center;"><input type="number" step="any" class="ai-test-input ai-number-input" name="AI_${window.currentAIModule}_20mA_${i + 1}" placeholder="Value"></td>
        `;

        // Protocol inputs (allow dash, with input restrictions)
        row.innerHTML += `
            <td><input type="text" class="ai-test-input ai-ioa-input" name="AI_${window.currentAIModule}_IEC101_${i + 1}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="ai-test-input ai-ioa-input" name="AI_${window.currentAIModule}_IEC104_${i + 1}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="ai-test-input ai-ioa-input" name="AI_${window.currentAIModule}_DNP3_${i + 1}" placeholder="Enter IOA or -"></td>
        `;

        tableBody.appendChild(row);
    }
}

async function saveAndGoToNext() {
    // Validate all number fields are filled
    /*if (!validateAINumberFields()) {
        return;
    }*/

    // Validate all required inputs are filled
    if (!validateAIInputs()) {
        return;
    }

    // Validate IOA index fields for IEC101 and IEC104
    if (!validateAIIOAIndexFields()) {
        return;
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
    // Initialize the module object if it doesn't exist
    if (!window.aiTestResults[moduleNumber]) {
        window.aiTestResults[moduleNumber] = {
            numericValues: {},
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {}
        };
    }

    // Ensure all required objects exist
    if (!window.aiTestResults[moduleNumber].numericValues) {
        window.aiTestResults[moduleNumber].numericValues = {};
    }
    if (!window.aiTestResults[moduleNumber].iec101Values) {
        window.aiTestResults[moduleNumber].iec101Values = {};
    }
    if (!window.aiTestResults[moduleNumber].iec104Values) {
        window.aiTestResults[moduleNumber].iec104Values = {};
    }
    if (!window.aiTestResults[moduleNumber].dnp3Values) {
        window.aiTestResults[moduleNumber].dnp3Values = {};
    }

    // Save all inputs
    for (let i = 1; i <= 8; i++) {
        // Numeric test values - save to both formats for compatibility
        const input0mA = document.querySelector(`input[name="AI_${moduleNumber}_0mA_${i}"]`);
        const input4mA = document.querySelector(`input[name="AI_${moduleNumber}_4mA_${i}"]`);
        const input8mA = document.querySelector(`input[name="AI_${moduleNumber}_8mA_${i}"]`);
        const input12mA = document.querySelector(`input[name="AI_${moduleNumber}_12mA_${i}"]`);
        const input16mA = document.querySelector(`input[name="AI_${moduleNumber}_16mA_${i}"]`);
        const input20mA = document.querySelector(`input[name="AI_${moduleNumber}_20mA_${i}"]`);
        
        const val0mA = input0mA ? input0mA.value : '';
        const val4mA = input4mA ? input4mA.value : '';
        const val8mA = input8mA ? input8mA.value : '';
        const val12mA = input12mA ? input12mA.value : '';
        const val16mA = input16mA ? input16mA.value : '';
        const val20mA = input20mA ? input20mA.value : '';
        
        // Save to numericValues (new format)
        window.aiTestResults[moduleNumber].numericValues[`AI_${moduleNumber}_0mA_${i}`] = val0mA;
        window.aiTestResults[moduleNumber].numericValues[`AI_${moduleNumber}_4mA_${i}`] = val4mA;
        window.aiTestResults[moduleNumber].numericValues[`AI_${moduleNumber}_8mA_${i}`] = val8mA;
        window.aiTestResults[moduleNumber].numericValues[`AI_${moduleNumber}_12mA_${i}`] = val12mA;
        window.aiTestResults[moduleNumber].numericValues[`AI_${moduleNumber}_16mA_${i}`] = val16mA;
        window.aiTestResults[moduleNumber].numericValues[`AI_${moduleNumber}_20mA_${i}`] = val20mA;
        
        // Also save to currentValues for backward compatibility
        if (!window.aiTestResults[moduleNumber].currentValues) {
            window.aiTestResults[moduleNumber].currentValues = {};
        }
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_0mA_${i}`] = val0mA;
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_4mA_${i}`] = val4mA;
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_8mA_${i}`] = val8mA;
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_12mA_${i}`] = val12mA;
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_16mA_${i}`] = val16mA;
        window.aiTestResults[moduleNumber].currentValues[`AI_${moduleNumber}_20mA_${i}`] = val20mA;
        
        // Protocol values
        const inputIEC101 = document.querySelector(`input[name="AI_${moduleNumber}_IEC101_${i}"]`);
        const inputIEC104 = document.querySelector(`input[name="AI_${moduleNumber}_IEC104_${i}"]`);
        const inputDNP3 = document.querySelector(`input[name="AI_${moduleNumber}_DNP3_${i}"]`);
        
        if (inputIEC101) window.aiTestResults[moduleNumber].iec101Values[`AI_${moduleNumber}_IEC101_${i}`] = inputIEC101.value || '';
        if (inputIEC104) window.aiTestResults[moduleNumber].iec104Values[`AI_${moduleNumber}_IEC104_${i}`] = inputIEC104.value || '';
        if (inputDNP3) window.aiTestResults[moduleNumber].dnp3Values[`AI_${moduleNumber}_DNP3_${i}`] = inputDNP3.value || '';
    }

    localStorage.setItem('aiTestResults', JSON.stringify(window.aiTestResults));
}

function loadAITestData(moduleNumber) {
    const saved = window.aiTestResults[moduleNumber];
    if (!saved) return;

    // Check which structure we have (supports both old and new formats)
    const numericData = saved.numericValues || saved.currentValues || {};
    
    // Load numeric test values (0mA through 20mA)
    for (let i = 1; i <= 8; i++) {
        const input0mA = document.querySelector(`input[name="AI_${moduleNumber}_0mA_${i}"]`);
        const input4mA = document.querySelector(`input[name="AI_${moduleNumber}_4mA_${i}"]`);
        const input8mA = document.querySelector(`input[name="AI_${moduleNumber}_8mA_${i}"]`);
        const input12mA = document.querySelector(`input[name="AI_${moduleNumber}_12mA_${i}"]`);
        const input16mA = document.querySelector(`input[name="AI_${moduleNumber}_16mA_${i}"]`);
        const input20mA = document.querySelector(`input[name="AI_${moduleNumber}_20mA_${i}"]`);
        
        // For numeric values - if it's a boolean from old data, convert to empty string
        let val0mA = numericData[`AI_${moduleNumber}_0mA_${i}`];
        let val4mA = numericData[`AI_${moduleNumber}_4mA_${i}`];
        let val8mA = numericData[`AI_${moduleNumber}_8mA_${i}`];
        let val12mA = numericData[`AI_${moduleNumber}_12mA_${i}`];
        let val16mA = numericData[`AI_${moduleNumber}_16mA_${i}`];
        let val20mA = numericData[`AI_${moduleNumber}_20mA_${i}`];
        
        // Convert boolean to empty string (old data compatibility)
        if (typeof val0mA === 'boolean') val0mA = '';
        if (typeof val4mA === 'boolean') val4mA = '';
        if (typeof val8mA === 'boolean') val8mA = '';
        if (typeof val12mA === 'boolean') val12mA = '';
        if (typeof val16mA === 'boolean') val16mA = '';
        if (typeof val20mA === 'boolean') val20mA = '';
        
        if (input0mA && val0mA !== undefined) input0mA.value = val0mA;
        if (input4mA && val4mA !== undefined) input4mA.value = val4mA;
        if (input8mA && val8mA !== undefined) input8mA.value = val8mA;
        if (input12mA && val12mA !== undefined) input12mA.value = val12mA;
        if (input16mA && val16mA !== undefined) input16mA.value = val16mA;
        if (input20mA && val20mA !== undefined) input20mA.value = val20mA;
        
        // Protocol values - these should load correctly
        const inputIEC101 = document.querySelector(`input[name="AI_${moduleNumber}_IEC101_${i}"]`);
        const inputIEC104 = document.querySelector(`input[name="AI_${moduleNumber}_IEC104_${i}"]`);
        const inputDNP3 = document.querySelector(`input[name="AI_${moduleNumber}_DNP3_${i}"]`);
        
        if (inputIEC101 && saved.iec101Values && saved.iec101Values[`AI_${moduleNumber}_IEC101_${i}`] !== undefined) {
            inputIEC101.value = saved.iec101Values[`AI_${moduleNumber}_IEC101_${i}`];
        }
        if (inputIEC104 && saved.iec104Values && saved.iec104Values[`AI_${moduleNumber}_IEC104_${i}`] !== undefined) {
            inputIEC104.value = saved.iec104Values[`AI_${moduleNumber}_IEC104_${i}`];
        }
        if (inputDNP3 && saved.dnp3Values && saved.dnp3Values[`AI_${moduleNumber}_DNP3_${i}`] !== undefined) {
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
    
    // Ensure aiTestResults exists for the new module
    if (!window.aiTestResults[window.currentAIModule]) {
        window.aiTestResults[window.currentAIModule] = {
            numericValues: {},
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {}
        };
    }
    
    // Show the previous AI module
    showFunctionalityAIPage();
}

// NEW VALIDATION: Check all number fields are filled
function validateAINumberFields() {
    let allFilled = true;
    const numberInputs = document.querySelectorAll('#functionalityAIPage input.ai-number-input');
    const emptyInputs = [];
    
    numberInputs.forEach(input => {
        const value = input.value.trim();
        if (value === "") {
            allFilled = false;
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#ffebee';
            emptyInputs.push(input);
        } else if (isNaN(parseFloat(value))) {
            allFilled = false;
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#ffebee';
            emptyInputs.push(input);
        } else {
            input.style.border = '';
            input.style.backgroundColor = '';
        }
    });
    
    if (!allFilled) {
        if (emptyInputs.length > 0) {
            emptyInputs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        showCustomAlert('Please fill in all numeric test fields (0mA through 20mA) for all channels before continuing.');
    }
    
    return allFilled;
}

function validateAIInputs() {
    let isValid = true;
    // Only validate IOA text inputs (skip number inputs and DNP3)
    const textInputs = document.querySelectorAll('.ai-ioa-input');
    const emptyInputs = [];
    
    textInputs.forEach(input => {
        // Skip DNP3 validation
        if (input.name.includes('_DNP3_')) {
            input.style.border = '';
            input.style.backgroundColor = '';
            return;
        }
        
        // For text inputs (IOA) - validate they have values (allows dash)
        if (!input.value.trim()) {
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#ffebee';
            emptyInputs.push(input);
            isValid = false;
        } else {
            input.style.border = '';
            input.style.backgroundColor = '';
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required IOA/Index fields (IEC101/IEC104) before continuing (use "-" for empty fields).');
    }
    
    return isValid;
}

function validateAIIOAIndexFields() {
    // 1. Determine current page and scope
    const aiPage = document.getElementById('functionalityAIPage');
    if (!aiPage || aiPage.style.display === 'none') {
        return false;
    }

    // 2. Get LIVE inputs from the current screen
    const currentIEC101Inputs = document.querySelectorAll('#functionalityAIPage input.ai-test-input[name*="IEC101"]');
    const currentIEC104Inputs = document.querySelectorAll('#functionalityAIPage input.ai-test-input[name*="IEC104"]');

    // Reset red borders
    [...currentIEC101Inputs, ...currentIEC104Inputs].forEach(input => {
        input.style.border = '';
        input.style.backgroundColor = '';
    });

    // --- CHECK 1: Ensure Fields are Filled (now accepts "-") ---
    let emptyFound = false;
    currentIEC101Inputs.forEach(input => {
        const value = input.value.trim();
        if (value === "") { 
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#ffebee';
            emptyFound = true; 
        }
    });
    currentIEC104Inputs.forEach(input => {
        const value = input.value.trim();
        if (value === "") { 
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#ffebee';
            emptyFound = true; 
        }
    });

    if (emptyFound) {
        alert("Please fill in all required IOA/Index fields before continuing (use '-' for empty fields).");
        return false;
    }

    // --- CHECK 2: Validate Format (only numbers or "-") ---
    let formatErrorFound = false;
    currentIEC101Inputs.forEach(input => {
        const value = input.value.trim();
        if (!isValidAIIOAValue(value)) {
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#ffebee';
            formatErrorFound = true;
        }
    });
    currentIEC104Inputs.forEach(input => {
        const value = input.value.trim();
        if (!isValidAIIOAValue(value)) {
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#ffebee';
            formatErrorFound = true;
        }
    });

    if (formatErrorFound) {
        alert("IOA/Index fields can only contain numbers or '-' (for empty fields). Please correct the highlighted fields.");
        return false;
    }

    // --- CHECK 3: Global Duplicates (Max 1 Allowed Total for AI - Strict Unique, ignore "-") ---
    let globalIEC101 = [];
    let globalIEC104 = [];
    
    // Track which module AND cell each value comes from
    let cellSources101 = {};
    let cellSources104 = {};

    // A. Load ALL data from LocalStorage
    const rawData = localStorage.getItem('aiTestResults');
    const savedResults = rawData ? JSON.parse(rawData) : {};
    
    // B. REMOVE the current module's saved data from memory
    const currentModKey = String(window.currentAIModule);
    if (savedResults[currentModKey]) {
        delete savedResults[currentModKey];
    }

    // C. Collect IEC101/104 from ALL OTHER modules with detailed cell tracking
    for (const modKey in savedResults) {
        const moduleData = savedResults[modKey];
        if (!moduleData) continue;

        // Track IEC101 values with cell information
        if (moduleData.iec101Values) {
            Object.entries(moduleData.iec101Values).forEach(([cellKey, val]) => {
                const trimmedVal = String(val).trim();
                if (trimmedVal !== "" && trimmedVal !== "-") {
                    globalIEC101.push(trimmedVal);
                    if (!cellSources101[trimmedVal]) {
                        cellSources101[trimmedVal] = [];
                    }
                    let cellName = 'Unknown Cell';
                    const match = cellKey.match(/AI_(\d+)_IEC101_(\d+)/);
                    if (match) {
                        cellName = `IEC101-NO: ${match[2]}`;
                    }
                    cellSources101[trimmedVal].push({module: `Module ${modKey}`, cell: cellName});
                }
            });
        }

        // Track IEC104 values with cell information
        if (moduleData.iec104Values) {
            Object.entries(moduleData.iec104Values).forEach(([cellKey, val]) => {
                const trimmedVal = String(val).trim();
                if (trimmedVal !== "" && trimmedVal !== "-") {
                    globalIEC104.push(trimmedVal);
                    if (!cellSources104[trimmedVal]) {
                        cellSources104[trimmedVal] = [];
                    }
                    let cellName = 'Unknown Cell';
                    const match = cellKey.match(/AI_(\d+)_IEC104_(\d+)/);
                    if (match) {
                        cellName = `IEC104-NO: ${match[2]}`;
                    }
                    cellSources104[trimmedVal].push({module: `Module ${modKey}`, cell: cellName});
                }
            });
        }
    }

    // D. Add the LIVE data from the current screen
    currentIEC101Inputs.forEach(input => {
        const val = input.value.trim();
        if (val !== "" && val !== "-") {
            globalIEC101.push(val);
            if (!cellSources101[val]) {
                cellSources101[val] = [];
            }
            let cellName = 'Current Cell';
            const match = input.name.match(/AI_(\d+)_IEC101_(\d+)/);
            if (match) {
                cellName = `IEC101-NO: ${match[2]}`;
            }
            cellSources101[val].push({module: `Current Module (${currentModKey})`, cell: cellName});
        }
    });

    currentIEC104Inputs.forEach(input => {
        const val = input.value.trim();
        if (val !== "" && val !== "-") {
            globalIEC104.push(val);
            if (!cellSources104[val]) {
                cellSources104[val] = [];
            }
            let cellName = 'Current Cell';
            const match = input.name.match(/AI_(\d+)_IEC104_(\d+)/);
            if (match) {
                cellName = `IEC104-NO: ${match[2]}`;
            }
            cellSources104[val].push({module: `Current Module (${currentModKey})`, cell: cellName});
        }
    });

    // E. Perform Validation (Limit: 1 duplicate allowed globally for AI - Strict Unique)
    let isValid = true;
    let errorMessages = [];

    const excessiveIEC101 = findExcessiveDuplicates(globalIEC101, 1);
    if (excessiveIEC101.length > 0) {
        isValid = false;
        excessiveIEC101.forEach(duplicateValue => {
            const sources = cellSources101[duplicateValue] || [];
            const sourceDetails = sources.map((source, index) => 
                `     ${index + 1}. ${source.module} - ${source.cell}`
            ).join('\n');
            errorMessages.push(`IEC101: Value "${duplicateValue}" appears more than once.\n${sourceDetails}`);
        });
        
        currentIEC101Inputs.forEach(input => {
            if (excessiveIEC101.includes(input.value.trim())) {
                input.style.border = '2px solid red';
                input.style.backgroundColor = '#ffebee';
            }
        });
    }

    const excessiveIEC104 = findExcessiveDuplicates(globalIEC104, 1);
    if (excessiveIEC104.length > 0) {
        isValid = false;
        excessiveIEC104.forEach(duplicateValue => {
            const sources = cellSources104[duplicateValue] || [];
            const sourceDetails = sources.map((source, index) => 
                `     ${index + 1}. ${source.module} - ${source.cell}`
            ).join('\n');
            errorMessages.push(`IEC104: Value "${duplicateValue}" appears more than once.\n${sourceDetails}`);
        });
        
        currentIEC104Inputs.forEach(input => {
            if (excessiveIEC104.includes(input.value.trim())) {
                input.style.border = '2px solid red';
                input.style.backgroundColor = '#ffebee';
            }
        });
    }

    if (!isValid) {
        const alertMessage = `IOA/Index Validation Failed - Duplicate Values Found:\n\n${errorMessages.join('\n\n')}\n\n⚠️ For AI modules, each IOA value must be UNIQUE across ALL AI modules.\nPlease change duplicate values to unique ones.`;
        alert(alertMessage);
        return false;
    }

    return true;
}

function findExcessiveDuplicates(array, maxAllowed) {
    const countMap = {};
    const excessive = [];
    
    array.forEach(value => {
        countMap[value] = (countMap[value] || 0) + 1;
    });
    
    for (const [value, count] of Object.entries(countMap)) {
        if (count > maxAllowed) {
            excessive.push(value);
        }
    }
    
    return excessive;
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

function isValidAIIOAValue(value) {
    if (value === "") return false;
    if (value === "-") return true;
    return /^\d+$/.test(value);
}

function restrictAIIOAInput(event) {
    const input = event.target;
    const value = input.value;
    const key = event.key;
    
    if (event.keyCode === 8 || event.keyCode === 46 || event.keyCode === 9 || 
        event.keyCode === 27 || event.keyCode === 13 || event.keyCode === 37 || 
        event.keyCode === 39 || event.keyCode === 35 || event.keyCode === 36) {
        return true;
    }
    
    if (event.ctrlKey && (key === 'a' || key === 'c' || key === 'v' || key === 'x')) {
        return true;
    }
    
    if (!/^[\d-]$/.test(key)) {
        event.preventDefault();
        return false;
    }
    
    if (key === '-' && value.includes('-')) {
        event.preventDefault();
        return false;
    }
    
    return true;
}

function addAIIOAInputRestrictions() {
    document.querySelectorAll('.ai-ioa-input').forEach(input => {
        input.addEventListener('keydown', restrictAIIOAInput);
        
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            if (/^[\d-]+$/.test(pastedText)) {
                if (pastedText.includes('-') && pastedText.indexOf('-') !== pastedText.lastIndexOf('-')) {
                    alert('Only one dash character is allowed per field');
                    return;
                }
                this.value = pastedText;
            } else {
                alert('Only numbers and dash character are allowed');
            }
        });
    });
}

function clearAllFunctionalityWithConfirm() {
    if (confirm("⚠️ WARNING: This will clear ALL test data for the current AI module.\n\nThis includes:\n- All numeric measured values (0mA through 20mA)\n- All IOA/Index field entries (IEC101, IEC104, DNP3)\n\nThis action CANNOT be undone.\n\nAre you sure you want to continue?")) {
        clearAllFunctionality();
        alert("All data has been cleared for this module.");
    }
}

function clearAllFunctionality() {
    // Clear number inputs
    const numberInputs = document.querySelectorAll('#tableBody input.ai-number-input');
    numberInputs.forEach(input => {
        input.value = '';
        input.style.border = '';
        input.style.backgroundColor = '';
    });
    
    // Clear IOA inputs
    const ioaInputs = document.querySelectorAll('#tableBody .ai-ioa-input');
    ioaInputs.forEach(input => {
        input.value = '';
        input.style.border = '';
        input.style.backgroundColor = '';
    });
}

function selectAllFunctionality() {
    // This function now populates demo numeric values instead of checking checkboxes
    const numberInputs = document.querySelectorAll('#tableBody input.ai-number-input');
    const demoValues = {
        '0mA': '-2500',
        '4mA': '0',
        '8mA': '2500',
        '12mA': '5000',
        '16mA': '7475',
        '20mA': '10000'
    };
    
    numberInputs.forEach(input => {
        for (const [key, value] of Object.entries(demoValues)) {
            if (input.name.includes(`_${key}_`)) {
                input.value = value;
                input.style.border = '';
                input.style.backgroundColor = '';
                break;
            }
        }
    });
    
    alert("Demo values populated. Please adjust if needed and fill IOA fields.");
}