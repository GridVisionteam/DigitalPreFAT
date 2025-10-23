// JavaScript specific to rtudetail.html
document.getElementById("logo").addEventListener("click", () => {
    // Clear all session data for a fresh start
    localStorage.clear();
    window.location.href = 'index.html';
});

function saveCurrentRTUDetails() {
    const rtuSerialInput = document.getElementById('rtuSerial');
    const contractNoInput = document.getElementById('contractNo');
    const projectNameInput = document.getElementById('projectName');

    if (rtuSerialInput) localStorage.setItem('session_rtuSerial', rtuSerialInput.value.trim());
    if (contractNoInput) localStorage.setItem('session_contractNo', contractNoInput.value.trim());
    if (projectNameInput) localStorage.setItem('session_projectName', projectNameInput.value.trim());
}

// --- Utility Functions ---
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

document.addEventListener('DOMContentLoaded', () => {
    // Helper function to remove extra quotes from stored values
    const getStoredValue = (key) => {
        let value = localStorage.getItem(key) || '';
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        return value;
    };

    // Load RTU data from localStorage and remove extra quotes if present
    const rtuSerialInput = document.getElementById('rtuSerial');
    const contractNoInput = document.getElementById('contractNo');
    const projectNameInput = document.getElementById('projectName');

    if (rtuSerialInput) rtuSerialInput.value = getStoredValue('session_rtuSerial');
    if (contractNoInput) contractNoInput.value = getStoredValue('session_contractNo');
    if (projectNameInput) projectNameInput.value = getStoredValue('session_projectName');
});

function goBackToUserDetails() {
    saveCurrentRTUDetails(); // Save current RTU details
    window.location.href = './userdetail.html'; 
}

function goToBQPage() {
    const rtuSerialInput = document.getElementById("rtuSerial");
    const contractNoInput = document.getElementById("contractNo");
    const projectNameInput = document.getElementById("projectName");

    const rtuSerial = rtuSerialInput ? rtuSerialInput.value.trim() : "";
    const contractNo = contractNoInput ? contractNoInput.value.trim() : "";
    const projectName = projectNameInput ? projectNameInput.value.trim() : "";

    if (!rtuSerial || !contractNo || !projectName) {
        showCustomAlert("Please fill in all fields (RTU Serial No., Contract No., and Project Name)");
        return;
    }
    saveCurrentRTUDetails();

    window.location.href = './BQ.html';
}