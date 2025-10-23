// Initialize with empty data structures
if (!window.iec104ParamResults) window.iec104ParamResults = {
    iec104Params: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved parameter results if available
    const savedResults = localStorage.getItem('iec104ParamResults');
    if (savedResults) {
        window.iec104ParamResults = JSON.parse(savedResults);
    }

    // Generate rows for IEC104 parameters
    generateIEC104ParameterRows();

    // Load any saved data
    loadIEC104ParamData();
});

// Function to generate parameter rows for IEC104 Module
function generateIEC104ParameterRows() {
    const tbody = document.getElementById('IEC104ParamTbody');
    if (!tbody) return;

    // IEC104 Parameter items
    const iec104Parameters = [
        {
            parameter: "Main Port",
            standardSetting: "EthernetA, Link2"
        },
        {
            parameter: "Backup/Standby Port",
            standardSetting: "EthernetB, Link2"
        },
        {
            parameter: "Protocol Name/No.",
            standardSetting: "114. Slave_IEC104Sec"
        },
        {
            parameter: "Standby Mode",
            standardSetting: "Both Have Task"
        },
        {
            parameter: "Work Mode",
            standardSetting: "TCP Server"
        },
        {
            parameter: "Port Address",
            standardSetting: "2404"
        },
        {
            parameter: "Cause of Transmission Size",
            standardSetting: "2 octets"
        },
        {
            parameter: "Common Address of ASDU Size",
            standardSetting: "2 octets"
        },
        {
            parameter: "Information Object Address Size",
            standardSetting: "3 octets"
        },
        {
            parameter: "Control Command Mode",
            standardSetting: "CMD_BOTH"
        },
        {
            parameter: "Background Scan Time (s)",
            standardSetting: "0"
        },
        {
            parameter: "T1 period",
            standardSetting: "15 seconds"
        },
        {
            parameter: "T2 period",
            standardSetting: "10 seconds"
        },
        {
            parameter: "T3 period",
            standardSetting: "20 seconds"
        },
        {
            parameter: "K",
            standardSetting: "12"
        },
        {
            parameter: "W",
            standardSetting: "8"
        }
    ];

    iec104Parameters.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item.parameter}</td>
            <td style="text-align: center;">${item.standardSetting}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="iec104_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="iec104_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save IEC104 parameter data
function saveIEC104ParamData() {
    // Ensure the param results object has the proper structure
    window.iec104ParamResults = window.iec104ParamResults || {};
    window.iec104ParamResults.iec104Params = window.iec104ParamResults.iec104Params || {};

    // Save IEC104 parameters
    for (let itemNum = 1; itemNum <= 16; itemNum++) {
        const iec104OK = document.querySelector(`input[name="iec104_${itemNum}"][value="OK"]:checked`) !== null;
        window.iec104ParamResults.iec104Params[`item_${itemNum}`] = iec104OK ? 'OK' : 'NO';
    }

    // Save to session storage
    localStorage.setItem('iec104ParamResults', JSON.stringify(window.iec104ParamResults));
}

// Load IEC104 parameter data
function loadIEC104ParamData() {
    // Ensure we have a valid iec104ParamResults object with the expected structure
    window.iec104ParamResults = window.iec104ParamResults || {};
    window.iec104ParamResults.iec104Params = window.iec104ParamResults.iec104Params || {};

    // Load IEC104 parameters
    for (let itemNum = 1; itemNum <= 16; itemNum++) {
        const iec104Result = window.iec104ParamResults.iec104Params[`item_${itemNum}`];
        if (iec104Result) {
            const radioToCheck = document.querySelector(`input[name="iec104_${itemNum}"][value="${iec104Result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Navigation functions
function goToPreviousPage() {
    // Save the current parameter data
    saveIEC104ParamData();
    window.location.href = 'ParameterSettingIEC101.html'; // Update with actual previous page
};

function handleParamIEC104Submission() {
    // First validate the form
    if (!validateIEC104Parameters()) {
        return; // Stop navigation if validation fails
    }
    
    // Save the current parameter data
    saveIEC104ParamData();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'VirtualAlarmTest.html';
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
function validateIEC104Parameters() {
    let isValid = true;
    
    // Reset all error styles first
    const allInputs = document.querySelectorAll('input[type="radio"]');
    allInputs.forEach(input => {
        input.parentElement.style.border = '';
    });

    // Check IEC104 parameters (16 items)
    for (let itemNum = 1; itemNum <= 16; itemNum++) {
        const paramOK = document.querySelector(`input[name="iec104_${itemNum}"][value="OK"]`);
        const paramNO = document.querySelector(`input[name="iec104_${itemNum}"][value="NO"]`);
        
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