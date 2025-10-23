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
                        // Remove extra quotes from string values if present
                        if (typeof jsonData[key] === 'string' && jsonData[key].startsWith('"') && jsonData[key].endsWith('"')) {
                            jsonData[key] = jsonData[key].slice(1, -1);
                        }
                        localStorage.setItem(key, JSON.stringify(jsonData[key]));
                    }
                }
                
                // Show success message
                alert('Data imported successfully!');
                
                // Redirect to userdetail.html
                window.location.href = 'userdetail.html';
                
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

// Add event listener to the Import button
document.addEventListener('DOMContentLoaded', () => {
    const importButton = document.getElementById('importButton');
    if (importButton) {
        importButton.addEventListener('click', importData);
    }
});