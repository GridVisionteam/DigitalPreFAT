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
    const checkboxes = document.querySelectorAll("#tableBody input[type='checkbox']");
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
    
    updateSubmitButtonState();
}

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
            type: 'CO-16-A'
        };
    }

    // Save all inputs
    const inputs = document.querySelectorAll("#tableBody input");
    window.doTestResults[moduleNumber].inputs = Array.from(inputs).map(input => {
        return input.type === 'checkbox' ? input.checked : input.value;
    });

    // Save checkbox values with their positions
    const rows = document.querySelectorAll("#tableBody tr");
    rows.forEach((row, rowIndex) => {
        // Checkboxes (columns 2 and 3)
        const checkbox1 = row.querySelector("td:nth-child(2) input[type='checkbox']");
        const checkbox2 = row.querySelector("td:nth-child(3) input[type='checkbox']");
        
        // Save checkboxes
        if (checkbox1) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO_${moduleNumber}_FT_1_${rowIndex + 1}`] = checkbox1.checked;
        }
        if (checkbox2) {
            window.doTestResults[moduleNumber].checkboxValues[`Check_Box_DO_${moduleNumber}_FT_2_${rowIndex + 1}`] = checkbox2.checked;
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
            iec101Values: {},
            iec104Values: {},
            dnp3Values: {},
            checkboxValues: {},
            type: 'CO-8-A'
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

// Validate IOA index fields for IEC101 and IEC104 only
function validateDOIOAIndexFields() {
    // Determine which page is currently visible
    const do16Page = document.getElementById('functionalityDOPage');
    const do8Page = document.getElementById('do8Page');
    let currentPageContainer = null;
    
    if (do16Page && do16Page.style.display !== 'none') {
        currentPageContainer = '#functionalityDOPage';
    } else if (do8Page && do8Page.style.display !== 'none') {
        currentPageContainer = '#do8Page';
    } else {
        // If no page is visible, return false
        return false;
    }
    
    // Get IEC101 and IEC104 input fields ONLY from the current page
    const iec101Inputs = document.querySelectorAll(`${currentPageContainer} input[class*="do-test-input"][name*="IEC101"], ${currentPageContainer} input[class*="do8-test-input"][name*="IEC101"]`);
    const iec104Inputs = document.querySelectorAll(`${currentPageContainer} input[class*="do-test-input"][name*="IEC104"], ${currentPageContainer} input[class*="do8-test-input"][name*="IEC104"]`);
    
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