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

        // Protocol inputs (change to text type to allow dash, with input restrictions)
        row.innerHTML += `
            <td><input type="text" class="ai-test-input ai-ioa-input" name="AI_${window.currentAIModule}_IEC101_${i + 1}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="ai-test-input ai-ioa-input" name="AI_${window.currentAIModule}_IEC104_${i + 1}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="ai-test-input ai-ioa-input" name="AI_${window.currentAIModule}_DNP3_${i + 1}" placeholder="Enter IOA or -"></td>
        `;

        tableBody.appendChild(row);
    }
}

async function saveAndGoToNext() {
    // Validate all checkboxes are ticked
    if (!validateAICheckboxes()) {
        return;
    }

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
            input.style.border = '';
            return;
        }
        
        // For checkbox inputs - NO VALIDATION REQUIRED
        if (input.type === 'checkbox') {
            // Just clear any previous error styling to be safe
            input.parentElement.style.backgroundColor = '';
            input.parentElement.style.border = '';
        }
        // For text inputs (IOA) - validate they have values (now allows dash)
        else if (input.type === 'text' && !input.value.trim()) {
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#ffebee';
            emptyInputs.push(input.name);
            isValid = false;
        } else {
            // Clear styles if valid
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
    let cellSources101 = {}; // value -> [{module: 'X', cell: 'Y'}, ...]
    let cellSources104 = {}; // value -> [{module: 'X', cell: 'Y'}, ...]

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
                // Ignore "-" and empty strings in duplicate checking
                if (trimmedVal !== "" && trimmedVal !== "-") {
                    globalIEC101.push(trimmedVal);
                    if (!cellSources101[trimmedVal]) {
                        cellSources101[trimmedVal] = [];
                    }
                    // Extract channel number from the key format: "AI_X_IEC101_Y"
                    let cellName = 'Unknown Cell';
                    // Match patterns like "AI_1_IEC101_1"
                    const match = cellKey.match(/AI_(\d+)_IEC101_(\d+)/);
                    if (match) {
                        const moduleNum = match[1];
                        const channelNum = match[2];
                        cellName = `IEC101-NO: ${channelNum}`;
                    } else if (cellKey.includes('IEC101')) {
                        // Try alternative pattern
                        const altMatch = cellKey.match(/_(\d+)$/);
                        if (altMatch) {
                            cellName = `IEC101-NO: ${altMatch[1]}`;
                        }
                    }
                    cellSources101[trimmedVal].push({module: `Module ${modKey}`, cell: cellName});
                }
            });
        }

        // Track IEC104 values with cell information
        if (moduleData.iec104Values) {
            Object.entries(moduleData.iec104Values).forEach(([cellKey, val]) => {
                const trimmedVal = String(val).trim();
                // Ignore "-" and empty strings in duplicate checking
                if (trimmedVal !== "" && trimmedVal !== "-") {
                    globalIEC104.push(trimmedVal);
                    if (!cellSources104[trimmedVal]) {
                        cellSources104[trimmedVal] = [];
                    }
                    // Extract channel number from the key format: "AI_X_IEC104_Y"
                    let cellName = 'Unknown Cell';
                    const match = cellKey.match(/AI_(\d+)_IEC104_(\d+)/);
                    if (match) {
                        const moduleNum = match[1];
                        const channelNum = match[2];
                        cellName = `IEC104-NO: ${channelNum}`;
                    } else if (cellKey.includes('IEC104')) {
                        const altMatch = cellKey.match(/_(\d+)$/);
                        if (altMatch) {
                            cellName = `IEC104-NO: ${altMatch[1]}`;
                        }
                    }
                    cellSources104[trimmedVal].push({module: `Module ${modKey}`, cell: cellName});
                }
            });
        }
    }

    // D. Add the LIVE data from the current screen with cell tracking
    currentIEC101Inputs.forEach(input => {
        const val = input.value.trim();
        // Ignore "-" and empty strings in duplicate checking
        if (val !== "" && val !== "-") {
            globalIEC101.push(val);
            if (!cellSources101[val]) {
                cellSources101[val] = [];
            }
            // Get cell name from input name - format: "AI_X_IEC101_Y"
            let cellName = 'Current Cell';
            const inputName = input.name || '';
            // Match patterns like "AI_1_IEC101_1"
            const match = inputName.match(/AI_(\d+)_IEC101_(\d+)/);
            if (match) {
                const moduleNum = match[1];
                const channelNum = match[2];
                cellName = `IEC101-NO: ${channelNum}`;
            } else if (inputName.includes('IEC101')) {
                // Try alternative pattern
                const altMatch = inputName.match(/_(\d+)$/);
                if (altMatch) {
                    cellName = `IEC101-NO: ${altMatch[1]}`;
                }
            }
            cellSources101[val].push({module: `Current Module (${currentModKey})`, cell: cellName});
        }
    });

    currentIEC104Inputs.forEach(input => {
        const val = input.value.trim();
        // Ignore "-" and empty strings in duplicate checking
        if (val !== "" && val !== "-") {
            globalIEC104.push(val);
            if (!cellSources104[val]) {
                cellSources104[val] = [];
            }
            // Get cell name from input name - format: "AI_X_IEC104_Y"
            let cellName = 'Current Cell';
            const inputName = input.name || '';
            const match = inputName.match(/AI_(\d+)_IEC104_(\d+)/);
            if (match) {
                const moduleNum = match[1];
                const channelNum = match[2];
                cellName = `IEC104-NO: ${channelNum}`;
            } else if (inputName.includes('IEC104')) {
                const altMatch = inputName.match(/_(\d+)$/);
                if (altMatch) {
                    cellName = `IEC104-NO: ${altMatch[1]}`;
                }
            }
            cellSources104[val].push({module: `Current Module (${currentModKey})`, cell: cellName});
        }
    });

    // E. Perform Validation (Limit: 1 duplicate allowed globally for AI - Strict Unique)
    let isValid = true;
    let errorMessages = [];

    const excessiveIEC101 = findExcessiveDuplicates(globalIEC101, 1); // Max 1 for AI
    if (excessiveIEC101.length > 0) {
        isValid = false;
        excessiveIEC101.forEach(duplicateValue => {
            const sources = cellSources101[duplicateValue] || [];
            const sourceDetails = sources.map((source, index) => 
                `     ${index + 1}. ${source.module} - ${source.cell}`
            ).join('\n');
            
            const locationText = sources.length > 0 ? 
                `Found in:\n${sourceDetails}` : 
                'Location not identified';
            
            errorMessages.push(`IEC101: Value "${duplicateValue}" appears more than once.\n${locationText}`);
        });
        
        currentIEC101Inputs.forEach(input => {
            if (excessiveIEC101.includes(input.value.trim())) {
                input.style.border = '2px solid red';
                input.style.backgroundColor = '#ffebee';
            }
        });
    }

    const excessiveIEC104 = findExcessiveDuplicates(globalIEC104, 1); // Max 1 for AI
    if (excessiveIEC104.length > 0) {
        isValid = false;
        excessiveIEC104.forEach(duplicateValue => {
            const sources = cellSources104[duplicateValue] || [];
            const sourceDetails = sources.map((source, index) => 
                `     ${index + 1}. ${source.module} - ${source.cell}`
            ).join('\n');
            
            const locationText = sources.length > 0 ? 
                `Found in:\n${sourceDetails}` : 
                'Location not identified';
            
            errorMessages.push(`IEC104: Value "${duplicateValue}" appears more than once.\n${locationText}`);
        });
        
        currentIEC104Inputs.forEach(input => {
            if (excessiveIEC104.includes(input.value.trim())) {
                input.style.border = '2px solid red';
                input.style.backgroundColor = '#ffebee';
            }
        });
    }

    if (!isValid) {
        const alertMessage = `IOA/Index Validation Failed - Duplicate Values Found:\n\n${errorMessages.join('\n\n')}\n\n⚠️  For AI modules, each IOA value must be UNIQUE across ALL AI modules.\nPlease change duplicate values to unique ones.`;
        alert(alertMessage);
        return false;
    }

    return true;
}

// Helper function to find values that appear more than maxAllowed times
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


function validateAICheckboxes() {
    let allChecked = true;
    const checkboxes = document.querySelectorAll('#functionalityAIPage input[type="checkbox"].ai-test-input');
    const emptyCheckboxes = [];
    
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            allChecked = false;
            emptyCheckboxes.push(checkbox);
            // Highlight unchecked checkboxes
            checkbox.parentElement.style.backgroundColor = '#ffebee';
            checkbox.parentElement.style.border = '2px solid red';
        } else {
            // Clear styles if checked
            checkbox.parentElement.style.backgroundColor = '';
            checkbox.parentElement.style.border = '';
        }
    });
    
    if (!allChecked) {
        // Scroll to first unchecked checkbox
        if (emptyCheckboxes.length > 0) {
            emptyCheckboxes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        showCustomAlert('Please tick all checkboxes (0mA, 4mA, 8mA, 12mA, 16mA, 20mA) for all channels before continuing.');
    }
    
    return allChecked;
}
function isValidAIIOAValue(value) {
    // Allow empty values (these will be caught by empty field validation)
    if (value === "") return false;
    
    // Allow single dash
    if (value === "-") return true;
    
    // Check if the value contains only numbers (no letters or special characters)
    // This regex matches only digits (0-9)
    return /^\d+$/.test(value);
}

// Add input restriction function
function restrictAIIOAInput(event) {
    const input = event.target;
    const value = input.value;
    
    // Allow backspace, delete, tab, escape, enter, etc.
    const key = event.key;
    if (event.keyCode === 8 || event.keyCode === 46 || event.keyCode === 9 || 
        event.keyCode === 27 || event.keyCode === 13 || event.keyCode === 37 || 
        event.keyCode === 39 || event.keyCode === 35 || event.keyCode === 36) {
        return true;
    }
    
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey && (key === 'a' || key === 'c' || key === 'v' || key === 'x')) {
        return true;
    }
    
    // Allow numbers and dash
    if (!/^[\d-]$/.test(key)) {
        event.preventDefault();
        return false;
    }
    
    // Prevent multiple dashes
    if (key === '-' && value.includes('-')) {
        event.preventDefault();
        return false;
    }
    
    return true;
}

// Add input restrictions for AI IOA inputs
function addAIIOAInputRestrictions() {
    document.querySelectorAll('.ai-ioa-input').forEach(input => {
        input.addEventListener('keydown', restrictAIIOAInput);
        
        // Also validate on paste
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            // Only allow numbers and dash
            if (/^[\d-]+$/.test(pastedText)) {
                // Prevent multiple dashes
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