// File: QualityInspectionDO.js
// Initialize with empty data structures
if (!window.doTestResults) window.doTestResults = {};
if (!window.doModuleTypes) window.doModuleTypes = {};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the DO count from local storage
    window.doModulesToTest = parseInt(localStorage.getItem('doModulesToTest')) || 0;
    
    // Display the DO count
    const doCountDisplay = document.getElementById('doNoInput');
    if (doCountDisplay) {
        doCountDisplay.textContent = window.doModulesToTest;
    }

    // Load saved module types if available
    const savedTypes = localStorage.getItem('doModuleTypes');
    if (savedTypes) {
        window.doModuleTypes = JSON.parse(savedTypes);
    } else {
        window.doModuleTypes = {};
        // Initialize with default types if none saved
        for (let i = 1; i <= window.doModulesToTest; i++) {
            window.doModuleTypes[i] = 'CO-16-A'; // Default type
        }
    }

    // Load saved test results if available
    const savedResults = localStorage.getItem('doTestResults');
    if (savedResults) {
        window.doTestResults = JSON.parse(savedResults);
    }

    // Generate quality inspection sections based on DO count
    generateQualityInspectionSections(window.doModulesToTest);

    // Load any saved quality inspection data
    loadQualityInspectionData();
});

// Function to generate quality inspection sections for each DO module
function generateQualityInspectionSections(count) {
    const sectionsContainer = document.getElementById('qualityInspectionSections');
    if (!sectionsContainer) return;

    sectionsContainer.innerHTML = ''; // Clear existing sections

    if (count === 0) {
        const noModulesMsg = document.createElement('div');
        noModulesMsg.style.textAlign = 'center';
        noModulesMsg.style.padding = '20px';
        noModulesMsg.style.color = '#666';
        noModulesMsg.innerHTML = '<p>No DO modules configured</p>';
        sectionsContainer.appendChild(noModulesMsg);
        return;
    }

    // Quality inspection items for DO modules
    const qualityItems = [
        "The module is free from defect e.g. scratches, deformities, corrosion, broken.",
        "The jumper is set as per approved drawing."
    ];

    // Generate sections for each DO module
    for (let i = 1; i <= count; i++) {
        const moduleSection = document.createElement('div');
        moduleSection.className = 'module-section';
        moduleSection.id = `do-module-${i}`;
        
        const moduleType = window.doModuleTypes[i] || 'CO-16-A';
        
        // Module header
        const moduleHeader = document.createElement('div');
        moduleHeader.className = 'module-header';
        moduleHeader.innerHTML = `
            <label class="module-number">DO module: ${i}</label>
            <label class="module-type">DO Type: ${moduleType}</label>
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
    const doCount = window.doModulesToTest || 0;
    
    // Ensure the test results object has the proper structure
    window.doTestResults = window.doTestResults || {};
    
    // Save quality inspection results for each module
    for (let i = 1; i <= doCount; i++) {
        if (!window.doTestResults[i]) {
            window.doTestResults[i] = {
                qualityInspections: {},
                type: window.doModuleTypes[i] || 'CO-16-A'
            };
        } else {
            window.doTestResults[i].qualityInspections = window.doTestResults[i].qualityInspections || {};
        }
        
        // Two quality inspection items per module
        for (let j = 1; j <= 2; j++) {
            const radioName = `quality_${i}_${j}`;
            const qualityOK = document.querySelector(`input[name="${radioName}"][value="OK"]:checked`) !== null;
            window.doTestResults[i].qualityInspections[`quality${j}`] = qualityOK ? 'OK' : 'NO';
        }
    }

    // Save to local storage
    localStorage.setItem('doTestResults', JSON.stringify(window.doTestResults));
    console.log('Quality inspection data saved:', window.doTestResults);
}

// Load quality inspection data
function loadQualityInspectionData() {
    const doCount = window.doModulesToTest || 0;

    // Load quality inspection results
    for (let i = 1; i <= doCount; i++) {
        const moduleData = window.doTestResults[i];
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
    const qualityRadioButtons = document.querySelectorAll('#QualityInspectionDO input[type="radio"][value="OK"]');
    qualityRadioButtons.forEach(radio => {
        radio.checked = true;
    });
    console.log('All quality inspections marked as OK');
}

// Clear All button functionality for quality inspection
function clearAllQuality() {
    const qualityRadioButtons = document.querySelectorAll('#QualityInspectionDO input[type="radio"][value="NO"]');
    qualityRadioButtons.forEach(radio => {
        radio.checked = true;
    });
    console.log('All quality inspections cleared');
}

// Navigation function to go to previous page
function goToPreviousPage() {
    saveQualityInspectionData();
    
    // Set flag to indicate we're returning to DI page
    localStorage.setItem('returningToDI', 'true');
    
    window.location.href = 'QualityInspectionDI.html';
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
    window.currentDOModule = 1;
    localStorage.setItem('currentDOModule', 1);
    navigationGuard.markPageAsCompleted();
    
    // Navigate to functionality test page
    window.location.href = 'QualityInspectionAI.html';
}

// Validation function for quality inspection
function validateQualityInspection() {
    let isValid = true;
    const doCount = window.doModulesToTest || 0;
    
    console.log(`Validating ${doCount} DO modules...`);
    
    // Reset all error styles first
    for (let i = 1; i <= doCount; i++) {
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