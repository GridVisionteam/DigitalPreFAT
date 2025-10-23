// Initialize with empty data structures
if (!window.virtualAlarmTestResults) window.virtualAlarmTestResults = {
    virtualAlarmTests: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('virtualAlarmTestResults');
    if (savedResults) {
        window.virtualAlarmTestResults = JSON.parse(savedResults);
    }

    // Generate rows for virtual alarm tests
    generateVirtualAlarmTestRows();

    // Load any saved data
    loadVirtualAlarmTestData();
});

// Function to generate rows for Virtual Alarm Test
function generateVirtualAlarmTestRows() {
    const tbody = document.getElementById('VirtualAlarmTestTbody');
    if (!tbody) return;

    // Virtual Alarm Test items
    const virtualAlarmTests = [
        {
            alarm: "SOE Buffer Full",
            iec101IOA: "950",
            iec104IOA: "950",
            editable: true
        },
        {
            alarm: "Time Sync Alarm",
            iec101IOA: "951",
            iec104IOA: "951",
            editable: true
        },
        {
            alarm: "RTU Health/Comm Fail",
            iec101IOA: "953",
            iec104IOA: "953",
            editable: true
        },
        {
            alarm: "DI Module Fail",
            iec101IOA: "",
            iec104IOA: "",
            editable: true
        },
        {
            alarm: "DO Module Fail",
            iec101IOA: "",
            iec104IOA: "",
            editable: true
        },
        {
            alarm: "AI Module Fail",
            iec101IOA: "",
            iec104IOA: "",
            editable: true
        },
        {
            alarm: "AO Module Fail",
            iec101IOA: "",
            iec104IOA: "",
            editable: true
        }
    ];

    virtualAlarmTests.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        
        // Create input fields for editable IOAs or static text for non-editable
        const iec101IOACell = item.editable 
            ? `<td style="text-align: center;"><input type="number" name="virtualAlarm_${rowNumber}_iec101IOA" value="${item.iec101IOA}" min="0" style="width: 60px;"></td>`
            : `<td style="text-align: center;">${item.iec101IOA}</td>`;
            
        const iec104IOACell = item.editable 
            ? `<td style="text-align: center;"><input type="number" name="virtualAlarm_${rowNumber}_iec104IOA" value="${item.iec104IOA}" min="0" style="width: 60px;"></td>`
            : `<td style="text-align: center;">${item.iec104IOA}</td>`;

        row.innerHTML = `
            <td style="text-align: left;">${item.alarm}</td>
            ${iec101IOACell}
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="virtualAlarm_${rowNumber}_iec101" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            ${iec104IOACell}
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="virtualAlarm_${rowNumber}_iec104" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save virtual alarm test data
function saveVirtualAlarmTestData() {
    // Ensure the test results object has the proper structure
    window.virtualAlarmTestResults = window.virtualAlarmTestResults || {};
    window.virtualAlarmTestResults.virtualAlarmTests = window.virtualAlarmTestResults.virtualAlarmTests || {};

    // Save Virtual Alarm Test results
    for (let itemNum = 1; itemNum <= 7; itemNum++) {
        const iec101Checked = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec101"]`)?.checked || false;
        const iec104Checked = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec104"]`)?.checked || false;
        
        // Get IOA values if they exist (for editable fields)
        const iec101IOAInput = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec101IOA"]`);
        const iec104IOAInput = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec104IOA"]`);
        
        const iec101IOA = iec101IOAInput ? iec101IOAInput.value : null;
        const iec104IOA = iec104IOAInput ? iec104IOAInput.value : null;

        window.virtualAlarmTestResults.virtualAlarmTests[`item_${itemNum}`] = {
            iec101: iec101Checked ? 'OK' : 'NO',
            iec104: iec104Checked ? 'OK' : 'NO',
            iec101IOA: iec101IOA,
            iec104IOA: iec104IOA
        };
    }

    // Save to session storage
    localStorage.setItem('virtualAlarmTestResults', JSON.stringify(window.virtualAlarmTestResults));
}

// Load virtual alarm test data
function loadVirtualAlarmTestData() {
    // Ensure we have a valid virtualAlarmTestResults object with the expected structure
    window.virtualAlarmTestResults = window.virtualAlarmTestResults || {};
    window.virtualAlarmTestResults.virtualAlarmTests = window.virtualAlarmTestResults.virtualAlarmTests || {};

    // Load Virtual Alarm Test results
    for (let itemNum = 1; itemNum <= 7; itemNum++) {
        const testResult = window.virtualAlarmTestResults.virtualAlarmTests[`item_${itemNum}`];
        if (testResult) {
            // Set IEC101 checkbox
            const iec101Checkbox = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec101"]`);
            if (iec101Checkbox) iec101Checkbox.checked = testResult.iec101 === 'OK';
            
            // Set IEC104 checkbox
            const iec104Checkbox = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec104"]`);
            if (iec104Checkbox) iec104Checkbox.checked = testResult.iec104 === 'OK';
            
            // Set IOA values if they exist
            const iec101IOAInput = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec101IOA"]`);
            if (iec101IOAInput && testResult.iec101IOA) {
                iec101IOAInput.value = testResult.iec101IOA;
            }
            
            const iec104IOAInput = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec104IOA"]`);
            if (iec104IOAInput && testResult.iec104IOA) {
                iec104IOAInput.value = testResult.iec104IOA;
            }
        }
    }
}

// Navigation functions
window.goToPreviousPage = function() {
    // Save the current test data
    saveVirtualAlarmTestData();
    window.location.href = 'ParameterSettingIEC104.html'; // Update with actual previous page
};

function handleVirtualAlarmTestSubmission() {
    // First validate the form
    if (!validateVirtualAlarmTests()) {
        return; // Stop navigation if validation fails
    }
    
    // Save the current test data
    saveVirtualAlarmTestData();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'ChannelRedundacyTest.html'; // Update with actual next page
};

function SelectAll() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

function clearAll() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function validateVirtualAlarmTests() {
    let isValid = true;
    
    // Reset all error styles first
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.parentElement.style.border = '';
    });
    
    const allIOAInputs = document.querySelectorAll('input[type="number"]');
    allIOAInputs.forEach(input => {
        input.style.border = '';
    });

    // Check each test item (7 items)
    for (let itemNum = 1; itemNum <= 7; itemNum++) {
        const iec101Checkbox = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec101"]`);
        const iec104Checkbox = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec104"]`);
        const iec101IOAInput = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec101IOA"]`);
        const iec104IOAInput = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec104IOA"]`);
        
        // Validate IEC101
        if (iec101IOAInput && iec101IOAInput.value.trim() !== "") {
            if (!iec101Checkbox.checked) {
                iec101Checkbox.parentElement.style.border = '1px solid red';
                isValid = false;
            }
        }
        
        // Validate IEC104
        if (iec104IOAInput && iec104IOAInput.value.trim() !== "") {
            if (!iec104Checkbox.checked) {
                iec104Checkbox.parentElement.style.border = '1px solid red';
                isValid = false;
            }
        }
        
        // Additional validation: If checkbox is checked, at least one IOA should be filled
        if ((iec101Checkbox.checked || iec104Checkbox.checked) && 
            (!iec101IOAInput || iec101IOAInput.value.trim() === "") && 
            (!iec104IOAInput || iec104IOAInput.value.trim() === "")) {
            
            if (iec101Checkbox.checked) iec101Checkbox.parentElement.style.border = '1px solid red';
            if (iec104Checkbox.checked) iec104Checkbox.parentElement.style.border = '1px solid red';
            isValid = false;
        }
    }
    
    if (!isValid) {
        alert('Validation failed:Please fill in the IOA');
    }
    
    return isValid;
}
