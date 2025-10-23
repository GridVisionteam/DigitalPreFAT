// Initialize with empty data structures
if (!window.channelRedundancyResults) window.channelRedundancyResults = {
    iec101: {},
    iec104: {},
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('channelRedundancyResults');
    if (savedResults) {
        window.channelRedundancyResults = JSON.parse(savedResults);
    }

    // Generate rows for all protocol tests
    generateIEC101TestRows();
    generateIEC104TestRows();

    // Load any saved data
    loadChannelRedundancyData();
});

// Function to generate test rows for IEC101
function generateIEC101TestRows() {
    const tbody = document.getElementById('IEC101Tbody');
    if (!tbody) return;

    // IEC101 Test procedures
    const iec101Procedures = [
        "Start by polling IEC101 through Main Channel (COM2).",
        "Simulate any Digital Input signal and verify ASE2000 received the signal.",
        "Do not stop ASE2000 and move the ASE Serial Cable from COM2 to COM3.",
        "IEC101 communication will resume through COM3 after around 20 – 30 seconds.",
        "Simulate any Digital Input signal and verify ASE2000 receive the data."
    ];

    iec101Procedures.forEach((procedure, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${procedure}</td>
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

// Function to generate test rows for IEC104
function generateIEC104TestRows() {
    const tbody = document.getElementById('IEC104Tbody');
    if (!tbody) return;

    // IEC104 Test procedures
    const iec104Procedures = [
        "Start by polling IEC104 through Main Channel (Ethernet1).",
        "Simulate any Digital Input signal and verify ASE2000 received the signal.",
        "Stop ASE2000 and move the LAN Cable from ETH1 to ETH2.",
        "Start polling IEC104 again through ETH2.",
        "Simulate any Digital Input point and make sure ASE2000 receive the data."
    ];

    iec104Procedures.forEach((procedure, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${procedure}</td>
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

// Save channel redundancy test data
function saveChannelRedundancyData() {
    // Ensure the test results object has the proper structure
    window.channelRedundancyResults = window.channelRedundancyResults || {};
    window.channelRedundancyResults.iec101 = window.channelRedundancyResults.iec101 || {};
    window.channelRedundancyResults.iec104 = window.channelRedundancyResults.iec104 || {};

    // Save IEC101 test results
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const iec101OK = document.querySelector(`input[name="iec101_${itemNum}"][value="OK"]:checked`) !== null;
        window.channelRedundancyResults.iec101[`item_${itemNum}`] = iec101OK ? 'OK' : 'NO';
    }

    // Save IEC104 test results
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const iec104OK = document.querySelector(`input[name="iec104_${itemNum}"][value="OK"]:checked`) !== null;
        window.channelRedundancyResults.iec104[`item_${itemNum}`] = iec104OK ? 'OK' : 'NO';
    }

    // Save to session storage
    localStorage.setItem('channelRedundancyResults', JSON.stringify(window.channelRedundancyResults));
}

// Load channel redundancy test data
function loadChannelRedundancyData() {
    // Ensure we have a valid channelRedundancyResults object with the expected structure
    window.channelRedundancyResults = window.channelRedundancyResults || {};
    window.channelRedundancyResults.iec101 = window.channelRedundancyResults.iec101 || {};
    window.channelRedundancyResults.iec104 = window.channelRedundancyResults.iec104 || {};

    // Load IEC101 test results
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const iec101Result = window.channelRedundancyResults.iec101[`item_${itemNum}`];
        if (iec101Result) {
            const radioToCheck = document.querySelector(`input[name="iec101_${itemNum}"][value="${iec101Result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }

    // Load IEC104 test results
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const iec104Result = window.channelRedundancyResults.iec104[`item_${itemNum}`];
        if (iec104Result) {
            const radioToCheck = document.querySelector(`input[name="iec104_${itemNum}"][value="${iec104Result}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Navigation functions
function goToPreviousPage()  {
    // Save the current test data
    saveChannelRedundancyData();
    window.location.href = 'VirtualAlarmTest.html';
};

function handleChannelRedundacySubmission() {
    // First validate the form
    if (!validateChannelRedundancyTests()) {
        return; // Stop navigation if validation fails
    }
    
    // Save the current test data
    saveChannelRedundancyData();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'LimitofAuthority.html';
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

// Validation function for channel redundancy tests
function validateChannelRedundancyTests() {
    let isValid = true;
    
    // Reset all error styles first
    const allInputs = document.querySelectorAll('input[type="radio"]');
    allInputs.forEach(input => {
        input.parentElement.style.border = '';
    });

    // Check IEC101 test items (5 items)
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const testOK = document.querySelector(`input[name="iec101_${itemNum}"][value="OK"]`);
        const testNO = document.querySelector(`input[name="iec101_${itemNum}"][value="NO"]`);
        
        // Highlight NO selections
        if (testNO && testNO.checked) {
            testNO.parentElement.style.border = '1px solid red';
            isValid = false;
        }
    }

    // Check IEC104 test items (5 items)
    for (let itemNum = 1; itemNum <= 5; itemNum++) {
        const testOK = document.querySelector(`input[name="iec104_${itemNum}"][value="OK"]`);
        const testNO = document.querySelector(`input[name="iec104_${itemNum}"][value="NO"]`);
        
        // Highlight NO selections
        if (testNO && testNO.checked) {
            testNO.parentElement.style.border = '1px solid red';
            isValid = false;
        }
    }
    
    if (!isValid) {
        alert('Please complete all required tests before continuing. All tests must be marked OK.');
    }
    
    return isValid;
}