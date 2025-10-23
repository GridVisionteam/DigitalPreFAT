function startNewSession() {
    // Show confirmation dialog
    const userConfirmed = confirm("All of the data in previous session will be permanently deleted to start a new session. Are you sure?");
    
    if (userConfirmed) {
        try {
            // Clear both sessionStorage and localStorage
            sessionStorage.clear();
            localStorage.clear();
            console.log("All session data cleared");
            
            // Redirect to index.html
            window.location.href = 'userdetail.html';
        } catch (error) {
            console.error("Failed to start new session:", error);
            alert("Failed to start new session. Please try again.");
        }
    } else {
        console.log("User canceled starting a new session");
    }
}
                
        
// Global user data to retain between pages
let userData = {
    name: '',
    designation: '',
    experience: '',
    rtuSerial: '',
    contractNo: ''
};

// --- Utility Functions ---
function showCustomAlert(message) {
    const existingAlert = document.getElementById('customAlertBox');
    if (existingAlert) existingAlert.remove();
    const messageBox = document.createElement('div');
    messageBox.id = 'customAlertBox';
    messageBox.textContent = message;
    messageBox.style.cssText = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index:1001; text-align: center; white-space: pre-line;";
    document.body.appendChild(messageBox);
    setTimeout(() => messageBox.remove(), 3000);
}

// JavaScript specific to login.html
document.getElementById("logo").addEventListener("click", () => {
    // Clear any session data if you want a full reset on logo click
    localStorage.clear();
    window.location.href = 'index.html'; // Or just stay, or reload
});

function goToUserDetails() {
    // Navigate directly to the user details page since login is no longer required
    window.location.href = 'userdetail.html';
}

// Logo click returns to Login page
document.getElementById("logo").addEventListener("click", () => {
    // Clear all user data & reset pages to login
    userData = {
        name: '',
        designation: '',
        experience: '',
        rtuSerial: '',
        contractNo: ''
    };

    // Clear input fields on all pages
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.querySelectorAll("textarea").forEach(textarea => textarea.value = "");
    document.querySelectorAll("select").forEach(select => select.selectedIndex = 0);

    // Clear sheets container
    document.getElementById("sheetsContainer").innerHTML = "";

    showPage('loginPage');
});