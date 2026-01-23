const { PDFDocument, rgb } = PDFLib;
// Initialize with empty data structures
if (!window.diTestResults) window.diTestResults = {};
if (!window.diModuleTypes) window.diModuleTypes = {};

function initializeModuleNavigation() {
    const moduleJump = document.getElementById('moduleJump');
    if (!moduleJump) return;
    
    const diModulesToTest = parseInt(localStorage.getItem('diModulesToTest')) || 0;
    
    // Clear existing options
    moduleJump.innerHTML = '';
    
    // Add options for each module
    for (let i = 1; i <= diModulesToTest; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Module ${i}`;
        moduleJump.appendChild(option);
    }
    
    // Set current module as selected
    moduleJump.value = window.currentDIModule;
    updateModuleCounter();
}

function updateModuleCounter() {
    const counter = document.getElementById('moduleCounter');
    if (counter) {
        counter.textContent = `Module ${window.currentDIModule} of ${window.diModulesToTest}`;
    }
}

function jumpToModule(moduleNumber) {
    moduleNumber = parseInt(moduleNumber);
    if (isNaN(moduleNumber) || moduleNumber < 1 || moduleNumber > window.diModulesToTest) {
        return;
    }
    
    // Save current module data before navigating
    saveCurrentModuleData();
    
    // Update current module
    window.currentDIModule = moduleNumber;
    localStorage.setItem('currentDIModule', moduleNumber);
    updateModuleCounter();
    
    // Show the appropriate page for the selected module
    const moduleType = window.diModuleTypes[moduleNumber] || 'DI-32';
    if (moduleType === 'DI-16') {
        showFunctionalityDI16Page();
    } else {
        showFunctionalityDIPage();
    }
}

function setupDIModuleTypeListeners() {
    const diModuleTypeSelects = document.querySelectorAll('#diModuleType');
    diModuleTypeSelects.forEach(select => {
        select.addEventListener('change', handleDIModuleTypeChange);
    });
}

function handleDIModuleTypeChange() {
    const moduleType = this.value;
    
    // Save current data before switching
    saveCurrentModuleData();
    
    // Update the module type in our tracking object
    window.diModuleTypes[window.currentDIModule] = moduleType;
    localStorage.setItem('diModuleTypes', JSON.stringify(window.diModuleTypes));

    // Switch to the selected page
    if (moduleType === 'DI-16') {
        showFunctionalityDI16Page();
    } else {
        showFunctionalityDIPage();
    }
}

function saveCurrentModuleData() {
    const di32Page = document.getElementById('FunctionalityDIPage');
    const di16Page = document.getElementById('di16Page');
    
    // Check which page is currently visible
    if (di32Page && di32Page.style.display !== 'none') {
        // DI-32 page is visible
        saveDITestData(window.currentDIModule);
        console.log('Saved DI-32 data for module', window.currentDIModule);
    } else if (di16Page && di16Page.style.display !== 'none') {
        // DI-16 page is visible
        saveDI16TestData(window.currentDIModule);
        console.log('Saved DI-16 data for module', window.currentDIModule);
    }
}

function showFunctionalityDIPage() {
    // Initialize module tracking
    window.diModulesToTest = parseInt(localStorage.getItem('diModulesToTest')) || 0;
    
    // Make page visible
    document.getElementById('FunctionalityDIPage').style.display = 'block';
    document.getElementById('di16Page').style.display = 'none';

    // Set module info based on stored type
    const moduleType = window.diModuleTypes[window.currentDIModule] || 'DI-32';
    document.getElementById("diNoInput").textContent = window.currentDIModule;
    
    // Update the title
    const titleElement = document.querySelector("#FunctionalityDIPage h1");
    if (titleElement) {
        titleElement.textContent = 
            `Digital Input Module (${moduleType}) - Functional Test (${window.currentDIModule} of ${window.diModulesToTest})`;
    }

    // Generate rows if not already present
    generateDIRows();

    // Load existing data if available
    if (window.diTestResults[window.currentDIModule] && 
        window.diTestResults[window.currentDIModule].type === moduleType) {
        loadDITestData(window.currentDIModule);
    } else {
        // Only set defaults if this is a new module
        clearAll();
    }
}

function showFunctionalityDI16Page() {
    // Hide DI-32 page and show DI-16 page
    document.getElementById('FunctionalityDIPage').style.display = 'none';
    document.getElementById('di16Page').style.display = 'block';

    // Set module info
    document.getElementById("di16NoInput").textContent = window.currentDIModule;
    document.querySelector("#di16Page h1").textContent = 
        `Digital Input Module (DI-16) - Functional Test (${window.currentDIModule} of ${window.diModulesToTest})`;

    // Clear and regenerate rows
    const tableBody = document.getElementById('di16TableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        generateDI16Rows();
    }

    // Initialize empty data structure if none exists
    if (!window.diTestResults[window.currentDIModule]) {
        window.diTestResults[window.currentDIModule] = {
            inputs: [],
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {},
            checkboxValues: {},
            type: 'DI-16',
            qualityInspections: window.diTestResults[window.currentDIModule]?.qualityInspections || {}
        };
    }

    // Load existing data if available
    if (window.diTestResults[window.currentDIModule] && 
        window.diTestResults[window.currentDIModule].type === 'DI-16') {
        loadDI16TestData(window.currentDIModule);
    } else {
        clearAllDI16();
    }
}

function generateDIRows() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        console.error("Table body not found - check HTML structure");
        return;
    }

    tableBody.innerHTML = '';
    
    for (let i = 0; i < 16; i++) {
        const row = document.createElement("tr");
        const rowNumber = i + 1;
        
        // Left channels (1-16)
        row.innerHTML += `
            <td>${rowNumber}</td>
            <td style="text-align: center;">
                <input type="radio" name="DI_${window.currentDIModule}_radio_left_${rowNumber}" value="0" class="di-test-radio">
            </td>
            <td style="text-align: center;">
                <input type="radio" name="DI_${window.currentDIModule}_radio_left_${rowNumber}" value="1" class="di-test-radio">
            </td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC101_${rowNumber}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC104_${rowNumber}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_DNP3_${rowNumber}"></td>
        `;
        
        // Right channels (17-32)
        const rightRowNumber = i + 17;
        row.innerHTML += `
            <td>${rightRowNumber}</td>
            <td style="text-align: center;">
                <input type="radio" name="DI_${window.currentDIModule}_radio_right_${i + 1}" value="0" class="di-test-radio">
            </td>
            <td style="text-align: center;">
                <input type="radio" name="DI_${window.currentDIModule}_radio_right_${i + 1}" value="1" class="di-test-radio">
            </td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC101_${rightRowNumber}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC104_${rightRowNumber}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_DNP3_${rightRowNumber}"></td>
        `;
        
        tableBody.appendChild(row);
    }

    // Add event listeners to radio buttons
    document.querySelectorAll('.di-test-radio').forEach(radio => {
        radio.addEventListener('change', updateSubmitButtonState);
    });
}

// Update generateDI16Rows function
function generateDI16Rows() {
    const tableBody = document.querySelector("#di16TableBody");
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    for (let i = 0; i < 16; i++) {
        const row = document.createElement("tr");
        const rowNumber = i + 1;
        
        row.innerHTML = `
            <td>${rowNumber}</td>
            <td style="text-align: center;">
                <input type="radio" name="DI_${window.currentDIModule}_radio_${rowNumber}" value="0" class="di-test-radio">
            </td>
            <td style="text-align: center;">
                <input type="radio" name="DI_${window.currentDIModule}_radio_${rowNumber}" value="1" class="di-test-radio">
            </td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC101_${rowNumber}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC104_${rowNumber}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_DNP3_${rowNumber}"></td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Add event listeners to radio buttons
    document.querySelectorAll('.di-test-radio').forEach(radio => {
        radio.addEventListener('change', updateDI16SubmitButtonState);
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
    const radios = document.querySelectorAll('.di-test-radio');
    radios.forEach(radio => {
        radio.checked = false;
    });
    
    // Clear all text inputs
    const textInputs = document.querySelectorAll('.di-test-input');
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

function SelectAllDI16() {
    const checkboxes = document.querySelectorAll("#di16TableBody input[type='checkbox']");
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
    
    updateDI16SubmitButtonState();
}

function clearAllDI16() {
    const checkboxes = document.querySelectorAll("#di16TableBody input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = false);

    const textInputs = document.querySelectorAll("#di16TableBody input[type='text']");
    textInputs.forEach(input => input.value = '');

    updateDI16SubmitButtonState();
}

function updateDI16SubmitButtonState() {
    const submitBtn = document.getElementById('submitBtnDI16');
    if (submitBtn) {
        submitBtn.disabled = false; // always enabled, let submission handler validate
    }
}

function saveDITestData(moduleNumber) {
    // Initialize or ensure proper structure exists
    if (!window.diTestResults[moduleNumber]) {
        window.diTestResults[moduleNumber] = {};
    }
    
    // Ensure all required properties exist
    if (!window.diTestResults[moduleNumber].iec101Values) window.diTestResults[moduleNumber].iec101Values = {};
    if (!window.diTestResults[moduleNumber].iec104Values) window.diTestResults[moduleNumber].iec104Values = {};
    if (!window.diTestResults[moduleNumber].dnp3Values) window.diTestResults[moduleNumber].dnp3Values = {};
    if (!window.diTestResults[moduleNumber].radioValues) window.diTestResults[moduleNumber].radioValues = {};
    
    // Set the type
    window.diTestResults[moduleNumber].type = 'DI-32';
    
    // Initialize inputs array
    window.diTestResults[moduleNumber].inputs = [];
    
    // Save all inputs (Generic array backup)
    const inputs = document.querySelectorAll("#tableBody input");
    window.diTestResults[moduleNumber].inputs = Array.from(inputs).map(input => {
        return input.type === 'radio' ? input.checked : input.value;
    });

    // --- FIX STARTS HERE ---
    // Save radio button values (Handle Empty State)
    const rows = document.querySelectorAll("#tableBody tr");
    rows.forEach((row, rowIndex) => {
        const rowNum = rowIndex + 1;

        // 1. Handle Left Side Radios
        const leftKey = `DI_${moduleNumber}_radio_left_${rowNum}`;
        const leftChecked = row.querySelector(`input[name="${leftKey}"]:checked`);
        
        if (leftChecked) {
            // If checked, save the value
            window.diTestResults[moduleNumber].radioValues[leftKey] = leftChecked.value;
        } else {
            // If EMPTY, delete the key so it doesn't persist
            delete window.diTestResults[moduleNumber].radioValues[leftKey];
        }
        
        // 2. Handle Right Side Radios
        // Note: In your generate function, right side starts at 17, but the logic inside the loop 
        // uses the row index logic. Let's ensure we target the correct name attribute.
        // Your generate function uses: name="DI_${window.currentDIModule}_radio_right_${i + 1}"
        const rightKey = `DI_${moduleNumber}_radio_right_${rowNum}`;
        const rightChecked = row.querySelector(`input[name="${rightKey}"]:checked`);
        
        if (rightChecked) {
            window.diTestResults[moduleNumber].radioValues[rightKey] = rightChecked.value;
        } else {
            delete window.diTestResults[moduleNumber].radioValues[rightKey];
        }
    });
    // --- FIX ENDS HERE ---

    // Save protocol values
    for (let i = 1; i <= 32; i++) {
        // IEC101
        const inputIEC101 = document.querySelector(`input[name="DI_${moduleNumber}_IEC101_${i}"]`);
        if (inputIEC101) window.diTestResults[moduleNumber].iec101Values[`DI_${moduleNumber}_IEC101_${i}`] = inputIEC101.value;
        
        // IEC104
        const inputIEC104 = document.querySelector(`input[name="DI_${moduleNumber}_IEC104_${i}"]`);
        if (inputIEC104) window.diTestResults[moduleNumber].iec104Values[`DI_${moduleNumber}_IEC104_${i}`] = inputIEC104.value;
        
        // DNP3
        const inputDNP3 = document.querySelector(`input[name="DI_${moduleNumber}_DNP3_${i}"]`);
        if (inputDNP3) window.diTestResults[moduleNumber].dnp3Values[`DI_${moduleNumber}_DNP3_${i}`] = inputDNP3.value;
    }

    // Ensure qualityInspections exists (preserve existing)
    if (!window.diTestResults[moduleNumber].qualityInspections) {
        window.diTestResults[moduleNumber].qualityInspections = {};
    }

    localStorage.setItem('diTestResults', JSON.stringify(window.diTestResults));
}

function loadDITestData(moduleNumber) {
    const saved = window.diTestResults[moduleNumber];
    if (!saved || saved.type !== 'DI-32') return;

    // Load radio button values
    if (saved.radioValues) {
        Object.keys(saved.radioValues).forEach(radioName => {
            const radio = document.querySelector(`input[name="${radioName}"][value="${saved.radioValues[radioName]}"]`);
            if (radio) {
                radio.checked = true;
            }
        });
    }

    // Load protocol input values
    const inputs = document.querySelectorAll("#tableBody input[type='number']");
    inputs.forEach(input => {
        const name = input.name;
        if (saved.iec101Values && saved.iec101Values[name]) {
            input.value = saved.iec101Values[name];
        } else if (saved.iec104Values && saved.iec104Values[name]) {
            input.value = saved.iec104Values[name];
        } else if (saved.dnp3Values && saved.dnp3Values[name]) {
            input.value = saved.dnp3Values[name];
        }
    });
    
    updateSubmitButtonState();
}


function loadDI16TestData(moduleNumber) {
    const saved = window.diTestResults[moduleNumber];
    if (!saved || saved.type !== 'DI-16') return;

    // Load radio button values
    if (saved.radioValues) {
        Object.keys(saved.radioValues).forEach(radioName => {
            const radio = document.querySelector(`input[name="${radioName}"][value="${saved.radioValues[radioName]}"]`);
            if (radio) {
                radio.checked = true;
            }
        });
    }

    // Load protocol input values
    const inputs = document.querySelectorAll("#di16TableBody input[type='number']");
    inputs.forEach(input => {
        const name = input.name;
        if (saved.iec101Values && saved.iec101Values[name]) {
            input.value = saved.iec101Values[name];
        } else if (saved.iec104Values && saved.iec104Values[name]) {
            input.value = saved.iec104Values[name];
        } else if (saved.dnp3Values && saved.dnp3Values[name]) {
            input.value = saved.dnp3Values[name];
        }
    });
    
    updateDI16SubmitButtonState();
}

async function handleDITestSubmission() {
    // Validate IOA index fields for IEC101 and IEC104
    if (!validateIOAIndexFields()) {
        return;
    }

    // Validate that one radio button is selected for each pair
    /*if (!validateRadioButtons()) {
        alert("Please select either 0 or 1 for all channels before continuing.");
        return;
    }*/
    
    // Save the current module's test data
    saveDITestData(window.currentDIModule);
    window.diModuleTypes[window.currentDIModule] = 'DI-32';
    
    // Save the last module before navigating to DO page
    localStorage.setItem('lastDIModule', window.currentDIModule);
    
    // Move to next module or final page
    window.currentDIModule++;
    localStorage.setItem('currentDIModule', window.currentDIModule);
    
    if (window.currentDIModule > window.diModulesToTest) {
        // All DI modules tested, go to DO page
        navigationGuard.markPageAsCompleted();
        window.location.href = 'FunctionalityDOPage.html';
    } else {
        // Update navigation
        initializeModuleNavigation();
        // Check module type for next module
        const nextType = window.diModuleTypes[window.currentDIModule] || 'DI-32';
        if (nextType === 'DI-16') {
            showFunctionalityDI16Page();
        } else {
            showFunctionalityDIPage();
        }
    }
}
function saveDI16TestData(moduleNumber) {
    // Initialize the module data structure if it doesn't exist
    if (!window.diTestResults[moduleNumber] || window.diTestResults[moduleNumber].type !== 'DI-16') {
        window.diTestResults[moduleNumber] = {
            inputs: [],
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {},
            radioValues: {},
            type: 'DI-16',
            qualityInspections: window.diTestResults[moduleNumber]?.qualityInspections || {}
        };
    } else {
        // Ensure all necessary objects exist
        if (!window.diTestResults[moduleNumber].iec101Values) window.diTestResults[moduleNumber].iec101Values = {};
        if (!window.diTestResults[moduleNumber].iec104Values) window.diTestResults[moduleNumber].iec104Values = {};
        if (!window.diTestResults[moduleNumber].dnp3Values) window.diTestResults[moduleNumber].dnp3Values = {};
        if (!window.diTestResults[moduleNumber].radioValues) window.diTestResults[moduleNumber].radioValues = {};
    }

    // Save all inputs
    const inputs = document.querySelectorAll("#di16TableBody input");
    window.diTestResults[moduleNumber].inputs = Array.from(inputs).map(input => {
        return input.type === 'radio' ? input.checked : input.value;
    });

    // --- FIX STARTS HERE ---
    // Save radio button values (Handle Empty State)
    const rows = document.querySelectorAll("#di16TableBody tr");
    rows.forEach((row, rowIndex) => {
        const rowNum = rowIndex + 1;
        const radioKey = `DI_${moduleNumber}_radio_${rowNum}`;
        
        // Find if any radio in this group is checked
        const checkedRadio = row.querySelector(`input[name="${radioKey}"]:checked`);

        if (checkedRadio) {
            // Save value
            window.diTestResults[moduleNumber].radioValues[radioKey] = checkedRadio.value;
        } else {
            // Delete key if empty
            delete window.diTestResults[moduleNumber].radioValues[radioKey];
        }
    });
    // --- FIX ENDS HERE ---

    // Save protocol values - only for 16 channels
    for (let i = 1; i <= 16; i++) {
        // IEC101
        const inputIEC101 = document.querySelector(`input[name="DI_${moduleNumber}_IEC101_${i}"]`);
        if (inputIEC101) window.diTestResults[moduleNumber].iec101Values[`DI_${moduleNumber}_IEC101_${i}`] = inputIEC101.value;
        
        // IEC104
        const inputIEC104 = document.querySelector(`input[name="DI_${moduleNumber}_IEC104_${i}"]`);
        if (inputIEC104) window.diTestResults[moduleNumber].iec104Values[`DI_${moduleNumber}_IEC104_${i}`] = inputIEC104.value;
        
        // DNP3
        const inputDNP3 = document.querySelector(`input[name="DI_${moduleNumber}_DNP3_${i}"]`);
        if (inputDNP3) window.diTestResults[moduleNumber].dnp3Values[`DI_${moduleNumber}_DNP3_${i}`] = inputDNP3.value;
    }

    localStorage.setItem('diTestResults', JSON.stringify(window.diTestResults));
}

async function handleDI16TestSubmission() {
    // Validate IOA index fields for IEC101 and IEC104
    if (!validateIOAIndexFields()) {
        return;
    }

    // Validate that one radio button is selected for each row
    if (!validateDI16RadioButtons()) {
        alert("Please select either 0 or 1 for all channels before continuing.");
        return;
    }
    
    // Save data and continue to next module
    saveDI16TestData(window.currentDIModule);
    window.diModuleTypes[window.currentDIModule] = 'DI-16';
    localStorage.setItem('diModuleTypes', JSON.stringify(window.diModuleTypes));
    
    // Save the last module before navigating to DO page
    localStorage.setItem('lastDIModule', window.currentDIModule);
    
    window.currentDIModule++;
    localStorage.setItem('currentDIModule', window.currentDIModule);
    
    if (window.currentDIModule > window.diModulesToTest) {
        // All DI modules tested, go to DO page
        navigationGuard.markPageAsCompleted();
        window.location.href = 'FunctionalityDOPage.html';
    } else {
        // Check module type for next module
        const nextType = window.diModuleTypes[window.currentDIModule] || 'DI-32';
        if (nextType === 'DI-16') {
            showFunctionalityDI16Page();
        } else {
            showFunctionalityDIPage();
        }
    }
}

// New validation function for radio buttons (DI-32)
function validateRadioButtons() {
    const rows = document.querySelectorAll("#tableBody tr");
    
    for (const row of rows) {
        // Check left side (columns 2-3)
        const leftRadios = row.querySelectorAll('td:nth-child(2) input[type="radio"], td:nth-child(3) input[type="radio"]');
        const leftSelected = Array.from(leftRadios).some(radio => radio.checked);
        
        // Check right side (columns 8-9)
        const rightRadios = row.querySelectorAll('td:nth-child(8) input[type="radio"], td:nth-child(9) input[type="radio"]');
        const rightSelected = Array.from(rightRadios).some(radio => radio.checked);
        
        // Both sides must have one radio selected
        if (!leftSelected || !rightSelected) {
            return false;
        }
    }
    
    return true;
}

// New validation function for radio buttons (DI-16)
function validateDI16RadioButtons() {
    const rows = document.querySelectorAll("#di16TableBody tr");
    
    for (const row of rows) {
        const radios = row.querySelectorAll('td:nth-child(2) input[type="radio"], td:nth-child(3) input[type="radio"]');
        const hasSelection = Array.from(radios).some(radio => radio.checked);
        
        if (!hasSelection) {
            return false;
        }
    }
    
    return true;
}

function goToPreviousPage() {
    // Save current test data before navigating
    if (document.getElementById('FunctionalityDIPage').style.display !== 'none') {
        saveDITestData(window.currentDIModule);
    } else if (document.getElementById('di16Page').style.display !== 'none') {
        saveDI16TestData(window.currentDIModule);
    }

    // If we're on the first module, go back to Quality Inspection page
    if (window.currentDIModule === 1) {
        window.location.href = 'FunctionalityTestCOM6.html';
        return;
    }

    // Go to previous module
    window.currentDIModule--;
    localStorage.setItem('currentDIModule', window.currentDIModule);

    // Load the saved module type for this module
    const currentModuleType = window.diModuleTypes[window.currentDIModule] || 'DI-32';
    
    // Clear any existing table rows before showing the correct page
    const tableBody = document.getElementById('tableBody');
    if (tableBody) tableBody.innerHTML = '';
    const di16TableBody = document.getElementById('di16TableBody');
    if (di16TableBody) di16TableBody.innerHTML = '';

    // Show DI-16 page if the module is DI-16
    if (currentModuleType === 'DI-16') {
        showFunctionalityDI16Page();
    } else {
        showFunctionalityDIPage();
    }
}

// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('diTestResults');
    if (savedResults) {
        window.diTestResults = JSON.parse(savedResults);
    }
    
    // Initialize module tracking
    window.diModulesToTest = parseInt(localStorage.getItem('diModulesToTest')) || 0;
    
    // Check if we're returning from DO page
    const returningFromDO = localStorage.getItem('returningToDI') === 'true';
    localStorage.removeItem('returningToDI'); // Clear the flag
    
    if (returningFromDO) {
        // Use the last DI module (but ensure it doesn't exceed total modules)
        const lastDIModule = parseInt(localStorage.getItem('lastDIModule')) || window.diModulesToTest;
        window.currentDIModule = Math.min(lastDIModule, window.diModulesToTest);
    } else {
        window.currentDIModule = parseInt(localStorage.getItem('currentDIModule')) || 1;
    }
    
    // Ensure currentDIModule doesn't exceed total modules
    if (window.currentDIModule > window.diModulesToTest) {
        window.currentDIModule = window.diModulesToTest;
    }
    
    localStorage.setItem('currentDIModule', window.currentDIModule);
    
    // Load saved module types if available
    const savedTypes = localStorage.getItem('diModuleTypes');
    if (savedTypes) {
        window.diModuleTypes = JSON.parse(savedTypes);
    } else {
        window.diModuleTypes = {};
        // Initialize with default types if none saved
        for (let i = 1; i <= window.diModulesToTest; i++) {
            window.diModuleTypes[i] = 'DI-32'; // Default type
        }
    }
    
    // Initialize navigation
    initializeModuleNavigation();
    
    // Always show DI-16 page if the current module is DI-16
    const firstModuleType = window.diModuleTypes[window.currentDIModule] || 'DI-32';
    if (firstModuleType === 'DI-16') {
        showFunctionalityDI16Page();
    } else {
        showFunctionalityDIPage();
    }
});

// Removed quality inspection validation functions - they're now in QualityInspectionDI.js

function validateIOAIndexFields() {
    // 1. Determine current page and scope
    const di32Page = document.getElementById('FunctionalityDIPage');
    const di16Page = document.getElementById('di16Page');
    let currentPageContainer = null;
    let inputClass = '';

    if (di32Page && di32Page.style.display !== 'none') {
        currentPageContainer = '#FunctionalityDIPage';
        inputClass = '.di-test-input';
    } else if (di16Page && di16Page.style.display !== 'none') {
        currentPageContainer = '#di16Page';
        inputClass = '.di-test-input';
    } else {
        return false;
    }

    // 2. Get LIVE inputs from the current screen
    const currentIEC101Inputs = document.querySelectorAll(`${currentPageContainer} input[name*="IEC101"]`);
    const currentIEC104Inputs = document.querySelectorAll(`${currentPageContainer} input[name*="IEC104"]`);

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
    const rawData = localStorage.getItem('diTestResults');
    const savedResults = rawData ? JSON.parse(rawData) : {};
    
    // B. REMOVE the current module's saved data from memory
    const currentModKey = String(window.currentDIModule);
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
                    // Extract channel number from the key format: "DI_X_IEC101_Y" or "DI_X_IEC101_Y"
                    let cellName = 'Unknown Cell';
                    // Match patterns like "DI_1_IEC101_1" or "DI_1_IEC101_17"
                    const match = cellKey.match(/DI_\d+_IEC101_(\d+)/);
                    if (match) {
                        cellName = `IEC101-NO: ${match[1]}`;
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
                    // Extract channel number from the key format: "DI_X_IEC104_Y"
                    let cellName = 'Unknown Cell';
                    const match = cellKey.match(/DI_\d+_IEC104_(\d+)/);
                    if (match) {
                        cellName = `IEC104-NO: ${match[1]}`;
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
            // Get cell name from input name - format: "DI_X_IEC101_Y"
            let cellName = 'Current Cell';
            const inputName = input.name || '';
            // Match patterns like "DI_1_IEC101_1" or "DI_1_IEC101_17"
            const match = inputName.match(/DI_\d+_IEC101_(\d+)/);
            if (match) {
                cellName = `IEC101-NO: ${match[1]}`;
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
            // Get cell name from input name - format: "DI_X_IEC104_Y"
            let cellName = 'Current Cell';
            const inputName = input.name || '';
            const match = inputName.match(/DI_\d+_IEC104_(\d+)/);
            if (match) {
                cellName = `IEC104-NO: ${match[1]}`;
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
// You'll need to update the navigation in your main flow to use QualityInspectionDI.html instead of FunctionalityDIPage.html for the first step
