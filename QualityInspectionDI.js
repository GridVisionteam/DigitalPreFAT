// File: QualityInspectionDI.js
// Initialize with empty data structures
if (!window.diTestResults) window.diTestResults = {};
if (!window.diModuleTypes) window.diModuleTypes = {};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the DI count from local storage
    window.diModulesToTest = parseInt(localStorage.getItem('diModulesToTest')) || 0;
    
    // Display the DI count
    const diCountDisplay = document.getElementById('diNoInput');
    if (diCountDisplay) {
        diCountDisplay.textContent = window.diModulesToTest;
    }

    // Load saved module types if available
    const savedTypes = localStorage.getItem('diModuleTypes');
    if (savedTypes) {
        window.diModuleTypes = JSON.parse(savedTypes);
    } else {
        window.diModuleTypes = {};
        // Initialize with default types if none saved
        for (let i = 1; i <= window.diModulesToTest; i++) {
            window.diModuleTypes[i] = 'DI-32'; // Default type
        }
    }

    // Load saved test results if available
    const savedResults = localStorage.getItem('diTestResults');
    if (savedResults) {
        window.diTestResults = JSON.parse(savedResults);
    }

    // Generate quality inspection sections based on DI count
    generateQualityInspectionSections(window.diModulesToTest);

    // Load any saved quality inspection data
    loadQualityInspectionData();
});

// Function to generate quality inspection sections for each DI module
function generateQualityInspectionSections(count) {
    const sectionsContainer = document.getElementById('qualityInspectionSections');
    if (!sectionsContainer) return;

    sectionsContainer.innerHTML = ''; // Clear existing sections

    if (count === 0) {
        const noModulesMsg = document.createElement('div');
        noModulesMsg.style.textAlign = 'center';
        noModulesMsg.style.padding = '20px';
        noModulesMsg.style.color = '#666';
        noModulesMsg.innerHTML = '<p>No DI modules configured</p>';
        sectionsContainer.appendChild(noModulesMsg);
        return;
    }

    // Quality inspection items for DI modules
    const qualityItems = [
        "The module is free from defect e.g. scratches, deformities, corrosion, broken.",
        "The jumper is set as per approved drawing."
    ];

    // Generate sections for each DI module
    for (let i = 1; i <= count; i++) {
        const moduleSection = document.createElement('div');
        moduleSection.className = 'module-section';
        moduleSection.id = `di-module-${i}`;
        
        const moduleType = window.diModuleTypes[i] || 'DI-32';
        
        // Module header
        const moduleHeader = document.createElement('div');
        moduleHeader.className = 'module-header';
        moduleHeader.innerHTML = `
            <label class="module-number">DI module: ${i}</label>
            <label class="module-type">DI Type: ${moduleType}</label>
        `;
        
        // Quality inspection table
        const tableContainer = document.createElement('div');
        tableContainer.className = 'quality-inspection';
        
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th style="text-align: center;">No.</th>
                    <th style="text-align: center;">Quality Inspection</th>
                    <th style="text-align: center;">OK</th>
                    <th style="text-align: center;">NO</th>
                </tr>
            </thead>
            <tbody id="qualityTableBody_${i}">
                <!-- Rows will be generated here -->
            </tbody>
        `;
        
        // Generate table rows for this module
        const tableBody = table.querySelector(`#qualityTableBody_${i}`);
        qualityItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="text-align: center;">${index + 1}</td>
                <td style="text-align: left;">${item}</td>
                <td style="text-align: center;">
                    <label class="toggle-button">
                        <input type="radio" name="quality_${i}_${index + 1}" value="OK">
                        <span class="toggle-text"></span>
                    </label>
                </td>
                <td style="text-align: center;">
                    <label class="toggle-button">
                        <input type="radio" name="quality_${i}_${index + 1}" value="NO">
                        <span class="toggle-text"></span>
                    </label>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        tableContainer.appendChild(table);
        
        // Assemble the section
        moduleSection.appendChild(moduleHeader);
        moduleSection.appendChild(tableContainer);
        sectionsContainer.appendChild(moduleSection);
    }
}

// Save quality inspection data
function saveQualityInspectionData() {
    const diCount = window.diModulesToTest || 0;
    
    // Ensure the test results object has the proper structure
    window.diTestResults = window.diTestResults || {};
    
    // Save quality inspection results for each module
    for (let i = 1; i <= diCount; i++) {
        if (!window.diTestResults[i]) {
            window.diTestResults[i] = {
                qualityInspections: {},
                type: window.diModuleTypes[i] || 'DI-32'
            };
        } else {
            window.diTestResults[i].qualityInspections = window.diTestResults[i].qualityInspections || {};
        }
        
        // Two quality inspection items per module
        for (let j = 1; j <= 2; j++) {
            const radioName = `quality_${i}_${j}`;
            const qualityOK = document.querySelector(`input[name="${radioName}"][value="OK"]:checked`) !== null;
            window.diTestResults[i].qualityInspections[`quality${j}`] = qualityOK ? 'OK' : 'NO';
        }
    }

    // Save to local storage
    localStorage.setItem('diTestResults', JSON.stringify(window.diTestResults));
    console.log('Quality inspection data saved:', window.diTestResults);
}

// Load quality inspection data
function loadQualityInspectionData() {
    const diCount = window.diModulesToTest || 0;

    // Load quality inspection results
    for (let i = 1; i <= diCount; i++) {
        const moduleData = window.diTestResults[i];
        if (moduleData && moduleData.qualityInspections) {
            for (let j = 1; j <= 2; j++) {
                const qualityResult = moduleData.qualityInspections[`quality${j}`];
                if (qualityResult) {
                    const radioName = `quality_${i}_${j}`;
                    const radioToCheck = document.querySelector(`input[name="${radioName}"][value="${qualityResult}"]`);
                    if (radioToCheck) {
                        radioToCheck.checked = true;
                        console.log(`Loaded quality inspection for module ${i}, item ${j}: ${qualityResult}`);
                    }
                }
            }
        }
    }
}

// Select All button functionality for quality inspection
function selectAllQuality() {
    const qualityRadioButtons = document.querySelectorAll('#QualityInspectionDI input[type="radio"][value="OK"]');
    qualityRadioButtons.forEach(radio => {
        radio.checked = true;
    });
    console.log('All quality inspections marked as OK');
}

// Clear All button functionality for quality inspection
function clearAllQuality() {
    const qualityRadioButtons = document.querySelectorAll('#QualityInspectionDI input[type="radio"][value="NO"]');
    qualityRadioButtons.forEach(radio => {
        radio.checked = true;
    });
    console.log('All quality inspections cleared');
}

// Navigation function to go to previous page
function goToPreviousPage() {
    saveQualityInspectionData();
    window.location.href = 'QualityInspectionCOM6.html';
}

// Save and navigate to functionality test page
function saveAndGoToFunctionality() {
    // First validate the quality inspection
    if (!validateQualityInspection()) {
        alert('Please complete all quality inspections before continuing. All inspections must be marked OK.');
        return;
    }
    
    // Save the quality inspection data
    saveQualityInspectionData();
    
    // Set current module to 1 for starting functionality test
    window.currentDIModule = 1;
    localStorage.setItem('currentDIModule', 1);
    navigationGuard.markPageAsCompleted();
    
    // Navigate to functionality test page
    window.location.href = 'QualityInspectionDO.html';
}

// Validation function for quality inspection
function validateQualityInspection() {
    let isValid = true;
    const diCount = window.diModulesToTest || 0;
    
    console.log(`Validating ${diCount} DI modules...`);
    
    // Reset all error styles first
    for (let i = 1; i <= diCount; i++) {
        for (let j = 1; j <= 2; j++) {
            const radioName = `quality_${i}_${j}`;
            const qualityOK = document.querySelector(`input[name="${radioName}"][value="OK"]`);
            const qualityNO = document.querySelector(`input[name="${radioName}"][value="NO"]`);
            
            if (qualityOK && qualityNO) {
                // Remove previous error styles
                qualityOK.parentElement.style.border = '';
                qualityNO.parentElement.style.border = '';
                
                // Check if NO is selected
                if (qualityNO.checked) {
                    qualityNO.parentElement.style.border = '2px solid red';
                    qualityOK.parentElement.style.border = '2px solid red';
                    isValid = false;
                    console.log(`Validation failed: Module ${i}, item ${j} marked as NO`);
                }
            }
        }
    }
    
    if (isValid) {
        console.log('All quality inspections are OK');
    } else {
        console.log('Quality inspection validation failed');
    }
    
    return isValid;
}