// Initialize with empty data structures
if (!window.productDeclarationResults) window.productDeclarationResults = {
    declarations: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved test results if available
    const savedResults = localStorage.getItem('productDeclarationResults');
    if (savedResults) {
        window.productDeclarationResults = JSON.parse(savedResults);
    }

    // Generate rows for Product Declaration
    generateProductDeclarationRows();

    // Load any saved data
    loadProductDeclarationData();
});

// Function to generate rows for Product Declaration
function generateProductDeclarationRows() {
    const tbody = document.getElementById('ProductDeclarationTbody');
    if (!tbody) return;

    // Product Declaration items
    const declarations = [
        {
            item: "1",
            description: "RTU Model",
            remarks: "DF1725IED",
            editable: false
        },
        {
            item: "2",
            description: "Communication Protocol",
            remarks: ["IEC101: ","IEC104: ","DNP3: "],
            editable: true,
            isMultiRemark: true,
            options: ["Single", "Redundancy", "N/A"] // Unique options for item 2
        },
        {
            item: "3",
            description: "Type",
            options: ["Centralized","Decentralized"], // Unique options for item 3
            editable: true
        },
        {
            item: "4",
            description: "Power Supply Input",
            editable: true,
            options: ["30VDC", "110VDC", "24VDC","Others: "] // Unique options for item 4
        }
    ];

    declarations.forEach((item, index) => {
        const rowNumber = index + 1;
        
if (item.isMultiRemark && Array.isArray(item.remarks)) {
    // Create a row for each remark in item 2
    item.remarks.forEach((remark, remarkIndex) => {
        const row = document.createElement('tr');
        
        // Only show item number and description for the first remark
        const itemCell = remarkIndex === 0 
            ? `<td style="text-align: center;" rowspan="${item.remarks.length}">${item.item}</td>`
            : '';
        
        const descCell = remarkIndex === 0 
            ? `<td style="text-align: left;" rowspan="${item.remarks.length}">${item.description}</td>`
            : '';
        
        // Generate options HTML for the select dropdown
        let optionsHtml = '';
        if (item.options && Array.isArray(item.options)) {
            item.options.forEach(option => {
                // Set default selection based on protocol
                let selected = '';
                if (remark.includes("IEC101") || remark.includes("IEC104")) {
                    selected = option === "Redundancy" ? 'selected' : '';
                } else if (remark.includes("DNP3")) {
                    selected = option === "N/A" ? 'selected' : '';
                }
                optionsHtml += `<option value="${option}" ${selected}>${option}</option>`;
            });
        }
        
        row.innerHTML = `
            ${itemCell}
            ${descCell}
            <td style="text-align: center;">
                ${remark}
                <select name="declaration_${rowNumber}_remarks_${remarkIndex}" style="width: 200px;">
                    ${optionsHtml}
                </select>
            </td>
        `;
        tbody.appendChild(row);
    });
        } else {
            // Normal row for other items
            const row = document.createElement('tr');
            
            // Generate options HTML for the select dropdown
            let optionsHtml = '';
            if (item.options && Array.isArray(item.options)) {
                item.options.forEach(option => {
                    optionsHtml += `<option value="${option}">${option}</option>`;
                });
            }
            
            const remarksCell = item.editable 
                ? `<td style="text-align: center;">
                    <select name="declaration_${rowNumber}_remarks" style="width: 200px;" onchange="handleOthersOption(this, ${rowNumber})">
                        ${optionsHtml}
                    </select>
                    <input type="text" name="declaration_${rowNumber}_others_input" style="display:none; margin-left:10px;" placeholder="Please specify..." />
                </td>`
                : `<td style="text-align: center;">${item.remarks || ''}</td>`;

            row.innerHTML = `
                <td style="text-align: center;">${item.item}</td>
                <td style="text-align: left;">${item.description}</td>
                ${remarksCell}
            `;
            tbody.appendChild(row);
        }
    });
}

// Save Product Declaration data
function saveProductDeclarationData() {
    // Ensure the test results object has the proper structure
    window.productDeclarationResults = window.productDeclarationResults || {};
    window.productDeclarationResults.declarations = window.productDeclarationResults.declarations || {};

    // Save Declaration results
    for (let itemNum = 1; itemNum <= 4; itemNum++) {
        const okChecked = document.querySelector(`input[name="declaration_${itemNum}_ok"]`)?.checked || false;
        
        // Special handling for item 2 with multiple remarks
        if (itemNum === 2) {
            const remarks = [];
            const remarkSelects = document.querySelectorAll(`select[name^="declaration_${itemNum}_remarks_"]`);
            remarkSelects.forEach(select => {
                if (select.value) remarks.push(select.value);
            });
            
            window.productDeclarationResults.declarations[`item_${itemNum}`] = {
                ok: okChecked ? 'OK' : 'NO',
                remarks: remarks
            };
            } else {
                const remarksSelect = document.querySelector(`select[name="declaration_${itemNum}_remarks"]`);
                const othersInput = document.querySelector(`input[name="declaration_${itemNum}_others_input"]`);
                let remarks = remarksSelect ? remarksSelect.value : null;

                if (remarks && remarks.startsWith("Others") && othersInput && othersInput.value.trim() !== "") {
                    remarks = `Others: ${othersInput.value.trim()}`;
                }

                window.productDeclarationResults.declarations[`item_${itemNum}`] = {
                    ok: okChecked ? 'OK' : 'NO',
                    remarks: remarks
                };
            }

                // Save to session storage
                localStorage.setItem('productDeclarationResults', JSON.stringify(window.productDeclarationResults));
            }
        }

// Load Product Declaration data
function loadProductDeclarationData() {
    // Ensure we have a valid productDeclarationResults object with the expected structure
    window.productDeclarationResults = window.productDeclarationResults || {};
    window.productDeclarationResults.declarations = window.productDeclarationResults.declarations || {};

    // Load Declaration results
    for (let itemNum = 1; itemNum <= 4; itemNum++) {
        const testResult = window.productDeclarationResults.declarations[`item_${itemNum}`];
        if (testResult) {
            // Set OK checkbox
            const okCheckbox = document.querySelector(`input[name="declaration_${itemNum}_ok"]`);
            if (okCheckbox) okCheckbox.checked = testResult.ok === 'OK';
            
            // Special handling for item 2 with multiple remarks
            if (itemNum === 2 && Array.isArray(testResult.remarks)) {
                testResult.remarks.forEach((remark, remarkIndex) => {
                    const remarksSelect = document.querySelector(`select[name="declaration_${itemNum}_remarks_${remarkIndex}"]`);
                    if (remarksSelect) {
                        remarksSelect.value = remark;
                    }
                });
            } else {
                const remarksSelect = document.querySelector(`select[name="declaration_${itemNum}_remarks"]`);
                const othersInput = document.querySelector(`input[name="declaration_${itemNum}_others_input"]`);
                if (remarksSelect && testResult.remarks) {
                    if (testResult.remarks.startsWith("Others:")) {
                        remarksSelect.value = "Others: ";
                        if (othersInput) {
                            othersInput.style.display = 'inline-block';
                            othersInput.value = testResult.remarks.replace("Others: ", "").trim();
                        }
                    } else {
                        remarksSelect.value = testResult.remarks;
                    }
                }
            }

        }
    }
}

// Navigation functions
function goToPreviousPage() {
    window.location.href = 'Pre-requisite.html';
}


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

function handleOthersOption(selectElem, rowNumber) {
    const input = document.querySelector(`input[name="declaration_${rowNumber}_others_input"]`);
    if (selectElem.value.startsWith("Others")) {
        input.style.display = 'inline-block';
    } else {
        input.style.display = 'none';
        input.value = ''; // clear if not others
    }
}
// Add this function to validate required fields
function validateProductDeclaration() {
    let isValid = true;
    
    // Reset all error styles first
    document.querySelectorAll('select').forEach(element => {
        element.style.borderColor = '';
    });

    // Validate Item 3 - "All labels and markings are correct and legible"
    const item3Select = document.querySelector('select[name="declaration_3_remarks"]');
    if (!item3Select.value) {
        item3Select.style.borderColor = 'red';
        isValid = false;
    }

    // Validate Item 4 - "All accessories are included as specified"
    const item4Select = document.querySelector('select[name="declaration_4_remarks"]');
    const item4OthersInput = document.querySelector('input[name="declaration_4_others_input"]');
    
    if (!item4Select.value) {
        item4Select.style.borderColor = 'red';
        isValid = false;
    } else if (item4Select.value.startsWith("Others") && (!item4OthersInput.value || item4OthersInput.value.trim() === "")) {
        item4OthersInput.style.borderColor = 'red';
        isValid = false;
    }

    return isValid;
}

// Update the handleProductDeclarationSubmission function to include validation
function handleProductDeclarationSubmission() {
    // First validate the form
    if (!validateProductDeclaration()) {
        alert('Please complete all required fields (Items 3 and 4) before continuing.');
        return; // Stop navigation if validation fails
    }
    
    // Save the data
    saveProductDeclarationData();
    
    // Mark page as completed and navigate
    navigationGuard.markPageAsCompleted();
    window.location.href = 'TestSetup.html';
}
