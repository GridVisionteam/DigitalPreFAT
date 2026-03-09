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
            editable: true,
            defaultIEC101Checked: true,
            defaultIEC104Checked: true
        },
        {
            alarm: "Time Sync Alarm",
            iec101IOA: "951",
            iec104IOA: "951",
            editable: true,
            defaultIEC101Checked: true,
            defaultIEC104Checked: true
        },
        {
            alarm: "RTU Health/Comm Fail",
            iec101IOA: "953",
            iec104IOA: "953",
            editable: true,
            defaultIEC101Checked: true,
            defaultIEC104Checked: true
        },
        {
            alarm: "DI Module Fail",
            iec101IOA: "954",
            iec104IOA: "954",
            editable: true,
            defaultIEC101Checked: true,
            defaultIEC104Checked: true
        },
        {
            alarm: "DO Module Fail",
            iec101IOA: "955",
            iec104IOA: "955",
            editable: true,
            defaultIEC101Checked: true,
            defaultIEC104Checked: true
        },
        {
            alarm: "AI Module Fail",
            iec101IOA: "956",
            iec104IOA: "956",
            editable: true,
            defaultIEC101Checked: false,
            defaultIEC104Checked: false
        },
        {
            alarm: "AO Module Fail",
            iec101IOA: "957",
            iec104IOA: "957",
            editable: true,
            defaultIEC101Checked: false,  // Both unchecked for AO Module Fail
            defaultIEC104Checked: false   // Both unchecked for AO Module Fail
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

        // Use the default checked values from the item configuration
        const iec101Checked = item.defaultIEC101Checked ? 'checked' : '';
        const iec104Checked = item.defaultIEC104Checked ? 'checked' : '';

        row.innerHTML = `
            <td style="text-align: left;">${item.alarm}</td>
            ${iec101IOACell}
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="virtualAlarm_${rowNumber}_iec101" ${iec101Checked}>
                    <span class="toggle-text"></span>
                </label>
            </td>
            ${iec104IOACell}
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="virtualAlarm_${rowNumber}_iec104" ${iec104Checked}>
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
        
        // Set IEC101 checkbox
        const iec101Checkbox = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec101"]`);
        if (iec101Checkbox && testResult) {
            iec101Checkbox.checked = testResult.iec101 === 'OK';
        }
        
        // Set IEC104 checkbox
        const iec104Checkbox = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec104"]`);
        if (iec104Checkbox && testResult) {
            iec104Checkbox.checked = testResult.iec104 === 'OK';
        }
        
        // Set IEC101 IOA value
        const iec101IOAInput = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec101IOA"]`);
        if (iec101IOAInput) {
            if (testResult && testResult.iec101IOA !== undefined && testResult.iec101IOA !== null) {
                // Load saved value
                iec101IOAInput.value = testResult.iec101IOA;
            }
            // REMOVE THE ELSE CLAUSE THAT WAS CLEARING THE VALUE
            // Don't clear the input - keep the default value from row generation
        }
        
        // Set IEC104 IOA value
        const iec104IOAInput = document.querySelector(`input[name="virtualAlarm_${itemNum}_iec104IOA"]`);
        if (iec104IOAInput) {
            if (testResult && testResult.iec104IOA !== undefined && testResult.iec104IOA !== null) {
                // Load saved value
                iec104IOAInput.value = testResult.iec104IOA;
            }
            // REMOVE THE ELSE CLAUSE THAT WAS CLEARING THE VALUE
            // Don't clear the input - keep the default value from row generation
        }
    }
}

// Navigation functions
window.goToPreviousPage = function() {
    // Save the current test data
    saveVirtualAlarmTestData();
    window.location.href = 'FunctionalityAIPage.html'; // Update with actual previous page
};

function handleVirtualAlarmTestSubmission() {
    // First validate the form
    if (!validateVirtualAlarmTests()) {
        return; // Stop navigation if validation fails
    }

    // Validate IOA index fields for IEC101 and IEC104
    if (!validateVirtualAlarmIOAIndexFields()) {
        return; // Stop if validation fails
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
    let errors = [];
    
    // Reset all error styles first
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        if(checkbox.parentElement) checkbox.parentElement.style.border = '';
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
        
        // Get alarm name for error messages
        const row = iec101Checkbox ? iec101Checkbox.closest('tr') : 
                    iec104Checkbox ? iec104Checkbox.closest('tr') : null;
        const alarmName = row ? row.querySelector('td:first-child').textContent.trim() : `Alarm ${itemNum}`;
        
        // --- IEC101 Validation ---
        if (iec101Checkbox && iec101IOAInput) {
            const hasNumber = iec101IOAInput.value.trim() !== "";
            const isChecked = iec101Checkbox.checked;
            
            // Case 1: Checked but no number
            if (isChecked && !hasNumber) {
                iec101Checkbox.parentElement.style.border = '1px solid red';
                iec101IOAInput.style.border = '1px solid red';
                errors.push(`IEC101 ${alarmName}: IOA required when ticked`);
                isValid = false;
            }
            // Case 2: Has number but not checked (NEW VALIDATION)
            else if (hasNumber && !isChecked) {
                iec101Checkbox.parentElement.style.border = '1px solid red';
                iec101IOAInput.style.border = '1px solid red';
                errors.push(`IEC101 ${alarmName}: Remove IOA or tick the checkbox`);
                isValid = false;
            }
        }
        
        // --- IEC104 Validation ---
        if (iec104Checkbox && iec104IOAInput) {
            const hasNumber = iec104IOAInput.value.trim() !== "";
            const isChecked = iec104Checkbox.checked;
            
            // Case 1: Checked but no number
            if (isChecked && !hasNumber) {
                iec104Checkbox.parentElement.style.border = '1px solid red';
                iec104IOAInput.style.border = '1px solid red';
                errors.push(`IEC104 ${alarmName}: IOA required when ticked`);
                isValid = false;
            }
            // Case 2: Has number but not checked (NEW VALIDATION)
            else if (hasNumber && !isChecked) {
                iec104Checkbox.parentElement.style.border = '1px solid red';
                iec104IOAInput.style.border = '1px solid red';
                errors.push(`IEC104 ${alarmName}: Remove IOA or tick the checkbox`);
                isValid = false;
            }
        }
    }
    
    if (!isValid) {
        alert('Validation failed:\n\n' + errors.join('\n'));
    }
    
    return isValid;
}

function validateVirtualAlarmIOAIndexFields() {
    // Get all IEC101 and IEC104 input fields
    const iec101Inputs = document.querySelectorAll('input[name*="iec101IOA"]');
    const iec104Inputs = document.querySelectorAll('input[name*="iec104IOA"]');
    
    let isValid = true;
    let emptyFields = [];
    let duplicateFields = [];

    // Reset previous red borders
    [...iec101Inputs, ...iec104Inputs].forEach(input => {
        input.style.border = ''; // clear border
    });

    // 1. Check IEC101 fields (Empty check) - ONLY if checked
    iec101Inputs.forEach(input => {
        const checkboxName = input.name.replace('IOA', ''); // derived from input name
        const checkbox = document.querySelector(`input[name="${checkboxName}"]`);
        
        const hasNumber = input.value.trim() !== "";
        const isChecked = checkbox && checkbox.checked;
        
        // Case 1: Checked but no number
        if (isChecked && !hasNumber) {
            input.style.border = '2px solid red';
            isValid = false;
            const alarmName = getAlarmNameFromInput(input);
            emptyFields.push(`IEC101 ${alarmName}: IOA required when ticked`);
        }
        // Case 2: Has number but not checked (NEW VALIDATION)
        else if (hasNumber && !isChecked) {
            input.style.border = '2px solid red';
            isValid = false;
            const alarmName = getAlarmNameFromInput(input);
            emptyFields.push(`IEC101 ${alarmName}: Remove IOA or tick the checkbox`);
        }
    });
    
    // 2. Check IEC104 fields (Empty check) - ONLY if checked
    iec104Inputs.forEach(input => {
        const checkboxName = input.name.replace('IOA', '');
        const checkbox = document.querySelector(`input[name="${checkboxName}"]`);
        
        const hasNumber = input.value.trim() !== "";
        const isChecked = checkbox && checkbox.checked;
        
        // Case 1: Checked but no number
        if (isChecked && !hasNumber) {
            input.style.border = '2px solid red';
            isValid = false;
            const alarmName = getAlarmNameFromInput(input);
            emptyFields.push(`IEC104 ${alarmName}: IOA required when ticked`);
        }
        // Case 2: Has number but not checked (NEW VALIDATION)
        else if (hasNumber && !isChecked) {
            input.style.border = '2px solid red';
            isValid = false;
            const alarmName = getAlarmNameFromInput(input);
            emptyFields.push(`IEC104 ${alarmName}: Remove IOA or tick the checkbox`);
        }
    });

    if (!isValid) {
        alert(`Validation failed:\n\n${emptyFields.join('\n')}`);
        return false;
    }

    // 3. Check for duplicate values in IEC101 column
    // Filter: Only include inputs where the checkbox is CHECKED
    const iec101ActiveInputs = Array.from(iec101Inputs).filter(input => {
        const checkboxName = input.name.replace('IOA', '');
        const checkbox = document.querySelector(`input[name="${checkboxName}"]`);
        return checkbox && checkbox.checked && input.value.trim() !== '';
    });

    const iec101Values = iec101ActiveInputs.map(input => input.value.trim());
    const iec101Duplicates = findDuplicates(iec101Values);

    if (iec101Duplicates.length > 0) {
        isValid = false;
        // Highlight only the active inputs that have duplicates
        iec101ActiveInputs.forEach(input => {
            if (iec101Duplicates.includes(input.value.trim())) {
                input.style.border = '2px solid red';
            }
        });
        duplicateFields.push(`IEC101: Duplicate values found (${iec101Duplicates.join(', ')})`);
    }

    // 4. Check for duplicate values in IEC104 column
    // Filter: Only include inputs where the checkbox is CHECKED
    const iec104ActiveInputs = Array.from(iec104Inputs).filter(input => {
        const checkboxName = input.name.replace('IOA', '');
        const checkbox = document.querySelector(`input[name="${checkboxName}"]`);
        return checkbox && checkbox.checked && input.value.trim() !== '';
    });

    const iec104Values = iec104ActiveInputs.map(input => input.value.trim());
    const iec104Duplicates = findDuplicates(iec104Values);

    if (iec104Duplicates.length > 0) {
        isValid = false;
        // Highlight only the active inputs that have duplicates
        iec104ActiveInputs.forEach(input => {
            if (iec104Duplicates.includes(input.value.trim())) {
                input.style.border = '2px solid red';
            }
        });
        duplicateFields.push(`IEC104: Duplicate values found (${iec104Duplicates.join(', ')})`);
    }

    if (duplicateFields.length > 0) {
        alert(`Duplicate IOA index values found among checked items:\n${duplicateFields.join('\n')}\n\n`);
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