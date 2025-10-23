// Initialize with empty data structures
if (!window.electronicAccessoriesResults) window.electronicAccessoriesResults = {
    accessories: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('electronicAccessoriesResults');
    if (savedResults) {
        window.electronicAccessoriesResults = JSON.parse(savedResults);
    }

    // Generate rows for Electronic Accessories
    generateElectronicAccessoriesRows();

    // Load any saved data
    loadElectronicAccessoriesData();
});

// Function to generate rows for Electronic Accessories
function generateElectronicAccessoriesRows() {
    const tbody = document.getElementById('ElectronicAccesoriesTbody');
    if (!tbody) return;

    // Electronic Accessories items
    const accessories = [
        {
            item: "1",
            accessory: "Dummy Breaker",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["DongFang","IDEC", "TE"],
            modelOptions: ["JHXH-121FF C-2a2b", "RR2KP-U" ,"KUL-11D15D"]
        },
        {
            item: "2",
            accessory: "Fault Alarm Relay [K2]",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["IDEC","TE", "Shenler","Omron"],
            modelOptions: ["RJ1S","RT314024", "RFT1CO024", "MK2SP"]
        },
        {
            item: "3",
            accessory: "Fault Alarm Relay [K3]",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["IDEC","TE", "Shenler","Omron"],
            modelOptions: ["RJ1S","RT314024", "RFT1CO024", "MK2SP"]
        },
        {
            item: "4",
            accessory: "110VDC Power Supply Unit Surge Protector",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["DongFang"],
            modelOptions: ["PLPT-110VDC"]
        },
        {
            item: "5",
            accessory: "30VDC Power Supply Unit Surge Protector",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["DongFang"],
            modelOptions: ["PLPT-30VDC","PLPT-30V-A"]
        },
        {
            item: "6",
            accessory: "UTP Cable Surge Protector",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["APC","DongFang"],
            modelOptions: ["PNET1GB", "DF-LPT-ETH"]
        },
        {
            item: "7",
            accessory: "Modem Splitter",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["DongFang"],
            modelOptions: ["DF1745MSN/DC24V"]
        },
        {
            item: "8",
            accessory: "Communication Surge Arrestor",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["DongFang"],
            modelOptions: ["RS232ISO","RS232ISO-A"]
        },
        {
            item: "9",
            accessory: "Lease Line Modem",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["TAINET"],
            modelOptions: ["T-336CX"]
        },
        {
            item: "10",
            accessory: "Communication Surge Protector",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["CRITEC"],
            modelOptions: ["UTB-30SP"]
        },
        {
            item: "11",
            accessory: "Fiber Modem",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["AD-net"],
            modelOptions: ["AN-FM-RS232"]
        },
        {
            item: "12",
            accessory: "Router Switch",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Four-Faith"],
            modelOptions: ["F-R100"]
        }
    ];

    // Identify special cases (one brand with multiple models)
    accessories.forEach(item => {
        if (item.brandOptions && item.brandOptions.length === 1 && 
            item.modelOptions && item.modelOptions.length > 1) {
            item.specialCase = true;
        }
    });

    accessories.forEach((item, index) => {
        const rowNumber = index + 1;
        const row = document.createElement('tr');
        
        // Create input fields for editable cells or static text for non-editable
        let brandCell = "";
        if (item.brandOptions && item.brandOptions.length > 0) {
            const optionsHtml = item.brandOptions.map(option => 
                `<option value="${option}" ${option === item.brand ? "selected" : ""}>${option}</option>`
            ).join("");
            brandCell = `
                <td style="text-align: center;">
                    <select name="accessory_${rowNumber}_brand" style="width: 120px;">
                        ${optionsHtml}
                    </select>
                </td>
            `;
        } else {
            brandCell = item.editable
                ? `<td style="text-align: center;"><input type="text" name="accessory_${rowNumber}_brand" value="${item.model}" style="width: 100px;"></td>`
                : `<td style="text-align: center;">${item.brand}</td>`;
        }

        // For special cases (one brand with multiple models), create a dropdown for model selection
        let modelCell = "";
        if (item.specialCase) {
            const optionsHtml = item.modelOptions.map(option => 
                `<option value="${option}" ${option === item.model ? "selected" : ""}>${option}</option>`
            ).join("");
            modelCell = `
                <td style="text-align: center;">
                    <select name="accessory_${rowNumber}_model" style="width: 120px;">
                        ${optionsHtml}
                    </select>
                </td>
            `;
        } else if (item.modelOptions && item.modelOptions.length > 0) {
            // For normal cases with multiple brands, create a readonly input field
            modelCell = `
                <td style="text-align: center;">
                    <input type="text" name="accessory_${rowNumber}_model" readonly style="width: 120px; background-color: #f0f0f0;">
                </td>
            `;
        } else {
            // For cases without predefined model options
            modelCell = item.editable
                ? `<td style="text-align: center;"><input type="text" name="accessory_${rowNumber}_model" value="${item.model}" style="width: 100px;"></td>`
                : `<td style="text-align: center;">${item.model}</td>`;
        }
            
        const quantityCell = item.editable 
            ? `<td style="text-align: center;"><input type="number" name="accessory_${rowNumber}_quantity" value="${item.quantity}" min="0" style="width: 60px;"></td>`
            : `<td style="text-align: center;">${item.quantity}</td>`;
            
        const datasheetCell = `
            <td style="text-align: center;">
                <select name="accessory_${rowNumber}_datasheet" style="width: 80px;">
                    <option value="NO" selected>NO</option>
                    <option value="YES">YES</option>
                </select>
            </td>
        `;

        row.innerHTML = `
            <td style="text-align: center;">${item.item}</td>
            <td style="text-align: left;">${item.accessory}</td>
            ${brandCell}
            ${modelCell}
            ${quantityCell}
            ${datasheetCell}
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="accessory_${rowNumber}_ok" unchecked>
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
        
        // Get references to the brand and model fields
        const brandSelect = row.querySelector(`select[name="accessory_${rowNumber}_brand"]`);
        const modelInput = row.querySelector(`input[name="accessory_${rowNumber}_model"]`);
        const modelSelect = row.querySelector(`select[name="accessory_${rowNumber}_model"]`);
        const okCheckbox = row.querySelector(`input[name="accessory_${rowNumber}_ok"]`);
        const datasheetSelect = row.querySelector(`select[name="accessory_${rowNumber}_datasheet"]`);

        // Add event listener for brand selection change (only for non-special cases)
        if (brandSelect && modelInput && !item.specialCase && item.modelOptions && item.modelOptions.length > 0) {
            // Set initial model based on selected brand
            if (brandSelect.selectedIndex >= 0 && brandSelect.selectedIndex < item.modelOptions.length) {
                modelInput.value = item.modelOptions[brandSelect.selectedIndex];
            }
            
            brandSelect.addEventListener('change', function() {
                // Update the model based on the selected brand index
                const selectedIndex = this.selectedIndex;
                if (selectedIndex >= 0 && selectedIndex < item.modelOptions.length) {
                    modelInput.value = item.modelOptions[selectedIndex];
                }
            });
        }

        okCheckbox.addEventListener('change', function() {
            datasheetSelect.value = this.checked ? 'YES' : 'NO';
        });
    });
}

// Save Electronic Accessories data
function saveElectronicAccessoriesData() {
    // Ensure the test results object has the proper structure
    window.electronicAccessoriesResults = window.electronicAccessoriesResults || {};
    window.electronicAccessoriesResults.accessories = window.electronicAccessoriesResults.accessories || {};

    // Save Accessories results
    for (let itemNum = 1; itemNum <= 12; itemNum++) {
        const okChecked = document.querySelector(`input[name="accessory_${itemNum}_ok"]`)?.checked || false;
        
        const datasheetSelect = document.querySelector(`select[name="accessory_${itemNum}_datasheet"]`);
        const datasheet = datasheetSelect ? datasheetSelect.value : null;

        // Get brand value (either from select or input)
        const brandSelect = document.querySelector(`select[name="accessory_${itemNum}_brand"]`);
        const brandInput = document.querySelector(`input[name="accessory_${itemNum}_brand"]`);
        const brand = brandSelect ? brandSelect.value : (brandInput ? brandInput.value : null);

        // Get model value (from input for normal cases, from select for special cases)
        const modelInput = document.querySelector(`input[name="accessory_${itemNum}_model"]`);
        const modelSelect = document.querySelector(`select[name="accessory_${itemNum}_model"]`);
        const model = modelInput ? modelInput.value : (modelSelect ? modelSelect.value : null);

        // Get quantity value
        const quantityInput = document.querySelector(`input[name="accessory_${itemNum}_quantity"]`);
        const quantity = quantityInput ? quantityInput.value : null;

        window.electronicAccessoriesResults.accessories[`item_${itemNum}`] = {
            ok: okChecked ? 'OK' : 'NO',
            brand: brand,
            model: model,
            quantity: quantity,
            datasheet: datasheet
        };
    }

    // Save to session storage
    localStorage.setItem('electronicAccessoriesResults', JSON.stringify(window.electronicAccessoriesResults));
}

// Load Electronic Accessories data
function loadElectronicAccessoriesData() {
    // Ensure we have a valid electronicAccessoriesResults object with the expected structure
    window.electronicAccessoriesResults = window.electronicAccessoriesResults || {};
    window.electronicAccessoriesResults.accessories = window.electronicAccessoriesResults.accessories || {};

    // Define which rows are special cases (one brand with multiple models)
    const specialCaseRows = [4, 5, 7, 8]; // Rows with one brand but multiple models

    // Load Accessories results
    for (let itemNum = 1; itemNum <= 12; itemNum++) {
        const testResult = window.electronicAccessoriesResults.accessories[`item_${itemNum}`];
        if (testResult) {
            const okCheckbox = document.querySelector(`input[name="accessory_${itemNum}_ok"]`);
            const datasheetSelect = document.querySelector(`select[name="accessory_${itemNum}_datasheet"]`);
            
            if (okCheckbox) {
                okCheckbox.checked = testResult.ok === 'OK';
                // Trigger the change event to update the datasheet
                okCheckbox.dispatchEvent(new Event('change'));
            }
            
            if (datasheetSelect && testResult.datasheet) {
                datasheetSelect.value = testResult.datasheet;
            }
            
            // Set brand value
            const brandSelect = document.querySelector(`select[name="accessory_${itemNum}_brand"]`);
            if (brandSelect && testResult.brand) {
                brandSelect.value = testResult.brand;
                
                // For non-special cases, set the model based on brand selection
                if (!specialCaseRows.includes(itemNum)) {
                    const modelInput = document.querySelector(`input[name="accessory_${itemNum}_model"]`);
                    if (modelInput && testResult.model) {
                        modelInput.value = testResult.model;
                    }
                }
            }

            // For special cases, set the model select value
            if (specialCaseRows.includes(itemNum)) {
                const modelSelect = document.querySelector(`select[name="accessory_${itemNum}_model"]`);
                if (modelSelect && testResult.model) {
                    modelSelect.value = testResult.model;
                }
            } else {
                // For normal cases, set the model input value
                const modelInput = document.querySelector(`input[name="accessory_${itemNum}_model"]`);
                if (modelInput && testResult.model) {
                    modelInput.value = testResult.model;
                }
            }

            const quantityInput = document.querySelector(`input[name="accessory_${itemNum}_quantity"]`);
            if (quantityInput && testResult.quantity) {
                quantityInput.value = testResult.quantity;
            }
        }
    }
}

function goToPreviousPage() {
    // Save data before navigating back
    saveElectronicAccessoriesData();
    window.location.href = 'TestSetup.html';
}

function SelectAll() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="accessory_"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        // Trigger the change event to update the datasheet
        const event = new Event('change');
        checkbox.dispatchEvent(event);
    });
}

function clearAll() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="accessory_"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        // Trigger the change event to update the datasheet
        const event = new Event('change');
        checkbox.dispatchEvent(event);
    });
}

// Add this function to validate required fields
function validateElectronicAccessoriesFields() {
    let isValid = true;
    
    // Reset all error styles first
    document.querySelectorAll('input, select').forEach(element => {
        element.style.borderColor = '';
    });

    // Validate each accessory row
    for (let itemNum = 1; itemNum <= 12; itemNum++) {
        const okCheckbox = document.querySelector(`input[name="accessory_${itemNum}_ok"]`);
        
        if (okCheckbox.checked) {
            const quantityInput = document.querySelector(`input[name="accessory_${itemNum}_quantity"]`);
            const datasheetSelect = document.querySelector(`select[name="accessory_${itemNum}_datasheet"]`);
            
            // Validate quantity
            if (!quantityInput.value || isNaN(quantityInput.value)) {
                quantityInput.style.borderColor = 'red';
                isValid = false;
            }
            
            // Validate datasheet must be "YES"
            if (datasheetSelect.value !== 'YES') {
                datasheetSelect.style.borderColor = 'red';
                isValid = false;
            }
        }
    }

    return isValid;
}

// Update the handleElectronicAccSubmission function to include more specific validation message
function handleElectronicAccSubmission() {
    // First validate the form
    if (!validateElectronicAccessoriesFields()) {
        alert('For all checked items (OK), please ensure:\n1. Quantity is entered\n2. Datasheet is marked as "YES"');
        return; // Stop navigation if validation fails
    }
    
    // Save the data
    saveElectronicAccessoriesData();
    
    // Mark page as completed and navigate only if validation passes
    navigationGuard.markPageAsCompleted();
    window.location.href = 'RTUPanelAcc.html';
}