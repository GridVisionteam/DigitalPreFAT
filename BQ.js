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

async function goToNext(returnOnly = false) {
    // ==========================================
    // 1. VALIDATION PHASE
    // ==========================================

    // Generic validation
    if (typeof validateAllModuleFields === 'function') {
        if (!validateAllModuleFields()) {
            if (returnOnly) return null;
            return;
        }
    }

    // ==========================================
    // 2. DATA SAVING PHASE
    // ==========================================
    
    // Initialize module types if needed
    if (!window.diModuleTypes) window.diModuleTypes = {};
    if (!window.doModuleTypes) window.doModuleTypes = {};
    
    // Save checker name & vendor - UPDATED TO SAVE BOTH FORMATS
    const checkerName = document.getElementById('checkerName')?.value || '';
    const vendorNumber = document.getElementById('vendorNumber')?.value || '';
    const supplierName = document.getElementById('supplierName')?.value || '';

    localStorage.setItem('checkerName', checkerName);
    localStorage.setItem('vendorNumber', vendorNumber);
    localStorage.setItem('session_checkerName', checkerName);
    localStorage.setItem('session_vendorNumber', vendorNumber);
    localStorage.setItem('session_supplierName', supplierName);
    localStorage.setItem('supplierName', supplierName);

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
    // 3. DATA PREPARATION FOR BOTH MODES
    // ==========================================
    
    // Create the Export Data Object (needed for both modes)
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

    // ==========================================
    // 4. RETURN-ONLY MODE (for Drive upload)
    // ==========================================
    if (returnOnly) {
        try {
            // Generate TXT content
            let txtContent = '';
            if (typeof generateTXTContent === 'function') {
                txtContent = generateTXTContent();
            }
            
            // Generate PDF blob
            let pdfResult = null;
            if (typeof generateAndDownloadPDF === 'function') {
                pdfResult = await generateAndDownloadPDF(contractNo, rtuSerial, true);
            }
            
            // Return the data for Drive upload
            return {
                jsonData: JSON.stringify(exportData, null, 2),
                txtContent: txtContent,
                pdfBlob: pdfResult
            };
        } catch (error) {
            console.error('Error in returnOnly mode:', error);
            return null;
        }
    }
    
    // ==========================================
    // 5. DOWNLOAD MODE - ONLY RUNS WHEN returnOnly IS FALSE
    // ==========================================
    try {
        showCustomAlert('Saving and Generating Backup Files...');

        // Generate QR Code
        let txtContent = '';
        if (typeof generateTXTContent === 'function') {
            txtContent = generateTXTContent();
            
            if (typeof generateAndDownloadQRCode === 'function' && txtContent) {
                await generateAndDownloadQRCode(txtContent, dateformat, contractNo, rtuSerial);
            }
        }

        // Generate PDF
        if (typeof generateAndDownloadPDF === 'function') {
            await generateAndDownloadPDF(contractNo, rtuSerial, false);
        }

    } catch (error) {
        console.error('Export Warning:', error);
    }

    // ==========================================
    // 6. MARK PAGE AS COMPLETED AND REDIRECT
    // ==========================================
    // Mark the page as completed in navigation guard
    if (window.navigationGuard && typeof window.navigationGuard.markPageAsCompleted === 'function') {
        window.navigationGuard.markPageAsCompleted();
    }
    
    // Redirect
    setTimeout(() => {
        window.location.href = './Pre-requisite.html';
    }, 1500);
}


// Enhanced validation function with duplicate highlighting
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
    document.querySelectorAll('input[name$="_serial"], input[required]').forEach(input => {
        input.style.border = '';
        input.style.backgroundColor = '';
        input.classList.remove('duplicate-serial', 'missing-serial');
        input.title = ''; // Clear tooltips
    });

    // First pass: Collect all serial numbers and validate format AND check for empty fields
    const serialMap = new Map(); // serial -> array of {element, location, moduleType, moduleNo}
    let missingSerialFound = false;
    let firstMissingSerial = null;
    
    for (const sheet of sheets) {
        const tableRows = sheet.querySelectorAll('tbody tr');
        const moduleType = sheet.dataset.moduleType;

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

            // 2. Validate Text Inputs (Subrack, Slot)
            const inputs = row.querySelectorAll('input[required]:not([name$="_serial"])');
            for (const input of inputs) {
                const value = input.value.trim();

                // Determine readable field name
                let fieldName = 'Field';
                if (input.name.includes('_subrack')) fieldName = 'Subrack No.';
                else if (input.name.includes('_slot')) fieldName = 'Slot No.';

                // CHECK A: Is it empty?
                if (!value) {
                    showCustomAlert(`Please fill in ${fieldName} for ${moduleType} Module ${moduleNo}`);
                    input.style.border = '2px solid red';
                    input.focus();
                    return false;
                }

                // CHECK B: Specific Slot Logic
                if (input.name.includes('_slot')) {
                    const nonZeroModules = ['COM', 'DI', 'DO', 'AI', 'AO'];
                    if (nonZeroModules.includes(moduleType) && value === '0') {
                        showCustomAlert(`Slot No. cannot be "0" for ${moduleType} Module ${moduleNo}. Please enter a valid slot number.`);
                        input.style.border = '2px solid red';
                        input.focus();
                        return false;
                    } else {
                        input.style.border = '';
                    }
                }
            }
            
            // Collect serial number data and check for empty serials
            const serialInput = row.querySelector('input[name$="_serial"]');
            const serialValue = serialInput?.value.trim();
            
            // NEW VALIDATION: Check if serial field is empty
            if (!serialValue) {
                // Mark as missing
                serialInput.style.border = '2px solid red';
                serialInput.style.backgroundColor = '#fff0f0';
                serialInput.classList.add('missing-serial');
                serialInput.title = 'Serial number is required';
                
                missingSerialFound = true;
                if (!firstMissingSerial) {
                    firstMissingSerial = serialInput;
                }
                continue; // Skip further validation for this empty field
            }
            
            // Check serial number format (12 digits)
            if (!/^\d{12}$/.test(serialValue)) {
                serialInput.style.border = '2px solid red';
                serialInput.style.backgroundColor = '#fff0f0';
                showCustomAlert(`Serial Number for ${moduleType} Module ${moduleNo} must be exactly 12 digits.`);
                serialInput.focus();
                return false;
            }
            
            const location = `${moduleType} Module ${moduleNo}`;
            
            if (!serialMap.has(serialValue)) {
                serialMap.set(serialValue, []);
            }
            serialMap.get(serialValue).push({
                element: serialInput,
                location: location,
                moduleType: moduleType,
                moduleNo: moduleNo
            });
        }
    }

    // If missing serials found, show alert and focus first missing field
    if (missingSerialFound) {
        showCustomAlert('Please fill in all Serial Number fields.');
        if (firstMissingSerial) {
            firstMissingSerial.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstMissingSerial.focus();
        }
        return false;
    }

    // Second pass: Check for duplicates and highlight them
    let duplicateFound = false;
    serialMap.forEach((occurrences, serial) => {
        if (occurrences.length > 1) {
            duplicateFound = true;
            
            // Add to serialNumberTracker for reference
            occurrences.forEach(occ => {
                serialNumberTracker.addSerial(serial, occ.moduleType, occ.moduleNo);
            });
            
            // Highlight all occurrences of this duplicate serial
            occurrences.forEach(occ => {
                occ.element.style.border = '3px solid red';
                occ.element.style.backgroundColor = '#ffeeee';
                occ.element.classList.add('duplicate-serial');
                
                // Create tooltip showing all locations
                const otherLocations = occurrences
                    .filter(o => o !== occ)
                    .map(o => o.location)
                    .join(', ');
                
                occ.element.title = `⚠️ DUPLICATE! Also used in: ${otherLocations}`;
            });
            
            // Create error messages for each unique pair
            for (let i = 0; i < occurrences.length; i++) {
                for (let j = i + 1; j < occurrences.length; j++) {
                    duplicateDetails.push({
                        serial: serial,
                        location1: occurrences[i].location,
                        location2: occurrences[j].location
                    });
                }
            }
        } else {
            // Valid unique serial - add to tracker
            serialNumberTracker.addSerial(serial, occurrences[0].moduleType, occurrences[0].moduleNo);
            
            // Mark as valid (green border)
            occurrences[0].element.style.border = '2px solid green';
            occurrences[0].element.style.backgroundColor = '#f0fff0';
            occurrences[0].element.title = 'Valid unique serial';
        }
    });

    // If duplicates found, show detailed alert and return false
    if (duplicateDetails.length > 0) {
        // Group duplicates by serial number for cleaner message
        const groupedMessages = [];
        const serialGroups = {};
        
        duplicateDetails.forEach(d => {
            if (!serialGroups[d.serial]) {
                serialGroups[d.serial] = new Set();
            }
            serialGroups[d.serial].add(d.location1);
            serialGroups[d.serial].add(d.location2);
        });
        
        Object.keys(serialGroups).forEach(serial => {
            const locations = Array.from(serialGroups[serial]);
            groupedMessages.push(`• Serial '${serial}' appears in: ${locations.join(', ')}`);
        });
        
        showCustomAlert(
            `⚠️ DUPLICATE SERIAL NUMBERS FOUND ⚠️\n\n` +
            `${groupedMessages.join('\n')}\n\n` +
            `Please correct the highlighted fields.`
        );
        
        // Scroll to the first duplicate
        const firstDuplicate = document.querySelector('.duplicate-serial');
        if (firstDuplicate) {
            firstDuplicate.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstDuplicate.focus();
        }
        
        return false;
    }

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

    // Validate Supplier Name
    const supplierNameInput = document.getElementById('supplierName');
    if (supplierNameInput && supplierNameInput.style.display !== 'none') {
        const supplierName = supplierNameInput.value.trim();
        if (!supplierName) {
            showCustomAlert('Please enter Supplier Name.');
            supplierNameInput.style.border = '2px solid red';
            supplierNameInput.focus();
            return false;
        } else {
            supplierNameInput.style.border = '';
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
        if (checkerNameInput) {
            localStorage.setItem('session_checkerName', checkerNameInput.value);
        }
        
        // Save vendor number
        const vendorNumberInput = document.getElementById('vendorNumber');
        if (vendorNumberInput) {
            localStorage.setItem('session_vendorNumber', vendorNumberInput.value);
        }
        // Save supplier name
        const supplierNameInput = document.getElementById('supplierName');
        if (supplierNameInput) {
            localStorage.setItem('session_supplierName', supplierNameInput.value);
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
        const sheetsContainer = document.getElementById('sheetsContainer');

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
            
            // CRITICAL FIX: Reattach serial number handling after restoring data
            // This ensures auto-advance works when importing JSON data
            setTimeout(() => {
                setupSerialNumberHandling();
                highlightDuplicateSerials();
                console.log("Serial number handling reattached after data load");
            }, 300);
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
        // Load supplier name
        const supplierNameInput = document.getElementById('supplierName');
        if (supplierNameInput) {
            supplierNameInput.value = localStorage.getItem('session_supplierName') || '';
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

            // Check if the current module is Subrack, Power, or Processor
            // and set default value to 0
            if (['Subrack', 'Power', 'Processor'].includes(moduleType)) {
                slotInput.value = '0';
            }

            slotCell.appendChild(slotInput);

            // Serial Number field with 12-digit limit
            const serialCell = row.insertCell();
            const serialInput = document.createElement('input');
            serialInput.type = 'text'; // Changed from 'number' to 'text' for better control
            serialInput.name = `${moduleType.toLowerCase()}_${i}_serial`;
            serialInput.placeholder = 'Enter 12-digit serial';
            serialInput.required = true;
            serialInput.setAttribute('maxlength', '12'); // Add maxlength attribute
            serialInput.setAttribute('pattern', '\\d{12}'); // Add pattern for validation
            serialInput.setAttribute('inputmode', 'numeric'); // Show numeric keyboard on mobile
            serialInput.style.padding = '8px';
            serialInput.style.width = '140px';
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
            // Clear serial tracker and highlighting before generating new sheets
            serialNumberTracker.clearAll();
            
            // Clear all serial highlighting
            document.querySelectorAll('input[name$="_serial"]').forEach(input => {
                input.style.border = '';
                input.style.backgroundColor = '';
                input.classList.remove('duplicate-serial');
                input.title = '';
            });
            
            saveCurrentBQCounts();
            const subrackCount = parseInt(document.getElementById('subrackCount')?.value) || 0;
            const processorCount = parseInt(document.getElementById('processorCount')?.value) || 0;
            const powerCount = parseInt(document.getElementById('powerCount')?.value) || 0;
            const comCount = parseInt(document.getElementById('comCount')?.value) || 0;
            const diCount = parseInt(document.getElementById('diCount')?.value) || 0;
            const doCount = parseInt(document.getElementById('doCount')?.value) || 0;
            const aiCount = parseInt(document.getElementById('aiCount')?.value) || 0;
            const aoCount = parseInt(document.getElementById('aoCount')?.value) || 0;
            
            // Sum ALL inputs
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
                            }
                        }
                    });
                }
                updatePartNumberSummary(sheet);
            });
            
            // Re-attach serial number handling for new sheets
            setupSerialNumberHandling();
            
            // Check for duplicates after restoring data
            setTimeout(() => highlightDuplicateSerials(), 200);
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
            // Clear serial tracker and highlighting
            serialNumberTracker.clearAll();
            
            // Clear all serial highlighting
            document.querySelectorAll('input[name$="_serial"]').forEach(input => {
                input.style.border = '';
                input.style.backgroundColor = '';
                input.classList.remove('duplicate-serial');
                input.title = '';
            });
            
            if (sheetsContainer) sheetsContainer.innerHTML = "";
            ['diCount','doCount','aiCount','aoCount', 'subrackCount', 'processorCount', 'powerCount', 'comCount'].forEach(id => {
                const inputEl = document.getElementById(id);
                if (inputEl) inputEl.value = '0';
            });
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
        submitBtn.addEventListener('click', async function() {
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
            
            // Try to use the integrated Drive upload version if available
            if (typeof goToNextWithDriveUpload === 'function' && 
                typeof uploadToDrive !== 'undefined') {
                // Use integrated version with Drive upload
                await goToNextWithDriveUpload();
            } else {
                // Fall back to original version
                window.goToNext();
            }
        });
    }

    document.getElementById('exportBtn').addEventListener('click', async function() {
        
        // --- PART 1: VALIDATION BLOCK ---
        // Select all inputs ending in "_serial"
        const serialInputs = document.querySelectorAll('input[name$="_serial"]');
        
        for (const input of serialInputs) {
            const serialValue = input.value.trim();

            // Check if value is NOT 12 digits
            if (!/^\d{12}$/.test(serialValue)) {
                
                // 1. Highlight the bad input
                input.style.border = '2px solid red';
                
                // 2. Scroll to and focus the bad input so the user sees it
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                input.focus();
                
                // 3. Show Alert
                showCustomAlert('Export Blocked: Found a serial number that is not exactly 12 digits. Please correct the highlighted field.');
                
                // 4. STOP THE EXPORT IMMEDIATELY
                return; 
            } else {
                // If valid, ensure border is clean
                input.style.border = '';
            }
        }
        
        // Check for duplicates before export
        const duplicateCheck = highlightDuplicateSerials();
        if (duplicateCheck) {
            showCustomAlert('Export Blocked: Duplicate serial numbers found. Please correct the highlighted fields.');
            return;
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

    // Setup serial number handling
    setupSerialNumberHandling();
    
    // Make the function available globally
    window.validateAllModuleFields = validateAllModuleFields;
    window.goToNext = goToNext;
    
    // Add duplicate styles
    addDuplicateStyles();
    
    // Initial duplicate check if there are existing serials
    setTimeout(() => highlightDuplicateSerials(), 500);
});

// Add this CSS to your stylesheet (or inject it via JavaScript)
function addDuplicateStyles() {
    const style = document.createElement('style');
    style.textContent = `
        input.duplicate-serial {
            border: 3px solid red !important;
            background-color: #ffeeee !important;
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        input.duplicate-serial:focus {
            outline: 2px solid darkred;
            outline-offset: 2px;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        
        /* Tooltip styling */
        input[title] {
            cursor: help;
        }
        
        /* Style for valid serials */
        input[name$="_serial"][style*="border: 2px solid green"] {
            background-color: #f0fff0 !important;
        }
        
        /* Style for invalid format */
        input[name$="_serial"][style*="border: 2px solid red"]:not(.duplicate-serial) {
            background-color: #fff0f0 !important;
        }
        
        /* Additional visual indicator for duplicates */
        .duplicate-serial + .duplicate-warning {
            display: inline-block;
            color: red;
            font-weight: bold;
            margin-left: 5px;
        }
    `;
    document.head.appendChild(style);
}

// Call this when the page loads (as a fallback)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDuplicateStyles);
} else {
    addDuplicateStyles();
}

// Function to handle serial number input and auto-advance
function setupSerialNumberHandling() {
    const sheetsContainer = document.getElementById('sheetsContainer');
    
    if (sheetsContainer) {
        // Handle input events (typing, pasting)
        sheetsContainer.addEventListener('input', function(event) {
            if (event.target && event.target.matches('input[name$="_serial"]')) {
                handleSerialInput(event.target);
                // Check for duplicates in real-time after a short delay
                setTimeout(() => highlightDuplicateSerials(), 100);
            }
        });
        
        // Handle keyup events for backspace navigation
        sheetsContainer.addEventListener('keyup', function(event) {
            if (event.target && event.target.matches('input[name$="_serial"]')) {
                if (event.key === 'Backspace' || event.keyCode === 8) {
                    handleSerialBackspace(event.target);
                    setTimeout(() => highlightDuplicateSerials(), 100);
                }
            }
        });
        
        // Handle keydown to prevent non-numeric input
        sheetsContainer.addEventListener('keydown', function(event) {
            if (event.target && event.target.matches('input[name$="_serial"]')) {
                // Allow: backspace, delete, tab, escape, enter, arrow keys, home, end
                if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' || 
                    event.key === 'Escape' || event.key === 'Enter' || event.key === 'ArrowLeft' || 
                    event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
                    event.key === 'Home' || event.key === 'End') {
                    return; // Let it happen
                }
                
                // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl/X
                if (event.ctrlKey && (event.key === 'a' || event.key === 'c' || event.key === 'v' || event.key === 'x')) {
                    return; // Let it happen
                }
                
                // Prevent if not a number
                if (!/^\d$/.test(event.key) && event.key !== ' ') {
                    event.preventDefault();
                }
            }
        });
        
        // Handle paste events separately
        sheetsContainer.addEventListener('paste', function(event) {
            if (event.target && event.target.matches('input[name$="_serial"]')) {
                event.preventDefault();
                
                // Get pasted data
                const pastedData = (event.clipboardData || window.clipboardData).getData('text');
                
                // Extract only digits
                const digitsOnly = pastedData.replace(/\D/g, '');
                
                // Limit to 12 digits
                const limitedDigits = digitsOnly.slice(0, 12);
                
                // Set the value
                event.target.value = limitedDigits;
                
                // Trigger input event to handle auto-advance
                const inputEvent = new Event('input', { bubbles: true });
                event.target.dispatchEvent(inputEvent);
                
                // Check for duplicates after paste
                setTimeout(() => highlightDuplicateSerials(), 100);
            }
        });

        // Handle blur event to check duplicates when field loses focus
        sheetsContainer.addEventListener('blur', function(event) {
            if (event.target && event.target.matches('input[name$="_serial"]')) {
                setTimeout(() => highlightDuplicateSerials(), 100);
            }
        }, true);
    }
}

// Function to handle serial input
function handleSerialInput(input) {
    // Get current value and remove any non-digit characters
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 12 digits
    if (value.length > 12) {
        value = value.slice(0, 12);
    }
    
    // Update the input value
    input.value = value;
    
    // Get module info for this input
    const row = input.closest('tr');
    const moduleSheet = input.closest('.module-sheet');
    const moduleType = moduleSheet?.dataset.moduleType || 'Unknown';
    const moduleNo = row ? Array.from(row.parentNode.children).indexOf(row) + 1 : 0;
    
    // Apply styling based on validity
    if (value.length === 12) {
        // Check format with regex
        if (/^\d{12}$/.test(value)) {
            // Don't set green immediately - will be set by highlightDuplicateSerials if unique
            input.dataset.validFormat = 'true';
        } else {
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#fff0f0';
            input.dataset.validFormat = 'false';
        }
        
        // Auto-advance to next serial number field
        autoAdvanceToSerial(input, 'next');
    } else if (value.length > 0) {
        input.style.border = '2px solid red';
        input.style.backgroundColor = '#fff0f0';
        input.dataset.validFormat = 'false';
    } else {
        input.style.border = '';
        input.style.backgroundColor = '';
        input.dataset.validFormat = 'false';
        input.title = '';
        input.classList.remove('duplicate-serial');
    }
}

function highlightDuplicateSerials() {
    const allSerialInputs = document.querySelectorAll('input[name$="_serial"]');
    const serialMap = new Map();
    
    // First, collect all serials with valid format
    allSerialInputs.forEach(input => {
        const serial = input.value.trim();
        
        // Only consider valid 12-digit serials
        if (serial && /^\d{12}$/.test(serial)) {
            if (!serialMap.has(serial)) {
                serialMap.set(serial, []);
            }
            
            // Get location info
            const row = input.closest('tr');
            const moduleSheet = input.closest('.module-sheet');
            const moduleType = moduleSheet?.dataset.moduleType || 'Unknown';
            const moduleNo = row ? Array.from(row.parentNode.children).indexOf(row) + 1 : 0;
            
            serialMap.get(serial).push({
                element: input,
                location: `${moduleType} Module ${moduleNo}`,
                moduleType: moduleType,
                moduleNo: moduleNo
            });
        }
    });
    
    // Reset all borders first (but preserve format validation)
    allSerialInputs.forEach(input => {
        const serial = input.value.trim();
        if (serial && !/^\d{12}$/.test(serial)) {
            // Keep red border for invalid format
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#fff0f0';
            input.classList.remove('duplicate-serial');
            input.title = 'Must be exactly 12 digits';
        } else if (!serial) {
            // Empty field
            input.style.border = '';
            input.style.backgroundColor = '';
            input.classList.remove('duplicate-serial');
            input.title = '';
        }
    });
    
    // Highlight duplicates
    let duplicateFound = false;
    serialMap.forEach((occurrences, serial) => {
        if (occurrences.length > 1) {
            duplicateFound = true;
            
            // Highlight all occurrences of this duplicate serial
            occurrences.forEach(occ => {
                occ.element.style.border = '3px solid red';
                occ.element.style.backgroundColor = '#ffeeee';
                occ.element.classList.add('duplicate-serial');
                
                // Create tooltip showing all locations
                const otherLocations = occurrences
                    .filter(o => o !== occ)
                    .map(o => o.location)
                    .join(', ');
                
                occ.element.title = `⚠️ DUPLICATE! Also used in: ${otherLocations}`;
            });
        } else {
            // Unique valid serial - set to green
            occurrences[0].element.style.border = '2px solid green';
            occurrences[0].element.style.backgroundColor = '#f0fff0';
            occurrences[0].element.classList.remove('duplicate-serial');
            occurrences[0].element.title = 'Valid unique serial';
        }
    });
    
    // Update serialNumberTracker for consistency
    serialNumberTracker.clearAll();
    serialMap.forEach((occurrences, serial) => {
        occurrences.forEach(occ => {
            serialNumberTracker.addSerial(serial, occ.moduleType, occ.moduleNo);
        });
    });
    
    return duplicateFound;
}

// Function to auto-advance to next serial field
function autoAdvanceToSerial(currentInput, direction = 'next') {
    const allSerialInputs = Array.from(document.querySelectorAll('input[name$="_serial"]'));
    const currentIndex = allSerialInputs.indexOf(currentInput);
    
    if (direction === 'next' && currentIndex !== -1 && currentIndex < allSerialInputs.length - 1) {
        // Focus on the next serial input
        const nextInput = allSerialInputs[currentIndex + 1];
        nextInput.focus();
    }
}

// Function to handle backspace on empty field
function handleSerialBackspace(input) {
    const value = input.value;
    
    // If current field becomes empty after backspace, move to previous field
    if (value.length === 0) {
        const allSerialInputs = Array.from(document.querySelectorAll('input[name$="_serial"]'));
        const currentIndex = allSerialInputs.indexOf(input);
        
        if (currentIndex > 0) {
            const prevInput = allSerialInputs[currentIndex - 1];
            prevInput.focus();
            // Position cursor at the end of previous input
            setTimeout(() => {
                prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
            }, 10);
        }
    }
}

async function generateAndDownloadPDF(contractNo, rtuSerial, returnBlob = false) {
    // Ensure jsPDF is loaded
    if (!window.jspdf) {
        console.error("jsPDF library not found");
        return returnBlob ? null : false;
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
    const supplierName = localStorage.getItem('session_supplierName') || 'N/A';

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
    doc.text(`Supplier: ${supplierName}`, 14, 50);
    doc.text(`Tester: ${testerName}`, 14, 55);

    // --- 2. Define Module Order & Colors ---
    const moduleConfig = [
        { type: 'Subrack', color: '#808080' }, // Gray
        { type: 'Processor', color: '#0000FF' }, // Blue
        { type: 'COM', color: '#2E8B57' },      // SeaGreen
        { type: 'DI', color: '#FFA500' },       // Orange
        { type: 'DO', color: '#800080' },       // Purple
        { type: 'AI', color: '#008080' },       // Teal
        { type: 'AO', color: '#DAA520' },       // GoldenRod
        { type: 'Power', color: '#FF0000' }     // Red
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
    
    if (returnBlob) {
        // Return PDF as blob instead of downloading
        const pdfBlob = doc.output('blob');
        return {
            blob: pdfBlob,
            filename: filename
        };
    } else {
        // Original behavior: download immediately
        doc.save(filename);
        return true;
    }
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
    
    // RESTORE CHECKER NAME AND VENDOR NUMBER
    const checkerNameInput = document.getElementById('checkerName');
    const vendorNumberInput = document.getElementById('vendorNumber');
    const supplierNameInput = document.getElementById('supplierName');

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
    // Restore supplier name
    if (supplierNameInput) {
        const savedSupplierName = localStorage.getItem('session_supplierName');
        if (savedSupplierName) {
            supplierNameInput.value = savedSupplierName;
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
        
        // Create filename for the label
        const filename = `${dateformat}_QR_CODE_${contractNo}_${rtuSerial}.png`;
        
        // Increase canvas size to accommodate QR code + label
        const qrSize = 400; // QR code size
        const cellSize = qrSize / qr.getModuleCount();
        const margin = 2;
        const qrTotalSize = qrSize + margin * 2 * cellSize;
        
        // Add space for label (approximately 60px for two lines of text)
        const labelHeight = 60;
        const totalHeight = qrTotalSize + labelHeight;
        
        // Create canvas with extra height for label
        const canvas = document.createElement('canvas');
        canvas.width = qrTotalSize;
        canvas.height = totalHeight;
        const ctx = canvas.getContext('2d');
        
        // Fill background (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
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
        
        // Add label below QR code - MODIFIED FORMAT
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Get supplier name from the input field
        const supplierName = document.getElementById('supplierName')?.value || localStorage.getItem('session_supplierName') || 'Unknown Supplier';
        
        // First line: RTU Serial No
        ctx.fillText(rtuSerial, canvas.width / 2, qrTotalSize + 10);
        
        // Second line: contract no. - supplier name
        ctx.fillText(`${contractNo} - ${supplierName}`, canvas.width / 2, qrTotalSize + 30);
        
        // Convert to data URL and download
        const qrDataUrl = canvas.toDataURL('image/png');
        
        const qrLink = document.createElement('a');
        qrLink.href = qrDataUrl;
        qrLink.download = filename;
        document.body.appendChild(qrLink);
        qrLink.click();
        document.body.removeChild(qrLink);
        
        console.log("QR code generated successfully with label");
        return true;
        
    } catch (error) {
        console.error('Error generating QR code with alternative method:', error);
        showCustomAlert('Error generating QR code: ' + error.message);
        return false;
    }
}

async function generateBQPDFForDrive(contractNo, rtuSerial) {
    try {
        // Ensure jsPDF is loaded
        if (!window.jspdf) {
            console.error("jsPDF library not found");
            return null;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // --- 1. Header Information ---
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateString = `${day}/${month}/${year}`;

        const testerName = localStorage.getItem('session_checkerName') || 'N/A';
        const vendorNum = localStorage.getItem('session_vendorNumber') || 'N/A';
        const supplierName = localStorage.getItem('session_supplierName') || 'N/A';

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
        doc.text(`Supplier: ${supplierName}`, 14, 50);
        doc.text(`Tester: ${testerName}`, 14, 55); 

        // --- 2. Define Module Order & Colors ---
        const moduleConfig = [
            { type: 'Subrack', color: '#808080' },
            { type: 'Processor', color: '#0000FF' },
            { type: 'COM', color: '#2E8B57' },
            { type: 'DI', color: '#FFA500' },
            { type: 'DO', color: '#800080' },
            { type: 'AI', color: '#008080' },
            { type: 'AO', color: '#DAA520' },
            { type: 'Power', color: '#FF0000' }
        ];

        // Get Data
        const allData = gatherAllModuleData();
        let currentY = 55;

        // --- 3. Generate Tables ---
        moduleConfig.forEach(config => {
            const modules = allData[config.type];

            if (modules && modules.length > 0) {
                const tableBody = modules.map((m, index) => [
                    index + 1,
                    m.partNo || '-',
                    m.subrack || '-',
                    (m.slot == '0' || m.slot === 0) ? 'N/A' : (m.slot || '-'),                
                    m.serial || '-'
                ]);

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
                        0: { halign: 'center', cellWidth: 25 },
                        1: { halign : 'center', cellWidth: 50 },
                        2: { halign: 'center' },
                        3: { halign: 'center' },
                        4: { halign: 'center' }
                    },
                    didDrawPage: function (data) {
                        currentY = data.cursor.y;
                    },
                    margin: { top: 20 } 
                });
                
                currentY = doc.lastAutoTable.finalY;
            }
        });

        // Return PDF as blob
        const pdfBlob = doc.output('blob');
        const dateformat = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const filename = `${dateformat}_RTU_SERIAL_NUMBER_LIST_${contractNo}_${rtuSerial}.pdf`;
        
        return {
            blob: pdfBlob,
            filename: filename
        };
        
    } catch (error) {
        console.error('Error generating PDF for Drive:', error);
        return null;
    }
}