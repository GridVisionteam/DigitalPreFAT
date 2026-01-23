const { PDFDocument, rgb } = PDFLib;
// Initialize with empty data structures
if (!window.doTestResults) window.doTestResults = {};
if (!window.doModuleTypes) window.doModuleTypes = {};

// Module navigation functions (removed module jump functions)

function showFunctionalityDOPage() {
    // Initialize module tracking
    window.doModulesToTest = parseInt(localStorage.getItem('doModulesToTest')) || 0;
    window.currentDOModule = parseInt(localStorage.getItem('currentDOModule')) || 1;
    
    // Load saved module types if available
    const savedTypes = localStorage.getItem('doModuleTypes');
    if (savedTypes) {
        window.doModuleTypes = JSON.parse(savedTypes);
    }

    // Make page visible
    document.getElementById('functionalityDOPage').style.display = 'block';
    document.getElementById('do8Page').style.display = 'none';

    // Set module info based on stored type
    const moduleType = window.doModuleTypes[window.currentDOModule] || 'CO-16-A';
    document.getElementById("doNoInput").textContent = window.currentDOModule;
    
    // Update the title
    const titleElement = document.querySelector("#functionalityDOPage h1");
    if (titleElement) {
        titleElement.textContent = `Digital Output Module (${moduleType}) (${window.currentDOModule} of ${window.doModulesToTest})`;
    }

    // Generate rows if not already present
    generateDORows();

    // Load existing data if available
    if (window.doTestResults[window.currentDOModule] && 
        window.doTestResults[window.currentDOModule].type === moduleType) {
        loadDOTestData(window.currentDOModule);
    } else {
        // Only set defaults if this is a new module
        clearAll();
    }
}

function showFunctionalityDO8Page() {
    // Hide DO-16 page and show DO-8 page
    document.getElementById('functionalityDOPage').style.display = 'none';
    document.getElementById('do8Page').style.display = 'block';

    // Set module info
    document.getElementById("do8NoInput").textContent = window.currentDOModule;
    document.querySelector("#do8Page h1").textContent = 
        `Digital Output Module (CO-8-A) (${window.currentDOModule} of ${window.doModulesToTest})`;

    // Clear and regenerate rows
    const tableBody = document.getElementById('do8TableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        generateDO8Rows();
    }

    // Initialize empty data structure if none exists
    if (!window.doTestResults[window.currentDOModule]) {
        window.doTestResults[window.currentDOModule] = {
            inputs: [],
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {},
            checkboxValues: {},
            type: 'CO-8-A'
        };
    }

    // Load existing data if available
    if (window.doTestResults[window.currentDOModule] && 
        window.doTestResults[window.currentDOModule].type === 'CO-8-A') {
        loadDO8TestData(window.currentDOModule);
    } else {
        clearAllDO8();
    }
}

function generateDORows() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        console.error("Table body not found - check HTML structure");
        return;
    }

    tableBody.innerHTML = '';
    
    for (let i = 0; i < 16; i++) {
        const row = document.createElement("tr");
        const rowNumber = i + 1;
        
        row.innerHTML = `
            <td>${rowNumber}</td>
            <td style="text-align: center;">
                <input type="radio" name="DO_${window.currentDOModule}_radio_${rowNumber}" value="1" class="do-test-radio">
            </td>
            <td style="text-align: center;">
                <input type="radio" name="DO_${window.currentDOModule}_radio_${rowNumber}" value="2" class="do-test-radio">
            </td>
            <td><input type="number" class="do-test-input" name="DO_${window.currentDOModule}_IEC101_${rowNumber}"></td>
            <td><input type="number" class="do-test-input" name="DO_${window.currentDOModule}_IEC104_${rowNumber}"></td>
            <td><input type="number" class="do-test-input" name="DO_${window.currentDOModule}_DNP3_${rowNumber}"></td>
        `;
        
        tableBody.appendChild(row);
    }

    // Add event listeners to radio buttons
    document.querySelectorAll('.do-test-radio').forEach(radio => {
        radio.addEventListener('change', updateSubmitButtonState);
    });
}

function generateDO8Rows() {
    const tableBody = document.getElementById('do8TableBody');
    if (!tableBody) return;
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    for (let i = 0; i < 8; i++) {
        const row = document.createElement("tr");
        const rowNumber = i + 1;
        
        row.innerHTML = `
            <td>${rowNumber}</td>
            <td style="text-align: center;">
                <input type="radio" name="DO8_${window.currentDOModule}_radio_${rowNumber}" value="1" class="do-test-radio">
            </td>
            <td style="text-align: center;">
                <input type="radio" name="DO8_${window.currentDOModule}_radio_${rowNumber}" value="2" class="do-test-radio">
            </td>
            <td><input type="number" class="do8-test-input" name="DO_${window.currentDOModule}_IEC101_${rowNumber}"></td>
            <td><input type="number" class="do8-test-input" name="DO_${window.currentDOModule}_IEC104_${rowNumber}"></td>
            <td><input type="number" class="do8-test-input" name="DO_${window.currentDOModule}_DNP3_${rowNumber}"></td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Add event listeners to radio buttons
    const radios = tableBody.querySelectorAll("input[type='radio']");
    radios.forEach(radio => {
        radio.addEventListener('change', updateDO8SubmitButtonState);
    });
}

// Update SelectAll function for radio buttons (this will now select "1" for all)
function SelectAll() {
    const radios = document.querySelectorAll('#tableBody input[type="radio"][value="1"]');
    radios.forEach(radio => {
        radio.checked = true;
    });
    
    updateSubmitButtonState();
}

// Update clearAll function
function clearAll() {
    // Clear all radio buttons
    const radios = document.querySelectorAll('#tableBody .do-test-radio');
    radios.forEach(radio => {
        radio.checked = false;
    });
    
    // Clear all text inputs
    const textInputs = document.querySelectorAll('#tableBody .do-test-input');
    textInputs.forEach(input => {
        input.value = '';
    });
    
    updateSubmitButtonState();
}

function updateSubmitButtonState() {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    
    // Enable the button by default (modify this logic if you need different behavior)
    submitBtn.disabled = false;
}

function SelectAllDO8() {
    const radios = document.querySelectorAll('#do8TableBody input[type="radio"][value="1"]');
    radios.forEach(radio => {
        radio.checked = true;
    });
    
    updateDO8SubmitButtonState();
}

// Update clearAllDO8 function
function clearAllDO8() {
    const radios = document.querySelectorAll("#do8TableBody input[type='radio']");
    radios.forEach(radio => radio.checked = false);

    const textInputs = document.querySelectorAll("#do8TableBody input[type='text'], #do8TableBody input[type='number']");
    textInputs.forEach(input => input.value = '');

    updateDO8SubmitButtonState();
}


function updateDO8SubmitButtonState() {
    const submitBtn = document.getElementById('submitBtnDO8');
    if (submitBtn) {
        submitBtn.disabled = false; // keep it enabled like DO-16
    }
}

function saveDOTestData(moduleNumber) {
    // Initialize or ensure proper structure exists
    if (!window.doTestResults[moduleNumber]) {
        window.doTestResults[moduleNumber] = {};
    }

    // Ensure all required properties exist
    if (!window.doTestResults[moduleNumber].iec101Values) window.doTestResults[moduleNumber].iec101Values = {};
    if (!window.doTestResults[moduleNumber].iec104Values) window.doTestResults[moduleNumber].iec104Values = {};
    if (!window.doTestResults[moduleNumber].dnp3Values) window.doTestResults[moduleNumber].dnp3Values = {};
    
    // NEW: Create a specific object for radio values
    if (!window.doTestResults[moduleNumber].radioValues) window.doTestResults[moduleNumber].radioValues = {};

    window.doTestResults[moduleNumber].type = 'CO-16-A';

    // 1. Save Radio Button States
    // We loop through rows and find which radio is checked
    const rows = document.querySelectorAll("#tableBody tr");
    rows.forEach((row, rowIndex) => {
        // Find the checked radio in this row
        const checkedRadio = row.querySelector("input[type='radio']:checked");
        const rowKey = `DO_${moduleNumber}_Row_${rowIndex + 1}`;
        
        if (checkedRadio) {
            // Save the value ("1" or "2")
            window.doTestResults[moduleNumber].radioValues[rowKey] = checkedRadio.value;
        } else {
            // If nothing checked, delete entry to keep it clean
            delete window.doTestResults[moduleNumber].radioValues[rowKey];
        }
    });

    // 2. Save Protocol Values (Text Inputs)
    for (let i = 1; i <= 16; i++) {
        // IEC101
        const inputIEC101 = document.querySelector(`input[name="DO_${moduleNumber}_IEC101_${i}"]`);
        if (inputIEC101) window.doTestResults[moduleNumber].iec101Values[`DO_${moduleNumber}_IEC101_${i}`] = inputIEC101.value;

        // IEC104
        const inputIEC104 = document.querySelector(`input[name="DO_${moduleNumber}_IEC104_${i}"]`);
        if (inputIEC104) window.doTestResults[moduleNumber].iec104Values[`DO_${moduleNumber}_IEC104_${i}`] = inputIEC104.value;

        // DNP3
        const inputDNP3 = document.querySelector(`input[name="DO_${moduleNumber}_DNP3_${i}"]`);
        if (inputDNP3) window.doTestResults[moduleNumber].dnp3Values[`DO_${moduleNumber}_DNP3_${i}`] = inputDNP3.value;
    }

    localStorage.setItem('doTestResults', JSON.stringify(window.doTestResults));
}

function saveDO8TestData(moduleNumber) {
    if (!window.doTestResults[moduleNumber]) {
        window.doTestResults[moduleNumber] = {};
    }

    if (!window.doTestResults[moduleNumber].iec101Values) window.doTestResults[moduleNumber].iec101Values = {};
    if (!window.doTestResults[moduleNumber].iec104Values) window.doTestResults[moduleNumber].iec104Values = {};
    if (!window.doTestResults[moduleNumber].dnp3Values) window.doTestResults[moduleNumber].dnp3Values = {};
    // NEW: Radio values object
    if (!window.doTestResults[moduleNumber].radioValues) window.doTestResults[moduleNumber].radioValues = {};

    window.doTestResults[moduleNumber].type = 'CO-8-A';

    // 1. Save Radio Button States
    const rows = document.querySelectorAll("#do8TableBody tr");
    rows.forEach((row, rowIndex) => {
        const checkedRadio = row.querySelector("input[type='radio']:checked");
        const rowKey = `DO8_${moduleNumber}_Row_${rowIndex + 1}`;
        
        if (checkedRadio) {
            window.doTestResults[moduleNumber].radioValues[rowKey] = checkedRadio.value;
        } else {
            delete window.doTestResults[moduleNumber].radioValues[rowKey];
        }
    });

    // 2. Save Protocol Values
    for (let i = 1; i <= 8; i++) {
        const inputIEC101 = document.querySelector(`input[name="DO_${moduleNumber}_IEC101_${i}"]`);
        if (inputIEC101) window.doTestResults[moduleNumber].iec101Values[`DO_${moduleNumber}_IEC101_${i}`] = inputIEC101.value;

        const inputIEC104 = document.querySelector(`input[name="DO_${moduleNumber}_IEC104_${i}"]`);
        if (inputIEC104) window.doTestResults[moduleNumber].iec104Values[`DO_${moduleNumber}_IEC104_${i}`] = inputIEC104.value;

        const inputDNP3 = document.querySelector(`input[name="DO_${moduleNumber}_DNP3_${i}"]`);
        if (inputDNP3) window.doTestResults[moduleNumber].dnp3Values[`DO_${moduleNumber}_DNP3_${i}`] = inputDNP3.value;
    }

    localStorage.setItem('doTestResults', JSON.stringify(window.doTestResults));
}

function loadDOTestData(moduleNumber) {
    const saved = window.doTestResults[moduleNumber];
    if (!saved || saved.type !== 'CO-16-A') return;

    // 1. Load Radio Buttons
    if (saved.radioValues) {
        const rows = document.querySelectorAll("#tableBody tr");
        rows.forEach((row, rowIndex) => {
            const rowKey = `DO_${moduleNumber}_Row_${rowIndex + 1}`;
            const savedValue = saved.radioValues[rowKey];

            if (savedValue) {
                // Find the radio with the matching value (1 or 2) in this row and check it
                const radioToCheck = row.querySelector(`input[type='radio'][value="${savedValue}"]`);
                if (radioToCheck) {
                    radioToCheck.checked = true;
                }
            }
        });
    }

    // 2. Load Protocol Inputs
    const inputs = document.querySelectorAll("#tableBody input[type='number']");
    inputs.forEach(input => {
        const name = input.name;
        if (saved.iec101Values && saved.iec101Values[name]) input.value = saved.iec101Values[name];
        else if (saved.iec104Values && saved.iec104Values[name]) input.value = saved.iec104Values[name];
        else if (saved.dnp3Values && saved.dnp3Values[name]) input.value = saved.dnp3Values[name];
    });

    updateSubmitButtonState();
}

function loadDO8TestData(moduleNumber) {
    const saved = window.doTestResults[moduleNumber];
    if (!saved || saved.type !== 'CO-8-A') return;

    // 1. Load Radio Buttons
    if (saved.radioValues) {
        const rows = document.querySelectorAll("#do8TableBody tr");
        rows.forEach((row, rowIndex) => {
            const rowKey = `DO8_${moduleNumber}_Row_${rowIndex + 1}`;
            const savedValue = saved.radioValues[rowKey];

            if (savedValue) {
                const radioToCheck = row.querySelector(`input[type='radio'][value="${savedValue}"]`);
                if (radioToCheck) {
                    radioToCheck.checked = true;
                }
            }
        });
    }

    // 2. Load Protocol Inputs
    const inputs = document.querySelectorAll("#do8TableBody input[type='number']");
    inputs.forEach(input => {
        const name = input.name;
        if (saved.iec101Values && saved.iec101Values[name]) input.value = saved.iec101Values[name];
        else if (saved.iec104Values && saved.iec104Values[name]) input.value = saved.iec104Values[name];
        else if (saved.dnp3Values && saved.dnp3Values[name]) input.value = saved.dnp3Values[name];
    });

    updateDO8SubmitButtonState();
}

async function handleDOTestSubmission() {
    // Validate IOA index fields for IEC101 and IEC104
    if (!validateDOIOAIndexFields()) {
        return; // Stop if validation fails
    }

    // Get all checkboxes in the current table
    const checkboxes = document.querySelectorAll("#tableBody input[type='checkbox']");
    let allChecked = true;
    
    // Check if all checkboxes are ticked
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            allChecked = false;
        }
    });
    
    if (!allChecked) {
        alert("Please tick all checkboxes before continuing.");
        return;
    }
    
    // Save the current module's test data
    saveDOTestData(window.currentDOModule);
    window.doModuleTypes[window.currentDOModule] = 'CO-16-A';
    
    // Move to next module or final page
    window.currentDOModule++;
    localStorage.setItem('currentDOModule', window.currentDOModule);
    
    if (window.currentDOModule > window.doModulesToTest) {
        // All DO modules tested, go to AI page
        navigationGuard.markPageAsCompleted();
        window.location.href = 'Dummy&CESFunctionalTest.html';
    } else {
        // Check module type for next module
        const nextType = window.doModuleTypes[window.currentDOModule] || 'CO-16-A';
        if (nextType === 'CO-8-A') {
            showFunctionalityDO8Page();
        } else {
            showFunctionalityDOPage();
        }
    }
}

function goToPreviousPage() {
    // Save current test data before navigating
    if (document.getElementById('functionalityDOPage').style.display !== 'none') {
        saveDOTestData(window.currentDOModule);
    } else {
        saveDO8TestData(window.currentDOModule);
    }

    // If we're on the first module, go back to Quality Inspection page
    if (window.currentDOModule === 1) {
        window.location.href = 'FunctionalityDIPage.html';
        return;
    }

    // Go to previous module
    window.currentDOModule--;
    localStorage.setItem('currentDOModule', window.currentDOModule);

    // Load the saved module type for this module
    const currentModuleType = window.doModuleTypes[window.currentDOModule] || 'CO-16-A';
    
    // Clear any existing table rows before showing the correct page
    const tableBody = document.getElementById('tableBody');
    if (tableBody) tableBody.innerHTML = '';
    const do8TableBody = document.getElementById('do8TableBody');
    if (do8TableBody) do8TableBody.innerHTML = '';

    // Show DO-8 page if the module is CO-8-A
    if (currentModuleType === 'CO-8-A') {
        showFunctionalityDO8Page();
    } else {
        showFunctionalityDOPage();
    }
}

async function handleDO8TestSubmission() {
    // Validate IOA index fields for IEC101 and IEC104
    if (!validateDOIOAIndexFields()) {
        return; // Stop if validation fails
    }

    // Get all checkboxes in the current table
    const checkboxes = document.querySelectorAll("#do8TableBody input[type='checkbox']");
    let allChecked = true;
    
    // Check if all checkboxes are ticked
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            allChecked = false;
        }
    });
    
    if (!allChecked) {
        alert("Please tick all checkboxes before continuing.");
        return;
    }

    // Save data and continue to next module
    saveDO8TestData(window.currentDOModule);
    window.doModuleTypes[window.currentDOModule] = 'CO-8-A';
    localStorage.setItem('doModuleTypes', JSON.stringify(window.doModuleTypes));
    
    window.currentDOModule++;
    localStorage.setItem('currentDOModule', window.currentDOModule);
    
    if (window.currentDOModule > window.doModulesToTest) {
        // All DO modules tested, go to AI page
        navigationGuard.markPageAsCompleted();
        window.location.href = 'Dummy&CESFunctionalTest.html';
    } else {
        // Check module type for next module
        const nextType = window.doModuleTypes[window.currentDOModule] || 'CO-16-A';
        if (nextType === 'CO-8-A') {
            showFunctionalityDO8Page();
        } else {
            showFunctionalityDOPage();
        }
    }
}

// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('doTestResults');
    if (savedResults) {
        window.doTestResults = JSON.parse(savedResults);
    }
    
    // Initialize module tracking
    window.doModulesToTest = parseInt(localStorage.getItem('doModulesToTest')) || 0;
    window.currentDOModule = parseInt(localStorage.getItem('currentDOModule')) || 1;
    
    // Load saved module types if available
    const savedTypes = localStorage.getItem('doModuleTypes');
    if (savedTypes) {
        window.doModuleTypes = JSON.parse(savedTypes);
    } else {
        window.doModuleTypes = {};
        // Initialize with default types if none saved
        for (let i = 1; i <= window.doModulesToTest; i++) {
            window.doModuleTypes[i] = 'CO-16-A'; // Default type
        }
    }
    
    // Show the appropriate page based on module type
    const firstModuleType = window.doModuleTypes[window.currentDOModule] || 'CO-16-A';
    if (firstModuleType === 'CO-8-A') {
        showFunctionalityDO8Page();
    } else {
        showFunctionalityDOPage();
    }
});

function validateDOIOAIndexFields() {
    // 1. Determine current page and scope
    const do16Page = document.getElementById('functionalityDOPage');
    const do8Page = document.getElementById('do8Page');
    let currentPageContainer = null;
    let inputClass = '';

    if (do16Page && do16Page.style.display !== 'none') {
        currentPageContainer = '#functionalityDOPage';
        inputClass = '.do-test-input';
    } else if (do8Page && do8Page.style.display !== 'none') {
        currentPageContainer = '#do8Page';
        inputClass = '.do8-test-input';
    } else {
        return false;
    }

    // 2. Get LIVE inputs from the current screen
    const currentIEC101Inputs = document.querySelectorAll(`${currentPageContainer} input${inputClass}[name*="IEC101"]`);
    const currentIEC104Inputs = document.querySelectorAll(`${currentPageContainer} input${inputClass}[name*="IEC104"]`);

    // Reset red borders
    [...currentIEC101Inputs, ...currentIEC104Inputs].forEach(input => input.style.border = '');

    // --- CHECK 1: Ensure Fields are Filled ---
    let emptyFound = false;
    currentIEC101Inputs.forEach(input => {
        if (!input.value.trim()) { input.style.border = '2px solid red'; emptyFound = true; }
    });
    currentIEC104Inputs.forEach(input => {
        if (!input.value.trim()) { input.style.border = '2px solid red'; emptyFound = true; }
    });

    if (emptyFound) {
        alert("Please fill in all required IOA/Index fields before continuing.");
        return false;
    }

    // --- CHECK 2: Global Duplicates (Max 2 Allowed Total) ---
    let globalIEC101 = [];
    let globalIEC104 = [];
    
    // Track which module AND cell each value comes from
    let cellSources101 = {}; // value -> [{module: 'X', cell: 'Y'}, ...]
    let cellSources104 = {}; // value -> [{module: 'X', cell: 'Y'}, ...]

    // A. Load ALL data from LocalStorage
    const rawData = localStorage.getItem('doTestResults');
    const savedResults = rawData ? JSON.parse(rawData) : {};
    
    // B. REMOVE the current module's saved data from memory
    const currentModKey = String(window.currentDOModule);
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
                if (trimmedVal !== "") {
                    globalIEC101.push(trimmedVal);
                    if (!cellSources101[trimmedVal]) {
                        cellSources101[trimmedVal] = [];
                    }
                    // Extract channel number from the key format: "DO_X_IEC101_Y"
                    let cellName = 'Unknown Cell';
                    // Match patterns like "DO_1_IEC101_1"
                    const match = cellKey.match(/DO_(\d+)_IEC101_(\d+)/);
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
                if (trimmedVal !== "") {
                    globalIEC104.push(trimmedVal);
                    if (!cellSources104[trimmedVal]) {
                        cellSources104[trimmedVal] = [];
                    }
                    // Extract channel number from the key format: "DO_X_IEC104_Y"
                    let cellName = 'Unknown Cell';
                    const match = cellKey.match(/DO_(\d+)_IEC104_(\d+)/);
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
        if (val !== "") {
            globalIEC101.push(val);
            if (!cellSources101[val]) {
                cellSources101[val] = [];
            }
            // Get cell name from input name - format: "DO_X_IEC101_Y"
            let cellName = 'Current Cell';
            const inputName = input.name || '';
            // Match patterns like "DO_1_IEC101_1"
            const match = inputName.match(/DO_(\d+)_IEC101_(\d+)/);
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
        if (val !== "") {
            globalIEC104.push(val);
            if (!cellSources104[val]) {
                cellSources104[val] = [];
            }
            // Get cell name from input name - format: "DO_X_IEC104_Y"
            let cellName = 'Current Cell';
            const inputName = input.name || '';
            const match = inputName.match(/DO_(\d+)_IEC104_(\d+)/);
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

    // E. Perform Validation (Limit: 2 duplicates allowed globally)
    let isValid = true;
    let errorMessages = [];

    const excessiveIEC101 = findExcessiveDuplicates(globalIEC101, 2);
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
            
            errorMessages.push(`IEC101: Value "${duplicateValue}" appears more than twice.\n${locationText}`);
        });
        
        currentIEC101Inputs.forEach(input => {
            if (excessiveIEC101.includes(input.value.trim())) input.style.border = '2px solid red';
        });
    }

    const excessiveIEC104 = findExcessiveDuplicates(globalIEC104, 2);
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
            
            errorMessages.push(`IEC104: Value "${duplicateValue}" appears more than twice.\n${locationText}`);
        });
        
        currentIEC104Inputs.forEach(input => {
            if (excessiveIEC104.includes(input.value.trim())) input.style.border = '2px solid red';
        });
    }

    if (!isValid) {
        const alertMessage = `IOA/Index Validation Failed - Duplicate Values Found:\n\n${errorMessages.join('\n\n')}\n\n⚠️  Each IOA value can appear maximum TWICE across ALL modules.\nPlease change duplicate values to unique ones.`;
        alert(alertMessage);
        //return false;
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

//-------------Load UserData-------------------------------------------------------
function loadUserData() {
    const nameInput = document.getElementById('name');
    const designationInput = document.getElementById('designation');
    const experienceInput = document.getElementById('experience');

    if (nameInput) nameInput.value = localStorage.getItem('session_name') || '';
    if (designationInput) designationInput.value = localStorage.getItem('session_designation') || '';
    if (experienceInput) experienceInput.value = localStorage.getItem('session_experience') || '';

    const sessionUsername = localStorage.getItem('session_username');
    const sessionRtuSerial = localStorage.getItem('session_rtuSerial');
    const sessionName = localStorage.getItem('session_name');
    const sessionDesignation = localStorage.getItem('session_designation');
    const sessionExperience = localStorage.getItem('session_experience');
    const sessionContractNo = localStorage.getItem('session_contractNo');
    const sessiondiModulesToTest = localStorage.getItem('diModulesToTest');
    const sessiondoModulesToTest = localStorage.getItem('doModulesToTest');
    const sessioncurrentDOModule = localStorage.getItem('currentDOModule');
    const sessiondiModulesDetails = localStorage.getItem('diModulesDetails');
    const sessiondoModulesDetails = localStorage.getItem('doModulesDetails');

    if (!sessionUsername || !sessionRtuSerial) {
        showCustomAlert("Essential session data missing. Redirecting to login.");
        setTimeout(() => { window.location.href = './index.html'; }, 2000);
        return false;
    }

    const iec101Values = {};
    const iec104Values = {};
    const dnp3Values = {};
    const savedResults = localStorage.getItem('doTestResults');
    if (savedResults) {
        const doTestResults = JSON.parse(savedResults);
        for (const [moduleNum, moduleData] of Object.entries(doTestResults)) {
            // IEC101
            if (moduleData.iec101Values) {
                for (const [key, value] of Object.entries(moduleData.iec101Values)) {
                    iec101Values[key] = value;
                }
            }
            // IEC104
            if (moduleData.iec104Values) {
                for (const [key, value] of Object.entries(moduleData.iec104Values)) {
                    iec104Values[key] = value;
                }
            }
            // DNP3
            if (moduleData.dnp3Values) {
                for (const [key, value] of Object.entries(moduleData.dnp3Values)) {
                    dnp3Values[key] = value;
                }
            }
        }
    }

    userData = {
        username: sessionUsername,
        rtuSerial: sessionRtuSerial,
        name: sessionName || 'N/A',
        designation: sessionDesignation || 'N/A',
        experience: sessionExperience || '0',
        contractNo: sessionContractNo || 'N/A',
        diModulesToTest: sessiondiModulesToTest,
        doModulesToTest: sessiondoModulesToTest,
        currentDOModule: sessioncurrentDOModule,
        diModulesDetails: sessiondiModulesDetails,
        doModulesDetails: sessiondoModulesDetails,
        ...iec101Values,
        ...iec104Values,
        ...dnp3Values
    };
    
    return userData;
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
// --- Helper Download Function (if not defined elsewhere) ---
if (typeof download === 'undefined') {
    window.download = function(data, filename, type) {
        const blob = new Blob([data], { type: type || 'application/octet-stream' });
        if (navigator.msSaveBlob) { // For IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    }
}