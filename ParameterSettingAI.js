// Initialize with empty data structures
if (!window.analogInputParamResults) window.analogInputParamResults = {
    underCardParams: {},
    underLogicParams: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved parameter results if available
    const savedResults = localStorage.getItem('analogInputParamResults');
    if (savedResults) {
        window.analogInputParamResults = JSON.parse(savedResults);
    }

    // Generate rows for both module types
    generateUnderCardParameterRows();
    generateUnderLogicParameterRows();

    // Load any saved data
    loadAnalogInputParamData();
});

// Function to generate parameter rows for Under Card Module
function generateUnderCardParameterRows() {
    const tbody = document.getElementById('UnderCardModuleTbody');
    if (!tbody) return;

    // Under Card Module Parameter items for Analog Input
    const underCardParameters = [
        {
            parameter: "AI Type",
            standardSetting: "4-20mA"
        },
        {
            parameter: "Main Force to 0",
            standardSetting: "YES"
        },
        {
            parameter: "Force to 0",
            standardSetting: "75"
        }
    ];

    underCardParameters.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item.parameter}</td>
            <td style="text-align: center;">${item.standardSetting}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="underCard_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="underCard_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate parameter rows for Under Logical Module
function generateUnderLogicParameterRows() {
    const tbody = document.getElementById('UnderLogicalModuleTbody');
    if (!tbody) return;

    // Under Logical Module Parameter items for Analog Input
    const underLogicParameters = [
        {
            parameter: "Coe. a",
            standardSetting: "32767"
        },
        {
            parameter: "Coe. b",
            standardSetting: "10000"
        },
        {
            parameter: "Coe. c",
            standardSetting: "0"
        },
        {
            parameter: "AI Multiply Coe",
            standardSetting: "YES"
        },
        {
            parameter: "AI Event Buffer Size",
            standardSetting: "1000"
        },
        {
            parameter: "Event Buffer Mode",
            standardSetting: "Uncovered (No Tick)"
        },
        {
            parameter: "Deadband",
            standardSetting: "100"
        },
        {
            parameter: "Info Code 1",
            standardSetting: "Disable"
        },
        {
            parameter: "Info Code 2",
            standardSetting: "(34) / (36)"
        },
        {
            parameter: "Priority",
            standardSetting: "2"
        }
    ];

    underLogicParameters.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item.parameter}</td>
            <td style="text-align: center;">${item.standardSetting}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="underLogic_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="underLogic_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save analog input parameter data
function saveAnalogInputParamData() {
    // Ensure the param results object has the proper structure
    window.analogInputParamResults = window.analogInputParamResults || {};
    window.analogInputParamResults.underCardParams = window.analogInputParamResults.underCardParams || {};
    window.analogInputParamResults.underLogicParams = window.analogInputParamResults.underLogicParams || {};

    // Save Under Card parameters (3 items)
    for (let itemNum = 1; itemNum <= 3; itemNum++) {
        const underCardOK = document.querySelector(`input[name="underCard_${itemNum}"][value="OK"]:checked`) !== null;
        window.analogInputParamResults.underCardParams[`item_${itemNum}`] = underCardOK ? 'OK' : 'NO';
    }

    // Save Under Logical parameters (10 items)
    for (let itemNum = 1; itemNum <= 10; itemNum++) {
        const underLogicOK = document.querySelector(`input[name="underLogic_${itemNum}"][value="OK"]:checked`) !== null;
        window.analogInputParamResults.underLogicParams[`item_${itemNum}`] = underLogicOK ? 'OK' : 'NO';
    }

    // Save to session storage
    localStorage.setItem('analogInputParamResults', JSON.stringify(window.analogInputParamResults));
}

// Load analog input parameter data
function loadAnalogInputParamData() {
    // Ensure we have a valid analogInputParamResults object with the expected structure
    window.analogInputParamResults = window.analogInputParamResults || {};
    window.analogInputParamResults.underCardParams = window.analogInputParamResults.underCardParams || {};
    window.analogInputParamResults.underLogicParams = window.analogInputParamResults.underLogicParams || {};

    // Load Under Card parameters (3 items)
    for (let itemNum = 1; itemNum <= 3; itemNum++) {
        const underCardResult = window.analogInputParamResults.underCardParams[`item_${itemNum}`];
        if (underCardResult) {
            const radioToCheck = document.querySelector(`input[name="underCard_${itemNum}"][value="${underCardResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }

    // Load Under Logical parameters (10 items)
    for (let itemNum = 1; itemNum <= 10; itemNum++) {
        const underLogicResult = window.analogInputParamResults.underLogicParams[`item_${itemNum}`];
        if (underLogicResult) {
            const radioToCheck = document.querySelector(`input[name="underLogic_${itemNum}"][value="${underLogicResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Navigation functions
function goToPreviousPage() {
    // Save the current parameter data
    saveAnalogInputParamData();
    window.location.href = 'ParameterSettingDO.html'; // Update with actual previous page
};

function handleParamAISubmission() {
    if (!validateAnalogInputParameters()) {
        return;
    }
    
    saveAnalogInputParamData();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'ParameterSettingIEC101.html';
}

// Update goToPreviousPage to handle cases with/without AI modules:
function goToPreviousPage() {
    saveAnalogInputParamData();
    
    const aiCount = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    
    if (aiCount > 0) {
        window.location.href = 'ParameterSettingDO.html';
    } else {
        // If no AI modules, we shouldn't be here, but handle gracefully
        window.location.href = 'ParameterSettingDO.html';
    }
}

function SelectAll() {
    const radioButtons = document.querySelectorAll('input[type="radio"][value="OK"]');
    radioButtons.forEach(radio => {
        radio.checked = true;
    });
}

function clearAll() {
    const radioButtons = document.querySelectorAll('input[type="radio"][value="NO"]');
    radioButtons.forEach(radio => {
        radio.checked = true;
    });
}

function validateAnalogInputParameters() {
    let isValid = true;
    
    // Reset all error styles first
    const allInputs = document.querySelectorAll('input[type="radio"]');
    allInputs.forEach(input => {
        input.parentElement.style.border = '';
    });

    // Check Under Card parameters (3 items)
    for (let itemNum = 1; itemNum <= 3; itemNum++) {
        const paramOK = document.querySelector(`input[name="underCard_${itemNum}"][value="OK"]`);
        const paramNO = document.querySelector(`input[name="underCard_${itemNum}"][value="NO"]`);
        
        // Highlight NO selections
        if (paramNO && paramNO.checked) {
            paramNO.parentElement.style.border = '1px solid red';
            isValid = false;
        }
    }
    
    // Check Under Logical parameters (10 items)
    for (let itemNum = 1; itemNum <= 10; itemNum++) {
        const paramOK = document.querySelector(`input[name="underLogic_${itemNum}"][value="OK"]`);
        const paramNO = document.querySelector(`input[name="underLogic_${itemNum}"][value="NO"]`);
        
        if (paramNO && paramNO.checked) {
            paramNO.parentElement.style.border = '1px solid red';
            isValid = false;
        }
    }
    
    if (!isValid) {
        alert('Please complete all required fields before continuing. All parameters must be marked OK.');
    }
    
    return isValid;
}