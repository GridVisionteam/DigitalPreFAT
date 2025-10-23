// Initialize with empty data structures
if (!window.iec101ParamResults) window.iec101ParamResults = {
    iec101Params: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved parameter results if available
    const savedResults = localStorage.getItem('iec101ParamResults');
    if (savedResults) {
        window.iec101ParamResults = JSON.parse(savedResults);
    }

    // Generate rows for IEC101 parameters
    generateIEC101ParameterRows();

    // Load any saved data
    loadIEC101ParamData();
});

// Function to generate parameter rows for IEC101 Module
function generateIEC101ParameterRows() {
    const tbody = document.getElementById('IEC101ParamTbody');
    if (!tbody) return;

    // IEC101 Parameter items
    const iec101Parameters = [
        {
            parameter: "Main Port",
            standardSetting: "COM2"
        },
        {
            parameter: "Backup/Standby Port",
            standardSetting: "COM3"
        },
        {
            parameter: "Protocol Name/No.",
            standardSetting: "292. Slave_IEC101Sec"
        },
        {
            parameter: "Standby Mode",
            standardSetting: "One Working Another Spare"
        },
        {
            parameter: "R&T Under Standby Machine",
            standardSetting: "Neither Transmit nor Receive"
        },
        {
            parameter: "Breaking Time (ms)",
            standardSetting: "20000"
        },
        {
            parameter: "Serial Type",
            standardSetting: "RS232"
        },
        {
            parameter: "Baudrate",
            standardSetting: "9600"
        },
        {
            parameter: "Data Bit",
            standardSetting: "8"
        },
        {
            parameter: "Stop Bit",
            standardSetting: "1"
        },
        {
            parameter: "Parity",
            standardSetting: "Even"
        },
        {
            parameter: "Link Address Size",
            standardSetting: "2 octets"
        },
        {
            parameter: "Cause of Transmission Size",
            standardSetting: "1 octets"
        },
        {
            parameter: "Common Address Size",
            standardSetting: "2 octets"
        },
        {
            parameter: "IOA Size",
            standardSetting: "2 octets"
        },
        {
            parameter: "Alarm Time (s)",
            standardSetting: "25"
        },
        {
            parameter: "Link Transmission Procedure",
            standardSetting: "Unbalanced"
        },
        {
            parameter: "User ID",
            standardSetting: "User_TNBD"
        }
    ];

    iec101Parameters.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item.parameter}</td>
            <td style="text-align: center;">${item.standardSetting}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="iec101_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="iec101_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save IEC101 parameter data
function saveIEC101ParamData() {
    // Ensure the param results object has the proper structure
    window.iec101ParamResults = window.iec101ParamResults || {};
    window.iec101ParamResults.iec101Params = window.iec101ParamResults.iec101Params || {};

    // Save IEC101 parameters
    for (let itemNum = 1; itemNum <= 18; itemNum++) {
        const iec101OK = document.querySelector(`input[name="iec101_${itemNum}"][value="OK"]:checked`) !== null;
        window.iec101ParamResults.iec101Params[`item_${itemNum}`] = iec101OK ? 'OK' : 'NO';
    }

    // Save to session storage
    localStorage.setItem('iec101ParamResults', JSON.stringify(window.iec101ParamResults));
}

// Load IEC101 parameter data
function loadIEC101ParamData() {
    // Ensure we have a valid iec101ParamResults object with the expected structure
    window.iec101ParamResults = window.iec101ParamResults || {};
    window.iec101ParamResults.iec101Params = window.iec101ParamResults.iec101Params || {};

    // Load IEC101 parameters
    for (let itemNum = 1; itemNum <= 18; itemNum++) {
        const iec101Result = window.iec101ParamResults.iec101Params[`item_${itemNum}`];
        if (iec101Result) {
            const radioToCheck = document.querySelector(`input[name="iec101_${itemNum}"][value="${iec101Result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Navigation functions
function goToPreviousPage() {
    saveIEC101ParamData();
    
    const aiCount = parseInt(localStorage.getItem('aiModulesToTest')) || 0;
    
    if (aiCount > 0) {
        window.location.href = 'ParameterSettingAI.html';
    } else {
        // Skip AI parameter page if no AI modules
        window.location.href = 'ParameterSettingDO.html';
    }
}

// handleParamIEC101Submission can remain the same as it always goes forward
function handleParamIEC101Submission() {
    if (!validateIEC101Parameters()) {
        return;
    }
    
    saveIEC101ParamData();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'ParameterSettingIEC104.html';
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

function validateIEC101Parameters() {
    let isValid = true;
    
    // Reset all error styles first
    const allInputs = document.querySelectorAll('input[type="radio"]');
    allInputs.forEach(input => {
        input.parentElement.style.border = '';
    });

    // Check IEC101 parameters (18 items)
    for (let itemNum = 1; itemNum <= 18; itemNum++) {
        const paramOK = document.querySelector(`input[name="iec101_${itemNum}"][value="OK"]`);
        const paramNO = document.querySelector(`input[name="iec101_${itemNum}"][value="NO"]`);
        
        // Highlight NO selections
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