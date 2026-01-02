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
        try {
            window.preRequisiteTestResults = JSON.parse(savedResults);
        } catch (e) {
            console.error('Error parsing saved data:', e);
        }
    }

    // Generate rows for each table
    generateApprovedDrawingsRows();
    generatePanelIPCertificateRows();
    generateTestEquipmentRecordRows();
    
    // Only generate measuring equipment rows if the section exists
    if (document.getElementById('MeasuringEquipmentRecordTbody')) {
        generateMeasuringEquipmentRecordRows();
    }
    
    generateSoftwareRecordRows();

    // Load any saved data
    loadPreRequisiteTestData();

    // Attach event listeners to navigation buttons
    attachNavigationEvents();
});

// Function to attach navigation event listeners
function attachNavigationEvents() {
    // Attach to Previous button
    const prevBtn = document.querySelector('button[onclick*="previous"], button[onclick*="Previous"], #prevBtn, .prev-btn');
    if (prevBtn) {
        // Remove existing onclick and add proper event listener
        prevBtn.onclick = null;
        prevBtn.addEventListener('click', goToPreviousPage);
    } else {
        // If no specific button found, check for any button that might navigate
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.toLowerCase().includes('previous') || 
                btn.textContent.toLowerCase().includes('back')) {
                btn.onclick = null;
                btn.addEventListener('click', goToPreviousPage);
            }
        });
    }

    // Attach to Next button
    const nextBtn = document.querySelector('button[onclick*="next"], button[onclick*="Next"], #nextBtn, .next-btn');
    if (nextBtn) {
        // Remove existing onclick and add proper event listener
        nextBtn.onclick = null;
        nextBtn.addEventListener('click', goToNext);
    } else {
        // If no specific button found, check for any button that might navigate
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.toLowerCase().includes('next') || 
                btn.textContent.toLowerCase().includes('continue')) {
                btn.onclick = null;
                btn.addEventListener('click', goToNext);
            }
        });
    }

    // Also attach to any existing onclick handlers that might call these functions
    document.body.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
            const onclickAttr = e.target.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('goToPreviousPage')) {
                e.preventDefault();
                e.target.onclick = null;
                goToPreviousPage();
            } else if (onclickAttr && onclickAttr.includes('goToNext')) {
                e.preventDefault();
                e.target.onclick = null;
                goToNext();
            }
        }
    });
}

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
        // Get saved data if it exists
        const savedData = window.preRequisiteTestResults.approvedDrawings && 
                         window.preRequisiteTestResults.approvedDrawings[index] ? 
                         window.preRequisiteTestResults.approvedDrawings[index] : {};
        
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
        const savedData = window.preRequisiteTestResults.panelIPCertificate && 
                         window.preRequisiteTestResults.panelIPCertificate[index] ? 
                         window.preRequisiteTestResults.panelIPCertificate[index] : {};
        
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
        const savedData = window.preRequisiteTestResults.testEquipmentRecord && 
                         window.preRequisiteTestResults.testEquipmentRecord[index] ? 
                         window.preRequisiteTestResults.testEquipmentRecord[index] : {};
        
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

    // Measuring Equipment Record items
    const measuringEquipmentItems = [
        { 
            item: "", // Now dropdown with "Process Meter" and "Multimeter"
            brand: "", // Will be set based on item selection
            model: [], // Will be populated based on item selection
            serialNumber: [], // Will be populated based on item and model selection
            calDate: "",
            calDueDate: ""
        },
        { 
            item: "Measuring Tape", 
            brand: "Marksman", // Default to Marksman as shown in image
            model: "NA", // Default to NA as shown in image
            serialNumber: "SA2016-ID-863", // Default serial number as shown in image
            calDate: "",
            calDueDate: ""
        },
        { 
            item: "Digimatic Caliper", 
            brand: "", // Will be dropdown with "Senator" and "NA"
            model: "", // Will be set based on brand selection
            serialNumber: "", // Will be set based on brand selection
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

    // Define serial numbers for different options
    const serialNumbers = {
        "Process Meter": {
            "787B": ["41480049","47240060","47240061","41480048","54930039","54930037","54930036","62160024","45680061","57980103","64170019","68640065","68640067","64170017"],
            "787": ["33500067","35120007"]
        },
        "Multimeter": {
            "Fluke - 101": ["54641492WS", "59751333WS", "42271566WS", "42271567WS", "59751337WS", "59751334WS", "42271204WS", "42271718WS"]
        }
    };

    // Define Measuring Tape options
    const measuringTapeOptions = {
        brands: ["Marksman", "Senator"],
        models: {
            "Marksman": ["NA"],
            "Senator": ["536-148"]
        },
        serialNumbers: {
            "Marksman": ["SA2016-ID-863"],
            "Senator": ["NA"]
        }
    };

    // Define Digimatic Caliper options
    const digimaticCaliperOptions = {
        brands: ["Senator", "NA"],
        models: {
            "Senator": ["SEN-331-1212K"],
            "NA": ["NA"]
        },
        serialNumbers: {
            "Senator": ["C2303091297"],
            "NA": ["SA2016-ID-862"]
        }
    };

    tbody.innerHTML = ''; // Clear existing rows

    measuringEquipmentItems.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        
        // Load saved data if available
        const savedData = window.preRequisiteTestResults.measuringEquipmentRecord && 
                         window.preRequisiteTestResults.measuringEquipmentRecord[index] ? 
                         window.preRequisiteTestResults.measuringEquipmentRecord[index] : {};

        // --- Item Column ---
        let itemHtml = '';
        if (rowNumber === 1) {
            // Row 1 - Dropdown for Process Meter/Multimeter
            const itemOptions = ["Process Meter", "Multimeter"];
            const selectedItem = savedData.item || "";
            
            itemHtml = `
                <td>
                    <select name="measuring_${rowNumber}_item" class="item-select" data-row="${rowNumber}" style="width: 100%;">
                        <option value="" ${!selectedItem ? 'selected' : ''} disabled>-- Select Item --</option>
                        ${itemOptions.map(option => 
                            `<option value="${option}" ${selectedItem === option ? 'selected' : ''}>${option}</option>`
                        ).join('')}
                    </select>
                </td>
            `;
        } else if (rowNumber === 2) {
            // Fixed "Measuring Tape" for row 2 - readonly input with grey font
            itemHtml = `
                <td>
                    <input type="text" name="measuring_${rowNumber}_item" 
                           value="Measuring Tape" 
                           readonly 
                           style="width: 100%; color: #666; background-color: #f5f5f5; border: 1px solid #ddd;">
                </td>
            `;
        } else if (rowNumber === 3) {
            // Fixed "Digimatic Caliper" for row 3 - readonly input with grey font
            itemHtml = `
                <td>
                    <input type="text" name="measuring_${rowNumber}_item" 
                           value="Digimatic Caliper" 
                           readonly 
                           style="width: 100%; color: #666; background-color: #f5f5f5; border: 1px solid #ddd;">
                </td>
            `;
        } else {
            // Editable for other rows
            itemHtml = `
                <td>
                    <input type="text" name="measuring_${rowNumber}_item" 
                           value="${savedData.item || item.item}" 
                           style="width: 100%;">
                </td>
            `;
        }

        // --- Brand Column ---
        let brandHtml = '';
        if (rowNumber === 1) {
            // For row 1, brand will be determined by item
            const selectedItem = savedData.item || "";
            let brandValue = "";
            
            // Determine brand based on item
            if (selectedItem === "Process Meter" || selectedItem === "Multimeter") {
                brandValue = "Fluke"; // Both Process Meter and Multimeter are Fluke
            }
            
            // If we have a brand from saved data, use it
            if (savedData.brand) {
                brandValue = savedData.brand;
            }
            
            brandHtml = `
                <td>
                    <input type="text" name="measuring_${rowNumber}_brand" 
                           value="${brandValue}" 
                           readonly 
                           style="width: 100%; color: #666; background-color: #f5f5f5; border: 1px solid #ddd;">
                </td>
            `;
        } else if (rowNumber === 2) {
            // Row 2 (Measuring Tape) - Dropdown for brand selection
            const selectedBrand = savedData.brand || item.brand;
            
            brandHtml = `
                <td>
                    <select name="measuring_${rowNumber}_brand" class="measuring-tape-brand-select" data-row="${rowNumber}" style="width: 100%;">
                        ${measuringTapeOptions.brands.map(brand => 
                            `<option value="${brand}" ${selectedBrand === brand ? 'selected' : ''}>${brand}</option>`
                        ).join('')}
                    </select>
                </td>
            `;
        } else if (rowNumber === 3) {
            // Row 3 (Digimatic Caliper) - Dropdown for brand selection
            const selectedBrand = savedData.brand || item.brand;
            
            brandHtml = `
                <td>
                    <select name="measuring_${rowNumber}_brand" class="digimatic-caliper-brand-select" data-row="${rowNumber}" style="width: 100%;">
                        ${digimaticCaliperOptions.brands.map(brand => 
                            `<option value="${brand}" ${selectedBrand === brand ? 'selected' : ''}>${brand}</option>`
                        ).join('')}
                    </select>
                </td>
            `;
        } else {
            // Editable for other rows
            brandHtml = `
                <td>
                    <input type="text" name="measuring_${rowNumber}_brand" 
                           value="${savedData.brand || item.brand}" 
                           style="width: 100%;">
                </td>
            `;
        }

        // --- Model Column ---
        let modelHtml = '';
        if (rowNumber === 1) {
            const selectedItem = savedData.item || "";
            let modelOptions = [];
            
            // Determine model options based on selected item
            if (selectedItem === "Process Meter") {
                modelOptions = ["787B", "787"];
            } else if (selectedItem === "Multimeter") {
                modelOptions = ["Fluke - 101"];
            }
            
            const selectedModel = savedData.model || "";
            const hasSavedModel = selectedModel && modelOptions.includes(selectedModel);
            
            if (modelOptions.length > 0) {
                const options = modelOptions.map(model => 
                    `<option value="${model}" ${selectedModel === model ? 'selected' : ''}>${model}</option>`
                ).join('');
                
                modelHtml = `
                    <td>
                        <select name="measuring_${rowNumber}_model" class="model-select" data-row="${rowNumber}" style="width: 100%;">
                            <option value="" ${!hasSavedModel ? 'selected' : ''} disabled>-- Select Model --</option>
                            ${options}
                        </select>
                    </td>
                `;
            } else {
                // If no item selected yet, show disabled dropdown
                modelHtml = `
                    <td>
                        <select name="measuring_${rowNumber}_model" class="model-select" data-row="${rowNumber}" disabled style="width: 100%;">
                            <option value="" selected disabled>-- Select Item First --</option>
                        </select>
                    </td>
                `;
            }
        } else if (rowNumber === 2) {
            // Row 2 (Measuring Tape) - Model based on brand selection
            const selectedBrand = savedData.brand || item.brand;
            const selectedModel = savedData.model || item.model;
            
            // Get model options based on selected brand
            let modelOptions = [];
            if (selectedBrand && measuringTapeOptions.models[selectedBrand]) {
                modelOptions = measuringTapeOptions.models[selectedBrand];
            }
            
            // Create model dropdown
            if (modelOptions.length > 0) {
                const options = modelOptions.map(model => 
                    `<option value="${model}" ${selectedModel === model ? 'selected' : ''}>${model}</option>`
                ).join('');
                
                modelHtml = `
                    <td>
                        <select name="measuring_${rowNumber}_model" class="measuring-tape-model-select" data-row="${rowNumber}" style="width: 100%;">
                            ${options}
                        </select>
                    </td>
                `;
            } else {
                // Fallback if no model options found
                modelHtml = `
                    <td>
                        <input type="text" name="measuring_${rowNumber}_model" 
                               value="${selectedModel}" 
                               style="width: 100%;">
                    </td>
                `;
            }
        } else if (rowNumber === 3) {
            // Row 3 (Digimatic Caliper) - Model based on brand selection
            const selectedBrand = savedData.brand || item.brand;
            const selectedModel = savedData.model || item.model;
            
            // Get model options based on selected brand
            let modelOptions = [];
            if (selectedBrand && digimaticCaliperOptions.models[selectedBrand]) {
                modelOptions = digimaticCaliperOptions.models[selectedBrand];
            }
            
            // Create model dropdown
            if (modelOptions.length > 0) {
                const options = modelOptions.map(model => 
                    `<option value="${model}" ${selectedModel === model ? 'selected' : ''}>${model}</option>`
                ).join('');
                
                modelHtml = `
                    <td>
                        <select name="measuring_${rowNumber}_model" class="digimatic-caliper-model-select" data-row="${rowNumber}" style="width: 100%;">
                            ${options}
                        </select>
                    </td>
                `;
            } else {
                // Fallback if no model options found
                modelHtml = `
                    <td>
                        <input type="text" name="measuring_${rowNumber}_model" 
                               value="${selectedModel}" 
                               style="width: 100%;">
                    </td>
                `;
            }
        } else {
            // Other rows - use text input
            modelHtml = `
                <td>
                    <input type="text" name="measuring_${rowNumber}_model" 
                           value="${savedData.model || item.model}" 
                           style="width: 100%;">
                </td>
            `;
        }

        // --- Serial Number Column ---
        let serialNumberHtml = '';
        
        if (rowNumber === 1) {
            const selectedItem = savedData.item || "";
            const selectedModel = savedData.model || "";
            let serialOptions = [];
            
            // Determine serial numbers based on item and model
            if (selectedItem === "Process Meter") {
                if (selectedModel === "787B") {
                    serialOptions = serialNumbers["Process Meter"]["787B"];
                } else if (selectedModel === "787") {
                    serialOptions = serialNumbers["Process Meter"]["787"];
                } else {
                    // If item is selected but no model, show all process meter serials
                    serialOptions = [
                        ...serialNumbers["Process Meter"]["787B"],
                        ...serialNumbers["Process Meter"]["787"]
                    ];
                }
            } else if (selectedItem === "Multimeter") {
                // Always show multimeter serials if item is multimeter
                serialOptions = serialNumbers["Multimeter"]["Fluke - 101"];
            }
            
            // Always show serial dropdown if item is selected (no need to wait for model)
            if (selectedItem) {
                // If we have serial options, create dropdown
                const options = serialOptions.map(sn => 
                    `<option value="${sn}" ${savedData.serialNumber === sn ? 'selected' : ''}>${sn}</option>`
                ).join('');
                
                const hasSavedSerial = savedData.serialNumber && serialOptions.includes(savedData.serialNumber);
                
                serialNumberHtml = `
                    <td>
                        <select name="measuring_${rowNumber}_serialNumber" class="serial-select" data-row="${rowNumber}" style="width: 100%;">
                            <option value="" ${!hasSavedSerial ? 'selected' : ''} disabled>-- Select S/N --</option>
                            ${options}
                        </select>
                    </td>
                `;
            } else {
                // If no item selected yet, show disabled dropdown
                serialNumberHtml = `
                    <td>
                        <select name="measuring_${rowNumber}_serialNumber" class="serial-select" data-row="${rowNumber}" disabled style="width: 100%;">
                            <option value="" selected disabled>-- Select Item First --</option>
                        </select>
                    </td>
                `;
            }
        } else if (rowNumber === 2) {
            // Row 2 (Measuring Tape) - Serial number based on brand selection
            const selectedBrand = savedData.brand || item.brand;
            const selectedSerial = savedData.serialNumber || item.serialNumber;
            
            // Get serial number options based on selected brand
            let serialOptions = [];
            if (selectedBrand && measuringTapeOptions.serialNumbers[selectedBrand]) {
                serialOptions = measuringTapeOptions.serialNumbers[selectedBrand];
            }
            
            // Create serial number dropdown
            if (serialOptions.length > 0) {
                const options = serialOptions.map(sn => 
                    `<option value="${sn}" ${selectedSerial === sn ? 'selected' : ''}>${sn}</option>`
                ).join('');
                
                serialNumberHtml = `
                    <td>
                        <select name="measuring_${rowNumber}_serialNumber" class="measuring-tape-serial-select" data-row="${rowNumber}" style="width: 100%;">
                            ${options}
                        </select>
                    </td>
                `;
            } else {
                // Fallback if no serial options found
                serialNumberHtml = `
                    <td>
                        <input type="text" name="measuring_${rowNumber}_serialNumber" 
                               value="${selectedSerial}" 
                               style="width: 100%;">
                    </td>
                `;
            }
        } else if (rowNumber === 3) {
            // Row 3 (Digimatic Caliper) - Serial number based on brand selection
            const selectedBrand = savedData.brand || item.brand;
            const selectedSerial = savedData.serialNumber || item.serialNumber;
            
            // Get serial number options based on selected brand
            let serialOptions = [];
            if (selectedBrand && digimaticCaliperOptions.serialNumbers[selectedBrand]) {
                serialOptions = digimaticCaliperOptions.serialNumbers[selectedBrand];
            }
            
            // Create serial number dropdown
            if (serialOptions.length > 0) {
                const options = serialOptions.map(sn => 
                    `<option value="${sn}" ${selectedSerial === sn ? 'selected' : ''}>${sn}</option>`
                ).join('');
                
                serialNumberHtml = `
                    <td>
                        <select name="measuring_${rowNumber}_serialNumber" class="digimatic-caliper-serial-select" data-row="${rowNumber}" style="width: 100%;">
                            ${options}
                        </select>
                    </td>
                `;
            } else {
                // Fallback if no serial options found
                serialNumberHtml = `
                    <td>
                        <input type="text" name="measuring_${rowNumber}_serialNumber" 
                               value="${selectedSerial}" 
                               style="width: 100%;">
                    </td>
                `;
            }
        } else {
            // For other rows, use text input
            serialNumberHtml = `
                <td>
                    <input type="text" name="measuring_${rowNumber}_serialNumber" 
                           value="${savedData.serialNumber || item.serialNumber}" 
                           style="width: 100%;">
                </td>
            `;
        }

        row.innerHTML = `
            <td style="text-align: center;">${rowNumber}</td>
            ${itemHtml}
            ${brandHtml}
            ${modelHtml}
            ${serialNumberHtml}
            <td><input type="date" name="measuring_${rowNumber}_calDate" value="${savedData.calDate || item.calDate}" style="width: 100%;"></td>
            <td><input type="date" name="measuring_${rowNumber}_calDueDate" value="${savedData.calDueDate || item.calDueDate}" style="width: 100%;"></td>
        `;

        tbody.appendChild(row);
    });

    // Add event listeners after rows are created
    setTimeout(() => {
        // Item selection change for row 1
        const itemSelects = document.querySelectorAll('.item-select');
        itemSelects.forEach(select => {
            select.addEventListener('change', function() {
                updateRowBasedOnItem(this);
            });
        });

        // Model selection change for row 1
        const modelSelects = document.querySelectorAll('.model-select');
        modelSelects.forEach(select => {
            select.addEventListener('change', function() {
                updateSerialNumberDropdownBasedOnModel(this);
            });
        });

        // Brand selection change for Measuring Tape (row 2)
        const measuringTapeBrandSelects = document.querySelectorAll('.measuring-tape-brand-select');
        measuringTapeBrandSelects.forEach(select => {
            select.addEventListener('change', function() {
                updateMeasuringTapeRowBasedOnBrand(this);
            });
        });

        // Brand selection change for Digimatic Caliper (row 3)
        const digimaticCaliperBrandSelects = document.querySelectorAll('.digimatic-caliper-brand-select');
        digimaticCaliperBrandSelects.forEach(select => {
            select.addEventListener('change', function() {
                updateDigimaticCaliperRowBasedOnBrand(this);
            });
        });
    }, 100);
}

// New function to update Digimatic Caliper row based on brand selection
function updateDigimaticCaliperRowBasedOnBrand(brandSelect) {
    const rowNumber = brandSelect.getAttribute('data-row');
    const selectedBrand = brandSelect.value;
    
    // Define Digimatic Caliper options
    const digimaticCaliperOptions = {
        models: {
            "Senator": ["SEN-331-1212K"],
            "NA": ["NA"]
        },
        serialNumbers: {
            "Senator": ["C2303091297"],
            "NA": ["SA2016-ID-862"]
        }
    };

    // Get model and serial number elements
    const modelElement = document.querySelector(`select[name="measuring_${rowNumber}_model"], input[name="measuring_${rowNumber}_model"]`);
    const serialElement = document.querySelector(`select[name="measuring_${rowNumber}_serialNumber"], input[name="measuring_${rowNumber}_serialNumber"]`);

    if (!modelElement || !serialElement) return;

    // Update model based on brand selection
    if (selectedBrand && digimaticCaliperOptions.models[selectedBrand]) {
        const modelOptions = digimaticCaliperOptions.models[selectedBrand];
        
        // If it's currently an input, replace with select
        if (modelElement.tagName === 'INPUT') {
            const newSelect = document.createElement('select');
            newSelect.name = `measuring_${rowNumber}_model`;
            newSelect.className = 'digimatic-caliper-model-select';
            newSelect.setAttribute('data-row', rowNumber);
            newSelect.style.width = '100%';
            
            modelOptions.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                newSelect.appendChild(option);
            });
            
            modelElement.parentNode.replaceChild(newSelect, modelElement);
        } else {
            // If it's already a select, update options
            modelElement.innerHTML = '';
            modelOptions.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelElement.appendChild(option);
            });
        }
    }

    // Update serial number based on brand selection
    if (selectedBrand && digimaticCaliperOptions.serialNumbers[selectedBrand]) {
        const serialOptions = digimaticCaliperOptions.serialNumbers[selectedBrand];
        
        // If it's currently an input, replace with select
        if (serialElement.tagName === 'INPUT') {
            const newSelect = document.createElement('select');
            newSelect.name = `measuring_${rowNumber}_serialNumber`;
            newSelect.className = 'digimatic-caliper-serial-select';
            newSelect.setAttribute('data-row', rowNumber);
            newSelect.style.width = '100%';
            
            serialOptions.forEach(sn => {
                const option = document.createElement('option');
                option.value = sn;
                option.textContent = sn;
                newSelect.appendChild(option);
            });
            
            serialElement.parentNode.replaceChild(newSelect, serialElement);
        } else {
            // If it's already a select, update options
            serialElement.innerHTML = '';
            serialOptions.forEach(sn => {
                const option = document.createElement('option');
                option.value = sn;
                option.textContent = sn;
                serialElement.appendChild(option);
            });
        }
    }
}

// Function to update entire row based on selected item
function updateRowBasedOnItem(itemSelect) {
    const rowNumber = itemSelect.getAttribute('data-row');
    const selectedItem = itemSelect.value;
    const modelSelect = document.querySelector(`select[name="measuring_${rowNumber}_model"]`);
    const brandInput = document.querySelector(`input[name="measuring_${rowNumber}_brand"]`);
    const serialSelect = document.querySelector(`select[name="measuring_${rowNumber}_serialNumber"]`);
    
    if (!modelSelect || !brandInput || !serialSelect) return;
    
    // Update brand - both Process Meter and Multimeter are Fluke
    if (selectedItem === "Process Meter" || selectedItem === "Multimeter") {
        brandInput.value = "Fluke";
    } else {
        brandInput.value = "";
    }
    
    // Update model dropdown
    let modelOptions = [];
    
    if (selectedItem === "Process Meter") {
        modelOptions = ["787B", "787"];
    } else if (selectedItem === "Multimeter") {
        modelOptions = ["Fluke - 101"];
    }
    
    modelSelect.innerHTML = '';
    
    if (modelOptions.length > 0) {
        modelSelect.disabled = false;
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Select Model --";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        modelSelect.appendChild(defaultOption);
        
        modelOptions.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    } else {
        modelSelect.disabled = true;
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "-- Select Item First --";
        option.disabled = true;
        option.selected = true;
        modelSelect.appendChild(option);
    }
    
    // Update serial number dropdown immediately when item is selected
    updateSerialNumberDropdownBasedOnItem(selectedItem, rowNumber);
}

// Function to update serial number dropdown based on selected item
function updateSerialNumberDropdownBasedOnItem(selectedItem, rowNumber) {
    const serialSelect = document.querySelector(`select[name="measuring_${rowNumber}_serialNumber"]`);
    
    if (!serialSelect) return;
    
    // Define serial numbers for different options
    const serialNumbers = {
        "Process Meter": {
            "787B": ["41480049","47240060","47240061","41480048","54930039","54930037","54930036","62160024","45680061","57980103","64170019","68640065","68640067","64170017"],
            "787": ["33500067","35120007"]
        },
        "Multimeter": {
            "Fluke - 101": ["54641492WS", "59751333WS", "42271566WS", "42271567WS", "59751337WS", "59751334WS", "42271204WS", "42271718WS"]
        }
    };
    
    let serialOptions = [];
    
    // Determine serial numbers based on selected item
    if (selectedItem === "Process Meter") {
        // Show all process meter serials
        serialOptions = [
            ...serialNumbers["Process Meter"]["787B"],
            ...serialNumbers["Process Meter"]["787"]
        ];
    } else if (selectedItem === "Multimeter") {
        // Show all multimeter serials
        serialOptions = serialNumbers["Multimeter"]["Fluke - 101"];
    }
    
    // Update serial number dropdown
    serialSelect.innerHTML = '';
    
    if (serialOptions.length > 0) {
        serialSelect.disabled = false;
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Select S/N --";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        serialSelect.appendChild(defaultOption);
        
        serialOptions.forEach(sn => {
            const option = document.createElement('option');
            option.value = sn;
            option.textContent = sn;
            serialSelect.appendChild(option);
        });
    } else {
        serialSelect.disabled = true;
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "-- Select Item First --";
        option.disabled = true;
        option.selected = true;
        serialSelect.appendChild(option);
    }
}

// Function to update serial number dropdown based on selected model (for filtering)
function updateSerialNumberDropdownBasedOnModel(modelSelect) {
    const rowNumber = modelSelect.getAttribute('data-row');
    const selectedModel = modelSelect.value;
    const itemSelect = document.querySelector(`select[name="measuring_${rowNumber}_item"]`);
    
    if (!itemSelect) return;
    
    const selectedItem = itemSelect.value;
    
    // Define serial numbers for different options
    const serialNumbers = {
        "Process Meter": {
            "787B": ["41480049","47240060","47240061","41480048","54930039","54930037","54930036","62160024","45680061","57980103","64170019","68640065","68640067","64170017"],
            "787": ["33500067","35120007"]
        },
        "Multimeter": {
            "Fluke - 101": ["54641492WS", "59751333WS", "42271566WS", "42271567WS", "59751337WS", "59751334WS", "42271204WS", "42271718WS"]
        }
    };
    
    let serialOptions = [];
    
    // Determine serial numbers based on selected item and model
    if (selectedItem === "Process Meter") {
        if (selectedModel === "787B") {
            serialOptions = serialNumbers["Process Meter"]["787B"];
        } else if (selectedModel === "787") {
            serialOptions = serialNumbers["Process Meter"]["787"];
        } else {
            // If no specific model, show all
            serialOptions = [
                ...serialNumbers["Process Meter"]["787B"],
                ...serialNumbers["Process Meter"]["787"]
            ];
        }
    } else if (selectedItem === "Multimeter") {
        // Always show multimeter serials
        serialOptions = serialNumbers["Multimeter"]["Fluke - 101"];
    }
    
    // Update serial number dropdown
    const serialSelect = document.querySelector(`select[name="measuring_${rowNumber}_serialNumber"]`);
    if (!serialSelect) return;
    
    serialSelect.innerHTML = '';
    
    if (serialOptions.length > 0) {
        serialSelect.disabled = false;
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Select S/N --";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        serialSelect.appendChild(defaultOption);
        
        serialOptions.forEach(sn => {
            const option = document.createElement('option');
            option.value = sn;
            option.textContent = sn;
            serialSelect.appendChild(option);
        });
    }
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
        const savedData = window.preRequisiteTestResults.softwareRecord && 
                         window.preRequisiteTestResults.softwareRecord[index] ? 
                         window.preRequisiteTestResults.softwareRecord[index] : {};
        
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

// Save pre-requisite test data - FIXED VERSION
function savePreRequisiteTestData() {
    console.log('Saving pre-requisite test data...');
    
    // Ensure data structure exists
    if (!window.preRequisiteTestResults) {
        window.preRequisiteTestResults = {
            approvedDrawings: [],
            panelIPCertificate: [],
            testEquipmentRecord: [],
            measuringEquipmentRecord: [],
            softwareRecord: [],
        };
    }

    // Clear arrays before saving new data (but preserve the structure)
    window.preRequisiteTestResults.approvedDrawings = [];
    window.preRequisiteTestResults.panelIPCertificate = [];
    window.preRequisiteTestResults.testEquipmentRecord = [];
    window.preRequisiteTestResults.measuringEquipmentRecord = [];
    window.preRequisiteTestResults.softwareRecord = [];

    // Save Approved Drawings data
    for (let i = 1; i <= 6; i++) {
        const revisionInput = document.querySelector(`input[name="approvedDrawing_revision_${i}"]`);
        const dateInput = document.querySelector(`input[name="approvedDrawing_date_${i}"]`);
        const okCheckbox = document.querySelector(`input[name="approvedDrawing_ok_${i}"]`);
        
        if (revisionInput && dateInput && okCheckbox) {
            window.preRequisiteTestResults.approvedDrawings.push({
                revision: revisionInput.value,
                date: dateInput.value,
                ok: okCheckbox.checked
            });
        }
    }

    // Save Panel IP Certificate data
    for (let i = 1; i <= 4; i++) {
        const applicableCheckbox = document.querySelector(`input[name="panelIPCertificate_applicable_${i}"]`);
        
        if (applicableCheckbox) {
            window.preRequisiteTestResults.panelIPCertificate.push({
                applicable: applicableCheckbox.checked
            });
        }
    }

    // Save Test Equipment Record data
    for (let i = 1; i <= 3; i++) {
        const itemInput = document.querySelector(`input[name="testEquipment_item_${i}"]`);
        const brandInput = document.querySelector(`input[name="testEquipment_brand_${i}"]`);
        const modelInput = document.querySelector(`input[name="testEquipment_model_${i}"]`);
        const serialInput = document.querySelector(`input[name="testEquipment_serialNumber_${i}"]`);
        
        if (itemInput && brandInput && modelInput && serialInput) {
            window.preRequisiteTestResults.testEquipmentRecord.push({
                item: itemInput.value,
                brand: brandInput.value,
                model: modelInput.value,
                serialNumber: serialInput.value
            });
        }
    }

    // FIXED: Correct selector for Measuring Equipment Record
    // Save Measuring Equipment Record data
    for (let i = 1; i <= 4; i++) {
        // Item could be input or select
        const itemElement = document.querySelector(`input[name="measuring_${i}_item"], select[name="measuring_${i}_item"]`);
        const brandElement = document.querySelector(`input[name="measuring_${i}_brand"], select[name="measuring_${i}_brand"]`);
        const modelElement = document.querySelector(`input[name="measuring_${i}_model"], select[name="measuring_${i}_model"]`);
        const serialElement = document.querySelector(`input[name="measuring_${i}_serialNumber"], select[name="measuring_${i}_serialNumber"]`);
        const calDateInput = document.querySelector(`input[name="measuring_${i}_calDate"]`);
        const calDueDateInput = document.querySelector(`input[name="measuring_${i}_calDueDate"]`);
        
        if (itemElement && brandElement && modelElement && serialElement && calDateInput && calDueDateInput) {
            window.preRequisiteTestResults.measuringEquipmentRecord.push({
                item: itemElement.value,
                brand: brandElement.value,
                model: modelElement.value,
                serialNumber: serialElement.value,
                calDate: calDateInput.value,
                calDueDate: calDueDateInput.value
            });
        }
    }

    // Save Software Record data
    for (let i = 1; i <= 2; i++) {
        const okCheckbox = document.querySelector(`input[name="software_ok_${i}"]`);
        
        if (okCheckbox) {
            window.preRequisiteTestResults.softwareRecord.push({
                ok: okCheckbox.checked
            });
        }
    }

    // Save to localStorage
    try {
        localStorage.setItem('preRequisiteTestResults', JSON.stringify(window.preRequisiteTestResults));
        console.log('Data saved successfully:', window.preRequisiteTestResults);
        return true;
    } catch (e) {
        console.error('Error saving data to localStorage:', e);
        return false;
    }
}

// Load pre-requisite test data
function loadPreRequisiteTestData() {
    // Data is already loaded in DOMContentLoaded event
    console.log('Data loaded from localStorage:', window.preRequisiteTestResults);
}

// Navigation functions
function goToPreviousPage() {
    console.log('Going to previous page...');
    
    // Save the data before navigating back
    if (savePreRequisiteTestData()) {
        console.log('Data saved successfully, navigating to BQ.html');
        // Navigate to previous page
        window.location.href = 'BQ.html';
    } else {
        alert('Error saving data. Please try again.');
    }
}

function goToNext() {
    console.log('Going to next page...');
    
    // First validate the form
    if (!validateRequiredFields()) {
        alert('Please complete all required fields before continuing & Pre-FAT Result must be passed.');
        return; // Stop navigation if validation fails
    }
    
    // Save the data
    if (savePreRequisiteTestData()) {
        console.log('Data saved successfully, navigating to ProductDeclaration.html');
        // Mark page as completed and navigate
        if (typeof navigationGuard !== 'undefined') {
            navigationGuard.markPageAsCompleted();
        }
        window.location.href = 'ProductDeclaration.html';
    } else {
        alert('Error saving data. Please try again.');
    }
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
        
        if (!okCheckbox) continue; // Skip if element doesn't exist
        
        if (!okCheckbox.checked) {
            okCheckbox.parentElement.style.border = '1px solid red';
            isValid = false;
        } else {
            // If checkbox is checked, also validate the revision and date fields
            const revision = document.querySelector(`input[name="approvedDrawing_revision_${i}"]`);
            const date = document.querySelector(`input[name="approvedDrawing_date_${i}"]`);
            
            if (revision && !revision.value) {
                revision.style.borderColor = 'red';
                isValid = false;
            }
            if (date && !date.value) {
                date.style.borderColor = 'red';
                isValid = false;
            }
        }
    }

    // Validate Software Record - both must be OK
    const softwareOk1 = document.querySelector('input[name="software_ok_1"]');
    const softwareOk2 = document.querySelector('input[name="software_ok_2"]');
    
    if (softwareOk1 && softwareOk2) {
        if (!softwareOk1.checked || !softwareOk2.checked) {
            if (!softwareOk1.checked) softwareOk1.parentElement.style.border = '1px solid red';
            if (!softwareOk2.checked) softwareOk2.parentElement.style.border = '1px solid red';
            isValid = false;
        } else {
            document.querySelectorAll('input[name^="software_ok_"]').forEach(el => {
                el.parentElement.style.border = '';
            });
        }
    }

    return isValid;
}

// Function to update Measuring Tape row based on brand selection
function updateMeasuringTapeRowBasedOnBrand(brandSelect) {
    const rowNumber = brandSelect.getAttribute('data-row');
    const selectedBrand = brandSelect.value;
    
    // Define Measuring Tape options
    const measuringTapeOptions = {
        models: {
            "Marksman": ["NA"],
            "Senator": ["536-148"]
        },
        serialNumbers: {
            "Marksman": ["SA2016-ID-863"],
            "Senator": ["NA"]
        }
    };

    // Get model and serial number elements
    const modelElement = document.querySelector(`select[name="measuring_${rowNumber}_model"], input[name="measuring_${rowNumber}_model"]`);
    const serialElement = document.querySelector(`select[name="measuring_${rowNumber}_serialNumber"], input[name="measuring_${rowNumber}_serialNumber"]`);

    if (!modelElement || !serialElement) return;

    // Update model based on brand selection
    if (selectedBrand && measuringTapeOptions.models[selectedBrand]) {
        const modelOptions = measuringTapeOptions.models[selectedBrand];
        
        // If it's currently an input, replace with select
        if (modelElement.tagName === 'INPUT') {
            const newSelect = document.createElement('select');
            newSelect.name = `measuring_${rowNumber}_model`;
            newSelect.className = 'measuring-tape-model-select';
            newSelect.setAttribute('data-row', rowNumber);
            newSelect.style.width = '100%';
            
            modelOptions.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                newSelect.appendChild(option);
            });
            
            modelElement.parentNode.replaceChild(newSelect, modelElement);
        } else {
            // If it's already a select, update options
            modelElement.innerHTML = '';
            modelOptions.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelElement.appendChild(option);
            });
        }
    }

    // Update serial number based on brand selection
    if (selectedBrand && measuringTapeOptions.serialNumbers[selectedBrand]) {
        const serialOptions = measuringTapeOptions.serialNumbers[selectedBrand];
        
        // If it's currently an input, replace with select
        if (serialElement.tagName === 'INPUT') {
            const newSelect = document.createElement('select');
            newSelect.name = `measuring_${rowNumber}_serialNumber`;
            newSelect.className = 'measuring-tape-serial-select';
            newSelect.setAttribute('data-row', rowNumber);
            newSelect.style.width = '100%';
            
            serialOptions.forEach(sn => {
                const option = document.createElement('option');
                option.value = sn;
                option.textContent = sn;
                newSelect.appendChild(option);
            });
            
            serialElement.parentNode.replaceChild(newSelect, serialElement);
        } else {
            // If it's already a select, update options
            serialElement.innerHTML = '';
            serialOptions.forEach(sn => {
                const option = document.createElement('option');
                option.value = sn;
                option.textContent = sn;
                serialElement.appendChild(option);
            });
        }
    }
}