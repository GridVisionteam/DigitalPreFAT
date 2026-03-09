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

// NEW: Function to handle checkbox radio-like behavior for DI-32
function handleCheckboxGroupClick(clickedCheckbox, groupName) {
    if (clickedCheckbox.checked) {
        // Get all checkboxes in the same group
        const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
        // Uncheck all other checkboxes in the group
        checkboxes.forEach(cb => {
            if (cb !== clickedCheckbox) {
                cb.checked = false;
            }
        });
    }
}

// NEW: Function to handle checkbox radio-like behavior for DI-16
function handleDI16CheckboxGroupClick(clickedCheckbox, groupName) {
    if (clickedCheckbox.checked) {
        // Get all checkboxes in the same group
        const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
        // Uncheck all other checkboxes in the group
        checkboxes.forEach(cb => {
            if (cb !== clickedCheckbox) {
                cb.checked = false;
            }
        });
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
        
        // Left channels (1-16) - Using checkboxes with radio-like behavior
        const leftGroupName = `DI_${window.currentDIModule}_checkbox_left_${rowNumber}`;
        row.innerHTML += `
            <td>${rowNumber}</td>
            <td style="text-align: center;">
                <input type="checkbox" name="${leftGroupName}" value="0" class="di-test-checkbox di-checkbox-group">
            </td>
            <td style="text-align: center;">
                <input type="checkbox" name="${leftGroupName}" value="1" class="di-test-checkbox di-checkbox-group">
            </td>
            <td><input type="text" class="di-test-input" name="DI_${window.currentDIModule}_IEC101_${rowNumber}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="di-test-input" name="DI_${window.currentDIModule}_IEC104_${rowNumber}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="di-test-input" name="DI_${window.currentDIModule}_DNP3_${rowNumber}" placeholder="Enter IOA or -"></td>
        `;
        
        // Right channels (17-32)
        const rightRowNumber = i + 17;
        const rightGroupName = `DI_${window.currentDIModule}_checkbox_right_${i + 1}`;
        row.innerHTML += `
            <td>${rightRowNumber}</td>
            <td style="text-align: center;">
                <input type="checkbox" name="${rightGroupName}" value="0" class="di-test-checkbox di-checkbox-group">
            </td>
            <td style="text-align: center;">
                <input type="checkbox" name="${rightGroupName}" value="1" class="di-test-checkbox di-checkbox-group">
            </td>
            <td><input type="text" class="di-test-input" name="DI_${window.currentDIModule}_IEC101_${rightRowNumber}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="di-test-input" name="DI_${window.currentDIModule}_IEC104_${rightRowNumber}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="di-test-input" name="DI_${window.currentDIModule}_DNP3_${rightRowNumber}" placeholder="Enter IOA or -"></td>
        `;
        
        tableBody.appendChild(row);
    }

    // Add event listeners to checkboxes for radio-like behavior
    document.querySelectorAll('.di-checkbox-group').forEach(checkbox => {
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
    document.querySelectorAll('.di-test-input').forEach(input => {
        input.addEventListener('input', updateSubmitButtonState);
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
        const groupName = `DI_${window.currentDIModule}_checkbox_${rowNumber}`;
        
        row.innerHTML = `
            <td>${rowNumber}</td>
            <td style="text-align: center;">
                <input type="checkbox" name="${groupName}" value="0" class="di16-test-checkbox di16-checkbox-group">
            </td>
            <td style="text-align: center;">
                <input type="checkbox" name="${groupName}" value="1" class="di16-test-checkbox di16-checkbox-group">
            </td>
            <td><input type="text" class="di-test-input" name="DI_${window.currentDIModule}_IEC101_${rowNumber}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="di-test-input" name="DI_${window.currentDIModule}_IEC104_${rowNumber}" placeholder="Enter IOA or -"></td>
            <td><input type="text" class="di-test-input" name="DI_${window.currentDIModule}_DNP3_${rowNumber}" placeholder="Enter IOA or -"></td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Add event listeners to checkboxes for radio-like behavior
    document.querySelectorAll('.di16-checkbox-group').forEach(checkbox => {
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
            updateDI16SubmitButtonState();
        });
    });
    
    // Add event listeners to text inputs
    document.querySelectorAll('#di16TableBody .di-test-input').forEach(input => {
        input.addEventListener('input', updateDI16SubmitButtonState);
    });
}

// Update SelectAll function for checkboxes (this will now select "1" for all)
function SelectAll() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    
    // First, determine the current state pattern
    // Check the first row's left side to see what pattern we're toggling to
    const firstRow = rows[0];
    if (!firstRow) return;
    
    const leftCheckbox0 = firstRow.querySelector('td:nth-child(2) input[type="checkbox"][value="0"]');
    const leftCheckbox1 = firstRow.querySelector('td:nth-child(3) input[type="checkbox"][value="1"]');
    
    // Determine if we're setting to all 1s or criss-cross pattern
    // If all checkboxes are already 1, toggle to criss-cross pattern
    let setToAllOne = true;
    
    // Check if currently all are 1
    rows.forEach((row, index) => {
        // Left side
        const left1 = row.querySelector('td:nth-child(3) input[type="checkbox"][value="1"]');
        const left0 = row.querySelector('td:nth-child(2) input[type="checkbox"][value="0"]');
        
        // Right side
        const right1 = row.querySelector('td:nth-child(9) input[type="checkbox"][value="1"]');
        const right0 = row.querySelector('td:nth-child(8) input[type="checkbox"][value="0"]');
        
        if (!left1?.checked || !right1?.checked) {
            setToAllOne = false;
        }
    });
    
    rows.forEach((row, index) => {
        // Left side checkboxes (columns 2 and 3)
        const leftCheckbox0 = row.querySelector('td:nth-child(2) input[type="checkbox"][value="0"]');
        const leftCheckbox1 = row.querySelector('td:nth-child(3) input[type="checkbox"][value="1"]');
        
        // Right side checkboxes (columns 8 and 9)
        const rightCheckbox0 = row.querySelector('td:nth-child(8) input[type="checkbox"][value="0"]');
        const rightCheckbox1 = row.querySelector('td:nth-child(9) input[type="checkbox"][value="1"]');
        
        if (setToAllOne) {
            // Toggle to criss-cross pattern
            // Even rows: Left=1, Right=0 | Odd rows: Left=0, Right=1
            if (index % 2 === 0) { // Even row (0-based)
                // Left = 1, Right = 0
                if (leftCheckbox1) leftCheckbox1.checked = false;
                if (leftCheckbox0) leftCheckbox0.checked = true;
                if (rightCheckbox0) rightCheckbox0.checked = true;
                if (rightCheckbox1) rightCheckbox1.checked = false;
            } else { // Odd row
                // Left = 0, Right = 1
                if (leftCheckbox0) leftCheckbox0.checked = false;
                if (leftCheckbox1) leftCheckbox1.checked = true;
                if (rightCheckbox1) rightCheckbox1.checked = true;
                if (rightCheckbox0) rightCheckbox0.checked = false;
            }
        } else {
            // Set all to 1 (current behavior)
            if (leftCheckbox1) leftCheckbox1.checked = true;
            if (leftCheckbox0) leftCheckbox0.checked = false;
            if (rightCheckbox1) rightCheckbox1.checked = true;
            if (rightCheckbox0) rightCheckbox0.checked = false;
        }
    });
    
    updateSubmitButtonState();
}

// Update clearAll function
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
    
    // Enable the button by default
    submitBtn.disabled = false;
}

function SelectAllDI16() {
    const tableBody = document.getElementById('di16TableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    
    // Determine current pattern
    const firstRow = rows[0];
    if (!firstRow) return;
    
    const firstCheckbox1 = firstRow.querySelector('td:nth-child(3) input[type="checkbox"][value="1"]');
    
    // Check if all are set to 1
    let setToAllOne = true;
    rows.forEach(row => {
        const checkbox1 = row.querySelector('td:nth-child(3) input[type="checkbox"][value="1"]');
        if (!checkbox1?.checked) {
            setToAllOne = false;
        }
    });
    
    rows.forEach((row, index) => {
        const checkbox0 = row.querySelector('td:nth-child(2) input[type="checkbox"][value="0"]');
        const checkbox1 = row.querySelector('td:nth-child(3) input[type="checkbox"][value="1"]');
        
        if (setToAllOne) {
            // Toggle to alternating pattern: 1,0,1,0,... vertically
            if (index % 2 === 0) { // Even rows (0,2,4,...)
                if (checkbox1) checkbox1.checked = false;
                if (checkbox0) checkbox0.checked = true;
            } else { // Odd rows (1,3,5,...)
                if (checkbox0) checkbox0.checked = false;
                if (checkbox1) checkbox1.checked = true;
            }
        } else {
            // Set all to 1
            if (checkbox1) checkbox1.checked = true;
            if (checkbox0) checkbox0.checked = false;
        }
    });
    
    updateDI16SubmitButtonState();
}

function clearAllDI16() {
    const checkboxes = document.querySelectorAll("#di16TableBody input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = false);

    const textInputs = document.querySelectorAll("#di16TableBody input[type='number']");
    textInputs.forEach(input => input.value = '');

    updateDI16SubmitButtonState();
}

function updateDI16SubmitButtonState() {
    const submitBtn = document.getElementById('submitBtnDI16');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}

function saveDITestData(moduleNumber) {
    // Initialize or ensure proper structure exists
    if (!window.diTestResults[moduleNumber]) {
        window.diTestResults[moduleNumber] = {};
    }
    
    // Ensure all required properties exist
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
    
    // Set the type
    window.diTestResults[moduleNumber].type = 'DI-32';
    
    // Initialize inputs array if it doesn't exist
    if (!window.diTestResults[moduleNumber].inputs) {
        window.diTestResults[moduleNumber].inputs = [];
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

    // Ensure qualityInspections exists (preserve existing)
    if (!window.diTestResults[moduleNumber].qualityInspections) {
        window.diTestResults[moduleNumber].qualityInspections = {};
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
        return;
    }

    // Validate that one checkbox is selected for each pair
    if (!validateCheckboxGroups()) {
        alert("Please select either 0 or 1 for all channels before continuing.");
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
        if (typeof navigationGuard !== 'undefined' && navigationGuard.markPageAsCompleted) {
            navigationGuard.markPageAsCompleted();
        }
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
    // Initialize or ensure proper structure exists
    if (!window.diTestResults[moduleNumber]) {
        window.diTestResults[moduleNumber] = {};
    }
    
    // Ensure all required properties exist
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
    
    // Set the type
    window.diTestResults[moduleNumber].type = 'DI-16';
    
    // Initialize inputs array if it doesn't exist
    if (!window.diTestResults[moduleNumber].inputs) {
        window.diTestResults[moduleNumber].inputs = [];
    }
    
    // Save all inputs
    const inputs = document.querySelectorAll("#di16TableBody input");
    window.diTestResults[moduleNumber].inputs = Array.from(inputs).map(input => {
        return input.type === 'checkbox' ? input.checked : input.value;
    });

    // Save checkbox values with their positions
    const rows = document.querySelectorAll("#di16TableBody tr");
    rows.forEach((row, rowIndex) => {
        const rowNumber = rowIndex + 1;
        
        // Checkboxes for this row (columns 2 and 3)
        const checkbox1 = row.querySelector("td:nth-child(2) input[type='checkbox']");
        const checkbox2 = row.querySelector("td:nth-child(3) input[type='checkbox']");

        // Save checkboxes
        if (checkbox1) {
            window.diTestResults[moduleNumber].checkboxValues[`Check_Box_DI_${moduleNumber}_FT_1_${rowNumber}`] = checkbox1.checked;
        }
        if (checkbox2) {
            window.diTestResults[moduleNumber].checkboxValues[`Check_Box_DI_${moduleNumber}_FT_2_${rowNumber}`] = checkbox2.checked;
        }
    });

    // Save protocol values for 16 channels
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

    // Ensure qualityInspections exists (preserve existing)
    if (!window.diTestResults[moduleNumber].qualityInspections) {
        window.diTestResults[moduleNumber].qualityInspections = {};
    }

    localStorage.setItem('diTestResults', JSON.stringify(window.diTestResults));
}

async function handleDI16TestSubmission() {
    // Validate IOA index fields for IEC101 and IEC104
    if (!validateIOAIndexFields()) {
        return;
    }

    // Validate that one checkbox is selected for each row
    if (!validateDI16CheckboxGroups()) {
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
        if (typeof navigationGuard !== 'undefined' && navigationGuard.markPageAsCompleted) {
            navigationGuard.markPageAsCompleted();
        }
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

// New validation function for checkbox groups (DI-32)
function validateCheckboxGroups() {
    const rows = document.querySelectorAll("#tableBody tr");
    
    for (const row of rows) {
        // Check left side (columns 2-3)
        const leftCheckboxes = row.querySelectorAll('td:nth-child(2) input[type="checkbox"], td:nth-child(3) input[type="checkbox"]');
        const leftSelected = Array.from(leftCheckboxes).some(checkbox => checkbox.checked);
        
        // Check right side (columns 8-9)
        const rightCheckboxes = row.querySelectorAll('td:nth-child(8) input[type="checkbox"], td:nth-child(9) input[type="checkbox"]');
        const rightSelected = Array.from(rightCheckboxes).some(checkbox => checkbox.checked);
        
        // Both sides must have one checkbox selected
        if (!leftSelected || !rightSelected) {
            return false;
        }
    }
    
    return true;
}

// New validation function for checkbox groups (DI-16)
function validateDI16CheckboxGroups() {
    const rows = document.querySelectorAll("#di16TableBody tr");
    
    for (const row of rows) {
        const checkboxes = row.querySelectorAll('td:nth-child(2) input[type="checkbox"], td:nth-child(3) input[type="checkbox"]');
        const hasSelection = Array.from(checkboxes).some(checkbox => checkbox.checked);
        
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
        try {
            window.diTestResults = JSON.parse(savedResults);
        } catch (e) {
            console.error('Error parsing saved results:', e);
            window.diTestResults = {};
        }
    }
    
    // Initialize module tracking
    window.diModulesToTest = parseInt(localStorage.getItem('diModulesToTest')) || 0;
    
    // Check if we're returning from DO page
    const returningFromDO = localStorage.getItem('returningToDI') === 'true';
    localStorage.removeItem('returningToDI'); // Clear the flag
    
    if (returningFromDO) {
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
        try {
            window.diModuleTypes = JSON.parse(savedTypes);
        } catch (e) {
            console.error('Error parsing module types:', e);
            window.diModuleTypes = {};
        }
    } else {
        window.diModuleTypes = {};
        for (let i = 1; i <= window.diModulesToTest; i++) {
            window.diModuleTypes[i] = 'DI-32';
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
        if (!isValidIOAValue(value)) {
            input.style.border = '2px solid red';
            formatErrorFound = true;
        }
    });
    currentIEC104Inputs.forEach(input => {
        const value = input.value.trim();
        if (!isValidIOAValue(value)) {
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

    const rawData = localStorage.getItem('diTestResults');
    const savedResults = rawData ? JSON.parse(rawData) : {};
    
    const currentModKey = String(window.currentDIModule);
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
                    const match = cellKey.match(/DI_\d+_IEC101_(\d+)/);
                    if (match) {
                        cellName = `IEC101-NO: ${match[1]}`;
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
            const match = inputName.match(/DI_\d+_IEC101_(\d+)/);
            if (match) {
                cellName = `IEC101-NO: ${match[1]}`;
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

function isValidIOAValue(value) {
    // Allow empty values (these will be caught by empty field validation)
    if (value === "") return false;
    
    // Allow single dash
    if (value === "-") return true;
    
    // Check if the value contains only numbers (no letters or special characters)
    // This regex matches only digits (0-9)
    return /^\d+$/.test(value);
}