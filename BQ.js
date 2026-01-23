let userData = {};
window.diTestResults = {};
window.diModuleTypes = {};
const serialNumberTracker = {
    usedSerials: new Map(),
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
    
    const partCounts = {};
    partNoSelects.forEach(select => {
        const partNo = select.value;
        partCounts[partNo] = (partCounts[partNo] || 0) + 1;
    });
    
    const summaryParts = [];
    for (const [partNo, count] of Object.entries(partCounts)) {
        summaryParts.push(`${count}x ${partNo}`);
    }
    
    summaryElement.textContent = summaryParts.join(', ') || 'No parts selected';
}

async function goToNext() {
    window.formTiming = window.formTiming || {};

    // 1. ENABLED VALIDATION
    if (typeof validateAllModuleFields === 'function') {
        if (!validateAllModuleFields()) return;
    }

    // 2. Initialize types
    if (!window.diModuleTypes) window.diModuleTypes = {};
    if (!window.doModuleTypes) window.doModuleTypes = {};

    // 3. Save Headers
    const checkerName = document.getElementById('checkerName')?.value || '';
    const vendorNumber = document.getElementById('vendorNumber')?.value || '';

    localStorage.setItem('checkerName', checkerName);
    localStorage.setItem('vendorNumber', vendorNumber);
    localStorage.setItem('session_checkerName', checkerName);
    localStorage.setItem('session_vendorNumber', vendorNumber);

    // 4. Save Counts
    const processorCount = parseInt(document.getElementById('processorCount').value) || 0;
    const powerCount = parseInt(document.getElementById('powerCount').value) || 0;
    const diCount = parseInt(document.getElementById('diCount').value) || 0;
    const doCount = parseInt(document.getElementById('doCount').value) || 0;
    const aiCount = parseInt(document.getElementById('aiCount').value) || 0;
    const comCount = parseInt(document.getElementById('comCount').value) || 0;
    const aoCount = parseInt(document.getElementById('aoCount')?.value) || 0;

    // 5. Helper to extract data
    const extractRowData = (selector) => {
        const rows = document.querySelectorAll(selector);
        return [...rows].map(row => ({
            partNo: row.querySelector('select[name$="_part_no"]')?.value || '',
            subrack: row.querySelector('input[name$="_subrack"]')?.value || '',
            slot: row.querySelector('input[name$="_slot"]')?.value || '',
            serial: row.querySelector('input[name$="_serial"]')?.value || ''
        }));
    };

    // 6. Save Module Details to LocalStorage
    localStorage.setItem('processorModulesDetails', JSON.stringify(extractRowData('.module-sheet[data-module-type="Processor"] tbody tr')));
    localStorage.setItem('powerModulesDetails', JSON.stringify(extractRowData('.module-sheet[data-module-type="Power"] tbody tr')));
    localStorage.setItem('subrackModulesDetails', JSON.stringify(extractRowData('.module-sheet[data-module-type="Subrack"] tbody tr')));
    localStorage.setItem('comModulesDetails', JSON.stringify(extractRowData('.module-sheet[data-module-type="COM"] tbody tr')));
    localStorage.setItem('aiModulesDetails', JSON.stringify(extractRowData('.module-sheet[data-module-type="AI"] tbody tr')));
    localStorage.setItem('aoModulesDetails', JSON.stringify(extractRowData('.module-sheet[data-module-type="AO"] tbody tr')));

    const diModulesData = [];
    document.querySelectorAll('.module-sheet[data-module-type="DI"] tbody tr').forEach((row, i) => {
        const partNo = row.querySelector('select[name$="_part_no"]')?.value;
        const type = partNo?.includes('DI-16') ? 'DI-16' : 'DI-32';
        window.diModuleTypes[i + 1] = type;
        diModulesData.push({
            partNo,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value,
            type
        });
    });
    localStorage.setItem('diModulesDetails', JSON.stringify(diModulesData));

    const doModulesData = [];
    document.querySelectorAll('.module-sheet[data-module-type="DO"] tbody tr').forEach((row, i) => {
        const partNo = row.querySelector('select[name$="_part_no"]')?.value;
        const type = partNo?.includes('CO-8') ? 'CO-8-A' : 'CO-16-A';
        window.doModuleTypes[i + 1] = type;
        doModulesData.push({
            partNo,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value,
            type
        });
    });
    localStorage.setItem('doModulesDetails', JSON.stringify(doModulesData));

    localStorage.setItem('diModulesToTest', diCount);
    localStorage.setItem('doModulesToTest', doCount);
    localStorage.setItem('aiModulesToTest', aiCount);
    localStorage.setItem('processorCount', processorCount);
    localStorage.setItem('powerCount', powerCount);
    localStorage.setItem('comCount', comCount);
    localStorage.setItem('aoModulesToTest', aoCount);

    // ✅ DIRECT REDIRECT - NO FILE GENERATION
    setTimeout(() => {
        window.location.href = "Pre-requisite.html";
    }, 100);
}

// --- UPDATE EVENT LISTENER ---
const submitBtn = document.getElementById('submitBtn');
if (submitBtn) {
    submitBtn.addEventListener('click', async function () {
        saveCurrentBQCounts();
        // ENABLED VALIDATION
        await goToNext();
    });
}

function validateAllModuleFields() {
    // Check if any sheets have been generated
    const sheets = document.querySelectorAll('#sheetsContainer .module-sheet');
    if (sheets.length === 0) {
        showCustomAlert('Please generate sheets first by clicking "Generate Sheets" button.');
        return false;
    }
    
    serialNumberTracker.clearAll();
    // REMOVED duplicate checking logic
    
    // First, clear all previous error styles
    document.querySelectorAll('input[name$="_serial"]').forEach(input => {
        input.style.border = '';
    });

    // Validate Serial Number Checker's Name
   /* const checkerNameInput = document.getElementById('checkerName');
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
    }*/

    // Validate Vendor Number
    /*const vendorNumberInput = document.getElementById('vendorNumber');
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
    }*/

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

            // 2. Validate Text Inputs (Subrack, Slot ONLY - NOT Serial)
            const inputs = row.querySelectorAll('input[required]');
            for (const input of inputs) {
                const value = input.value.trim();
                
                // SKIP SERIAL NUMBER VALIDATION
                if (input.name.includes('_serial')) {
                    continue; // Skip validation for serial number
                }

                // Determine readable field name
                let fieldName = 'Field';
                if (input.name.includes('_subrack')) fieldName = 'Subrack No.';
                else if (input.name.includes('_slot')) fieldName = 'Slot No.';

                // CHECK A: Is it empty? (for non-serial fields)
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
            
            // REMOVED serial number format validation (12 digits)
            // REMOVED duplicate serial number checking
        }
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
            return (this.generationStartTime - this.loginTime) / 1000;
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
        
        const checkerNameInput = document.getElementById('checkerName');
        if (checkerNameInput) {
            localStorage.setItem('session_checkerName', checkerNameInput.value);
        }
        
        const vendorNumberInput = document.getElementById('vendorNumber');
        if (vendorNumberInput) {
            localStorage.setItem('session_vendorNumber', vendorNumberInput.value);
        }
        
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

        const getParsedValue = (key) => {
            const value = localStorage.getItem(key);
            if (value === null) return '0';
            try {
                const parsed = JSON.parse(value);
                return String(parsed);
            } catch (e) {
                return value.replace(/"/g, '');
            }
        };

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

        const vendorNumberInput = document.getElementById('vendorNumber');
        if (vendorNumberInput) {
            vendorNumberInput.value = localStorage.getItem('session_vendorNumber') || '';
        }

        const sheets = document.querySelectorAll('#sheetsContainer .module-sheet');
        const checkerNameSection = document.getElementById('checkerNameSection');
        if (checkerNameSection && sheets.length > 0) {
            checkerNameSection.style.display = 'block';
        }

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

            const slotCell = row.insertCell();
            const slotInput = document.createElement('input');
            slotInput.type = 'number';
            slotInput.name = `${moduleType.toLowerCase()}_${i}_slot`;
            slotInput.placeholder = 'Enter slot';
            slotInput.required = true;

            if (['Subrack', 'Power', 'Processor'].includes(moduleType)) {
                slotInput.value = '0';
            }

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
        return;
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
            
            const totalCount = subrackCount + processorCount + powerCount + comCount + diCount + doCount + aiCount + aoCount;
            
            // ENABLED VALIDATION
            if (totalCount === 0) {
                showCustomAlert('Please enter at least one module count to generate sheets.');
                return;
            }
            
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
            
            if (subrackCount > 0 && sheetsContainer) sheetsContainer.appendChild(createSUBRACKSheet(subrackCount));
            if (processorCount > 0 && sheetsContainer) sheetsContainer.appendChild(createPROCESSORSheet(processorCount));
            if (comCount > 0 && sheetsContainer) sheetsContainer.appendChild(createCOMSheet(comCount));
            if (diCount > 0 && sheetsContainer) sheetsContainer.appendChild(createDISheet(diCount));
            if (doCount > 0 && sheetsContainer) sheetsContainer.appendChild(createDOSheet(doCount));
            if (aiCount > 0 && sheetsContainer) sheetsContainer.appendChild(createAISheet(aiCount));
            if (aoCount > 0 && sheetsContainer) sheetsContainer.appendChild(createAOSheet(aoCount));
            if (powerCount > 0 && sheetsContainer) sheetsContainer.appendChild(createPOWERSheet(powerCount));
       
            const checkerNameSection = document.getElementById('checkerNameSection');
            if (checkerNameSection) {
                checkerNameSection.style.display = 'block';
            }
            
            const vendorNumberSection = document.getElementById('vendorNumberSection');
            if (vendorNumberSection) {
                vendorNumberSection.style.display = 'block';
            }
            
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
            
            const checkerNameSection = document.getElementById('checkerNameSection');
            if (checkerNameSection) {
                checkerNameSection.style.display = 'none';
            }
            
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
        submitBtn.addEventListener('click', async function() {
            saveCurrentBQCounts();
            formTiming.generationStartTime = new Date();
            
            // ENABLED VALIDATION
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
            
            window.goToNext();
        });
    }

    document.getElementById('exportBtn').addEventListener('click', async function() {
        // REMOVED serial number format validation from export
        try {
            const exportData = {};
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                try {
                    exportData[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    exportData[key] = localStorage.getItem(key);
                }
            }
            
            const moduleData = gatherAllModuleData();
            exportData.currentModuleData = moduleData;
            
            exportData.metadata = {
                generationDate: new Date().toISOString(),
                rtuSerial: localStorage.getItem('session_rtuSerial') || 'N/A',
                contractNo: localStorage.getItem('session_contractNo') || 'N/A',
                testerName: localStorage.getItem('session_name') || 'N/A'
            };
            
            const now = new Date();
            const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
            
            const contractNo = localStorage.getItem('session_contractNo') || 'ContractNo';
            const rtuSerial = localStorage.getItem('session_rtuSerial') || 'SerialNo';
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = `${dateformat}_BQ_BACKUP_${contractNo}_${rtuSerial}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);
            
            const txtContent = generateTXTContent();
            const txtDataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txtContent);
            const txtFileName = `${dateformat}_QR_TXT_${contractNo}_${rtuSerial}.txt`;
            
            const txtLinkElement = document.createElement('a');
            txtLinkElement.setAttribute('href', txtDataUri);
            txtLinkElement.setAttribute('download', txtFileName);
            document.body.appendChild(txtLinkElement);
            txtLinkElement.click();
            document.body.removeChild(txtLinkElement);
            
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

    // Make the function available globally
    window.validateAllModuleFields = validateAllModuleFields;
    navigationGuard.markPageAsCompleted();
    window.goToNext = goToNext;

});

async function generateAndDownloadPDF(contractNo, rtuSerial, returnBlob = false) {
    // Keep this function but it won't be called
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
                const partNoSelect = row.querySelector('select[name$="_part_no"]');
                if (partNoSelect && savedData.partNo) {
                    partNoSelect.value = savedData.partNo;
                }
                
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
                    serialNumberTracker.addSerial(savedData.serial, moduleType, moduleNo);
                }
                
                updatePartNumberSummary(sheet);
            }
        });
    });
    
    const checkerNameInput = document.getElementById('checkerName');
    const vendorNumberInput = document.getElementById('vendorNumber');
    
    if (checkerNameInput) {
        const savedCheckerName = localStorage.getItem('session_checkerName');
        if (savedCheckerName) {
            checkerNameInput.value = savedCheckerName;
        }
    }
    
    if (vendorNumberInput) {
        const savedVendorNumber = localStorage.getItem('session_vendorNumber');
        if (savedVendorNumber) {
            vendorNumberInput.value = savedVendorNumber;
        }
    }
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
    
    const moduleData = gatherAllModuleData();
    
    let txtContent = '';
    
    txtContent += `${contractNo} |\n`;
    txtContent += `${vendorNumber} |\n`;
    txtContent += `RTU DONGFANG 1725 IED |\n`;
    txtContent += `DF1725IED |\n`;
    txtContent += `DONGFANG |\n`;
    txtContent += `CN |\n`;
    txtContent += `${rtuSerial} |\n`;
    
    if (moduleData.Subrack && moduleData.Subrack.length > 0) {
        moduleData.Subrack.forEach((subrack, index) => {
            if (subrack.serial) {
                txtContent += `DF1725IED,SUBRACK SN ${subrack.serial} |\n`;
            }
        });
    }
    txtContent += `||\n`;
    
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
        
        const typeNumber = 0;
        const errorCorrectionLevel = 'L';
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(txtContent);
        qr.make();
        
        const canvas = document.createElement('canvas');
        const size = 400;
        const cellSize = size / qr.getModuleCount();
        const margin = 2;
        const totalSize = size + margin * 2 * cellSize;
        
        canvas.width = totalSize;
        canvas.height = totalSize;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, totalSize, totalSize);
        
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