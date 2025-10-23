// Initialize with empty data structures
if (!window.rtuPanelAccessoriesResults) window.rtuPanelAccessoriesResults = {
    accessories: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('rtuPanelAccessoriesResults');
    if (savedResults) {
        window.rtuPanelAccessoriesResults = JSON.parse(savedResults);
    }

    // Generate rows for RTU Panel Accessories
    generateRTUPanelAccessoriesRows();

    // Load any saved data
    loadRTUPanelAccessoriesData();
});

// Function to generate rows for RTU Panel Accessories
function generateRTUPanelAccessoriesRows() {
    const tbody = document.getElementById('RTUPanelAccesoriesTbody');
    if (!tbody) return;

    // RTU Panel Accessories items
    const accessories = [
        {
            item: "1",
            accessory: "MCB DC",
            quantity: "",
            datasheet: "DF1725IED",
            editable: true,
            brandOptions: ["Schneider", "L&T", "Himel"],
            modelOptions: ["A9F74206", "BB2006DC", "HDB9Z632C6" ]
        },
        {
            item: "2",
            accessory: "MCB DC (Converter)",
            quantity: "",
            datasheet: "PSU-24VDC-100W",
            editable: true,
            brandOptions: ["Schneider", "L&T", "Himel"],
            modelOptions: ["A9F74106", "BB1006DC" ,"HDB3wHN2C6" ]
        },
        {
            item: "3",
            accessory: "MCB DI",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Schneider", "L&T", "Himel"],
            modelOptions: ["A9F74106", "BB1006DC", "HDB9Z631C6"] 
        },
        {
            item: "4",
            accessory: "MCB CES",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Schneider", "L&T", "Himel"],
            modelOptions: ["A9F74206", "BB2006DC", "HDB9Z632C6"]
        },
        {
            item: "5",
            accessory: "MCB Modem",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Schneider", "L&T", "Himel"],
            modelOptions: ["A9F74206", "BB2006DC", "HDB3wHN2C6"]
        },
        {
            item: "6",
            accessory: "MCB AC (F6)",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Schneider", "L&T", "Himel"],
            modelOptions: ["A9F74216", "BB20160C", "HDB3wHN2C16" ]
        },
        {
            item: "7",
            accessory: "MCB AC (F6A)",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Schneider", "L&T", "Himel"],
            modelOptions: ["A9F74216", "BB20160C", "HDB3wHN2C16" ]
        },
        {
            item: "8",
            accessory: "MCB Auxiliary Contact",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Schneider", "L&T", "Himel"],
            modelOptions: ["A9A26924", "BZA11006", "HDB963DF" ]
        },
        {
            item: "9",
            accessory: "Control Enable Switch",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Seiko", "K&N", "Stilo"],
            modelOptions: ["ESN-C202X","CA10","SA2061038CM" ]
        },
        {
            item: "10",
            accessory: "DC/DC 110/24VDC Converter",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Mean Well"],
            modelOptions: ["SD-100D-24"]
        },
        {
            item: "11",
            accessory: "Door Switch",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Higly","Himel","Plasma"],
            modelOptions: ["Z15G1307","HXCMP-1307","PMS-1307"]
        },
        {
            item: "12",
            accessory: "Buzzer Switch",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Higly","Himel","Plasma"],
            modelOptions: ["Z15G1307","HXCMP-1307","PMS-1307"]
        },
        {
            item: "13",
            accessory: "Panel Light",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Philips", "Lit By Cardi","Ecolink"],
            modelOptions: ["LED-6500K-E27"]
        },
        {
            item: "14",
            accessory: "Switch Socket Outlet",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Schneider","UMS","Himel"],
            modelOptions: ["KB15-WE-G11","SP-2913A","HWDA13SS" ]
        },
        {
            item: "15",
            accessory: "Lamp Indicator DC Supply",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["ATEC","Shimatec","ATOMS" ],
            modelOptions: ["AD22-22DS","AD22B-22DS", "AD117" ]
        },
        {
            item: "16",
            accessory: "Lamp Indicator RTU Fault",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["ATEC","Shimatec","ATOMS" ],
            modelOptions: ["AD22-22DS","AD22B-22DS", "AD117" ]
        },
        {
            item: "17",
            accessory: "Lamp Indicator Dummy CB Open",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["ATEC","Shimatec","ATOMS" ],
            modelOptions: ["AD22-22DS","AD22B-22DS", "AD117" ]
        },
        {
            item: "18",
            accessory: "Lamp Indicator Dummy CB Close",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["ATEC","Shimatec","ATOMS" ],
            modelOptions: ["AD22-22DS","AD22B-22DS", "AD117" ]
        },
        {
            item: "19",
            accessory: "Terminal Block (DC Wetting/DO System)",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Weidmuller","Phoenix Contact","Entrelec"],
            modelOptions: ["WTR2.5", "UT2.5-MT", "MA2.5/5.SNB"]
        },
        {
            item: "20",
            accessory: "Terminal Block (I/O Plant)",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Weidmuller","Phoenix Contact","Entrelec"],
            modelOptions: ["WTR2.5", "UT2.5-MT", "MA2.5/5.SNB"]
        },
        {
            item: "21",
            accessory: "Terminal Block (DC Plant/Input/Comm)",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Weidmuller","Phoenix Contact","Entrelec"],
            modelOptions: {
                "Weidmuller": ["WTL6/1/STB EN", "SAKTL 6 STB"],
                "Phoenix Contact": ["URTK/S"],
                "Entrelec": ["M6/8.ST1"]
            },
            specialCase: true
        },
        {
            item: "22",
            accessory: "Terminal Block (AC Circuit)",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Weidmuller","Phoenix Contact","Entrelec"],
            modelOptions: {
                "Weidmuller": ["WTL6/1/STB EN", "SAKTL 6 STB"],
                "Phoenix Contact": ["URTK/S"],
                "Entrelec": ["M6/8.ST1"]
            },
            specialCase: true
        },
        {
            item: "23",
            accessory: "Terminal Block (External Local Alarm – XE)",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["Weidmuller","Phoenix Contact","Entrelec"],
            modelOptions: ["WTR2.5","UT2.5-MT","MA2.5/5.SNB" ]
        },
        {
            item: "24",
            accessory: "Earthing Bar",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["GV"],
            modelOptions: ["Copper"]
        },
        {
            item: "25",
            accessory: "Buzzer",
            quantity: "",
            datasheet: "",
            editable: true,
            brandOptions: ["XGH","ATOMS"],
            modelOptions: ["AD22-22SM","AD116-BZ"]
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

        // For special cases (one brand with multiple models or complex model mapping), create a dropdown for model selection
        let modelCell = "";
        if (item.specialCase || (item.modelOptions && typeof item.modelOptions === 'object' && !Array.isArray(item.modelOptions))) {
            // Create a dropdown for model selection
            let optionsHtml = '';
            
            if (typeof item.modelOptions === 'object' && !Array.isArray(item.modelOptions)) {
                // For items 21 and 22 with complex model mapping
                optionsHtml = Object.values(item.modelOptions).flat().map(model => 
                    `<option value="${model}">${model}</option>`
                ).join("");
            } else {
                // For regular special cases
                optionsHtml = item.modelOptions.map(option => 
                    `<option value="${option}">${option}</option>`
                ).join("");
            }
            
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
        if (brandSelect && modelInput && !item.specialCase && item.modelOptions && Array.isArray(item.modelOptions) && item.modelOptions.length > 0) {
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

        // For items 21 and 22 with complex model mapping, update model options based on brand selection
        if ((rowNumber === 21 || rowNumber === 22) && brandSelect && modelSelect) {
            // Set initial model options based on selected brand
            updateModelOptionsForComplexCases(rowNumber, brandSelect.value);
            
            brandSelect.addEventListener('change', function() {
                updateModelOptionsForComplexCases(rowNumber, this.value);
            });
        }

        okCheckbox.addEventListener('change', function() {
            datasheetSelect.value = this.checked ? 'YES' : 'NO';
        });
    });
}

// Helper function to update model options for complex cases (items 21 and 22)
function updateModelOptionsForComplexCases(rowNumber, selectedBrand) {
    const modelSelect = document.querySelector(`select[name="accessory_${rowNumber}_model"]`);
    if (!modelSelect) return;

    // Define the model mappings for items 21 and 22
    const modelMappings = {
        "Weidmuller": ["WTL6/1/STB EN", "SAKTL 6 STB"],
        "Phoenix Contact": ["URTK/S"],
        "Entrelec": ["M6/8.ST1"]
    };

    // Clear existing options
    modelSelect.innerHTML = '';

    // Add new options based on selected brand
    if (modelMappings[selectedBrand]) {
        modelMappings[selectedBrand].forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }

    // Set default selection
    if (modelMappings[selectedBrand] && modelMappings[selectedBrand].length > 0) {
        modelSelect.value = modelMappings[selectedBrand][0];
    }
}

// Save RTU Panel Accessories data
function saveRTUPanelAccessoriesData() {
    // Ensure the test results object has the proper structure
    window.rtuPanelAccessoriesResults = window.rtuPanelAccessoriesResults || {};
    window.rtuPanelAccessoriesResults.accessories = window.rtuPanelAccessoriesResults.accessories || {};

    // Save Accessories results
    for (let itemNum = 1; itemNum <= 25; itemNum++) {
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

        window.rtuPanelAccessoriesResults.accessories[`item_${itemNum}`] = {
            ok: okChecked ? 'OK' : 'NO',
            brand: brand,
            model: model,
            quantity: quantity,
            datasheet: datasheet
        };
    }

    // Save to session storage
    localStorage.setItem('rtuPanelAccessoriesResults', JSON.stringify(window.rtuPanelAccessoriesResults));
}

// Load RTU Panel Accessories data
function loadRTUPanelAccessoriesData() {
    // Ensure we have a valid rtuPanelAccessoriesResults object with the expected structure
    window.rtuPanelAccessoriesResults = window.rtuPanelAccessoriesResults || {};
    window.rtuPanelAccessoriesResults.accessories = window.rtuPanelAccessoriesResults.accessories || {};

    // Define which rows are special cases (one brand with multiple models or complex cases)
    const specialCaseRows = [10, 13, 15, 16, 17, 18, 21, 22, 24, 25];

    // Load Accessories results
    for (let itemNum = 1; itemNum <= 25; itemNum++) {
        const testResult = window.rtuPanelAccessoriesResults.accessories[`item_${itemNum}`];
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
                
                // For items 21 and 22, update model options based on selected brand
                if (itemNum === 21 || itemNum === 22) {
                    updateModelOptionsForComplexCases(itemNum, testResult.brand);
                }
                
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

// Validation function for RTU Panel Accessories
function validateRTUPanelAccessories() {
    let isValid = true;
    
    // Reset all error styles first
    document.querySelectorAll('input, select').forEach(element => {
        element.style.borderColor = '';
    });

    // Validate each accessory item
    for (let itemNum = 1; itemNum <= 25; itemNum++) {
        const okCheckbox = document.querySelector(`input[name="accessory_${itemNum}_ok"]`);
        
        if (okCheckbox && okCheckbox.checked) {
            // Validate quantity
            const quantityInput = document.querySelector(`input[name="accessory_${itemNum}_quantity"]`);
            if (quantityInput && (!quantityInput.value || isNaN(quantityInput.value))) {
                quantityInput.style.borderColor = 'red';
                isValid = false;
            }

            // Validate datasheet must be "YES"
            const datasheetSelect = document.querySelector(`select[name="accessory_${itemNum}_datasheet"]`);
            if (datasheetSelect && datasheetSelect.value !== 'YES') {
                datasheetSelect.style.borderColor = 'red';
                isValid = false;
            }
        }
    }

    return isValid;
}

// Update the handleRTUPanelAccSubmission function to include more specific validation message
function handleRTUPanelAccSubmission() {
    // First validate the form
    if (!validateRTUPanelAccessories()) {
        alert('For all checked items (OK), please ensure:\n1. Quantity is entered\n2. Datasheet is marked as "YES"');
        return; // Stop navigation if validation fails
    }
    
    // Save the data
    saveRTUPanelAccessoriesData();
    
    // Mark page as completed and navigate
    navigationGuard.markPageAsCompleted();
    window.location.href = 'PanelInformation.html';
}

function goToPreviousPage() {
    // Save the data
    saveRTUPanelAccessoriesData();
    window.location.href = 'ElectronicAcc.html';
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