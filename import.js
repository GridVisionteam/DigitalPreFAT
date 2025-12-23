function importData() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // Handle file selection
    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                // Validate the JSON structure (basic check)
                if (!jsonData.metadata || !jsonData.metadata.rtuSerial) {
                    alert('Invalid JSON file format. Please select a valid Pre-FAT backup file.');
                    return;
                }
                
                // Clear existing data
                localStorage.clear();
                
                // Store all data from JSON into localStorage
                for (const key in jsonData) {
                    if (jsonData.hasOwnProperty(key)) {
                        let value = jsonData[key];
                        
                        // Handle string values that might have extra quotes
                        if (typeof value === 'string') {
                            // Remove extra quotes if they exist
                            if (value.startsWith('"') && value.endsWith('"')) {
                                value = value.slice(1, -1);
                            }
                            localStorage.setItem(key, value);
                        } else {
                            // For objects/arrays, stringify them
                            localStorage.setItem(key, JSON.stringify(value));
                        }
                    }
                }
                
                // RESET NAVIGATION MARKS - Clear all page completion status
                resetNavigationMarks();
                
                // Show success message
                alert('Data imported successfully!');
                
                // Redirect to userdetail.html
                window.location.href = 'rtudetail.html';
                
            } catch (error) {
                console.error('Error parsing JSON file:', error);
                alert('Error parsing JSON file. Please make sure the file is valid.');
            }
        };
        
        reader.onerror = () => {
            alert('Error reading file. Please try again.');
        };
        
        reader.readAsText(file);
    };
    
    // Trigger file selection dialog
    fileInput.click();
}

// Function to reset all navigation completion marks
function resetNavigationMarks() {
    const PAGE_SEQUENCE = [
        'BQ.html',
        'Pre-requisite.html',
        'ProductDeclaration.html',
        'TestSetup.html',
        'ElectronicAcc.html',
        'RTUPanelAcc.html',
        'PanelInformation.html',
        'SubrackInspection.html',
        'FunctionalityPowerSupply.html',
        'FunctionalityProcessor.html',
        'FunctionalityCOM6.html',
        'FunctionalityDIPage.html',
        'FunctionalityDOPage.html',
        'Dummy&CESFunctionalTest.html',
        'FunctionalityAIPage.html',
        'RTUPowerUp.html',
        'ParameterSettingProc.html',
        'ParameterSettingDI.html',
        'ParameterSettingDO.html',
        'ParameterSettingAI.html',
        'ParameterSettingIEC101.html',
        'ParameterSettingIEC104.html',
        'VirtualAlarmTest.html',
        'ChannelRedundacyTest.html',
        'LimitofAuthority.html',
        'userdetail.html',
        'signature.html'
    ];
    
    // Clear all completion marks
    PAGE_SEQUENCE.forEach(page => {
        localStorage.removeItem(`${page}_completed`);
    });
    
    console.log('Navigation marks reset successfully');
}

// Add event listener to the Import button
document.addEventListener('DOMContentLoaded', () => {
    const importButton = document.getElementById('importButton');
    if (importButton) {
        importButton.addEventListener('click', importData);
    }
});