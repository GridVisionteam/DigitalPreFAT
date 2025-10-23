// Initialize with empty data structures
if (!window.preRequisiteTestResults) window.preRequisiteTestResults = {
    approvedDrawings: [],
    panelIPCertificate: [],
    testEquipmentRecord: [],
    measuringEquipmentRecord: [],
    softwareRecord: [],

};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('preRequisiteTestResults');
    if (savedResults) {
        window.preRequisiteTestResults = JSON.parse(savedResults);
    }

    // Generate rows for each table
    generateApprovedDrawingsRows();
    generatePanelIPCertificateRows();
    generateTestEquipmentRecordRows();
    generateMeasuringEquipmentRecordRows();
    generateSoftwareRecordRows();

    // Load any saved data
    loadPreRequisiteTestData();
});

// Function to generate Approved Drawings rows
function generateApprovedDrawingsRows() {
    const tbody = document.getElementById('ApprovedDrawingsTbody');
    if (!tbody) return;

    // Approved Drawings items (sample data - adjust as needed)
    const approvedDrawingsItems = [
        { title: "Telecontrol Overview Drawing", number: "GV TNBD 0614 B02 TOD", revision: "", date: "", ok: false },
        { title: "RTU Configuration Drawing", number: "GV TNBD 0614 B01 RCF", revision: "", date: "", ok: false },
        { title: "RTU Cubicle Internal Wiring Drawing", number: "GV TNBD 0614 V01 RIW", revision: "", date: "", ok: false },
        { title: "RTU Cubicle Drawing", number: "GV TNBD 0614 U01 CDW", revision: "", date: "", ok: false },
        { title: "RTU Parameter List", number: "GV TNBD 0614 T01 PM", revision: "", date: "", ok: false },
        { title: "RTU Cable Drawing", number: "GV TNBD 0614 T11 RCS", revision: "", date: "", ok: false }
    ];

    tbody.innerHTML = ''; // Clear existing rows

    approvedDrawingsItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const savedData = window.preRequisiteTestResults.approvedDrawings[index] || {};
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${item.title}</td>
            <td style="text-align: center;">${item.number}</td>
            <td style="text-align: center;">
                <input type="number" name="approvedDrawing_revision_${rowNumber}" value="${savedData.revision || item.revision}" />
            </td>
            <td style="text-align: center;">
                <input type="date" name="approvedDrawing_date_${rowNumber}" value="${savedData.date || item.date}" />
            </td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="approvedDrawing_ok_${rowNumber}" ${(savedData.ok !== undefined ? savedData.ok : item.ok) ? 'checked' : ''}>
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate Panel IP Certificate rows
function generatePanelIPCertificateRows() {
    const tbody = document.getElementById('PanelIPCertificateTbody');
    if (!tbody) return;

    // Panel IP Certificate items (sample data - adjust as needed)
    const panelIPCertificateItems = [
        { panelType: "Floor Standing – Indoor", ipRating: "IP51", certNumber: "2017EEA0204", applicable: false },
        { panelType: "Floor Standing – Outdoor", ipRating: "IP54", certNumber: "2021EA1541", applicable: false },
        { panelType: "Wall Mounted – Indoor", ipRating: "IP51", certNumber: "2015EEA0091", applicable: false },
        { panelType: "Wall Mounted – Outdoor", ipRating: "IP54", certNumber: "2021EA1540", applicable: false }
    ];

    tbody.innerHTML = ''; // Clear existing rows

    panelIPCertificateItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const savedData = window.preRequisiteTestResults.panelIPCertificate[index] || {};
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: center;">${item.panelType}</td>
            <td style="text-align: center;">${item.ipRating}</td>
            <td style="text-align: center;">${item.certNumber}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="panelIPCertificate_applicable_${rowNumber}" ${(savedData.applicable !== undefined ? savedData.applicable : item.applicable) ? 'checked' : ''}>
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate Test Equipment Record rows
function generateTestEquipmentRecordRows() {
    const tbody = document.getElementById('TestEquipmentRecordTbody');
    if (!tbody) return;

    // Test Equipment Record items (sample data - adjust as needed)
    const testEquipmentItems = [
        { item: "Laptop", brand: "", model: "", serialNumber: "" },
        { item: "", brand: "", model: "", serialNumber: "" },
        { item: "", brand: "", model: "", serialNumber: "" }
    ];

    tbody.innerHTML = ''; // Clear existing rows

    testEquipmentItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const savedData = window.preRequisiteTestResults.testEquipmentRecord[index] || {};
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: center;">
                <input type="text" name="testEquipment_item_${rowNumber}" value="${savedData.item || item.item}" />
            </td>
            <td style="text-align: center;">
                <input type="text" name="testEquipment_brand_${rowNumber}" value="${savedData.brand || item.brand}" />
            </td>
            <td style="text-align: center;">
                <input type="text" name="testEquipment_model_${rowNumber}" value="${savedData.model || item.model}" />
            </td>
            <td style="text-align: center;">
                <input type="text" name="testEquipment_serialNumber_${rowNumber}" value="${savedData.serialNumber || item.serialNumber}" />
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate Measuring Equipment Record rows
function generateMeasuringEquipmentRecordRows() {
    const tbody = document.getElementById('MeasuringEquipmentRecordTbody');
    if (!tbody) return;

    // Measuring Equipment Record items (sample data - adjust as needed)
    const measuringEquipmentItems = [
        { 
            item: "Process Meter", 
            brand: "Fluke", 
            model: "787", 
            serialNumber: "",
            calDate: "",
            calDueDate: ""
        },
        { 
            item: "Measuring Tape", 
            brand: "", 
            model: "", 
            serialNumber: "",
            calDate: "",
            calDueDate: ""
        },
        { 
            item: "Digimatic Caliper", 
            brand: "", 
            model: "", 
            serialNumber: "",
            calDate: "",
            calDueDate: ""
        },
        { 
            item: "", 
            brand: "", 
            model: "", 
            serialNumber: "",
            calDate: "",
            calDueDate: ""
        }
    ];

    tbody.innerHTML = ''; // Clear existing rows

    measuringEquipmentItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const savedData = window.preRequisiteTestResults.measuringEquipmentRecord[index] || {};
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: center;">
                <input type="text" name="measuringEquipment_item_${rowNumber}" value="${savedData.item || item.item}" />
            </td>
            <td style="text-align: center;">
                <input type="text" name="measuringEquipment_brand_${rowNumber}" value="${savedData.brand || item.brand}" />
            </td>
            <td style="text-align: center;">
                <input type="text" name="measuringEquipment_model_${rowNumber}" value="${savedData.model || item.model}" />
            </td>
            <td style="text-align: center;">
                <input type="text" name="measuringEquipment_serialNumber_${rowNumber}" value="${savedData.serialNumber || item.serialNumber}" />
            </td>
            <td style="text-align: center;">
                <input type="date" name="measuringEquipment_calDate_${rowNumber}" value="${savedData.calDate || item.calDate}" />
            </td>
            <td style="text-align: center;">
                <input type="date" name="measuringEquipment_calDueDate_${rowNumber}" value="${savedData.calDueDate || item.calDueDate}" />
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to generate Software Record rows
function generateSoftwareRecordRows() {
    const tbody = document.getElementById('SoftwareRecordTbody');
    if (!tbody) return;

    // Software Record items (sample data - adjust as needed)
    const softwareItems = [
        { 
            item: "Diagnostic/Configuration Tool", 
            brand: "Dong Fang", 
            softwareName: "DFE Engineering Tool Software", 
            version: "3.02.009",
            ok: false
        },
        { 
            item: "IEC101/IEC104/DNP3.0 Master Simulator", 
            brand: "ASE", 
            softwareName: "ASE2000 Version 1", 
            version: "1.56",
            ok: false
        }
    ];

    tbody.innerHTML = ''; // Clear existing rows

    softwareItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const savedData = window.preRequisiteTestResults.softwareRecord[index] || {};
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            <td style="text-align: center;">${item.item}</td>
            <td style="text-align: center;">${item.brand}</td>
            <td style="text-align: center;">${item.softwareName}</td>
            <td style="text-align: center;">${item.version}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="software_ok_${rowNumber}" ${(savedData.ok !== undefined ? savedData.ok : item.ok) ? 'checked' : ''}>
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save pre-requisite test data
function savePreRequisiteTestData() {
    // Initialize data structure if not exists
    window.preRequisiteTestResults = window.preRequisiteTestResults || {};
    window.preRequisiteTestResults.approvedDrawings = [];
    window.preRequisiteTestResults.panelIPCertificate = [];
    window.preRequisiteTestResults.testEquipmentRecord = [];
    window.preRequisiteTestResults.measuringEquipmentRecord = [];
    window.preRequisiteTestResults.softwareRecord = [];

    // Save Approved Drawings data
    for (let i = 1; i <= 6; i++) {
        window.preRequisiteTestResults.approvedDrawings.push({
            revision: document.querySelector(`input[name="approvedDrawing_revision_${i}"]`).value,
            date: document.querySelector(`input[name="approvedDrawing_date_${i}"]`).value,
            ok: document.querySelector(`input[name="approvedDrawing_ok_${i}"]`).checked
        });
    }

    // Save Panel IP Certificate data
    for (let i = 1; i <= 4; i++) {
        window.preRequisiteTestResults.panelIPCertificate.push({
            applicable: document.querySelector(`input[name="panelIPCertificate_applicable_${i}"]`).checked
        });
    }

    // Save Test Equipment Record data
    for (let i = 1; i <= 3; i++) {
        window.preRequisiteTestResults.testEquipmentRecord.push({
            item: document.querySelector(`input[name="testEquipment_item_${i}"]`).value,
            brand: document.querySelector(`input[name="testEquipment_brand_${i}"]`).value,
            model: document.querySelector(`input[name="testEquipment_model_${i}"]`).value,
            serialNumber: document.querySelector(`input[name="testEquipment_serialNumber_${i}"]`).value
        });
    }

    // Save Measuring Equipment Record data
    for (let i = 1; i <= 4; i++) {
        window.preRequisiteTestResults.measuringEquipmentRecord.push({
            item: document.querySelector(`input[name="measuringEquipment_item_${i}"]`).value,
            brand: document.querySelector(`input[name="measuringEquipment_brand_${i}"]`).value,
            model: document.querySelector(`input[name="measuringEquipment_model_${i}"]`).value,
            serialNumber: document.querySelector(`input[name="measuringEquipment_serialNumber_${i}"]`).value,
            calDate: document.querySelector(`input[name="measuringEquipment_calDate_${i}"]`).value,
            calDueDate: document.querySelector(`input[name="measuringEquipment_calDueDate_${i}"]`).value
        });
    }

    // Save Software Record data
    for (let i = 1; i <= 2; i++) {
        window.preRequisiteTestResults.softwareRecord.push({
            ok: document.querySelector(`input[name="software_ok_${i}"]`).checked
        });
    }


    // Save to session storage
    localStorage.setItem('preRequisiteTestResults', JSON.stringify(window.preRequisiteTestResults));
}

// Load pre-requisite test data
function loadPreRequisiteTestData() {
    // No need to load here as we're now loading during row generation
    // This ensures data is loaded before the rows are created
}

// Navigation functions
function goToPreviousPage() {
    window.location.href = 'BQ.html';
}

// Update the goToNext function to include validation
function goToNext() {
    // First validate the form
    if (!validateRequiredFields()) {
        alert('Please complete all required fields before continuing & Pre-FAT Result must be passed.');
        return; // Stop navigation if validation fails
    }
    
    // Save the data
    savePreRequisiteTestData();
    
    // Mark page as completed and navigate
    navigationGuard.markPageAsCompleted();
    window.location.href = 'ProductDeclaration.html';
}

// Utility functions
function SelectAll() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

function clearAll() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// this function to validate required fields
function validateRequiredFields() {
    let isValid = true;
    
    // Reset all error styles first
    document.querySelectorAll('input, select').forEach(element => {
        element.style.borderColor = '';
    });

    // Validate Approved Drawings - ALL checkboxes must be checked
    for (let i = 1; i <= 6; i++) {
        const okCheckbox = document.querySelector(`input[name="approvedDrawing_ok_${i}"]`);
        
        if (!okCheckbox.checked) {
            okCheckbox.parentElement.style.border = '1px solid red';
            isValid = false;
        } else {
            // If checkbox is checked, also validate the revision and date fields
            const revision = document.querySelector(`input[name="approvedDrawing_revision_${i}"]`);
            const date = document.querySelector(`input[name="approvedDrawing_date_${i}"]`);
            
            if (!revision.value) {
                revision.style.borderColor = 'red';
                isValid = false;
            }
            if (!date.value) {
                date.style.borderColor = 'red';
                isValid = false;
            }
        }
    }

    // Panel IP Certificate - no validation required as per requirements
    document.querySelector('.Panel-IP-Certificate').style.border = '';

    // Test Equipment Record - no validation required as per requirements
    document.querySelectorAll('input[name^="testEquipment_"]').forEach(el => {
        el.style.borderColor = '';
    });

    // Measuring Equipment Record - no validation required as per requirements
    document.querySelectorAll('input[name^="measuringEquipment_"]').forEach(el => {
        el.style.borderColor = '';
    });

    // Validate Software Record - both must be OK
    const softwareOk1 = document.querySelector('input[name="software_ok_1"]').checked;
    const softwareOk2 = document.querySelector('input[name="software_ok_2"]').checked;
    
    if (!softwareOk1 || !softwareOk2) {
        if (!softwareOk1) document.querySelector('input[name="software_ok_1"]').parentElement.style.border = '1px solid red';
        if (!softwareOk2) document.querySelector('input[name="software_ok_2"]').parentElement.style.border = '1px solid red';
        isValid = false;
    } else {
        document.querySelectorAll('input[name^="software_ok_"]').forEach(el => {
            el.parentElement.style.border = '';
        });
    }

    return isValid;
}