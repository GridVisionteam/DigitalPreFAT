// Initialize with empty data structures
if (!window.processorParamResults) window.processorParamResults = {
    mcu1aParams: {},
    mcu4aParams: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved parameter results if available
    const savedResults = localStorage.getItem('processorParamResults');
    if (savedResults) {
        window.processorParamResults = JSON.parse(savedResults);
    }

    // Generate rows for both MCU types
    generateMCU1AParameterRows();
    generateMCU4AParameterRows();

    // Load any saved data
    loadProcessorParamData();
});

// Function to generate parameter rows for MCU-1-A
function generateMCU1AParameterRows() {
    const tbody = document.getElementById('MCU-1-ATbody');
    if (!tbody) return;

    // MCU-1-A Parameter items
    const mcu1aParameters = [
        {
            parameter: "Time Zone",
            standard: "UTC +08:00"
        },
        {
            parameter: "Employ NVRAM",
            standard: "YES"
        },
        {
            parameter: "Time delay (s)",
            standard: "20 seconds"
        },
        {
            parameter: "ClockSyn",
            standard: "60 minutes"
        }
    ];

    mcu1aParameters.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item.parameter}</td>
            <td style="text-align: left;">${item.standard}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="mcu1a_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="mcu1a_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate parameter rows for MCU-4-A
function generateMCU4AParameterRows() {
    const tbody = document.getElementById('MCU-4-ATbody');
    if (!tbody) return;

    // MCU-4-A Parameter items
    const mcu4aParameters = [
        {
            parameter: "Time Zone",
            standard: "UTC +08:00"
        },
        {
            parameter: "Employ NVRAM",
            standard: "YES"
        },
        {
            parameter: "Time delay (s)",
            standard: "20 seconds"
        },
        {
            parameter: "ClockSyn",
            standard: "60 minutes"
        }
    ];

    mcu4aParameters.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item.parameter}</td>
            <td style="text-align: left;">${item.standard}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="mcu4a_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="mcu4a_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save processor parameter data
function saveProcessorParamData() {
    // Ensure the param results object has the proper structure
    window.processorParamResults = window.processorParamResults || {};
    window.processorParamResults.mcu1aParams = window.processorParamResults.mcu1aParams || {};
    window.processorParamResults.mcu4aParams = window.processorParamResults.mcu4aParams || {};

    // Save MCU-1-A parameters (5 items)
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const mcu1aOK = document.querySelector(`input[name="mcu1a_${itemNum}"][value="OK"]:checked`) !== null;
        window.processorParamResults.mcu1aParams[`item_${itemNum}`] = mcu1aOK ? 'OK' : 'NO';
    }

    // Save MCU-4-A parameters (7 items)
    for (let itemNum = 1; itemNum <= 7; itemNum++) {
        const mcu4aOK = document.querySelector(`input[name="mcu4a_${itemNum}"][value="OK"]:checked`) !== null;
        window.processorParamResults.mcu4aParams[`item_${itemNum}`] = mcu4aOK ? 'OK' : 'NO';
    }

    // Save to session storage
    localStorage.setItem('processorParamResults', JSON.stringify(window.processorParamResults));
}

// Load processor parameter data
function loadProcessorParamData() {
    // Ensure we have a valid processorParamResults object with the expected structure
    window.processorParamResults = window.processorParamResults || {};
    window.processorParamResults.mcu1aParams = window.processorParamResults.mcu1aParams || {};
    window.processorParamResults.mcu4aParams = window.processorParamResults.mcu4aParams || {};

    // Load MCU-1-A parameters (5 items)
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const mcu1aResult = window.processorParamResults.mcu1aParams[`item_${itemNum}`];
        if (mcu1aResult) {
            const radioToCheck = document.querySelector(`input[name="mcu1a_${itemNum}"][value="${mcu1aResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }

    // Load MCU-4-A parameters (7 items)
    for (let itemNum = 1; itemNum <= 7; itemNum++) {
        const mcu4aResult = window.processorParamResults.mcu4aParams[`item_${itemNum}`];
        if (mcu4aResult) {
            const radioToCheck = document.querySelector(`input[name="mcu4a_${itemNum}"][value="${mcu4aResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Update navigation functions
window.goToPreviousPage = function() {
    // Save the current parameter data
    saveProcessorParamData();

    const aiModulesToTest = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    window.currentAIModule = aiModulesToTest;
    localStorage.setItem('currentAIModule', window.currentAIModule);
    
    window.location.href = 'RTUPowerUp.html';



};

function handleParamProcSubmission() {
    // First validate the form
    if (!validateProcessorParameters()) {
        return; // Stop navigation if validation fails
    }
    
    // Save the current parameter data
    saveProcessorParamData();
    navigationGuard.markPageAsCompleted();
    window.location.href = './ParameterSettingDI.html';
};

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

function validateProcessorParameters() {
    let isValid = true;
    
    // Reset all error styles first
    const allInputs = document.querySelectorAll('input[type="radio"]');
    allInputs.forEach(input => {
        input.parentElement.style.border = '';
    });

    // Check MCU-1-A parameters (4 items)
    for (let itemNum = 1; itemNum <= 4; itemNum++) {
        const paramOK = document.querySelector(`input[name="mcu1a_${itemNum}"][value="OK"]`);
        const paramNO = document.querySelector(`input[name="mcu1a_${itemNum}"][value="NO"]`);
        
        // Highlight NO selections
        if (paramNO && paramNO.checked) {
            paramNO.parentElement.style.border = '1px solid red';
            isValid = false;
        }
    }
    
    // Check MCU-4-A parameters (4 items)
    for (let itemNum = 1; itemNum <= 4; itemNum++) {
        const paramOK = document.querySelector(`input[name="mcu4a_${itemNum}"][value="OK"]`);
        const paramNO = document.querySelector(`input[name="mcu4a_${itemNum}"][value="NO"]`);
        
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