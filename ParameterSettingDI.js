// Initialize with empty data structures
if (!window.digitalInputParamResults) window.digitalInputParamResults = {
    underCardParams: {},
    underLogicParams: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved parameter results if available
    const savedResults = localStorage.getItem('digitalInputParamResults');
    if (savedResults) {
        window.digitalInputParamResults = JSON.parse(savedResults);
    }

    // Generate rows for both module types
    generateUnderCardParameterRows();
    generateUnderLogicParameterRows();

    // Load any saved data
    loadDigitalInputParamData();
});

// Function to generate parameter rows for Under Card Module
function generateUnderCardParameterRows() {
    const tbody = document.getElementById('UnderCardModuleTbody');
    if (!tbody) return;

    // Under Card Module Parameter items
    const underCardParameters = [
        {
            parameter: "Debounce",
            standardSPI: "10ms",
            standardDPI: "10ms"
        },
        {
            parameter: "Invert",
            standardSPI: "NO",
            standardDPI: "NO"
        },
        {
            parameter: "Chatter Time = Tc (ms)",
            standardSPI: "1000",
            standardDPI: "1000"
        },
        {
            parameter: "Number of Chatter = Nc",
            standardSPI: "5",
            standardDPI: "5"
        },
        {
            parameter: "Recovery Time = TRcvr",
            standardSPI: "60",
            standardDPI: "60"
        }
    ];

    underCardParameters.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item.parameter}</td>
            <td style="text-align: center;">${item.standardSPI}</td>
            <td style="text-align: center;">${item.standardDPI}</td>
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

    // Under Logical Module Parameter items
    const underLogicParameters = [
        {
            parameter: "Transmit SOE",
            standardSPI: "YES",
            standardDPI: "YES"
        },
        {
            parameter: "Transmit COS",
            standardSPI: "NO",
            standardDPI: "NO"
        },
        {
            parameter: "Info Code 1",
            standardSPI: "(1)",
            standardDPI: "(3)"
        },
        {
            parameter: "Info Code 2",
            standardSPI: "(30)",
            standardDPI: "(31)"
        },
        {
            parameter: "Event Buffer Mode",
            standardSPI: "Uncovered (No Tick)",
            standardDPI: "Uncovered (No Tick)"
        },
        {
            parameter: "SOE Buffer Size",
            standardSPI: "1000",
            standardDPI: "1000"
        },
        {
            parameter: "Priority",
            standardSPI: "2",
            standardDPI: "2"
        }
    ];

    underLogicParameters.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item.parameter}</td>
            <td style="text-align: center;">${item.standardSPI}</td>
            <td style="text-align: center;">${item.standardDPI}</td>
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

// Save digital input parameter data
function saveDigitalInputParamData() {
    // Ensure the param results object has the proper structure
    window.digitalInputParamResults = window.digitalInputParamResults || {};
    window.digitalInputParamResults.underCardParams = window.digitalInputParamResults.underCardParams || {};
    window.digitalInputParamResults.underLogicParams = window.digitalInputParamResults.underLogicParams || {};

    // Save Under Card parameters
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const underCardOK = document.querySelector(`input[name="underCard_${itemNum}"][value="OK"]:checked`) !== null;
        window.digitalInputParamResults.underCardParams[`item_${itemNum}`] = underCardOK ? 'OK' : 'NO';
    }

    // Save Under Logical parameters
    for (let itemNum = 1; itemNum <= 7; itemNum++) {
        const underLogicOK = document.querySelector(`input[name="underLogic_${itemNum}"][value="OK"]:checked`) !== null;
        window.digitalInputParamResults.underLogicParams[`item_${itemNum}`] = underLogicOK ? 'OK' : 'NO';
    }

    // Save to session storage
    localStorage.setItem('digitalInputParamResults', JSON.stringify(window.digitalInputParamResults));
}

// Load digital input parameter data
function loadDigitalInputParamData() {
    // Ensure we have a valid digitalInputParamResults object with the expected structure
    window.digitalInputParamResults = window.digitalInputParamResults || {};
    window.digitalInputParamResults.underCardParams = window.digitalInputParamResults.underCardParams || {};
    window.digitalInputParamResults.underLogicParams = window.digitalInputParamResults.underLogicParams || {};

    // Load Under Card parameters
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const underCardResult = window.digitalInputParamResults.underCardParams[`item_${itemNum}`];
        if (underCardResult) {
            const radioToCheck = document.querySelector(`input[name="underCard_${itemNum}"][value="${underCardResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }

    // Load Under Logical parameters
    for (let itemNum = 1; itemNum <= 7; itemNum++) {
        const underLogicResult = window.digitalInputParamResults.underLogicParams[`item_${itemNum}`];
        if (underLogicResult) {
            const radioToCheck = document.querySelector(`input[name="underLogic_${itemNum}"][value="${underLogicResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Navigation functions
window.goToPreviousPage = function() {
    // Save the current parameter data
    saveDigitalInputParamData();
    window.location.href = 'ParameterSettingProc.html';
};

function handleParamDISubmission() {
    // First validate the form
    if (!validateDigitalInputParameters()) {
        return; // Stop navigation if validation fails
    }
    
    // Save the current parameter data
    saveDigitalInputParamData();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'ParameterSettingDO.html';
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

function validateDigitalInputParameters() {
    let isValid = true;
    
    // Reset all error styles first
    const allInputs = document.querySelectorAll('input[type="radio"]');
    allInputs.forEach(input => {
        input.parentElement.style.border = '';
    });

    // Check Under Card parameters (5 items)
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const paramOK = document.querySelector(`input[name="underCard_${itemNum}"][value="OK"]`);
        const paramNO = document.querySelector(`input[name="underCard_${itemNum}"][value="NO"]`);
        
        // Highlight NO selections
        if (paramNO && paramNO.checked) {
            paramNO.parentElement.style.border = '1px solid red';
            isValid = false;
        }
    }
    
    // Check Under Logical parameters (7 items)
    for (let itemNum = 1; itemNum <= 7; itemNum++) {
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