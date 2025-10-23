// Initialize with empty data structures
if (!window.panelTestResults) window.panelTestResults = {
    physicalInspections: {},
    qualityInspections: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Generate sections for panel information
    generatePanelSections();

    // Load saved test results if available
    const savedResults = localStorage.getItem('panelTestResults');
    if (savedResults) {
        window.panelTestResults = JSON.parse(savedResults);
    }

    // Load any saved data
    loadPanelTestData();
});

// Function to generate sections for panel information
function generatePanelSections() {
    const container = document.getElementById('PanelInformationSections');
    if (!container) return;

    container.innerHTML = ''; // Clear existing sections

    const section = document.createElement('div');
    section.className = 'panel-section';
    section.innerHTML = `
        <div class="physical-inspections">
            <label>Physical Inspections:</label>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">No.</th>
                        <th style="text-align: center;">Inspection</th>
                        <th style="text-align: center;">Measurement (mm)</th>
                        <th style="text-align: center;">Manufacturer Tolerance</th>
                        <th style="text-align: center;">OK</th>
                        <th style="text-align: center;">NO</th>
                    </tr>
                </thead>
                <tbody id="physicalTbody"></tbody>
            </table>
        </div>
        <div class="quality-inspections">
            <label>Quality Inspections</label>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">No.</th>
                        <th style="text-align: center;">Inspection</th>
                        <th style="text-align: center;">OK</th>
                        <th style="text-align: center;">NO</th>
                    </tr>
                </thead>
                <tbody id="qualityTbody"></tbody>
            </table>
        </div>
    `;
    container.appendChild(section);

    // Generate rows for panel information
    generatePhysicalInspectionRows();
    generateQualityInspectionRows();
}

// Function to generate quality inspection rows for panel
function generatePhysicalInspectionRows() {
    const tbody = document.getElementById('physicalTbody');
    if (!tbody) return;

    // Quality inspection items for panel
    const physicalItems = [
        "Panel Height",
        "Panel Width",
        "Panel Depth"
    ];

    physicalItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <input type="number" name="physical_${rowNumber}" />
            </td>
            <td style="text-align: center;">
                ±5%
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="physical_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="physical_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate functional test rows for panel
function generateQualityInspectionRows() {
    const tbody = document.getElementById('qualityTbody');
    if (!tbody) return;

    // Functional test items for panel
    const qualityItems = [
        "The panel is free from defect e.g. scratches, deformities, corrosion, broken.",
        "The wirings are neat, tidy, proper, and accessible.",
        "The wire marker and ferrules are available, proper, and correct.",
        "The wire marker has source and destination stated.",
        "The terminal block arrangement is proper and tidy.",
        "All LED indicators are correct as per approved drawing."
    ];

    qualityItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: left;">${item}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="quality_${rowNumber}" value="OK" checked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="radio" name="quality_${rowNumber}" value="NO">
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save panel test data
function savePanelTestData() {
    // Ensure the test results object has the proper structure
    window.panelTestResults = window.panelTestResults || {};
    window.panelTestResults.physicalInspections = window.panelTestResults.physicalInspections || {};
    window.panelTestResults.qualityTests = window.panelTestResults.qualityTests || {};
    window.panelTestResults.measurements = window.panelTestResults.measurements || {};

    // Save physical results (3 items) and measurements
    for (let itemNum = 1; itemNum <= 3; itemNum++) {
        const physicalOK = document.querySelector(`input[name="physical_${itemNum}"][value="OK"]:checked`) !== null;
        window.panelTestResults.physicalInspections[`panel_${itemNum}`] = physicalOK ? 'OK' : 'NO';
        
        // Save measurement value
        const measurementInput = document.querySelector(`input[name="physical_${itemNum}"][type="number"]`);
        if (measurementInput) {
            window.panelTestResults.measurements[`panel_${itemNum}`] = measurementInput.value;
        }
    }
    
    // Save quality test results (6 items)
    for (let itemNum = 1; itemNum <= 6; itemNum++) {
        const qualityOK = document.querySelector(`input[name="quality_${itemNum}"][value="OK"]:checked`) !== null;
        window.panelTestResults.qualityTests[`panel_${itemNum}`] = qualityOK ? 'OK' : 'NO';
    }

    // Save to session storage
    localStorage.setItem('panelTestResults', JSON.stringify(window.panelTestResults));
}

// Load panel test data
function loadPanelTestData() {
    // Ensure we have a valid panelTestResults object with the expected structure
    window.panelTestResults = window.panelTestResults || {};
    window.panelTestResults.physicalInspections = window.panelTestResults.physicalInspections || {};
    window.panelTestResults.qualityTests = window.panelTestResults.qualityTests || {};
    window.panelTestResults.measurements = window.panelTestResults.measurements || {};
    
    // Load physical inspection results (3 items) and measurements
    for (let itemNum = 1; itemNum <= 3; itemNum++) {
        const physicalResult = window.panelTestResults.physicalInspections[`panel_${itemNum}`];
        if (physicalResult) {
            const radioToCheck = document.querySelector(`input[name="physical_${itemNum}"][value="${physicalResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
        
        // Load measurement value
        const measurementValue = window.panelTestResults.measurements[`panel_${itemNum}`];
        if (measurementValue) {
            const measurementInput = document.querySelector(`input[name="physical_${itemNum}"][type="number"]`);
            if (measurementInput) {
                measurementInput.value = measurementValue;
            }
        }
    }
    
    // Load quality test results (6 items)
    for (let itemNum = 1; itemNum <= 6; itemNum++) {
        const qualityResult = window.panelTestResults.qualityTests[`panel_${itemNum}`];
        if (qualityResult) {
            const radioToCheck = document.querySelector(`input[name="quality_${itemNum}"][value="${qualityResult}"]`);
            if (radioToCheck) radioToCheck.checked = true;
        }
    }
}

// Navigation functions
function goToPreviousPage() {
    savePanelTestData();
    window.location.href = 'RTUPanelAcc.html';
}

function goToFunctionalityPowerSupply() {
    // First validate the form
    if (!validatePanelInformation()) {
        alert('Please complete all required fields before continuing. All measurements must be filled and all inspections must be marked OK.');
        return; // Stop navigation if validation fails
    }
    
    // Save the data
    savePanelTestData();
    
    navigationGuard.markPageAsCompleted();
    window.location.href = 'SubrackInspection.html';
}

// Button functions
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

function validatePanelInformation() {
    let isValid = true;
    
    // Reset all error styles first
    document.querySelectorAll('input').forEach(element => {
        element.style.borderColor = '';
    });
    
    // Validate Physical Inspections (3 items)
    for (let itemNum = 1; itemNum <= 3; itemNum++) {
        // Validate measurement value (required)
        const measurementInput = document.querySelector(`input[name="physical_${itemNum}"][type="number"]`);
        if (!measurementInput.value) {
            measurementInput.style.borderColor = 'red';
            isValid = false;
        }
        
        // Validate radio selection (must be OK)
        const radioOK = document.querySelector(`input[name="physical_${itemNum}"][value="OK"]`);
        const radioNO = document.querySelector(`input[name="physical_${itemNum}"][value="NO"]`);
        
        if (radioNO.checked) {
            radioNO.parentElement.style.border = '1px solid red';
            isValid = false;
        } else {
            radioOK.parentElement.style.border = '';
        }
    }
    
    // Validate Quality Inspections (6 items)
    for (let itemNum = 1; itemNum <= 6; itemNum++) {
        const radioOK = document.querySelector(`input[name="quality_${itemNum}"][value="OK"]`);
        const radioNO = document.querySelector(`input[name="quality_${itemNum}"][value="NO"]`);
        
        if (radioNO.checked) {
            radioNO.parentElement.style.border = '1px solid red';
            isValid = false;
        } else {
            radioOK.parentElement.style.border = '';
        }
    }
    
    return isValid;
}