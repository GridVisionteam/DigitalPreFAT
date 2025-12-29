let userData = {};
window.diTestResults = {};
window.diModuleTypes = {};
const serialNumberTracker = {
    usedSerials: new Map(), // Stores serial -> {moduleType, moduleNo}
    checkDuplicate: function(serial) {
        if (!serial) return false;
        return this.usedSerials.has(serial);
    },
    addSerial: function(serial, moduleType, moduleNo) {
        if (serial) this.usedSerials.set(serial, { moduleType, moduleNo });
    },
    getDuplicateLocation: function(serial) {
        const info = this.usedSerials.get(serial);
        return info ? `${info.moduleType} Module ${info.moduleNo}` : null;
    },
    clearAll: function() {
        this.usedSerials.clear();
    }
};

function updatePartNumberSummary(moduleSheet) {
    const moduleType = moduleSheet.dataset.moduleType;
    const partNoSelects = moduleSheet.querySelectorAll('select[name$="_part_no"]');
    const summaryElement = moduleSheet.querySelector('.module-type');
    
    if (!summaryElement) return;
    
    // Count part number selections
    const partCounts = {};
    partNoSelects.forEach(select => {
        const partNo = select.value;
        partCounts[partNo] = (partCounts[partNo] || 0) + 1;
    });
    
    // Update summary text
    const summaryParts = [];
    for (const [partNo, count] of Object.entries(partCounts)) {
        summaryParts.push(`${count}x ${partNo}`);
    }
    
    summaryElement.textContent = summaryParts.join(', ') || 'No parts selected';
}

async function goToNext() {
    // ==========================================
    // 1. VALIDATION PHASE
    // ==========================================

    // Generic validation
    if (typeof validateAllModuleFields === 'function') {
       if (!validateAllModuleFields()) {
           return; 
      }
    }

    // Specific Validation: Check ALL Serial Numbers for 12 Digits
    /*const serialInputs = document.querySelectorAll('input[name$="_serial"]');
    for (const input of serialInputs) {
        const serialValue = input.value.trim();
        if (serialValue && !/^\d{12}$/.test(serialValue)) {
            input.style.border = '2px solid red';
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            input.focus();
            showCustomAlert('Action Blocked: A serial number detected that is not 12 digits. Please fix it before proceeding.');
            return; 
        } else {
            input.style.border = '';
        }
    } */

    // ==========================================
    // 2. DATA SAVING PHASE
    // ==========================================
    
    // Initialize module types if needed
    if (!window.diModuleTypes) window.diModuleTypes = {};
    if (!window.doModuleTypes) window.doModuleTypes = {};
    
    // Save checker name & vendor
    localStorage.setItem('checkerName', document.getElementById('checkerName')?.value || '');
    localStorage.setItem('vendorNumber', document.getElementById('vendorNumber')?.value || '');

    // Get the counts
    const processorCount = parseInt(document.getElementById('processorCount').value) || 0;
    const powerCount = parseInt(document.getElementById('powerCount').value) || 0;
    const diCount = parseInt(document.getElementById('diCount').value) || 0;
    const doCount = parseInt(document.getElementById('doCount').value) || 0;
    const aiCount = parseInt(document.getElementById('aiCount').value) || 0;
    const comCount = parseInt(document.getElementById('comCount').value) || 0;
    const aoCount = parseInt(document.getElementById('aoCount')?.value) || 0;

    // Helper to extract row data
    const extractRowData = (rows) => {
        const data = [];
        rows.forEach(row => {
            data.push({
                partNo: row.querySelector('select[name$="_part_no"]')?.value,
                subrack: row.querySelector('input[name$="_subrack"]')?.value,
                slot: row.querySelector('input[name$="_slot"]')?.value,
                serial: row.querySelector('input[name$="_serial"]')?.value
            });
        });
        return data;
    };

    // Save Processor modules
    const processorModulesData = extractRowData(document.querySelectorAll('.module-sheet[data-module-type="Processor"] tbody tr'));
    localStorage.setItem('processorModulesDetails', JSON.stringify(processorModulesData));
    
    // Save Power modules
    const powerModulesData = extractRowData(document.querySelectorAll('.module-sheet[data-module-type="Power"] tbody tr'));
    localStorage.setItem('powerModulesDetails', JSON.stringify(powerModulesData));

    // Save Subrack modules
    const subrackModulesData = extractRowData(document.querySelectorAll('.module-sheet[data-module-type="Subrack"] tbody tr'));
    localStorage.setItem('subrackModulesDetails', JSON.stringify(subrackModulesData));

    // Save COM modules
    const comModulesData = extractRowData(document.querySelectorAll('.module-sheet[data-module-type="COM"] tbody tr'));
    localStorage.setItem('comModulesDetails', JSON.stringify(comModulesData));
    
    // Save DI modules (with type logic)
    const diModulesData = [];
    document.querySelectorAll('.module-sheet[data-module-type="DI"] tbody tr').forEach((row, index) => {
        const partNo = row.querySelector('select[name$="_part_no"]')?.value;
        let moduleType = 'DI-32'; 
        if (partNo && partNo.includes('DI-16')) moduleType = 'DI-16';
        
        window.diModuleTypes[index + 1] = moduleType;
        diModulesData.push({
            partNo: partNo,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value,
            type: moduleType
        });
    });
    localStorage.setItem('diModuleTypes', JSON.stringify(window.diModuleTypes));
    
    // Save DO modules (with type logic)
    const doModulesData = [];
    document.querySelectorAll('.module-sheet[data-module-type="DO"] tbody tr').forEach((row, index) => {
        const partNo = row.querySelector('select[name$="_part_no"]')?.value;
        let moduleType = 'CO-16-A';
        if (partNo && partNo.includes('CO-8')) moduleType = 'CO-8-A';
        
        window.doModuleTypes[index + 1] = moduleType;
        doModulesData.push({
            partNo: partNo,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value,
            type: moduleType
        });
    });
    localStorage.setItem('doModuleTypes', JSON.stringify(window.doModuleTypes));

    // Save AI modules
    const aiModulesData = extractRowData(document.querySelectorAll('.module-sheet[data-module-type="AI"] tbody tr'));

    // Save AO modules
    const aoModulesData = extractRowData(document.querySelectorAll('.module-sheet[data-module-type="AO"] tbody tr'));
    localStorage.setItem('aoModulesDetails', JSON.stringify(aoModulesData));

    // Save final counts and details
    localStorage.setItem('diModulesToTest', diCount);
    localStorage.setItem('doModulesToTest', doCount);
    localStorage.setItem('aiModulesToTest', aiCount);
    localStorage.setItem('processorCount', processorCount);
    localStorage.setItem('powerCount', powerCount);
    localStorage.setItem('diModulesDetails', JSON.stringify(diModulesData));
    localStorage.setItem('doModulesDetails', JSON.stringify(doModulesData));
    localStorage.setItem('aiModulesDetails', JSON.stringify(aiModulesData));
    localStorage.setItem('currentDIModule', 1);
    localStorage.setItem('currentDOModule', 1);
    localStorage.setItem('currentAIModule', 1);
    localStorage.setItem('comCount', comCount);
    localStorage.setItem('aoModulesToTest', aoCount);


    // ==========================================
    // 3. EXPORT PHASE (JSON, TXT, QR, PDF)
    // ==========================================
    try {
        showCustomAlert('Saving and Generating Backup Files...');

        // Create the Export Data Object
        const exportData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                exportData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                exportData[key] = localStorage.getItem(key);
            }
        }
        
        // Metadata setup
        const now = new Date();
        const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const contractNo = localStorage.getItem('session_contractNo') || 'ContractNo';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'SerialNo';
        
        exportData.metadata = {
            generationDate: now.toISOString(),
            rtuSerial: rtuSerial,
            contractNo: contractNo,
            testerName: localStorage.getItem('session_name') || 'N/A'
        };

        // A. DOWNLOAD JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `${dateformat}_BQ_BACKUP_${contractNo}_${rtuSerial}.json`);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);

        // B. DOWNLOAD TXT
        if (typeof generateTXTContent === 'function') {
            const txtContent = generateTXTContent();
            const txtDataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txtContent);
            const txtLinkElement = document.createElement('a');
            txtLinkElement.setAttribute('href', txtDataUri);
            txtLinkElement.setAttribute('download', `${dateformat}_QR_TXT_${contractNo}_${rtuSerial}.txt`);
            document.body.appendChild(txtLinkElement);
            txtLinkElement.click();
            document.body.removeChild(txtLinkElement);

            // C. GENERATE QR CODE
            if (typeof generateAndDownloadQRCode === 'function') {
                await generateAndDownloadQRCode(txtContent, dateformat, contractNo, rtuSerial);
            }
        }

        // D. GENERATE PDF (Called Here)
        if (typeof generateAndDownloadPDF === 'function') {
            await generateAndDownloadPDF(contractNo, rtuSerial);
        }

    } catch (error) {
        console.error('Export Warning:', error);
    }

    // ==========================================
    // 4. REDIRECT PHASE
    // ==========================================
    setTimeout(() => {
        window.location.href = './Pre-requisite.html';
    }, 1500); 
}


function validateAllModuleFields() {
    // Check if any sheets have been generated
    const sheets = document.querySelectorAll('#sheetsContainer .module-sheet');
    if (sheets.length === 0) {
        showCustomAlert('Please generate sheets first by clicking "Generate Sheets" button.');
        return false;
    }
    
    serialNumberTracker.clearAll();
    let duplicateDetails = [];
    
    // First, clear all previous error styles
    document.querySelectorAll('input[name$="_serial"]').forEach(input => {
        input.style.border = '';
    });

    // Validate Serial Number Checker's Name
    const checkerNameInput = document.getElementById('checkerName');
    if (checkerNameInput && checkerNameInput.style.display !== 'none') {
        const checkerName = checkerNameInput.value.trim();
        if (!checkerName) {
            showCustomAlert('Please enter Serial Number Checker\'s Name.');
            checkerNameInput.style.border = '2px solid red';
            checkerNameInput.focus();
            return false;
        } else {
            checkerNameInput.style.border = '';
        }
    }

    // Validate Vendor Number
    const vendorNumberInput = document.getElementById('vendorNumber');
    if (vendorNumberInput && vendorNumberInput.style.display !== 'none') {
        const vendorNumber = vendorNumberInput.value.trim();
        if (!vendorNumber) {
            showCustomAlert('Please enter Vendor Number.');
            vendorNumberInput.style.border = '2px solid red';
            vendorNumberInput.focus();
            return false;
        } else {
            vendorNumberInput.style.border = '';
        }
    }

    for (const sheet of sheets) {
        const tableRows = sheet.querySelectorAll('tbody tr');
        const moduleType = sheet.dataset.moduleType; // e.g., "DI", "COM", "Subrack"

        for (let i = 0; i < tableRows.length; i++) {
            const row = tableRows[i];
            const moduleNo = i + 1;
            
            // 1. Validate Part Number Selection
            const partNoSelect = row.querySelector('select');
            if (!partNoSelect?.value) {
                showCustomAlert(`Please select Part Number for ${moduleType} Module ${moduleNo}`);
                partNoSelect?.focus();
                return false;
            }

            // 2. Validate Text Inputs (Subrack, Slot, Serial)
            const inputs = row.querySelectorAll('input[required]');
            for (const input of inputs) {
                const value = input.value.trim();

                // Determine readable field name
                let fieldName = 'Field';
                if (input.name.includes('_subrack')) fieldName = 'Subrack No.';
                else if (input.name.includes('_slot')) fieldName = 'Slot No.';
                else if (input.name.includes('_serial')) fieldName = 'Serial No.';

                // CHECK A: Is it empty?
                if (!value) {
                    showCustomAlert(`Please fill in ${fieldName} for ${moduleType} Module ${moduleNo}`);
                    input.focus();
                    return false;
                }

                // CHECK B: Specific Slot Logic
                // For COM, DI, DO, AI, AO -> Slot cannot be "0"
                if (input.name.includes('_slot')) {
                    const nonZeroModules = ['COM', 'DI', 'DO', 'AI', 'AO'];
                    if (nonZeroModules.includes(moduleType) && value === '0') {
                        showCustomAlert(`Slot No. cannot be "0" for ${moduleType} Module ${moduleNo}. Please enter a valid slot number.`);
                        input.style.border = '2px solid red'; // Highlight error
                        input.focus();
                        return false;
                    } else {
                        input.style.border = ''; // Reset border if correct
                    }
                }
            }
            
            // Validate Serial Number format (12 digits)
            const serialInput = row.querySelector('input[name$="_serial"]');
            const serialValue = serialInput?.value.trim();
            if (serialValue) {
                // Check if serial number is exactly 12 digits
                if (!/^\d{12}$/.test(serialValue)) {
                    // Make the border red for invalid serial number
                    serialInput.style.border = '2px solid red';
                    showCustomAlert(`Serial Number for ${moduleType} Module ${moduleNo} must be exactly 12 digits.`);
                    serialInput.focus();
                    return false;
                } else {
                    // Ensure border is normal for valid serial numbers
                    serialInput.style.border = '';
                }
                
                if (serialNumberTracker.checkDuplicate(serialValue)) {
                    duplicateDetails.push({
                        serial: serialValue,
                        location1: serialNumberTracker.getDuplicateLocation(serialValue),
                        location2: `${moduleType} Module ${moduleNo}`
                    });
                } else {
                    serialNumberTracker.addSerial(serialValue, moduleType, moduleNo);
                }
            } 
        }
    }

    if (duplicateDetails.length > 0) {
        const duplicateMessages = duplicateDetails.map(d => 
            `'${d.serial}' is used in both ${d.location1} and ${d.location2}`
        );
        showCustomAlert(`Duplicate Serial Numbers found:\n${duplicateMessages.join('\n')}`);
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const backBtn = document.getElementById('backBtn');
    const submitBtn = document.getElementById('submitBtn');
    const sheetsContainer = document.getElementById('sheetsContainer');
    function saveBQDetails(diCount, diModulesData) {
        localStorage.setItem('diModulesToTest', diCount);
        localStorage.setItem('currentDIModule', 1);
        localStorage.setItem('diModulesDetails', JSON.stringify(diModulesData));
    }

    // Time tracking object
    const formTiming = {
        loginTime: null,
        generationStartTime: null,
        pdfGeneratedTime: null,
        getFormFillingTime: function() {
            if (!this.loginTime || !this.generationStartTime) return null;
            return (this.generationStartTime - this.loginTime) / 1000; // in seconds
        }
    };

    // --- Initial Setup for logo click ---
    const logoElement = document.getElementById("logo");
    if (logoElement) {
        logoElement.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // --- Function to load user data from session storage ---
    function loadUserData() {
        const nameInput = document.getElementById('name');
        const designationInput = document.getElementById('designation');
        const experienceInput = document.getElementById('experience');
        formTiming.loginTime = new Date();

        if (nameInput) nameInput.value = localStorage.getItem('session_name') || '';
        if (designationInput) designationInput.value = localStorage.getItem('session_designation') || '';
        if (experienceInput) experienceInput.value = localStorage.getItem('session_experience') || '';

        const sessionUsername = localStorage.getItem('session_username');
        const sessionRtuSerial = localStorage.getItem('session_rtuSerial');
        const sessionName = localStorage.getItem('session_name');
        const sessionDesignation = localStorage.getItem('session_designation');
        const sessionExperience = localStorage.getItem('session_experience');
        const sessionContractNo = localStorage.getItem('session_contractNo');


        userData = {
            username: sessionUsername,
            rtuSerial: sessionRtuSerial,
            name: sessionName || 'N/A',
            designation: sessionDesignation || 'N/A',
            experience: sessionExperience || '0',
            contractNo: sessionContractNo || 'N/A'
        };
        console.log("User data loaded:", userData);
        return true;
    }

    // --- Utility Functions ---
    function showCustomAlert(message) {
        const existingAlert = document.getElementById('customAlertBox');
        if (existingAlert) existingAlert.remove();
        const messageBox = document.createElement('div');
        messageBox.id = 'customAlertBox';
        messageBox.textContent = message;
        messageBox.style.cssText = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index:1001; text-align: center;";
        document.body.appendChild(messageBox);
        setTimeout(() => messageBox.remove(), 3000);
    }

    // --- Session Storage and Data Persistence ---
    function saveCurrentBQCounts() {
        const subrackCountInput = document.getElementById('subrackCount');
        const processorCountInput = document.getElementById('processorCount');
        const powerCountInput = document.getElementById('powerCount');
        const comCountInput = document.getElementById('comCount')
        const diCountInput = document.getElementById('diCount');
        const doCountInput = document.getElementById('doCount');
        const aiCountInput = document.getElementById('aiCount');
        const aoCountInput = document.getElementById('aoCount');
        if (subrackCountInput) localStorage.setItem('session_subrackCount', subrackCountInput.value);
        if (processorCountInput) localStorage.setItem('session_processorCount', processorCountInput.value);
        if (powerCountInput) localStorage.setItem('session_powerCount', powerCountInput.value);
        if (comCountInput) localStorage.setItem('session_comCount', comCountInput.value);
        if (diCountInput) localStorage.setItem('session_diCount', diCountInput.value);
        if (doCountInput) localStorage.setItem('session_doCount', doCountInput.value);
        if (aiCountInput) localStorage.setItem('session_aiCount', aiCountInput.value);
        if (aoCountInput) localStorage.setItem('session_aoCount', aoCountInput.value);
        
        // Save checker name
        const checkerNameInput = document.getElementById('checkerName');
        if (checkerNameInput) localStorage.setItem('session_checkerName', checkerNameInput.value);
        
        // Save vendor number
        const vendorNumberInput = document.getElementById('vendorNumber');
        if (vendorNumberInput) localStorage.setItem('session_vendorNumber', vendorNumberInput.value);
        
        const moduleData = gatherAllModuleData();
        localStorage.setItem('currentModuleData', JSON.stringify(moduleData));
    }

    function loadBQCounts() {
        const subrackCountInput = document.getElementById('subrackCount');
        const processorCountInput = document.getElementById('processorCount');
        const powerCountInput = document.getElementById('powerCount');
        const comCountInput = document.getElementById('comCount');
        const diCountInput = document.getElementById('diCount');
        const doCountInput = document.getElementById('doCount');
        const aiCountInput = document.getElementById('aiCount');
        const aoCountInput = document.getElementById('aoCount');

        // Helper function to safely parse localStorage values
        const getParsedValue = (key) => {
            const value = localStorage.getItem(key);
            if (value === null) return '0';
            try {
                // Try to parse JSON first (in case it's a stringified number)
                const parsed = JSON.parse(value);
                return String(parsed);
            } catch (e) {
                // If not JSON, use directly (but remove any quotes)
                return value.replace(/"/g, '');
            }
        };

        // Load and set values from localStorage
        if (subrackCountInput) subrackCountInput.value = getParsedValue('session_subrackCount');
        if (processorCountInput) processorCountInput.value = getParsedValue('session_processorCount');
        if (powerCountInput) powerCountInput.value = getParsedValue('session_powerCount');
        if (comCountInput) comCountInput.value = getParsedValue('session_comCount');
        if (diCountInput) diCountInput.value = getParsedValue('session_diCount');
        if (doCountInput) doCountInput.value = getParsedValue('session_doCount');
        if (aiCountInput) aiCountInput.value = getParsedValue('session_aiCount');
        if (aoCountInput) aoCountInput.value = getParsedValue('session_aoCount');

        const subrackCount = parseInt(subrackCountInput?.value) || 0;
        const processorCount = parseInt(processorCountInput?.value) || 0;
        const powerCount = parseInt(powerCountInput?.value) || 0;
        const comCount = parseInt(comCountInput?.value) || 0;
        const diCount = parseInt(diCountInput?.value) || 0;
        const doCount = parseInt(doCountInput?.value) || 0;
        const aiCount = parseInt(aiCountInput?.value) || 0;
        const aoCount = parseInt(aoCountInput?.value) || 0;

        const totalCount = subrackCount + processorCount + powerCount + 
                        comCount + diCount + doCount + 
                        aiCount + aoCount;
        
        if (totalCount > 0 && sheetsContainer) {
            sheetsContainer.innerHTML = "";
            
            if (subrackCount > 0) sheetsContainer.appendChild(createSUBRACKSheet(subrackCount));
            if (processorCount > 0) sheetsContainer.appendChild(createPROCESSORSheet(processorCount));
            if (comCount > 0) sheetsContainer.appendChild(createCOMSheet(comCount));
            if (diCount > 0) sheetsContainer.appendChild(createDISheet(diCount));
            if (doCount > 0) sheetsContainer.appendChild(createDOSheet(doCount));
            if (aiCount > 0) sheetsContainer.appendChild(createAISheet(aiCount));
            if (aoCount > 0) sheetsContainer.appendChild(createAOSheet(aoCount));
            if (powerCount > 0) sheetsContainer.appendChild(createPOWERSheet(powerCount));
            
            restoreModuleData();
        }
        const savedModuleData = JSON.parse(localStorage.getItem('currentModuleData'));
        if (savedModuleData) {
            document.querySelectorAll('.module-sheet').forEach(sheet => {
                const moduleType = sheet.dataset.moduleType;
                const rows = sheet.querySelectorAll('tbody tr');
                
                if (savedModuleData[moduleType]) {
                    rows.forEach((row, index) => {
                        if (index < savedModuleData[moduleType].length) {
                            const data = savedModuleData[moduleType][index];
                            if (!data) return;
                            
                            const partNoSelect = row.querySelector('select[name$="_part_no"]');
                            if (partNoSelect && data.partNo) partNoSelect.value = data.partNo;
                            
                            const subrackInput = row.querySelector('input[name$="_subrack"]');
                            if (subrackInput && data.subrack) subrackInput.value = data.subrack;
                            
                            const slotInput = row.querySelector('input[name$="_slot"]');
                            if (slotInput && data.slot) slotInput.value = data.slot;
                            
                            const serialInput = row.querySelector('input[name$="_serial"]');
                            if (serialInput && data.serial) serialInput.value = data.serial;
                        }
                    });
                }
            });
        }
        const checkerNameInput = document.getElementById('checkerName');
        if (checkerNameInput) {
            checkerNameInput.value = localStorage.getItem('session_checkerName') || '';
        }

        // Load vendor number
        const vendorNumberInput = document.getElementById('vendorNumber');
        if (vendorNumberInput) {
            vendorNumberInput.value = localStorage.getItem('session_vendorNumber') || '';
        }

        // Show checker name section if there are modules
        const sheets = document.querySelectorAll('#sheetsContainer .module-sheet');
        const checkerNameSection = document.getElementById('checkerNameSection');
        if (checkerNameSection && sheets.length > 0) {
            checkerNameSection.style.display = 'block';
        }

        // Show vendor number section if there are modules
        const vendorNumberSection = document.getElementById('vendorNumberSection');
        if (vendorNumberSection && sheets.length > 0) {
            vendorNumberSection.style.display = 'block';
        }
    }

    // --- Dynamic Sheet Creation Functions ---
function createModuleSheetBase(count, moduleType, partNumbers) {
    const container = document.createElement('div');
    container.className = 'module-sheet';
    container.dataset.moduleType = moduleType;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'sheet-header';
    const h3 = document.createElement('h3');
    h3.textContent = `${moduleType.toUpperCase()} Modules (${count})`;
    const label = document.createElement('span');
    label.className = `module-type ${moduleType.toLowerCase()}`;
    label.textContent = moduleType.toUpperCase();
    headerDiv.appendChild(h3);
    headerDiv.appendChild(label);
    container.appendChild(headerDiv);
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    ['Module No.', 'Part Number', 'Subrack No.', 'Slot No.', 'Serial No.'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    for (let i = 1; i <= count; i++) {
        const row = document.createElement('tr');
        
        row.insertCell().textContent = i;
        
        const cellPartNo = row.insertCell();
        const partNoSelect = document.createElement('select');
        partNoSelect.name = `${moduleType.toLowerCase()}_${i}_part_no`;
        partNoSelect.required = true;
        const placeholderOption = document.createElement('option');
        placeholderOption.value = "";
        placeholderOption.textContent = "-- Select Part --";
        placeholderOption.disabled = true;
        partNoSelect.appendChild(placeholderOption);

        partNumbers.forEach(part => {
            const option = document.createElement('option');
            option.value = part;
            option.textContent = part;
            partNoSelect.appendChild(option);
        });
        if (partNumbers.length > 0) partNoSelect.value = partNumbers[0];
        cellPartNo.appendChild(partNoSelect);

        const subrackCell = row.insertCell();
        const subrackInput = document.createElement('input');
        subrackInput.type = 'number';
        subrackInput.name = `${moduleType.toLowerCase()}_${i}_subrack`;
        subrackInput.placeholder = 'Enter subrack';
        subrackInput.required = true;
        subrackCell.appendChild(subrackInput);

        // --- SLOT NUMBER SECTION ---
        const slotCell = row.insertCell();
        const slotInput = document.createElement('input');
        slotInput.type = 'number';
        slotInput.name = `${moduleType.toLowerCase()}_${i}_slot`;
        slotInput.placeholder = 'Enter slot';
        slotInput.required = true;

        // === NEW CODE ADDED BELOW ===
        // Check if the current module is Subrack, Power, or Processor
        // and set default value to 0
        if (['Subrack', 'Power', 'Processor'].includes(moduleType)) {
            slotInput.value = '0';
        }
        // ============================

        slotCell.appendChild(slotInput);

        const serialCell = row.insertCell();
        const serialInput = document.createElement('input');
        serialInput.type = 'number';
        serialInput.name = `${moduleType.toLowerCase()}_${i}_serial`;
        serialInput.placeholder = 'Enter serial number';
        serialInput.required = true;
        serialCell.appendChild(serialInput);

        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    container.appendChild(table);
    
    return container; 
}


    function createSUBRACKSheet(count) { return createModuleSheetBase(count, 'Subrack', [' Subrack 19"', 'Subrack 2/3 19"', 'Subrack 1/2 19"']); }
    function createPROCESSORSheet(count) { return createModuleSheetBase(count, 'Processor', ['MCU-1-A', 'MCU-4-A']); }
    function createPOWERSheet(count) { return createModuleSheetBase(count, 'Power', ['POWER-24V-A', 'POWER-110/220V']); }
    function createCOMSheet(count) { return createModuleSheetBase(count, 'COM', ['COM-6-A']); }
    function createDISheet(count) { return createModuleSheetBase(count, 'DI', ['DI-32-24V', 'DI-16-24V-A']); }
    function createDOSheet(count) { return createModuleSheetBase(count, 'DO', ['CO-16-A', 'CO-8-A']); }
    function createAISheet(count) { return createModuleSheetBase(count, 'AI', ['DCAI-8-A']); }
    function createAOSheet(count) { return createModuleSheetBase(count, 'AO', ['AO-2']); }
    
    // --- Initialize Page ---
    if (!loadUserData()) {
        return; // Stop script execution if user data is invalid
    }
    loadBQCounts();

    // --- Event Listeners ---
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            saveCurrentBQCounts();
            const subrackCount = parseInt(document.getElementById('subrackCount')?.value) || 0;
            const processorCount = parseInt(document.getElementById('processorCount')?.value) || 0;
            const powerCount = parseInt(document.getElementById('powerCount')?.value) || 0;
            const comCount = parseInt(document.getElementById('comCount')?.value) || 0;
            const diCount = parseInt(document.getElementById('diCount')?.value) || 0;
            const doCount = parseInt(document.getElementById('doCount')?.value) || 0;
            const aiCount = parseInt(document.getElementById('aiCount')?.value) || 0;
            const aoCount = parseInt(document.getElementById('aoCount')?.value) || 0;
            
            // --- FIX IS HERE: Sum ALL inputs ---
            const totalCount = subrackCount + processorCount + powerCount + comCount + diCount + doCount + aiCount + aoCount;
            
            if (totalCount === 0) {
                showCustomAlert('Please enter at least one module count to generate sheets.');
                return;
            }
            
            // Save all current module data before regenerating
            const allCurrentData = {};
            document.querySelectorAll('.module-sheet').forEach(sheet => {
                const moduleType = sheet.dataset.moduleType;
                const rows = sheet.querySelectorAll('tbody tr');
                const moduleData = [];
                
                rows.forEach((row, index) => {
                    moduleData.push({
                        partNo: row.querySelector('select[name$="_part_no"]')?.value,
                        subrack: row.querySelector('input[name$="_subrack"]')?.value,
                        slot: row.querySelector('input[name$="_slot"]')?.value,
                        serial: row.querySelector('input[name$="_serial"]')?.value
                    });
                });
                
                allCurrentData[moduleType] = moduleData;
            });
            
            serialNumberTracker.clearAll();
            if (sheetsContainer) sheetsContainer.innerHTML = "";
            
            // Generate new sheets
            // 1. Subrack
            if (subrackCount > 0 && sheetsContainer) sheetsContainer.appendChild(createSUBRACKSheet(subrackCount));
            // 2. Processor
            if (processorCount > 0 && sheetsContainer) sheetsContainer.appendChild(createPROCESSORSheet(processorCount));
            // 3. COM
            if (comCount > 0 && sheetsContainer) sheetsContainer.appendChild(createCOMSheet(comCount));
            // 4. DI
            if (diCount > 0 && sheetsContainer) sheetsContainer.appendChild(createDISheet(diCount));
            // 5. DO
            if (doCount > 0 && sheetsContainer) sheetsContainer.appendChild(createDOSheet(doCount));
            // 6. AI
            if (aiCount > 0 && sheetsContainer) sheetsContainer.appendChild(createAISheet(aiCount));
            // 7. AO
            if (aoCount > 0 && sheetsContainer) sheetsContainer.appendChild(createAOSheet(aoCount));
            // 8. Power (At the bottom)
            if (powerCount > 0 && sheetsContainer) sheetsContainer.appendChild(createPOWERSheet(powerCount));
       
            // Show the checker name section
            const checkerNameSection = document.getElementById('checkerNameSection');
            if (checkerNameSection) {
                checkerNameSection.style.display = 'block';
            }
            
            // Show the vendor number section
            const vendorNumberSection = document.getElementById('vendorNumberSection');
            if (vendorNumberSection) {
                vendorNumberSection.style.display = 'block';
            }
            
            // Restore data for all modules
            document.querySelectorAll('.module-sheet').forEach(sheet => {
                const moduleType = sheet.dataset.moduleType;
                const rows = sheet.querySelectorAll('tbody tr');
                
                if (allCurrentData[moduleType]) {
                    rows.forEach((row, index) => {
                        if (index < allCurrentData[moduleType].length) {
                            const data = allCurrentData[moduleType][index];
                            if (!data) return;
                            
                            const partNoSelect = row.querySelector('select[name$="_part_no"]');
                            if (partNoSelect && data.partNo) partNoSelect.value = data.partNo;
                            
                            const subrackInput = row.querySelector('input[name$="_subrack"]');
                            if (subrackInput && data.subrack) subrackInput.value = data.subrack;
                            
                            const slotInput = row.querySelector('input[name$="_slot"]');
                            if (slotInput && data.slot) slotInput.value = data.slot;
                            
                            const serialInput = row.querySelector('input[name$="_serial"]');
                            if (serialInput && data.serial) {
                                serialInput.value = data.serial;
                                serialNumberTracker.addSerial(data.serial, moduleType, index + 1);
                            }
                        }
                    });
                }
                updatePartNumberSummary(sheet);
            });
        });
    }

    if (sheetsContainer) {
        sheetsContainer.addEventListener('change', function(event) {
            if (event.target && event.target.matches('select[name$="_part_no"]')) {
                const moduleSheet = event.target.closest('.module-sheet');
                if (moduleSheet) {
                    updatePartNumberSummary(moduleSheet);
                }
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (sheetsContainer) sheetsContainer.innerHTML = "";
            ['diCount','doCount','aiCount','aoCount', 'subrackCount', 'processorCount', 'powerCount', 'comCount'].forEach(id => {
                const inputEl = document.getElementById(id);
                if (inputEl) inputEl.value = '0';
            });
            serialNumberTracker.clearAll();
            saveCurrentBQCounts();
            
            // Hide the checker name section when clearing
            const checkerNameSection = document.getElementById('checkerNameSection');
            if (checkerNameSection) {
                checkerNameSection.style.display = 'none';
            }
            
            // Hide the vendor number section when clearing
            const vendorNumberSection = document.getElementById('vendorNumberSection');
            if (vendorNumberSection) {
                vendorNumberSection.style.display = 'none';
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            saveCurrentBQCounts();
            window.location.href = './rtudetail.html';
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            saveCurrentBQCounts();
            formTiming.generationStartTime = new Date();

            const totalModules = ['diCount', 'doCount', 'aiCount', 'aoCount', 'subrackCount', 'processorCount', 'powerCount', 'comCount']
                .reduce((sum, id) => sum + (parseInt(document.getElementById(id)?.value) || 0), 0);

            if (totalModules === 0) {
                showCustomAlert("Please enter module quantities and generate sheets before submitting.");
                return;
            }
            if (!userData || !userData.rtuSerial) {
                showCustomAlert("User data is missing. Cannot generate report. Please log in again.");
                return;
            }
            if (!sheetsContainer || sheetsContainer.children.length === 0) {
                showCustomAlert("Please click 'Generate Sheets' first to create the forms for your modules.");
                return;
            }
            if (!validateAllModuleFields()) {
                return; 
            }
            
            // Call the main goToNext function
            window.goToNext();  // Use window.goToNext to be explicit
        });
    }

document.getElementById('exportBtn').addEventListener('click', async function() {
    
    // --- PART 1: VALIDATION BLOCK ---
    // Select all inputs ending in "_serial"
    const serialInputs = document.querySelectorAll('input[name$="_serial"]');
    
    for (const input of serialInputs) {
        const serialValue = input.value.trim();

        // Check if value is NOT 12 digits
        // Note: This regex (!/^\d{12}$/) will fail if the field is empty OR if it has the wrong number of digits.
        if (!/^\d{12}$/.test(serialValue)) {
            
            // 1. Highlight the bad input
            input.style.border = '2px solid red';
            
            // 2. Scroll to and focus the bad input so the user sees it
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            input.focus();
            
            // 3. Show Alert
            // We try to find the module name for a better error message, if possible
            // Assuming the input is inside a row with some identifier, otherwise generic message
            showCustomAlert('Export Blocked: Found a serial number that is not exactly 12 digits. Please correct the highlighted field.');
            
            // 4. STOP THE EXPORT IMMEDIATELY
            return; 
        } else {
            // If valid, ensure border is clean
            input.style.border = '';
        }
    }
    // --------------------------------


    // --- PART 2: EXPORT LOGIC (Only runs if Part 1 passes) ---
    try {
        // Create the data structure similar to generateJSON.js
        const exportData = {};
        
        // Copy all localStorage items
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                // Try to parse JSON data
                exportData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                // If not JSON, store as text
                exportData[key] = localStorage.getItem(key);
            }
        }
        
        // Add the current module data from the form
        const moduleData = gatherAllModuleData();
        exportData.currentModuleData = moduleData;
        
        // Add required metadata
        exportData.metadata = {
            generationDate: new Date().toISOString(),
            rtuSerial: localStorage.getItem('session_rtuSerial') || 'N/A',
            contractNo: localStorage.getItem('session_contractNo') || 'N/A',
            testerName: localStorage.getItem('session_name') || 'N/A'
        };
        
        // Create date format: YYYYMMDD
        const now = new Date();
        const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        
        const contractNo = localStorage.getItem('session_contractNo') || 'ContractNo';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'SerialNo';
        
        // Create and trigger download for JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `${dateformat}_BQ_BACKUP_${contractNo}_${rtuSerial}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        // Generate and download TXT file with similar naming
        const txtContent = generateTXTContent();
        const txtDataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txtContent);
        const txtFileName = `${dateformat}_QR_TXT_${contractNo}_${rtuSerial}.txt`;
        
        const txtLinkElement = document.createElement('a');
        txtLinkElement.setAttribute('href', txtDataUri);
        txtLinkElement.setAttribute('download', txtFileName);
        document.body.appendChild(txtLinkElement);
        txtLinkElement.click();
        document.body.removeChild(txtLinkElement);
        
        // Generate and download QR Code with a small delay
        setTimeout(async () => {
            const qrSuccess = await generateAndDownloadQRCode(txtContent, dateformat, contractNo, rtuSerial);
            if (qrSuccess) {
                showCustomAlert('Configuration exported successfully as JSON, TXT, and QR Code files!');
            } else {
                showCustomAlert('Configuration exported as JSON and TXT files, but QR code generation failed.');
            }
        }, 500);
        
    } catch (error) {
        console.error('Error during export:', error);
        showCustomAlert('Error during export: ' + error.message);
    }
});
    

    document.addEventListener('input', function(event) {
        if (event.target && event.target.matches('input[name$="_serial"]')) {
            const serialInput = event.target;
            const serialValue = serialInput.value.trim();
            
            // Remove any existing error styling when user starts typing
            if (serialValue.length > 0) {
                if (!/^\d{12}$/.test(serialValue)) {
                    serialInput.style.border = '2px solid red';
                } else {
                    serialInput.style.border = '2px solid green'; // Optional: green for valid
                }
            } else {
                serialInput.style.border = ''; // Reset to default when empty
            }
        }
    });

    // Make the function available globally
    window.validateAllModuleFields = validateAllModuleFields;
    navigationGuard.markPageAsCompleted();
    window.goToNext = goToNext;

});

async function generateAndDownloadPDF(contractNo, rtuSerial) {
    // Ensure jsPDF is loaded
    if (!window.jspdf) {
        console.error("jsPDF library not found");
        return false;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // --- 1. Header Information ---
    const now = new Date();

    // 1. Get the day and pad with '0' if it's single digit
    const day = String(now.getDate()).padStart(2, '0');

    // 2. Get the month (Add 1 because months are 0-indexed: Jan=0, Dec=11)
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // 3. Get the full year
    const year = now.getFullYear();

    // 4. Combine them
    const dateString = `${day}/${month}/${year}`;

    console.log(dateString); // Output: 09/12/2025

    const testerName = localStorage.getItem('session_checkerName') || 'N/A';
    const vendorNum = localStorage.getItem('session_vendorNumber') || 'N/A';

    doc.setFontSize(18);
    doc.text(`RTU Serial Number List for ${contractNo} | ${rtuSerial}`, 14, 20);


    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${dateString}`, 14, 26);
    
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Contract No: ${contractNo}`, 14, 35);
    doc.text(`RTU Serial No: ${rtuSerial}`, 14, 40);
    doc.text(`Vendor No: ${vendorNum}`, 14, 45);
    doc.text(`Tester: ${testerName}`, 14, 50);

    // --- 2. Define Module Order & Colors ---
    // You can customize HEX colors here
    const moduleConfig = [
        { type: 'Subrack', color: '#808080' }, // Gray
        { type: 'Processor', color: '#0000FF' }, // Blue (Requested)
        { type: 'COM', color: '#2E8B57' },      // SeaGreen
        { type: 'DI', color: '#FFA500' },       // Orange
        { type: 'DO', color: '#800080' },       // Purple
        { type: 'AI', color: '#008080' },       // Teal
        { type: 'AO', color: '#DAA520' },       // GoldenRod
        { type: 'Power', color: '#FF0000' }     // Red (Requested)
    ];

    // Get Data
    const allData = gatherAllModuleData();
    let currentY = 55; // Start position for first table

    // --- 3. Generate Tables ---
    moduleConfig.forEach(config => {
        const modules = allData[config.type];

        // Only generate table if data exists for this module type
        if (modules && modules.length > 0) {
            
            // Prepare Table Body
            const tableBody = modules.map((m, index) => [
                index + 1,
                m.partNo || '-',
                m.subrack || '-',
                (m.slot == '0' || m.slot === 0) ? 'N/A' : (m.slot || '-'),                
                m.serial || '-'
            ]);

            // Generate Table
            doc.autoTable({
                startY: currentY + 5,
                head: [[`${config.type} Module`, 'Part Number', 'Subrack', 'Slot', 'Serial No.']],
                body: tableBody,
                theme: 'grid',
                headStyles: { 
                    fillColor: config.color, 
                    textColor: 255, 
                    fontStyle: 'bold',
                    halign: 'center' 
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 25 }, // No.
                    1: { halign : 'center', cellWidth: 50 }, // Part No
                    2: { halign: 'center' }, // Subrack
                    3: { halign: 'center' }, // Slot
                    4: { halign: 'center' }  // Serial
                },
                didDrawPage: function (data) {
                    // Update currentY to the end of this table so the next one starts below it
                    currentY = data.cursor.y;
                },
                margin: { top: 20 } 
            });
            
            // Update Y for next loop (in case table didn't break page)
            currentY = doc.lastAutoTable.finalY;
        }
    });

    // --- 4. Save File ---
    const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const filename = `${dateformat}_RTU_SERIAL_NUMBER_LIST_${contractNo}_${rtuSerial}.pdf`;
    
    doc.save(filename);
    return true;
}

function restoreModuleData() {
    const sheets = document.querySelectorAll('#sheetsContainer .module-sheet');
    
    sheets.forEach(sheet => {
        const moduleType = sheet.dataset.moduleType;
        const rows = sheet.querySelectorAll('tbody tr');
        
        rows.forEach((row, index) => {
            const moduleNo = index + 1;
            const savedData = JSON.parse(localStorage.getItem(`${moduleType.toLowerCase()}ModulesDetails`))?.[index];
            
            if (savedData) {
                // Restore part number
                const partNoSelect = row.querySelector('select[name$="_part_no"]');
                if (partNoSelect && savedData.partNo) {
                    partNoSelect.value = savedData.partNo;
                }
                
                // Restore subrack, slot, and serial
                const subrackInput = row.querySelector('input[name$="_subrack"]');
                if (subrackInput && savedData.subrack) {
                    subrackInput.value = savedData.subrack;
                }
                
                const slotInput = row.querySelector('input[name$="_slot"]');
                if (slotInput && savedData.slot) {
                    slotInput.value = savedData.slot;
                }
                
                const serialInput = row.querySelector('input[name$="_serial"]');
                if (serialInput && savedData.serial) {
                    serialInput.value = savedData.serial;
                    // Add to serial number tracker
                    serialNumberTracker.addSerial(savedData.serial, moduleType, moduleNo);
                }
                
                // Update part number summary
                updatePartNumberSummary(sheet);
            }
        });
    });
}

function gatherAllModuleData() {
    const sheets = document.querySelectorAll('#sheetsContainer .module-sheet');
    const moduleData = {};
    
    sheets.forEach(sheet => {
        const moduleType = sheet.dataset.moduleType;
        const rows = sheet.querySelectorAll('tbody tr');
        const moduleArray = [];
        
        rows.forEach((row, index) => {
            moduleArray.push({
                partNo: row.querySelector('select[name$="_part_no"]')?.value,
                subrack: row.querySelector('input[name$="_subrack"]')?.value,
                slot: row.querySelector('input[name$="_slot"]')?.value,
                serial: row.querySelector('input[name$="_serial"]')?.value,
                type: moduleType === 'DI' || moduleType === 'DO' ? 
                     (moduleType === 'DI') ?
                      (row.querySelector('select[name$="_part_no"]')?.value.includes('DI-16') ? 'DI-16' : 'DI-32') :
                      (row.querySelector('select[name$="_part_no"]')?.value.includes('CO-8') ? 'CO-8-A' : 'CO-16-A') :
                     undefined
            });
        });
        
        moduleData[moduleType] = moduleArray;
    });
    
    return moduleData;
}

function generateTXTContent() {
    const contractNo = localStorage.getItem('session_contractNo') || 'xxxxxx';
    const rtuSerial = localStorage.getItem('session_rtuSerial') || '';
    const vendorNumber = document.getElementById('vendorNumber')?.value || localStorage.getItem('session_vendorNumber') || '(VENDOR NUMBER)';
    
    // Gather all module data
    const moduleData = gatherAllModuleData();
    
    // Initialize txtContent variable
    let txtContent = '';
    
    txtContent += `${contractNo} |\n`;
    txtContent += `${vendorNumber} |\n`;
    txtContent += `RTU DONGFANG 1725 IED |\n`;
    txtContent += `DF1725IED |\n`;
    txtContent += `DONGFANG |\n`;
    txtContent += `CN |\n`;
    txtContent += `${rtuSerial} |\n`;
    
    // Subrack modules
    if (moduleData.Subrack && moduleData.Subrack.length > 0) {
        moduleData.Subrack.forEach((subrack, index) => {
            if (subrack.serial) {
                txtContent += `DF1725IED,SUBRACK SN ${subrack.serial} |\n`;
            }
        });
    }
    txtContent += `||\n`;
    
    // Power modules
    if (moduleData.Power && moduleData.Power.length > 0) {
        moduleData.Power.forEach((power, index) => {
            if (power.serial) {
                const powerType = power.partNo || 'POWER';
                txtContent += `DF1725IED,${powerType} SN ${power.serial} |\n`;
            }
        });
    }
    txtContent += `||\n`;
    txtContent += `||\n`;
    txtContent += `||\n`;
    
    // Processor modules
    if (moduleData.Processor && moduleData.Processor.length > 0) {
        moduleData.Processor.forEach((processor, index) => {
            if (processor.serial) {
                const processorType = processor.partNo || 'MCU';
                txtContent += `DF1725IED,${processorType} SN ${processor.serial} |\n`;
            }
        });
    }
    txtContent += `||\n`;
    txtContent += `||\n`;
    txtContent += `||\n`;
    
    // DI modules
    if (moduleData.DI && moduleData.DI.length > 0) {
        moduleData.DI.forEach((di, index) => {
            if (di.serial) {
                const diNumber = index + 1;
                txtContent += `DF1725IED,DI ${diNumber} SN ${di.serial} |\n`;
            }
        });
    }
    txtContent += `||\n`;
    txtContent += `||\n`;
    txtContent += `||\n`;
    
    // DO modules
    if (moduleData.DO && moduleData.DO.length > 0) {
        moduleData.DO.forEach((doModule, index) => {
            if (doModule.serial) {
                const doNumber = index + 1;
                txtContent += `DF1725IED,CO ${doNumber} SN ${doModule.serial} |\n`;
            }
        });
    }
    txtContent += `||\n`;
    txtContent += `||\n`;
    
    // AI modules
    if (moduleData.AI && moduleData.AI.length > 0) {
        moduleData.AI.forEach((ai, index) => {
            if (ai.serial) {
                const aiNumber = index + 1;
                txtContent += `DF1725IED,DCAI ${aiNumber} SN ${ai.serial} |\n`;
            }
        });
    }
    txtContent += `||\n`;
    txtContent += `||\n`;
    txtContent += `||\n`;
    txtContent += `||\n`;
    txtContent += `||\n`;
    txtContent += `||\n`;
    txtContent += `||\n`;
    
    return txtContent;
}


function generateAndDownloadQRCode(txtContent, dateformat, contractNo, rtuSerial) {
    try {
        console.log("Starting QR code generation with alternative method...");
        
        // Use qrcode-generator library
        const typeNumber = 0; // Auto detect type
        const errorCorrectionLevel = 'L';
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(txtContent);
        qr.make();
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        const size = 400;
        const cellSize = size / qr.getModuleCount();
        const margin = 2;
        const totalSize = size + margin * 2 * cellSize;
        
        canvas.width = totalSize;
        canvas.height = totalSize;
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, totalSize, totalSize);
        
        // Draw QR code
        ctx.fillStyle = '#000000';
        for (let row = 0; row < qr.getModuleCount(); row++) {
            for (let col = 0; col < qr.getModuleCount(); col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(
                        margin * cellSize + col * cellSize,
                        margin * cellSize + row * cellSize,
                        cellSize,
                        cellSize
                    );
                }
            }
        }
        
        // Convert to data URL and download
        const qrDataUrl = canvas.toDataURL('image/png');
        
        const qrLink = document.createElement('a');
        qrLink.href = qrDataUrl;
        qrLink.download = `${dateformat}_QR_CODE_${contractNo}_${rtuSerial}.png`;
        document.body.appendChild(qrLink);
        qrLink.click();
        document.body.removeChild(qrLink);
        
        console.log("QR code generated successfully with alternative method");
        return true;
        
    } catch (error) {
        console.error('Error generating QR code with alternative method:', error);
        showCustomAlert('Error generating QR code: ' + error.message);
        return false;
    }
}