const { PDFDocument, rgb } = PDFLib;
// Initialize with empty data structures
if (!window.doTestResults) window.doTestResults = {};
if (!window.doModuleTypes) window.doModuleTypes = {};

function setupDOModuleTypeListeners() {
    const doModuleTypeSelects = document.querySelectorAll('#doModuleType');
    doModuleTypeSelects.forEach(select => {
        select.addEventListener('change', handleDOModuleTypeChange);
    });
}

function handleDOModuleTypeChange() {
    const moduleType = this.value;
    
    // Save current data before switching
    saveCurrentModuleData();
    
    // Update the module type in our tracking object
    window.doModuleTypes[window.currentDOModule] = moduleType;
    localStorage.setItem('doModuleTypes', JSON.stringify(window.doModuleTypes));

    // For now, we only have one page for both types, but we can add more if needed
    showFunctionalityDOPage();
}

function saveCurrentModuleData() {
    saveDOTestData(window.currentDOModule);
}

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
        document.querySelector('input[name="quality1"][value="OK"]').checked = true;
        document.querySelector('input[name="quality2"][value="OK"]').checked = true;
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

    // Load existing data if available
    if (window.doTestResults[window.currentDOModule] && 
        window.doTestResults[window.currentDOModule].type === 'CO-8-A') {
        loadDO8TestData(window.currentDOModule);
    } else {
        // Initialize empty data structure if none exists
        if (!window.doTestResults[window.currentDOModule]) {
            window.doTestResults[window.currentDOModule] = {
                inputs: [],
                type: 'CO-8-A'
            };
        }
        document.querySelector('#do8Page input[name="quality1"][value="OK"]').checked = true;
        document.querySelector('#do8Page input[name="quality2"][value="OK"]').checked = true;
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
        
        row.innerHTML += `
            <td>${i + 1}</td>
            <td><input type="checkbox" class="do-test-checkbox"></td>
            <td><input type="checkbox" class="do-test-checkbox"></td>
            <td><input type="number" class="do-test-input" name="DO_${window.currentDOModule}_IEC101_${i + 1}"></td>
            <td><input type="number" class="do-test-input" name="DO_${window.currentDOModule}_IEC104_${i + 1}"></td>
            <td><input type="number" class="do-test-input" name="DO_${window.currentDOModule}_DNP3_${i + 1}"></td>
        `;
        
        tableBody.appendChild(row);
    }

    // Add event listeners safely
    document.querySelectorAll('.do-test-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSubmitButtonState);
    });
}

function generateDO8Rows() {
    const tableBody = document.getElementById('do8TableBody');
    if (!tableBody) return;
    
    // Clear existing content and any event listeners
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
    
    for (let i = 0; i < 8; i++) {
        const row = document.createElement("tr");
        
        // Number column
        row.innerHTML += `<td>${i + 1}</td>`;
        
        // Checkboxes and text inputs
        row.innerHTML += `
            <td style="text-align: center;"><input type="checkbox" class="do-test-checkbox"></td>
            <td style="text-align: center;"><input type="checkbox" class="do-test-checkbox"></td>
            <td><input type="number" class="do8-test-input" name="DO_${window.currentDOModule}_IEC101_${i + 1}"></td>
            <td><input type="number" class="do8-test-input" name="DO_${window.currentDOModule}_IEC104_${i + 1}"></td>
            <td><input type="number" class="do8-test-input" name="DO_${window.currentDOModule}_DNP3_${i + 1}"></td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Add event listeners to checkboxes
    const checkboxes = tableBody.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateDO8SubmitButtonState);
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
    const checkboxes = document.querySelectorAll('.do-test-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear all text inputs
    const textInputs = document.querySelectorAll('.do-test-input');
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
    const checkboxes = document.querySelectorAll("#do8TableBody input[type='checkbox']");
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
    
    updateDO8SubmitButtonState();
}

function clearAllDO8() {
    const checkboxes = document.querySelectorAll("#do8TableBody input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = false);

    const textInputs = document.querySelectorAll("#do8TableBody input[type='text']");
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
    if (!window.doTestResults[moduleNumber] || window.doTestResults[moduleNumber].type !== 'CO-16-A') {
        window.doTestResults[moduleNumber] = {
            inputs: [],
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {},
            checkboxValues: {},
            type: 'CO-16-A',
            qualityInspections: {}
        };
    }

    // Save quality inspection results
    const quality1 = document.querySelector('input[name="quality1"][value="OK"]:checked') ? 'OK' : 'NO';
    const quality2 = document.querySelector('input[name="quality2"][value="OK"]:checked') ? 'OK' : 'NO';
    
    window.doTestResults[moduleNumber].qualityInspections = {
        quality1,
        quality2
    };

    // Save all inputs
    const inputs = document.querySelectorAll("#tableBody input");
    window.doTestResults[moduleNumber].inputs = Array.from(inputs).map(input => {
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

        // Save left side checkboxes (channels 1-8)
        if (leftCheckbox1) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO_${moduleNumber}_FT_1_${rowIndex + 1}`] = leftCheckbox1.checked;
        }
        if (leftCheckbox2) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO_${moduleNumber}_FT_2_${rowIndex + 1}`] = leftCheckbox2.checked;
        }
        
        // Save right side checkboxes (channels 9-16)
        if (rightCheckbox1) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO_${moduleNumber}_FT_3_${rowIndex + 1}`] = rightCheckbox1.checked;
        }
        if (rightCheckbox2) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO_${moduleNumber}_FT_4_${rowIndex + 1}`] = rightCheckbox2.checked;
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
    // Initialize the module data structure if it doesn't exist
    if (!window.doTestResults[moduleNumber] || window.doTestResults[moduleNumber].type !== 'CO-8-A') {
        window.doTestResults[moduleNumber] = {
            inputs: [],
            iec101Values: {}, // Initialize as empty object
            iec104Values: {}, // Initialize as empty object
            dnp3Values: {},   // Initialize as empty object
            checkboxValues: {},
            type: 'CO-8-A',
            qualityInspections: {}
        };
    } else {
        // Ensure all necessary objects exist even if the module data exists
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
    }

    // Rest of the function remains the same...
    // Save quality inspection results from DO-8 page
    const quality1 = document.querySelector('#do8Page input[name="quality1"][value="OK"]:checked') ? 'OK' : 'NO';
    const quality2 = document.querySelector('#do8Page input[name="quality2"][value="OK"]:checked') ? 'OK' : 'NO';
    
    window.doTestResults[moduleNumber].qualityInspections = {
        quality1,
        quality2
    };

    // Save all inputs
    const inputs = document.querySelectorAll("#do8TableBody input");
    window.doTestResults[moduleNumber].inputs = Array.from(inputs).map(input => {
        return input.type === 'checkbox' ? input.checked : input.value;
    });

    // Save checkbox values with their positions
    const rows = document.querySelectorAll("#do8TableBody tr");
    rows.forEach((row, rowIndex) => {
        const checkbox1 = row.querySelector("td:nth-child(2) input[type='checkbox']");
        const checkbox2 = row.querySelector("td:nth-child(3) input[type='checkbox']");
        
        if (checkbox1) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO_${moduleNumber}_FT_1_${rowIndex + 1}`] = checkbox1.checked;
        }
        if (checkbox2) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO_${moduleNumber}_FT_2_${rowIndex + 1}`] = checkbox2.checked;
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

    // Load quality inspection values
    if (saved.qualityInspections) {
        const quality1OK = document.querySelector('#do8Page input[name="quality1"][value="OK"]');
        const quality1NO = document.querySelector('#do8Page input[name="quality1"][value="NO"]');
        const quality2OK = document.querySelector('#do8Page input[name="quality2"][value="OK"]');
        const quality2NO = document.querySelector('#do8Page input[name="quality2"][value="NO"]');
        
        if (quality1OK && quality1NO) {
            quality1OK.checked = saved.qualityInspections.quality1 === 'OK';
            quality1NO.checked = saved.qualityInspections.quality1 === 'NO';
        }
        
        if (quality2OK && quality2NO) {
            quality2OK.checked = saved.qualityInspections.quality2 === 'OK';
            quality2NO.checked = saved.qualityInspections.quality2 === 'NO';
        }
    }

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
    // First validate the quality inspection
    if (!validateDOQualityInspection()) {
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
    localStorage.setItem('doModuleTypes', JSON.stringify(window.doModuleTypes));
    
    // Move to next module or final page
    window.currentDOModule++;
    localStorage.setItem('currentDOModule', window.currentDOModule);
    
    if (window.currentDOModule > window.doModulesToTest) {
        // All DO modules tested, go to AI page
        navigationGuard.markPageAsCompleted(); // Add this line
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

    // If we're on the first module, go back to DI page
    if (window.currentDOModule === 1) {
        // Reset DI module counter to the last DI module
        const diModulesToTest = parseInt(localStorage.getItem('diModulesToTest')) || 0;
        window.currentDIModule = diModulesToTest;
        localStorage.setItem('currentDIModule', window.currentDIModule);
        
        window.location.href = 'FunctionalityDIPage.html';
        return;
    }

    // Go to previous module
    window.currentDOModule--;
    localStorage.setItem('currentDOModule', window.currentDOModule);

    // Check module type for previous module
    const previousType = window.doModuleTypes[window.currentDOModule] || 'CO-16-A';
    if (previousType === 'CO-8-A') {
        showFunctionalityDO8Page();
    } else {
        showFunctionalityDOPage();
    }
}

async function handleDO8TestSubmission() {
    // First validate the quality inspection
    if (!validateDOQualityInspection()) {
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
        navigationGuard.markPageAsCompleted(); // Add this line
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

//-------------Load UserData-------------------------------------------------------

function loadUserData() {
    const nameInput = document.getElementById('name');
    const designationInput = document.getElementById('designation');
    const experienceInput = document.getElementById('experience');
    //formTiming.loginTime = new Date();

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

// Add this validation function to FunctionalityDOPage.js
function validateDOQualityInspection() {
    let isValid = true;
    const currentModule = window.currentDOModule;
    const moduleType = window.doModuleTypes[currentModule] || 'CO-16-A';
    
    // Get the appropriate container based on module type
    const container = moduleType === 'CO-8-A' ? '#do8Page' : '#functionalityDOPage';
    
    // Reset all error styles first
    const quality1OK = document.querySelector(`${container} input[name="quality1"][value="OK"]`);
    const quality1NO = document.querySelector(`${container} input[name="quality1"][value="NO"]`);
    const quality2OK = document.querySelector(`${container} input[name="quality2"][value="OK"]`);
    const quality2NO = document.querySelector(`${container} input[name="quality2"][value="NO"]`);
    
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