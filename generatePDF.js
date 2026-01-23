// generateJSON.js - This file handles JSON generation only

// Main function to generate JSON from localStorage
function generateJsonFromLocalStorage() {
    console.log("Generating JSON from localStorage...");
    
    // Collect all data from localStorage
    const allData = {};
    
    // Session data
    const sessionKeys = [
        'session_name', 'session_experience', 'session_rtuSerial',
        'session_contractNo', 'session_projectName', 'session_subrackCount',
        'session_processorCount', 'session_comCount', 'session_diModulesToTest',
        'session_doModulesToTest', 'session_aiModulesToTest', 'session_powerCount'
    ];
    
    sessionKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            allData[key] = localStorage.getItem(key);
        }
    });
    
    // Module details
    const moduleKeys = [
        'subrackModulesDetails', 'processorModulesDetails', 'comModulesDetails',
        'diModulesDetails', 'doModulesDetails', 'aiModulesDetails', 
        'powerModulesDetails'
    ];
    
    moduleKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                allData[key] = JSON.parse(value);
            } catch (e) {
                allData[key] = value; // Store as string if not valid JSON
            }
        }
    });
    
    // Test results
    const testResultKeys = [
        'preRequisiteTestResults', 'productDeclarationResults', 'testSetupResults',
        'electronicAccessoriesResults', 'rtuPanelAccessoriesResults',
        'panelTestResults', 'subrackTestResults', 'powerTestResults',
        'processorTestResults', 'com6TestResults', 'diTestResults',
        'doTestResults', 'dummyCesTestResults', 'aiTestResults',
        'rtuPowerUpTestResults', 'processorParamResults',
        'digitalInputParamResults', 'digitalOutputParamResults',
        'analogInputParamResults', 'iec101ParamResults', 'iec104ParamResults',
        'virtualAlarmTestResults', 'channelRedundancyResults',
        'limitOfAuthorityResults', 'signatureData'
    ];
    
    testResultKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                allData[key] = JSON.parse(value);
            } catch (e) {
                allData[key] = value;
            }
        }
    });
    
    // Add metadata
    allData.metadata = {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        dataSource: "RTU FAT Test System"
    };
    
    // Convert to pretty-printed JSON
    const jsonContent = JSON.stringify(allData, null, 2);
    
    return jsonContent;
}

// Function to trigger JSON download
function generateJsonFile() {
    try {
        const jsonContent = generateJsonFromLocalStorage();
        
        // Create filename
        const now = new Date();
        const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const contractNo = localStorage.getItem('session_contractNo') || 'ContractNo';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'SerialNo';
        const cleanContractNo = contractNo.replace(/"/g, '').trim();
        const cleanRtuSerial = rtuSerial.replace(/"/g, '').trim();
        const fileName = `${dateformat}_RTU_Backup_${cleanContractNo}_${cleanRtuSerial}.json`;
        
        // Create and download file
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        console.log("JSON file generated:", fileName);
        return true;
        
    } catch (error) {
        console.error("Failed to generate JSON file:", error);
        alert("Failed to generate JSON backup: " + error.message);
        return false;
    }
}

// Function to load user data (compatibility with existing code)
function loadUserData() {
    return {
        name: localStorage.getItem('session_name') || 'N/A',
        experience: localStorage.getItem('session_experience') || 'N/A',
        rtuSerial: localStorage.getItem('session_rtuSerial') || 'N/A',
        contractNo: localStorage.getItem('session_contractNo') || 'N/A',
        projectName: localStorage.getItem('session_projectName') || 'N/A'
    };
}

// Function to start new session
function startNewSession() {
    const userConfirmed = confirm("All of the data in previous session will be permanently deleted to start a new session. Are you sure?");
    if (userConfirmed) {
        try {
            sessionStorage.clear();
            localStorage.clear();
            console.log("All session data cleared");
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Failed to start new session:", error);
            alert("Failed to start new session. Please try again.");
        }
    }
}

// Export functions to global scope
window.generateJsonFromLocalStorage = generateJsonFromLocalStorage;
window.generateJsonFile = generateJsonFile;
window.loadUserData = loadUserData;
window.startNewSession = startNewSession;