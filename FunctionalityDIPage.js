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
        
        // Left channels (1-16)
        row.innerHTML += `
            <td>${i + 1}</td>
            <td><input type="checkbox" class="di-test-checkbox"></td>
            <td><input type="checkbox" class="di-test-checkbox"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC101_${i + 1}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC104_${i + 1}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_DNP3_${i + 1}"></td>
        `;
        
        // Right channels (17-32)
        row.innerHTML += `
            <td>${i + 17}</td>
            <td><input type="checkbox" class="di-test-checkbox"></td>
            <td><input type="checkbox" class="di-test-checkbox"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC101_${i + 17}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC104_${i + 17}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_DNP3_${i + 17}"></td>
        `;
        
        tableBody.appendChild(row);
    }

    // Add event listeners safely
    document.querySelectorAll('.di-test-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSubmitButtonState);
    });
}

function generateDI16Rows() {
    const tableBody = document.querySelector("#di16TableBody");
    if (!tableBody) return;
    
    // Clear existing content and any event listeners
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
    
    for (let i = 0; i < 16; i++) {
        const row = document.createElement("tr");
        
        // Number column
        row.innerHTML += `<td>${i + 1}</td>`;
        
        // Checkboxes and text inputs
        row.innerHTML += `
            <td style="text-align: center;"><input type="checkbox" class="di-test-checkbox"></td>
            <td style="text-align: center;"><input type="checkbox" class="di-test-checkbox"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC101_${i + 1}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_IEC104_${i + 1}"></td>
            <td><input type="number" class="di-test-input" name="DI_${window.currentDIModule}_DNP3_${i + 1}"></td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Add event listeners to checkboxes
    const checkboxes = tableBody.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateDI16SubmitButtonState);
    });
}

function SelectAll() {
    const rows = document.querySelectorAll("#tableBody tr");
    let allChecked = true;
    
    // First check if all checkboxes are already checked
    rows.forEach(row => {
        const checkboxes = row.querySelectorAll("td:nth-child(2) input[type='checkbox'], td:nth-child(3) input[type='checkbox'], td:nth-child(8) input[type='checkbox'], td:nth-child(9) input[type='checkbox']");
        checkboxes.forEach(cb => {
            if (!cb.checked) allChecked = false;
        });
    });
    
    // Then toggle based on current state
    rows.forEach(row => {
        const checkboxes = row.querySelectorAll("td:nth-child(2) input[type='checkbox'], td:nth-child(3) input[type='checkbox'], td:nth-child(8) input[type='checkbox'], td:nth-child(9) input[type='checkbox']");
        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
        });
    });
    
    updateSubmitButtonState();
}

function clearAll() {
    // Clear all checkboxes
    const checkboxes = document.querySelectorAll('.di-test-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
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
    if (!window.diTestResults[moduleNumber] || window.diTestResults[moduleNumber].type !== 'DI-32') {
        window.diTestResults[moduleNumber] = {
            inputs: [],
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {},
            checkboxValues: {},
            type: 'DI-32',
            qualityInspections: window.diTestResults[moduleNumber]?.qualityInspections || {}
        };
    }

    // Save all inputs
    const inputs = document.querySelectorAll("#tableBody input");
    window.diTestResults[moduleNumber].inputs = Array.from(inputs).map(input => {
        return input.type === 'checkbox' ? input.checked : input.value;
    });

    // Save checkbox values with their positions
    const rows = document.querySelectorAll("#tableBody tr");
    rows.forEach((row, rowIndex) => {
        // Left side checkboxes (columns 2 and 3)
        const leftCheckbox1 = row.querySelector("td:nth-child(2) input[type='checkbox']");
        const leftCheckbox2 = row.querySelector("td:nth-child(3) input[type='checkbox']");
        
        // Right side checkboxes (columns 8 and 9)
        const rightCheckbox1 = row.querySelector("td:nth-child(8) input[type='checkbox']");
        const rightCheckbox2 = row.querySelector("td:nth-child(9) input[type='checkbox']");

        // Save left side checkboxes (channels 1-16)
        if (leftCheckbox1) {
            window.diTestResults[moduleNumber].checkboxValues[`Check_Box_DI_${moduleNumber}_FT_1_${rowIndex + 1}`] = leftCheckbox1.checked;
        }
        if (leftCheckbox2) {
            window.diTestResults[moduleNumber].checkboxValues[`Check_Box_DI_${moduleNumber}_FT_2_${rowIndex + 1}`] = leftCheckbox2.checked;
        }
        
        // Save right side checkboxes (channels 17-32)
        if (rightCheckbox1) {
            window.diTestResults[moduleNumber].checkboxValues[`Check_Box_DI_${moduleNumber}_FT_3_${rowIndex + 1}`] = rightCheckbox1.checked;
        }
        if (rightCheckbox2) {
            window.diTestResults[moduleNumber].checkboxValues[`Check_Box_DI_${moduleNumber}_FT_4_${rowIndex + 1}`] = rightCheckbox2.checked;
        }
    });

    // Save protocol values
    for (let i = 1; i <= 32; i++) {
        // IEC101
        const inputIEC101 = document.querySelector(`input[name="DI_${moduleNumber}_IEC101_${i}"]`);
        if (inputIEC101) {
            window.diTestResults[moduleNumber].iec101Values[`DI_${moduleNumber}_IEC101_${i}`] = inputIEC101.value;
        }
        
        // IEC104
        const inputIEC104 = document.querySelector(`input[name="DI_${moduleNumber}_IEC104_${i}"]`);
        if (inputIEC104) {
            window.diTestResults[moduleNumber].iec104Values[`DI_${moduleNumber}_IEC104_${i}`] = inputIEC104.value;
        }
        
        // DNP3
        const inputDNP3 = document.querySelector(`input[name="DI_${moduleNumber}_DNP3_${i}"]`);
        if (inputDNP3) {
            window.diTestResults[moduleNumber].dnp3Values[`DI_${moduleNumber}_DNP3_${i}`] = inputDNP3.value;
        }
    }

    localStorage.setItem('diTestResults', JSON.stringify(window.diTestResults));
}

function loadDITestData(moduleNumber) {
    const saved = window.diTestResults[moduleNumber];
    if (!saved || saved.type !== 'DI-32') return;

    // Load table inputs
    const inputs = document.querySelectorAll("#tableBody input");
    saved.inputs.forEach((value, idx) => {
        const input = inputs[idx];
        if (!input) return;

        if (input.type === 'checkbox') {
            input.checked = !!value;
        } else {
            input.value = value;
        }
    });
    updateSubmitButtonState();
}

function loadDI16TestData(moduleNumber) {
    const saved = window.diTestResults[moduleNumber];
    if (!saved || saved.type !== 'DI-16') return;

    // Load table inputs
    const inputs = document.querySelectorAll("#di16TableBody input");
    saved.inputs.forEach((value, idx) => {
        const input = inputs[idx];
        if (!input) return;

        if (input.type === 'checkbox') {
            input.checked = !!value;
        } else {
            input.value = value;
        }
    });
    updateDI16SubmitButtonState();
}

async function handleDITestSubmission() {
    // Validate IOA index fields for IEC101 and IEC104
    if (!validateIOAIndexFields()) {
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
            checkboxValues: {},
            type: 'DI-16',
            qualityInspections: window.diTestResults[moduleNumber]?.qualityInspections || {}
        };
    } else {
        // Ensure all necessary objects exist even if the module data exists
        if (!window.diTestResults[moduleNumber].iec101Values) {
            window.diTestResults[moduleNumber].iec101Values = {};
        }
        if (!window.diTestResults[moduleNumber].iec104Values) {
            window.diTestResults[moduleNumber].iec104Values = {};
        }
        if (!window.diTestResults[moduleNumber].dnp3Values) {
            window.diTestResults[moduleNumber].dnp3Values = {};
        }
        if (!window.diTestResults[moduleNumber].checkboxValues) {
            window.diTestResults[moduleNumber].checkboxValues = {};
        }
    }

    // Save all inputs
    const inputs = document.querySelectorAll("#di16TableBody input");
    window.diTestResults[moduleNumber].inputs = Array.from(inputs).map(input => {
        return input.type === 'checkbox' ? input.checked : input.value;
    });

    // Save checkbox values with their positions
    const rows = document.querySelectorAll("#di16TableBody tr");
    rows.forEach((row, rowIndex) => {
        const checkbox1 = row.querySelector("td:nth-child(2) input[type='checkbox']");
        const checkbox2 = row.querySelector("td:nth-child(3) input[type='checkbox']");
        
        if (checkbox1) {
            window.diTestResults[moduleNumber].checkboxValues[`Check_Box_DI_${moduleNumber}_FT_1_${rowIndex + 1}`] = checkbox1.checked;
        }
        if (checkbox2) {
            window.diTestResults[moduleNumber].checkboxValues[`Check_Box_DI_${moduleNumber}_FT_2_${rowIndex + 1}`] = checkbox2.checked;
        }
    });

    // Save protocol values - only for 16 channels
    for (let i = 1; i <= 16; i++) {
        // IEC101
        const inputIEC101 = document.querySelector(`input[name="DI_${moduleNumber}_IEC101_${i}"]`);
        if (inputIEC101) {
            window.diTestResults[moduleNumber].iec101Values[`DI_${moduleNumber}_IEC101_${i}`] = inputIEC101.value;
        }
        
        // IEC104
        const inputIEC104 = document.querySelector(`input[name="DI_${moduleNumber}_IEC104_${i}"]`);
        if (inputIEC104) {
            window.diTestResults[moduleNumber].iec104Values[`DI_${moduleNumber}_IEC104_${i}`] = inputIEC104.value;
        }
        
        // DNP3
        const inputDNP3 = document.querySelector(`input[name="DI_${moduleNumber}_DNP3_${i}"]`);
        if (inputDNP3) {
            window.diTestResults[moduleNumber].dnp3Values[`DI_${moduleNumber}_DNP3_${i}`] = inputDNP3.value;
        }
    }

    localStorage.setItem('diTestResults', JSON.stringify(window.diTestResults));
}

async function handleDI16TestSubmission() {
    // Validate IOA index fields for IEC101 and IEC104
    if (!validateIOAIndexFields()) {
        return; // Stop if validation fails
    }

    // Get all checkboxes in the current table
    const checkboxes = document.querySelectorAll("#di16TableBody input[type='checkbox']");
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

// Validate IOA index fields for IEC101 and IEC104 only
function validateIOAIndexFields() {
    // Determine which page is currently visible
    const di32Page = document.getElementById('FunctionalityDIPage');
    const di16Page = document.getElementById('di16Page');
    let currentPageContainer = null;
    
    if (di32Page && di32Page.style.display !== 'none') {
        currentPageContainer = '#FunctionalityDIPage';
    } else if (di16Page && di16Page.style.display !== 'none') {
        currentPageContainer = '#di16Page';
    } else {
        // If no page is visible, return false
        return false;
    }
    
    // Get IEC101 and IEC104 input fields ONLY from the current page
    const iec101Inputs = document.querySelectorAll(`${currentPageContainer} input[class*="di-test-input"][name*="IEC101"]`);
    const iec104Inputs = document.querySelectorAll(`${currentPageContainer} input[class*="di-test-input"][name*="IEC104"]`);
    
    let isValid = true;
    let emptyFields = [];
    let duplicateFields = [];

    // Reset previous red borders on current page only
    [...iec101Inputs, ...iec104Inputs].forEach(input => {
        input.style.border = ''; // clear border
    });

    // Check IEC101 fields for empty values on current page
    iec101Inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.border = '2px solid red';
            isValid = false;
            const channel = input.name.split('_').pop();
            emptyFields.push(`IEC101 Channel ${channel}`);
        }
    });
    
    // Check IEC104 fields for empty values on current page
    iec104Inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.border = '2px solid red';
            isValid = false;
            const channel = input.name.split('_').pop();
            emptyFields.push(`IEC104 Channel ${channel}`);
        }
    });

    if (!isValid) {
        alert(`Please fill in all IOA index fields for IEC101 and IEC104 protocols.`);
        return false;
    }

    // Check for duplicate values in IEC101 column - ONLY within current page
    const iec101Values = Array.from(iec101Inputs).map(input => input.value.trim()).filter(val => val !== '');
    const iec101Duplicates = findDuplicates(iec101Values);
    if (iec101Duplicates.length > 0) {
        isValid = false;
        iec101Inputs.forEach(input => {
            if (iec101Duplicates.includes(input.value.trim())) {
                input.style.border = '2px solid red';
            }
        });
        duplicateFields.push(`IEC101: Duplicate values found (${iec101Duplicates.join(', ')})`);
    }

    // Check for duplicate values in IEC104 column - ONLY within current page
    const iec104Values = Array.from(iec104Inputs).map(input => input.value.trim()).filter(val => val !== '');
    const iec104Duplicates = findDuplicates(iec104Values);
    if (iec104Duplicates.length > 0) {
        isValid = false;
        iec104Inputs.forEach(input => {
            if (iec104Duplicates.includes(input.value.trim())) {
                input.style.border = '2px solid red';
            }
        });
        duplicateFields.push(`IEC104: Duplicate values found (${iec104Duplicates.join(', ')})`);
    }

    if (duplicateFields.length > 0) {
        alert(`Duplicate IOA index values found:\n${duplicateFields.join('\n')}\n\nEach value must be unique within the current page.`);
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

// You'll need to update the navigation in your main flow to use QualityInspectionDI.html instead of FunctionalityDIPage.html for the first step