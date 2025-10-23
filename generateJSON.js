function generateJsonFromLocalStorage() {
    const allData = {};
    
    // Copy all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            // Try to parse JSON data
            allData[key] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
            // If not JSON, store as text
            allData[key] = localStorage.getItem(key);
        }
    }
    
    // Transform currentModuleData to use individual module detail names
    if (allData.currentModuleData) {
        // Create a new structure with the renamed properties
        const transformedModuleData = {};
        
        if (allData.currentModuleData.Subrack) {
            transformedModuleData.subrackModulesDetails = allData.currentModuleData.Subrack;
        }
        if (allData.currentModuleData.Processor) {
            transformedModuleData.processorModulesDetails = allData.currentModuleData.Processor;
        }
        if (allData.currentModuleData.Power) {
            transformedModuleData.powerModulesDetails = allData.currentModuleData.Power;
        }
        if (allData.currentModuleData.COM) {
            transformedModuleData.comModulesDetails = allData.currentModuleData.COM;
        }
        if (allData.currentModuleData.DI) {
            transformedModuleData.diModulesDetails = allData.currentModuleData.DI;
        }
        if (allData.currentModuleData.DO) {
            transformedModuleData.doModulesDetails = allData.currentModuleData.DO;
        }
        if (allData.currentModuleData.AI) {
            transformedModuleData.aiModulesDetails = allData.currentModuleData.AI;
        }
        if (allData.currentModuleData.AO) {
            transformedModuleData.aoModulesDetails = allData.currentModuleData.AO;
        }
        
        // Replace the currentModuleData with the transformed version
        allData.currentModuleData = transformedModuleData;
    }
    
    // Add metadata
    allData.metadata = {
        generationDate: new Date().toISOString(),
        rtuSerial: localStorage.getItem('session_rtuSerial') || 'N/A',
        contractNo: localStorage.getItem('session_contractNo') || 'N/A',
        testerName: localStorage.getItem('session_name') || 'N/A'
    };
    
    return JSON.stringify(allData, null, 2);
}

/**
 * Triggers download of JSON backup file
 */
function generateJsonFile() {
    try {
        const statusElement = document.getElementById('generationStatus');
        if (statusElement) {
            statusElement.textContent = "Generating JSON backup...";
        }
        
        const jsonContent = generateJsonFromLocalStorage();
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `RTU_Backup_${localStorage.getItem('session_rtuSerial') || 'UnknownRTU'}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (statusElement) {
                statusElement.textContent = "JSON backup generated successfully!";
            }
        }, 100);
        
    } catch (error) {
        console.error("JSON generation failed:", error);
        const statusElement = document.getElementById('generationStatus');
        if (statusElement) {
            statusElement.textContent = "JSON generation failed: " + error.message;
        }
    }
}

// Expose functions to global scope if needed
window.generateJsonFromLocalStorage = generateJsonFromLocalStorage;
window.generateJsonFile = generateJsonFile;