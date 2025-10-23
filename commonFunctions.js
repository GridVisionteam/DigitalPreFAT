// commonFunctions.js
// Shared functions used across multiple pages

// Time tracking object
const formTiming = {
    loginTime: null,
    generationStartTime: null,
    pdfGeneratedTime: null,
    getFormFillingTime: function() {
        if (!this.loginTime || !this.generationStartTime) return null;
        return (this.generationStartTime - this.loginTime) / 1000; // in seconds
    }
};

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

function loadUserData() {
    const sessionUsername = localStorage.getItem('session_username');
    const sessionRtuSerial = localStorage.getItem('session_rtuSerial');
    const sessionName = localStorage.getItem('session_name');
    const sessionDesignation = localStorage.getItem('session_designation');
    const sessionExperience = localStorage.getItem('session_experience');
    const sessionContractNo = localStorage.getItem('session_contractNo');
    const sessionAiModulesToTest = localStorage.getItem('aiModulesToTest');
    const sessionCurrentAIModule = localStorage.getItem('currentAIModule');
    const sessionAiModulesDetails = localStorage.getItem('aiModulesDetails');
    const sessionProcessorCount = localStorage.getItem('processorCount');


    const userData = {
        username: sessionUsername,
        rtuSerial: sessionRtuSerial,
        name: sessionName || 'N/A',
        designation: sessionDesignation || 'N/A',
        experience: sessionExperience || '0',
        contractNo: sessionContractNo || 'N/A',
        aiModulesToTest: parseInt(sessionAiModulesToTest) || 0,
        currentAIModule: parseInt(sessionCurrentAIModule) || 1,
        aiModulesDetails: JSON.parse(sessionAiModulesDetails || "[]"),
        processorCount: parseInt(sessionProcessorCount) || 0,
        processorTestResults: JSON.parse(localStorage.getItem('processorTestResults') || "{}"),

        // Also include DI and DO details if needed for the PDF
        diModulesToTest: parseInt(localStorage.getItem('diModulesToTest')) || 0,
        doModulesToTest: parseInt(localStorage.getItem('doModulesToTest')) || 0,
        diModulesDetails: JSON.parse(localStorage.getItem('diModulesDetails') || "[]"),
        doModulesDetails: JSON.parse(localStorage.getItem('doModulesDetails') || "[]")
    };
    
    return userData;
}
