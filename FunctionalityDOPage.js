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
        
        // Change radio buttons to checkboxes with radio-like behavior
        row.innerHTML = `
            <td>${rowNumber}</td>
            <td style="text-align: center;">
                <input type="checkbox" name="DO_${window.currentDOModule}_checkbox_${rowNumber}" value="1" class="do-test-checkbox do-checkbox-group">
            </td>
            <td style="text-align: center;">
                <input type="checkbox" name="DO_${window.currentDOModule}_checkbox_${rowNumber}" value="2" class="do-test-checkbox do-checkbox-group">
            </td>
            <td><input type="text" class="do-test-input" name="DO_${window.currentDOModule}_IEC101_${rowNumber}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="do-test-input" name="DO_${window.currentDOModule}_IEC104_${rowNumber}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="do-test-input" name="DO_${window.currentDOModule}_DNP3_${rowNumber}" placeholder="Enter IOA or -"></td>
        `;
        
        tableBody.appendChild(row);
    }

    // Add event listeners to checkboxes for radio-like behavior
    document.querySelectorAll('.do-checkbox-group').forEach(checkbox => {
        checkbox.addEventListener('click', function(e) {
            const groupName = this.name;
            if (this.checked) {
                // Uncheck all other checkboxes in the same group
                document.querySelectorAll(`input[name="${groupName}"]`).forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
            }
            updateSubmitButtonState();
        });
    });
    
    // Add event listeners to text inputs
    document.querySelectorAll('.do-test-input').forEach(input => {
        input.addEventListener('input', updateSubmitButtonState);
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
        
        // Change radio buttons to checkboxes with radio-like behavior
        row.innerHTML = `
            <td>${rowNumber}</td>
            <td style="text-align: center;">
                <input type="checkbox" name="DO8_${window.currentDOModule}_checkbox_${rowNumber}" value="1" class="do8-test-checkbox do8-checkbox-group">
            </td>
            <td style="text-align: center;">
                <input type="checkbox" name="DO8_${window.currentDOModule}_checkbox_${rowNumber}" value="2" class="do8-test-checkbox do8-checkbox-group">
            </td>
            <td><input type="text" class="do8-test-input" name="DO_${window.currentDOModule}_IEC101_${rowNumber}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="do8-test-input" name="DO_${window.currentDOModule}_IEC104_${rowNumber}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="do8-test-input" name="DO_${window.currentDOModule}_DNP3_${rowNumber}" placeholder="Enter IOA or -"></td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Add event listeners to checkboxes for radio-like behavior
    document.querySelectorAll('.do8-checkbox-group').forEach(checkbox => {
        checkbox.addEventListener('click', function(e) {
            const groupName = this.name;
            if (this.checked) {
                // Uncheck all other checkboxes in the same group
                document.querySelectorAll(`input[name="${groupName}"]`).forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
            }
            updateDO8SubmitButtonState();
        });
    });
    
    // Add event listeners to text inputs
    document.querySelectorAll('#do8TableBody .do8-test-input').forEach(input => {
        input.addEventListener('input', updateDO8SubmitButtonState);
    });
}

// Update SelectAll function for checkboxes (selects "2" for all)
function SelectAll() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    if (rows.length === 0) return;
    
    // Determine current pattern
    const firstRow = rows[0];
    const firstCheckbox2 = firstRow.querySelector('td:nth-child(3) input[type="checkbox"][value="2"]');
    
    // Check if all are set to 2
    let setToAllTwo = true;
    rows.forEach(row => {
        const checkbox2 = row.querySelector('td:nth-child(3) input[type="checkbox"][value="2"]');
        if (!checkbox2?.checked) {
            setToAllTwo = false;
        }
    });
    
    rows.forEach((row, index) => {
        const checkbox1 = row.querySelector('td:nth-child(2) input[type="checkbox"][value="1"]');
        const checkbox2 = row.querySelector('td:nth-child(3) input[type="checkbox"][value="2"]');
        
        if (setToAllTwo) {
            // Toggle to alternating pattern: 2,1,2,1,... vertically
            if (index % 2 === 0) { // Even rows (0,2,4,...)
                if (checkbox2) checkbox2.checked = false;
                if (checkbox1) checkbox1.checked = true;
            } else { // Odd rows (1,3,5,...)
                if (checkbox1) checkbox1.checked = false;
                if (checkbox2) checkbox2.checked = true;
            }
        } else {
            // Set all to 2 (current behavior)
            if (checkbox2) checkbox2.checked = true;
            if (checkbox1) checkbox1.checked = false;
        }
    });
    
    updateSubmitButtonState();
}

// Update clearAll function
function clearAll() {
    // Clear all checkboxes
    const checkboxes = document.querySelectorAll('#tableBody .do-test-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
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
    
    // Enable the button by default
    submitBtn.disabled = false;
}

function SelectAllDO8() {
    const tableBody = document.getElementById('do8TableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    if (rows.length === 0) return;
    
    // Determine current pattern
    const firstRow = rows[0];
    const firstCheckbox2 = firstRow.querySelector('td:nth-child(3) input[type="checkbox"][value="2"]');
    
    // Check if all are set to 2
    let setToAllTwo = true;
    rows.forEach(row => {
        const checkbox2 = row.querySelector('td:nth-child(3) input[type="checkbox"][value="2"]');
        if (!checkbox2?.checked) {
            setToAllTwo = false;
        }
    });
    
    rows.forEach((row, index) => {
        const checkbox1 = row.querySelector('td:nth-child(2) input[type="checkbox"][value="1"]');
        const checkbox2 = row.querySelector('td:nth-child(3) input[type="checkbox"][value="2"]');
        
        if (setToAllTwo) {
            // Toggle to alternating pattern: 2,1,2,1,... vertically
            if (index % 2 === 0) { // Even rows (0,2,4,...)
                if (checkbox2) checkbox2.checked = false;
                if (checkbox1) checkbox1.checked = true;
            } else { // Odd rows (1,3,5,...)
                if (checkbox1) checkbox1.checked = false;
                if (checkbox2) checkbox2.checked = true;
            }
        } else {
            // Set all to 2 (current behavior)
            if (checkbox2) checkbox2.checked = true;
            if (checkbox1) checkbox1.checked = false;
        }
    });
    
    updateDO8SubmitButtonState();
}

function clearAllDO8() {
    const checkboxes = document.querySelectorAll("#do8TableBody input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = false);

    const textInputs = document.querySelectorAll("#do8TableBody input[type='number']");
    textInputs.forEach(input => input.value = '');

    updateDO8SubmitButtonState();
}

function updateDO8SubmitButtonState() {
    const submitBtn = document.getElementById('submitBtnDO8');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}

function saveDOTestData(moduleNumber) {
    // Initialize or ensure proper structure exists
    if (!window.doTestResults[moduleNumber]) {
        window.doTestResults[moduleNumber] = {};
    }
    
    // Ensure all required properties exist
    if (!window.doTestResults[moduleNumber].iec101Values) {
        window.doTestResults[moduleNumber].iec101Values = {};
    }
    if (!window.doTestResults[moduleNumber].iec104Values) {
        window.doTestResults[moduleNumber].iec104Values = {};
    }
    if (!window.doTestResults[moduleNumber].dnp3Values) {
        window.doTestResults[moduleNumber].dnp3Values = {};
    }
    if (!window.doTestResults[moduleNumber].checkboxValues) {
        window.doTestResults[moduleNumber].checkboxValues = {};
    }
    
    // Set the type
    window.doTestResults[moduleNumber].type = 'CO-16-A';
    
    // Initialize inputs array if it doesn't exist
    if (!window.doTestResults[moduleNumber].inputs) {
        window.doTestResults[moduleNumber].inputs = [];
    }
    
    // Save all inputs
    const inputs = document.querySelectorAll("#tableBody input");
    window.doTestResults[moduleNumber].inputs = Array.from(inputs).map(input => {
        return input.type === 'checkbox' ? input.checked : input.value;
    });

    // Save checkbox values with their positions
    const rows = document.querySelectorAll("#tableBody tr");
    rows.forEach((row, rowIndex) => {
        const rowNumber = rowIndex + 1;
        
        // Checkboxes for this row (columns 2 and 3)
        const checkbox1 = row.querySelector("td:nth-child(2) input[type='checkbox']");
        const checkbox2 = row.querySelector("td:nth-child(3) input[type='checkbox']");

        // Save checkboxes
        if (checkbox1) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO_${moduleNumber}_FT_1_${rowNumber}`] = checkbox1.checked;
        }
        if (checkbox2) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO_${moduleNumber}_FT_2_${rowNumber}`] = checkbox2.checked;
        }
    });

    // Save protocol values
    for (let i = 1; i <= 16; i++) {
        // IEC101
        const inputIEC101 = document.querySelector(`input[name="DO_${moduleNumber}_IEC101_${i}"]`);
        if (inputIEC101) {
            window.doTestResults[moduleNumber].iec101Values[`DO_${moduleNumber}_IEC101_${i}`] = inputIEC101.value;
        }
        
        // IEC104
        const inputIEC104 = document.querySelector(`input[name="DO_${moduleNumber}_IEC104_${i}"]`);
        if (inputIEC104) {
            window.doTestResults[moduleNumber].iec104Values[`DO_${moduleNumber}_IEC104_${i}`] = inputIEC104.value;
        }
        
        // DNP3
        const inputDNP3 = document.querySelector(`input[name="DO_${moduleNumber}_DNP3_${i}"]`);
        if (inputDNP3) {
            window.doTestResults[moduleNumber].dnp3Values[`DO_${moduleNumber}_DNP3_${i}`] = inputDNP3.value;
        }
    }

    localStorage.setItem('doTestResults', JSON.stringify(window.doTestResults));
}


function saveDO8TestData(moduleNumber) {
    // Initialize or ensure proper structure exists
    if (!window.doTestResults[moduleNumber]) {
        window.doTestResults[moduleNumber] = {};
    }
    
    // Ensure all required properties exist
    if (!window.doTestResults[moduleNumber].iec101Values) {
        window.doTestResults[moduleNumber].iec101Values = {};
    }
    if (!window.doTestResults[moduleNumber].iec104Values) {
        window.doTestResults[moduleNumber].iec104Values = {};
    }
    if (!window.doTestResults[moduleNumber].dnp3Values) {
        window.doTestResults[moduleNumber].dnp3Values = {};
    }
    if (!window.doTestResults[moduleNumber].checkboxValues) {
        window.doTestResults[moduleNumber].checkboxValues = {};
    }
    
    // Set the type
    window.doTestResults[moduleNumber].type = 'CO-8-A';
    
    // Initialize inputs array if it doesn't exist
    if (!window.doTestResults[moduleNumber].inputs) {
        window.doTestResults[moduleNumber].inputs = [];
    }
    
    // Save all inputs
    const inputs = document.querySelectorAll("#do8TableBody input");
    window.doTestResults[moduleNumber].inputs = Array.from(inputs).map(input => {
        return input.type === 'checkbox' ? input.checked : input.value;
    });

    // Save checkbox values with their positions
    const rows = document.querySelectorAll("#do8TableBody tr");
    rows.forEach((row, rowIndex) => {
        const rowNumber = rowIndex + 1;
        
        // Checkboxes for this row (columns 2 and 3)
        const checkbox1 = row.querySelector("td:nth-child(2) input[type='checkbox']");
        const checkbox2 = row.querySelector("td:nth-child(3) input[type='checkbox']");

        // Save checkboxes
        if (checkbox1) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO8_${moduleNumber}_FT_1_${rowNumber}`] = checkbox1.checked;
        }
        if (checkbox2) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO8_${moduleNumber}_FT_2_${rowNumber}`] = checkbox2.checked;
        }
    });

    // Save protocol values
    for (let i = 1; i <= 8; i++) {
        // IEC101
        const inputIEC101 = document.querySelector(`input[name="DO_${moduleNumber}_IEC101_${i}"]`);
        if (inputIEC101) {
            window.doTestResults[moduleNumber].iec101Values[`DO_${moduleNumber}_IEC101_${i}`] = inputIEC101.value;
        }
        
        // IEC104
        const inputIEC104 = document.querySelector(`input[name="DO_${moduleNumber}_IEC104_${i}"]`);
        if (inputIEC104) {
            window.doTestResults[moduleNumber].iec104Values[`DO_${moduleNumber}_IEC104_${i}`] = inputIEC104.value;
        }
        
        // DNP3
        const inputDNP3 = document.querySelector(`input[name="DO_${moduleNumber}_DNP3_${i}"]`);
        if (inputDNP3) {
            window.doTestResults[moduleNumber].dnp3Values[`DO_${moduleNumber}_DNP3_${i}`] = inputDNP3.value;
        }
    }

    localStorage.setItem('doTestResults', JSON.stringify(window.doTestResults));
}

function loadDOTestData(moduleNumber) {
    const saved = window.doTestResults[moduleNumber];
    if (!saved || saved.type !== 'CO-16-A') return;

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

function loadDO8TestData(moduleNumber) {
    const saved = window.doTestResults[moduleNumber];
    if (!saved || saved.type !== 'CO-8-A') return;

    // Load table inputs
    const inputs = document.querySelectorAll("#do8TableBody input");
    saved.inputs.forEach((value, idx) => {
        const input = inputs[idx];
        if (!input) return;

        if (input.type === 'checkbox') {
            input.checked = !!value;
        } else {
            input.value = value;
        }
    });
    
    updateDO8SubmitButtonState();
}

async function handleDOTestSubmission() {
    // Validate IOA index fields for IEC101 and IEC104
    if (!validateDOIOAIndexFields()) {
        return;
    }

    // Validate that one checkbox is selected for each row
    if (!validateDOCheckboxGroups()) {
        alert("Please select either 1 or 2 for all channels before continuing.");
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
        return;
    }

    // Validate that one checkbox is selected for each row
    if (!validateDO8CheckboxGroups()) {
        alert("Please select either 1 or 2 for all channels before continuing.");
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
        for (let i = 1; i <= window.doModulesToTest; i++) {
            window.doModuleTypes[i] = 'CO-16-A';
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

    // --- CHECK 1: Ensure Fields are Filled (now accepts "-") ---
    let emptyFound = false;
    currentIEC101Inputs.forEach(input => {
        const value = input.value.trim();
        if (value === "") { 
            input.style.border = '2px solid red'; 
            emptyFound = true; 
        }
    });
    currentIEC104Inputs.forEach(input => {
        const value = input.value.trim();
        if (value === "") { 
            input.style.border = '2px solid red'; 
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
        if (!isValidDOIOAValue(value)) {
            input.style.border = '2px solid red';
            formatErrorFound = true;
        }
    });
    currentIEC104Inputs.forEach(input => {
        const value = input.value.trim();
        if (!isValidDOIOAValue(value)) {
            input.style.border = '2px solid red';
            formatErrorFound = true;
        }
    });

    if (formatErrorFound) {
        alert("IOA/Index fields can only contain numbers or '-' (for empty fields). Please correct the highlighted fields.");
        return false;
    }

    // --- CHECK 3: Global Duplicates (Max 2 Allowed Total, ignore "-") ---
    let globalIEC101 = [];
    let globalIEC104 = [];
    
    let cellSources101 = {};
    let cellSources104 = {};

    const rawData = localStorage.getItem('doTestResults');
    const savedResults = rawData ? JSON.parse(rawData) : {};
    
    const currentModKey = String(window.currentDOModule);
    if (savedResults[currentModKey]) {
        delete savedResults[currentModKey];
    }

    for (const modKey in savedResults) {
        const moduleData = savedResults[modKey];
        if (!moduleData) continue;

        if (moduleData.iec101Values) {
            Object.entries(moduleData.iec101Values).forEach(([cellKey, val]) => {
                const trimmedVal = String(val).trim();
                // Ignore "-" and empty strings in duplicate checking
                if (trimmedVal !== "" && trimmedVal !== "-") {
                    globalIEC101.push(trimmedVal);
                    if (!cellSources101[trimmedVal]) {
                        cellSources101[trimmedVal] = [];
                    }
                    let cellName = 'Unknown Cell';
                    const match = cellKey.match(/DO_(\d+)_IEC101_(\d+)/);
                    if (match) {
                        const channelNum = match[2];
                        cellName = `IEC101-NO: ${channelNum}`;
                    } else if (cellKey.includes('IEC101')) {
                        const altMatch = cellKey.match(/_(\d+)$/);
                        if (altMatch) {
                            cellName = `IEC101-NO: ${altMatch[1]}`;
                        }
                    }
                    cellSources101[trimmedVal].push({module: `Module ${modKey}`, cell: cellName});
                }
            });
        }

        if (moduleData.iec104Values) {
            Object.entries(moduleData.iec104Values).forEach(([cellKey, val]) => {
                const trimmedVal = String(val).trim();
                // Ignore "-" and empty strings in duplicate checking
                if (trimmedVal !== "" && trimmedVal !== "-") {
                    globalIEC104.push(trimmedVal);
                    if (!cellSources104[trimmedVal]) {
                        cellSources104[trimmedVal] = [];
                    }
                    let cellName = 'Unknown Cell';
                    const match = cellKey.match(/DO_(\d+)_IEC104_(\d+)/);
                    if (match) {
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

    currentIEC101Inputs.forEach(input => {
        const val = input.value.trim();
        // Ignore "-" and empty strings in duplicate checking
        if (val !== "" && val !== "-") {
            globalIEC101.push(val);
            if (!cellSources101[val]) {
                cellSources101[val] = [];
            }
            let cellName = 'Current Cell';
            const inputName = input.name || '';
            const match = inputName.match(/DO_(\d+)_IEC101_(\d+)/);
            if (match) {
                const channelNum = match[2];
                cellName = `IEC101-NO: ${channelNum}`;
            } else if (inputName.includes('IEC101')) {
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
            let cellName = 'Current Cell';
            const inputName = input.name || '';
            const match = inputName.match(/DO_(\d+)_IEC104_(\d+)/);
            if (match) {
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
            if (moduleData.iec101Values) {
                for (const [key, value] of Object.entries(moduleData.iec101Values)) {
                    iec101Values[key] = value;
                }
            }
            if (moduleData.iec104Values) {
                for (const [key, value] of Object.entries(moduleData.iec104Values)) {
                    iec104Values[key] = value;
                }
            }
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

if (typeof download === 'undefined') {
    window.download = function(data, filename, type) {
        const blob = new Blob([data], { type: type || 'application/octet-stream' });
        if (navigator.msSaveBlob) {
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

// Validation function for checkbox groups (DO-16)
function validateDOCheckboxGroups() {
    const rows = document.querySelectorAll("#tableBody tr");
    
    for (const row of rows) {
        const checkboxes = row.querySelectorAll('td:nth-child(2) input[type="checkbox"], td:nth-child(3) input[type="checkbox"]');
        const hasSelection = Array.from(checkboxes).some(checkbox => checkbox.checked);
        
        if (!hasSelection) {
            return false;
        }
    }
    
    return true;
}

// Validation function for checkbox groups (DO-8)
function validateDO8CheckboxGroups() {
    const rows = document.querySelectorAll("#do8TableBody tr");
    
    for (const row of rows) {
        const checkboxes = row.querySelectorAll('td:nth-child(2) input[type="checkbox"], td:nth-child(3) input[type="checkbox"]');
        const hasSelection = Array.from(checkboxes).some(checkbox => checkbox.checked);
        
        if (!hasSelection) {
            return false;
        }
    }
    
    return true;
}

function isValidDOIOAValue(value) {
    // Allow empty values (these will be caught by empty field validation)
    if (value === "") return false;
    
    // Allow single dash
    if (value === "-") return true;
    
    // Check if the value contains only numbers (no letters or special characters)
    // This regex matches only digits (0-9)
    return /^\d+$/.test(value);
}