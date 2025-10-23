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

function goToNext() {
    //let allValid = true;
    
    if (!validateAllModuleFields()) {
        return; 
    }

    // Initialize diModuleTypes if it doesn't exist
    if (!window.diModuleTypes) {
        window.diModuleTypes = {};
    }
    if (!window.doModuleTypes) {
        window.doModuleTypes = {};
    }
    
    // Get the counts from input fields
    const processorCount = parseInt(document.getElementById('processorCount').value) || 0;
    const powerCount = parseInt(document.getElementById('powerCount').value) || 0;
    const diCount = parseInt(document.getElementById('diCount').value) || 0;
    const doCount = parseInt(document.getElementById('doCount').value) || 0;
    const aiCount = parseInt(document.getElementById('aiCount').value) || 0;
    const comCount = parseInt(document.getElementById('comCount').value) || 0;
    
    // Processor modules
    const processorModulesData = [];
    const processorRows = document.querySelectorAll('.module-sheet[data-module-type="Processor"] tbody tr');
    processorRows.forEach((row, index) => {
        processorModulesData.push({
            partNo: row.querySelector('select[name$="_part_no"]')?.value,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value
        });
    });
    localStorage.setItem('processorModulesDetails', JSON.stringify(processorModulesData));
    
    // Power modules
    const powerModulesData = [];
    const powerRows = document.querySelectorAll('.module-sheet[data-module-type="Power"] tbody tr');
    powerRows.forEach((row, index) => {
        powerModulesData.push({
            partNo: row.querySelector('select[name$="_part_no"]')?.value,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value
        });
    });
    
    // Save to localStorage
    localStorage.setItem('powerModulesDetails', JSON.stringify(powerModulesData));

    //  Subrack modules:
    const subrackModulesData = [];
    const subrackRows = document.querySelectorAll('.module-sheet[data-module-type="Subrack"] tbody tr');
    subrackRows.forEach((row, index) => {
        subrackModulesData.push({
            partNo: row.querySelector('select[name$="_part_no"]')?.value,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value
        });
    });

    // Save to localStorage
    localStorage.setItem('subrackModulesDetails', JSON.stringify(subrackModulesData));


    // COM modules
    const comModulesData = [];
    const comRows = document.querySelectorAll('.module-sheet[data-module-type="COM"] tbody tr');
    comRows.forEach((row, index) => {
        comModulesData.push({
            partNo: row.querySelector('select[name$="_part_no"]')?.value,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value
        });
    });
    
    // Save to localStorage
    localStorage.setItem('comModulesDetails', JSON.stringify(comModulesData));
    
    // DI modules
    const diModulesData = [];
    const diRows = document.querySelectorAll('.module-sheet[data-module-type="DI"] tbody tr');
    diRows.forEach((row, index) => {
        const partNo = row.querySelector('select[name$="_part_no"]')?.value;
        let moduleType = 'DI-32'; // default
        if (partNo.includes('DI-16')) {
            moduleType = 'DI-16';
        }
        window.diModuleTypes[index + 1] = moduleType;
        
        diModulesData.push({
            partNo: partNo,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value,
            type: moduleType
        });
    });
    
    // Save to localStorage
    localStorage.setItem('diModuleTypes', JSON.stringify(window.diModuleTypes));
    
    // DO modules
    const doModulesData = [];
    const doRows = document.querySelectorAll('.module-sheet[data-module-type="DO"] tbody tr');
    doRows.forEach((row, index) => {
        const partNo = row.querySelector('select[name$="_part_no"]')?.value;
        let moduleType = 'CO-16-A'; // default
        if (partNo.includes('CO-8')) {
            moduleType = 'CO-8-A';
        }
        window.doModuleTypes[index + 1] = moduleType;
        
        doModulesData.push({
            partNo: partNo,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value,
            type: moduleType
        });
    });

    // Save to localStorage
    localStorage.setItem('doModuleTypes', JSON.stringify(window.doModuleTypes));

    // AI modules
    const aiModulesData = [];
    const aiRows = document.querySelectorAll('.module-sheet[data-module-type="AI"] tbody tr');
    aiRows.forEach((row, index) => {
        aiModulesData.push({
            partNo: row.querySelector('select[name$="_part_no"]')?.value,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value
        });
    });

    // AO modules
    const aoModulesData = [];
    const aoRows = document.querySelectorAll('.module-sheet[data-module-type="AO"] tbody tr');
    aoRows.forEach((row, index) => {
        aoModulesData.push({
            partNo: row.querySelector('select[name$="_part_no"]')?.value,
            subrack: row.querySelector('input[name$="_subrack"]')?.value,
            slot: row.querySelector('input[name$="_slot"]')?.value,
            serial: row.querySelector('input[name$="_serial"]')?.value
        });
    });

    // Save to localStorage
    localStorage.setItem('aoModulesDetails', JSON.stringify(aoModulesData));

    // Save to localStorage
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
    
    window.location.href = './Pre-requisite.html';
}

    function validateAllModuleFields() {
        serialNumberTracker.clearAll();
        const sheets = document.querySelectorAll('#sheetsContainer .module-sheet');
        let duplicateDetails = [];

        for (const sheet of sheets) {
            const tableRows = sheet.querySelectorAll('tbody tr');
            const moduleType = sheet.dataset.moduleType;

            for (let i = 0; i < tableRows.length; i++) {
                const row = tableRows[i];
                const moduleNo = i + 1;
                
                const partNoSelect = row.querySelector('select');
                if (!partNoSelect?.value) {
                    showCustomAlert(`Please select Part Number for ${moduleType} Module ${moduleNo}`);
                    partNoSelect?.focus();
                    return false;
                }

                const inputs = row.querySelectorAll('input[required]');
                for (const input of inputs) {
                    if (!input.value.trim()) {
                        const fieldName = input.name.includes('subrack') ? 'Subrack No.' :
                                            input.name.includes('slot') ? 'Slot No.' : 'Serial No.';
                        showCustomAlert(`Please fill in ${fieldName} for ${moduleType} Module ${moduleNo}`);
                        input.focus();
                        return false;
                    }
                }
                
                const serialInput = row.querySelector('input[name$="_serial"]');
                const serialValue = serialInput?.value.trim();
                if (serialValue) {
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

        // Rest of the function remains the same...
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
            if (powerCount > 0) sheetsContainer.appendChild(createPOWERSheet(powerCount));
            if (comCount > 0) sheetsContainer.appendChild(createCOMSheet(comCount));
            if (diCount > 0) sheetsContainer.appendChild(createDISheet(diCount));
            if (doCount > 0) sheetsContainer.appendChild(createDOSheet(doCount));
            if (aiCount > 0) sheetsContainer.appendChild(createAISheet(aiCount));
            if (aoCount > 0) sheetsContainer.appendChild(createAOSheet(aoCount));
            
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
            const totalCount = diCount + doCount + aiCount + aoCount;
            
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
            if (subrackCount > 0 && sheetsContainer) sheetsContainer.appendChild(createSUBRACKSheet(subrackCount));
            if (processorCount > 0 && sheetsContainer) sheetsContainer.appendChild(createPROCESSORSheet(processorCount));
            if (powerCount > 0 && sheetsContainer) sheetsContainer.appendChild(createPOWERSheet(powerCount));
            if (comCount > 0 && sheetsContainer) sheetsContainer.appendChild(createCOMSheet(comCount));
            if (diCount > 0 && sheetsContainer) sheetsContainer.appendChild(createDISheet(diCount));
            if (doCount > 0 && sheetsContainer) sheetsContainer.appendChild(createDOSheet(doCount));
            if (aiCount > 0 && sheetsContainer) sheetsContainer.appendChild(createAISheet(aiCount));
            if (aoCount > 0 && sheetsContainer) sheetsContainer.appendChild(createAOSheet(aoCount));
        
            // Restore data for all modules
            document.querySelectorAll('.module-sheet').forEach(sheet => {
                const moduleType = sheet.dataset.moduleType;
                const rows = sheet.querySelectorAll('tbody tr');
                
                // Restore data for all existing rows (even if count increased)
                if (allCurrentData[moduleType]) {
                    rows.forEach((row, index) => {
                        // Only restore if we have data for this index
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
        });
    }

    document.getElementById('exportBtn').addEventListener('click', function() {
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
        
        // Create and trigger download
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `RTU_Backup_${localStorage.getItem('session_rtuSerial') || 'UnknownRTU'}_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });
    

    // Make the function available globally
    window.validateAllModuleFields = validateAllModuleFields;
    window.goToNext = goToNext;

});

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