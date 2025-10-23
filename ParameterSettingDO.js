// Initialize with empty data structures
if (!window.digitalOutputParamResults) window.digitalOutputParamResults = {
    underCardParams: {},
    underLogicParams: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved parameter results if available
    const savedResults = localStorage.getItem('digitalOutputParamResults');
    if (savedResults) {
        window.digitalOutputParamResults = JSON.parse(savedResults);
    }

    // Generate rows for both module types
    generateUnderCardParameterRows();
    generateUnderLogicParameterRows();

    // Load any saved data
    loadDigitalOutputParamData();
});

// Function to generate parameter rows for Under Card Module
function generateUnderCardParameterRows() {
    const tbody = document.getElementById('UnderCardModuleTbody');
    if (!tbody) return;

    // Under Card Module Parameter items for Digital Output
    const underCardParameters = [
        {
            parameter: "Reset Time (s)",
            DoubleCommand : "20",
            SingleCommand : "20"
        },
        {
            parameter: "On Time (long: ms)",
            DoubleCommand : "3000",
            SingleCommand: "3000"
        },
        {
            parameter: "On Time (short: ms)",
            DoubleCommand: "3000",
            SingleCommand: "3000"
        }
    ];

    underCardParameters.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item.parameter}</td>
            <td style="text-align: center;">${item.DoubleCommand}</td>
            <td style="text-align: center;">${item.SingleCommand}</td>
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

    // Under Logical Module Parameter items for Digital Output
    const underLogicParameters = [
        {
            parameter: "DO Attribute",
            DoubleCommand: "Trip & Close",
            SingleCommand: "Close"
        },
        {
            parameter: "Command Format",
            DoubleCommand: "Double / Rise/Fall",
            SingleCommand: "Single"
        },
        {
            parameter: "SBO",
            DoubleCommand: "SBO",
            SingleCommand: "SBO"
        },
        {
            parameter: "Priority",
            DoubleCommand: "2",
            SingleCommand: "2"
        }
    ];

    underLogicParameters.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item.parameter}</td>
            <td style="text-align: center;">${item.DoubleCommand}</td>
            <td style="text-align: center;">${item.SingleCommand}</td>
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

// Save digital output parameter data
function saveDigitalOutputParamData() {
    // Ensure the param results object has the proper structure
    window.digitalOutputParamResults = window.digitalOutputParamResults || {};
    window.digitalOutputParamResults.underCardParams = window.digitalOutputParamResults.underCardParams || {};
    window.digitalOutputParamResults.underLogicParams = window.digitalOutputParamResults.underLogicParams || {};

    // Save Under Card parameters (3 items)
    for (let itemNum = 1; itemNum <= 3; itemNum++) {
        const underCardOK = document.querySelector(`input[name="underCard_${itemNum}"][value="OK"]:checked`) !== null;
        window.digitalOutputParamResults.underCardParams[`item_${itemNum}`] = underCardOK ? 'OK' : 'NO';
    }

    // Save Under Logical parameters (4 items)
    for (let itemNum = 1; itemNum <= 4; itemNum++) {
        const underLogicOK = document.querySelector(`input[name="underLogic_${itemNum}"][value="OK"]:checked`) !== null;
        window.digitalOutputParamResults.underLogicParams[`item_${itemNum}`] = underLogicOK ? 'OK' : 'NO';
    }

    // Save to session storage
    localStorage.setItem('digitalOutputParamResults', JSON.stringify(window.digitalOutputParamResults));
}

// Load digital output parameter data
function loadDigitalOutputParamData() {
    // Ensure we have a valid digitalOutputParamResults object with the expected structure
    window.digitalOutputParamResults = window.digitalOutputParamResults || {};
    window.digitalOutputParamResults.underCardParams = window.digitalOutputParamResults.underCardParams || {};
    window.digitalOutputParamResults.underLogicParams = window.digitalOutputParamResults.underLogicParams || {};

    // Load Under Card parameters (3 items)
    for (let itemNum = 1; itemNum <= 3; itemNum++) {
        const underCardResult = window.digitalOutputParamResults.underCardParams[`item_${itemNum}`];
        if (underCardResult) {
            const radioToCheck = document.querySelector(`input[name="underCard_${itemNum}"][value="${underCardResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }

    // Load Under Logical parameters (4 items)
    for (let itemNum = 1; itemNum <= 4; itemNum++) {
        const underLogicResult = window.digitalOutputParamResults.underLogicParams[`item_${itemNum}`];
        if (underLogicResult) {
            const radioToCheck = document.querySelector(`input[name="underLogic_${itemNum}"][value="${underLogicResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Navigation functions
function goToPreviousPage() {
    // Save the current parameter data
    saveDigitalOutputParamData();
    window.location.href = 'ParameterSettingDI.html';
};

function handleParamDOSubmission() {
    if (!validateDigitalOutputParameters()) {
        return;
    }
    
    saveDigitalOutputParamData();
    navigationGuard.markPageAsCompleted();
    
    const aiCount = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    
    if (aiCount > 0) {
        // Manually mark next pages as completed to satisfy navigation guard
        localStorage.setItem('ParameterSettingAI.html_completed', 'true');
        window.location.href = 'ParameterSettingAI.html';
    } else {
        // Skip AI parameter page if no AI modules
        localStorage.setItem('ParameterSettingAI.html_completed', 'true');
        window.location.href = 'ParameterSettingIEC101.html';
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

function validateDigitalOutputParameters() {
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
    
    // Check Under Logical parameters (4 items)
    for (let itemNum = 1; itemNum <= 4; itemNum++) {
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