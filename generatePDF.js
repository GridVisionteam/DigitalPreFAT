if (typeof PDFLib === 'undefined') {
    console.error("PDFLib is not available. Please check the script loading.");
    throw new Error("PDFLib library failed to load");
}

console.log("PDFLib available:", typeof PDFLib !== 'undefined');
console.log("Download function available:", typeof download !== 'undefined');

function startNewSession() {
    // Show confirmation dialog
    const userConfirmed = confirm("All of the data in previous session will be permanently deleted to start a new session. Are you sure?");
    
    if (userConfirmed) {
        try {
            // Clear both sessionStorage and localStorage
            sessionStorage.clear();
            localStorage.clear();
            console.log("All session data cleared");
            
            // Redirect to index.html
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Failed to start new session:", error);
            alert("Failed to start new session. Please try again.");
        }
    } else {
        console.log("User canceled starting a new session");
    }
}

// Main PDF generation function
async function generateFinalPDF(currentUserData) {
    console.log("Starting PDF generation with data:", currentUserData);
    formTiming.generationStartTime = new Date();
    console.log("DO Modules to Test:", currentUserData.doModulesToTest);
    
    try {
        console.log("Loading main template...");
        let templateUrl = './PDF/DF1725IED FAT Test Record Front.pdf';
        let templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        console.log("Creating PDF document...");
        const pdfDoc = await PDFLib.PDFDocument.load(templateBytes);
        let form = pdfDoc.getForm();

        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        form.getTextField('RTUSerialNumber').setText(rtuSerial);
        form.getTextField('ContractNo').setText(contractNo);
        form.getTextField('TesterName').setText(testerName);
        form.getTextField('ProjectName').setText(localStorage.getItem('session_projectName') || 'N/A');
        // Add signature
        await addSignatureToForm(form, pdfDoc);
        fetch('https://worldtimeapi.org/api/timezone/Asia/Kuala_Lumpur')
        .then(response => response.json())
        .then(data => {
            const date = new Date(data.datetime);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            const dateTimeString = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
            form.getTextField('GenerationTime').setText(dateTimeString);
        })
        .catch(err => {
            console.error(err);
            form.getTextField('GenerationTime').setText('N/A');
        });

        

        // Get modules details from localStorage
        const diModulesDetails = JSON.parse(localStorage.getItem('diModulesDetails') || "[]");
        const doModulesDetails = JSON.parse(localStorage.getItem('doModulesDetails') || "[]");
        const aiModulesDetails = JSON.parse(localStorage.getItem('aiModulesDetails') || "[]");
        const processorModulesDetails = JSON.parse(localStorage.getItem('processorModulesDetails') || "[]");
        const powerModulesDetails = JSON.parse(localStorage.getItem('powerModulesDetails') || "[]");
        
        // Fill module details
        const moduleTypes = ['DI', 'DO', 'AI', 'AO'];
        for (const type of moduleTypes) {
            const sheet = document.querySelector(`.module-sheet[data-module-type="${type}"]`);
            if (sheet) {
                const rows = sheet.querySelectorAll('tbody tr');
                rows.forEach((row, index) => {
                    const moduleNo = index + 1;
                    const partNo = row.querySelector('select[name$="_part_no"]')?.value || '';
                    const subrack = row.querySelector('input[name$="_subrack"]')?.value || '';
                    const slot = row.querySelector('input[name$="_slot"]')?.value || '';
                    const serial = row.querySelector('input[name$="_serial"]')?.value || '';
                    try {
                        form.getTextField(`${type}_${moduleNo}_PartNo`).setText(partNo);
                        form.getTextField(`${type}_${moduleNo}_Subrack`).setText(subrack);
                        form.getTextField(`${type}_${moduleNo}_Slot`).setText(slot);
                        form.getTextField(`${type}_${moduleNo}_Serial`).setText(serial);
                    } catch (e) {
                        console.warn(`Could not find PDF field for ${type} module ${moduleNo}. Error: ${e.message}`);
                    }
                });
            }
        }

        // Get all test results from localStorage
        const diTestResults = JSON.parse(localStorage.getItem('diTestResults') || '{}');
        const doTestResults = JSON.parse(localStorage.getItem('doTestResults') || '{}');
        const aiTestResults = JSON.parse(localStorage.getItem('aiTestResults') || '{}');
        
        // Pre Requisite modules
        await processPreRequisiteSection(pdfDoc, currentUserData);

        // Product Declaration modules
        await processProductDeclarationSection(pdfDoc, currentUserData);   
        
        // Test Setup modules
        await processTestSetup(pdfDoc, currentUserData);
        
        // Process Electronic Accessories modules
        await processElectronicAccessories(pdfDoc, currentUserData);
        
        // Process RTU Panel Accessories modules
        await processRTUPanelAccessories(pdfDoc, currentUserData);

        // Process Panel Information modules
        await processPanelInformation(pdfDoc, currentUserData);

        // Process Subrack Inspection
        await processSubrackInspection(pdfDoc, currentUserData);

        // Process Power Supply modules
        await processPowerSupplyModules(pdfDoc, currentUserData, powerModulesDetails);

        // Process Processor modules
        await processProcessorModules(pdfDoc, currentUserData, processorModulesDetails);

        // Process Processor IEC101 & IEC104 Initialization
        await processProcessorInitialization(pdfDoc, currentUserData);

        // Process COM-6-A modules
        await processCom6Modules(pdfDoc, currentUserData);

        // Process DI modules
        await processDIModules(pdfDoc, currentUserData, diModulesDetails, diTestResults);

        // Process DO modules
        await processDOModules(pdfDoc, currentUserData, doModulesDetails, doTestResults);

        // Process Dummy&CES modules
        await processDummyCesTest(pdfDoc, currentUserData);

        // Process AI modules - only if there are AI modules to test
        const aiCount = currentUserData.aiModulesToTest || 0;
        if (aiCount > 0) {
            await processAIModules(pdfDoc, currentUserData, aiModulesDetails, aiTestResults);
        } else {
            console.log("Skipping AI modules processing - no AI modules to test");
        }

        // Process RTUPowerUp modules       
        await processRTUPowerUp(pdfDoc, currentUserData);

        // Process Processor Param modules
        await processParameterSetting(pdfDoc, currentUserData);

        // Process DI Param modules
        await processDIParameterSetting(pdfDoc, currentUserData);

        // Process DO Parameter modules
        await processDOParameterSetting(pdfDoc, currentUserData);

        // Process AI Parameter modules - only if there are AI modules
        if (aiCount > 0) {
            await processAIParameterSetting(pdfDoc, currentUserData);
        } else {
            console.log("Skipping AI Parameter setting - no AI modules");
        }

        // Process IEC101 Parameter modules
        await processIEC101ParameterSetting(pdfDoc, currentUserData);

        // Process IEC104 Parameter modules
        await processIEC104ParameterSetting(pdfDoc, currentUserData);

        // Process Virtual Alarm Test
        await processVirtualAlarmTest(pdfDoc, currentUserData);

        // Process ChannelRedundacyTest Parameter modules
        await processChannelRedundancyTest(pdfDoc, currentUserData);  
        
        // Process LimitofAuthority modules
        await processLimitOfAuthority(pdfDoc, currentUserData);

        // Process Signature modules
        //await processSignatureSection(pdfDoc, currentUserData);

        validateModuleCounts();

        // Finalize the original form
        form.flatten();

        // Save and download
        console.log("Finalizing PDF...");
        const modifiedPdfBytes = await pdfDoc.save();
        console.log("Downloading PDF...");
        // Use downloadjs if available, otherwise fallback
        const fileName = `RTU_Report_${localStorage.getItem('session_rtuSerial') || 'UnknownRTU'}.pdf`;

        if (typeof download === 'function') {
            // Use downloadjs from CDN
            download(modifiedPdfBytes, fileName, 'application/pdf');
        } else {
            console.log("Using fallback download method...");
            // Fallback method
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL object
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }

        return true; // Indicate success
    } catch (error) {
        console.error("PDF generation failed:", error);
        throw error; // Re-throw to be caught by the caller
    }
}

// Power Supply modules processing
async function processPowerSupplyModules(pdfDoc, currentUserData, powerModulesDetails) {
    console.log(`Processing Power Supply modules`);
    const powerCount = parseInt(localStorage.getItem('powerCount')) || 0;
    const powerTestResults = JSON.parse(localStorage.getItem('powerTestResults') || '{}');

    if (powerCount > 0) {
        // Determine which template page to use based on powerCount
        let powerPage = 1; // Default to first page
        if (powerCount > 4 && powerCount <= 8) {
            powerPage = 2;
        } else if (powerCount > 8) {
            // Handle cases beyond 8 if needed
            powerPage = 2; // Or you might want to add more pages
            console.warn(`Power count ${powerCount} exceeds maximum supported count of 8`);
        }

        // Load the Power Supply template
        const templateUrl = `./PDF/DF1725IED FAT Test Record Power.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();

        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);
        currentForm.getTextField('Powercount').setText(powerPage.toString());
        

        // Fill Physical and Quality Inspection
        for (let i = 1; i <= powerCount; i++) {
            const moduleDetails = powerModulesDetails[i-1] || {};
            const partNo = moduleDetails.partNo || 'N/A';
            const subrack = moduleDetails.subrack || 'N/A';
            const slot = moduleDetails.slot || 'N/A';
            const serial = moduleDetails.slot || 'N/A';
            
            currentForm.getTextField(`Power_${i}_ModuleNo`).setText(i.toString());
            currentForm.getTextField(`Power_${i}_PartNo`).setText(partNo);
            currentForm.getTextField(`Power_${i}_Subrack`).setText(subrack);
            currentForm.getTextField(`Power_${i}_Slot`).setText(slot);
            currentForm.getTextField(`Power_${i}_Serial`).setText(serial);
        }

        // Fill power supply data
        for (let i = 1; i <= powerCount; i++) {
            // Set quality inspection checkboxes
            const qualityResult = powerTestResults.qualityInspections?.[`power_${i}`] || 'NO';
            if (qualityResult === 'OK') {
                currentForm.getCheckBox(`Check_Box_PS_QI${i}_1`).check();
            } else {
                currentForm.getCheckBox(`Check_Box_PS_QI${i}_2`).check();
            }

            // Set functional test checkboxes
            const functionalResult = powerTestResults.functionalTests?.[`power_${i}`] || 'NO';
            if (functionalResult === 'OK') {
                currentForm.getCheckBox(`Check_Box_PS_FT${i}_1`).check();
            } else {
                currentForm.getCheckBox(`Check_Box_PS_FT${i}_2`).check();
            }

            // Set input voltage value
            const voltageValue = powerTestResults.voltageValues?.[`power_${i}`] || '';
            try {
                currentForm.getTextField(`PS_IV_${i}`).setText(voltageValue);
            } catch (e) {
                console.warn(`Could not find PDF field PS_IV_${i}`);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        let pagesToCopy = powerCount <= 4 ? [0] : [0, 1];
        const copiedPages = await pdfDoc.copyPages(currentPdf, pagesToCopy);

        // Add copied pages to the new PDF
        for (const page of copiedPages) {
            pdfDoc.addPage(page);
        }
    }
}

// Processor modules processing
async function processProcessorModules(pdfDoc, currentUserData, processorModulesDetails) {
    console.log(`Processing Processor modules`);
    
    // Load the Processor template just once
    const templateUrl = `./PDF/DF1725IED FAT Test Record Processor.pdf`;
    const templateBytes = await fetch(templateUrl).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
        return res.arrayBuffer();
    });

    const processorCount = parseInt(localStorage.getItem('processorCount')) || 0;
    const processorTestResults = JSON.parse(localStorage.getItem('processorTestResults')) || {};

    for (let i = 1; i <= processorCount; i++) {
        console.log(`Processing Processor module ${i}`);
        // Create a new PDF document for each Processor module
        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        
        // Get module details
        const moduleDetails = processorModulesDetails[i-1] || {};
        const subrack = moduleDetails.subrack || 'N/A';
        const slot = moduleDetails.slot || 'N/A';
        const serial = moduleDetails.serial || 'N/A';
        const partNo = moduleDetails.partNo || 'N/A';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic module info - using generic field names
        currentForm.getTextField('ModuleNo').setText(i.toString());
        currentForm.getTextField('ProcessorCount').setText(processorCount.toString());
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);
        currentForm.getTextField('SubrackNo').setText(subrack);
        currentForm.getTextField('SlotNo').setText(slot);
        currentForm.getTextField('SN').setText(serial);
        currentForm.getTextField('PartNo').setText(partNo);
        
        // Get the test results for this specific module
        const qualityResults = processorTestResults.qualityInspections || {};
        const functionalResults = processorTestResults.functionalTests || {};
        
        // Fill quality inspection checkboxes (2 items per processor)
        for (let j = 1; j <= 2; j++) {
            const result = qualityResults[`proc_${i}_${j}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_PROC_QI_${j}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_PROC_QI_${j}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find quality checkbox for Processor ${i} item ${j}`);
            }
        }

        // Fill functional test checkboxes (4 items per processor)
        for (let j = 1; j <= 4; j++) {
            const result = functionalResults[`proc_${i}_${j}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_PROC_FT${j}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_PROC_FT${j}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find functional checkbox for Processor ${i} item ${j}`);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    }
}

// Processor Initialization processing
async function processProcessorInitialization(pdfDoc, currentUserData) {
    console.log("Processing Processor IEC101 & IEC104 Initialization");
    try {
        // Load the Processor Initialization template
        const templateUrl = `./PDF/DF1725IED FAT Test Processor part2.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Fill IEC101 Initialization test results
        const processorTestResults = JSON.parse(localStorage.getItem('processorTestResults') || "{}");
        const iec101Results = processorTestResults.iec101Tests || {};
        for (let i = 1; i <= 6; i++) {
            const result = iec101Results[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check Box_IEC101_Init_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check Box_IEC101_Init_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find IEC101 checkbox for item ${i}`);
            }
        }

        // Fill IEC104 Initialization test results
        const iec104Results = processorTestResults.iec104Tests || {};
        for (let i = 1; i <= 5; i++) {
            const result = iec104Results[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check Box_IEC104_Init_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check Box_IEC104_Init_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find IEC104 checkbox for item ${i}`);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Processor Initialization section:", error);
        throw error;
    }
}

// COM-6-A modules processing
async function processCom6Modules(pdfDoc, currentUserData) {
    console.log(`Processing COM-6-A modules`);
    const comCount = parseInt(localStorage.getItem('comCount')) || 0;
    const comModulesDetails = JSON.parse(localStorage.getItem('comModulesDetails') || "[]");
    const com6TestResults = JSON.parse(localStorage.getItem('com6TestResults') || '{}');

    if (comCount > 0) {
        // Load the COM-6-A template
        const templateUrl = `./PDF/DF1725IED FAT Test Record COM.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);
        currentForm.getTextField(`ComCount`).setText(comCount.toString() || 'N/A');

        // Fill COM-6-A module details and test results
        for (let i = 1; i <= comCount; i++) {
            const moduleDetails = comModulesDetails[i-1] || {};
            const partNo = moduleDetails.partNo || 'N/A';
            const subrack = moduleDetails.subrack || 'N/A';
            const slot = moduleDetails.slot || 'N/A';
            const serial = moduleDetails.serial || 'N/A';
            
            currentForm.getTextField(`COM_${i}_ModuleNo`).setText(i.toString());
            currentForm.getTextField(`COM_${i}_Subrack`).setText(subrack);
            currentForm.getTextField(`COM_${i}_Slot`).setText(slot);
            currentForm.getTextField(`COM_${i}_Serial`).setText(serial);

            // Fill quality inspection results (2 items per module)
            for (let j = 1; j <= 2; j++) {
                const qualityResult = com6TestResults.qualityInspections?.[`com6_${i}_${j}`] || 'NO';
                try {
                    if (qualityResult === 'OK') {
                        currentForm.getCheckBox(`Check_Box_COM_${i}_QI${j}_1`).check();
                    } else {
                        currentForm.getCheckBox(`Check_Box_COM_${i}_QI${j}_2`).check();
                    }
                } catch (e) {
                    console.warn(`Could not find quality checkbox for COM-6-A ${i} item ${j}`);
                }
            }

            // Fill functional test results (2 items per module)
            for (let j = 1; j <= 2; j++) {
                const functionalResult = com6TestResults.functionalTests?.[`com6_${i}_${j}`] || 'NO';
                try {
                    if (functionalResult === 'OK') {
                        currentForm.getCheckBox(`Check_Box_COM_${i}_FT${j}_1`).check();
                    } else {
                        currentForm.getCheckBox(`Check_Box_COM_${i}_FT${j}_2`).check();
                    }
                } catch (e) {
                    console.warn(`Could not find functional checkbox for COM-6-A ${i} item ${j}`);
                }
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        let pagesToCopy = comCount <= 4 ? [0] : [0, 1];
        const copiedPages = await pdfDoc.copyPages(currentPdf, pagesToCopy);

        // Add copied pages to the new PDF
        for (const page of copiedPages) {
            pdfDoc.addPage(page);
        }
    }
}

// DI modules processing
// DI modules processing
async function processDIModules(pdfDoc, currentUserData, diModulesDetails, diTestResults) {
    // Load the DI template just once
    const templateUrl = `./PDF/DI/DF1725IED FAT Test Record DI.pdf`; // Single template
    const templateBytes = await fetch(templateUrl).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
        return res.arrayBuffer();
    });
    DICount = parseInt(localStorage.getItem('diModulesToTest'));
    for (let i = 1; i <= currentUserData.diModulesToTest; i++) {
        // Create a new PDF document for each DI module
        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        
        // Get module details
        const moduleDetails = diModulesDetails[i-1] || {};
        const subrack = moduleDetails.subrack || 'N/A';
        const slot = moduleDetails.slot || 'N/A';
        const serial = moduleDetails.serial || 'N/A';
        const partNo = moduleDetails.partNo || 'N/A';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic module info - using generic field names
        currentForm.getTextField('ModuleNo').setText(i.toString());
        currentForm.getTextField('DICount').setText(DICount.toString());
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);
        currentForm.getTextField('SubrackNo').setText(subrack);
        currentForm.getTextField('SlotNo').setText(slot);
        currentForm.getTextField('SN').setText(serial);
        currentForm.getTextField('PartNo').setText(partNo);
        
        // Get the test results for this specific module
        const moduleResults = diTestResults[i] || {};
        
        // Fill quality inspection checkboxes (standardized field names)
        try {
            // Quality Inspection 1
            const quality1 = moduleResults.qualityInspections?.quality1 || 'NO';
            if (quality1 === 'OK') {
                currentForm.getCheckBox('QI1_OK').check();
            } else {
                currentForm.getCheckBox('QI1_NO').check();
            }
            
            // Quality Inspection 2
            const quality2 = moduleResults.qualityInspections?.quality2 || 'NO';
            if (quality2 === 'OK') {
                currentForm.getCheckBox('QI2_OK').check();
            } else {
                currentForm.getCheckBox('QI2_NO').check();
            }

        } catch (e) {
            console.warn(`Could not set quality/functional test checkboxes for DI module ${i}:`, e);
        }

        // Fill protocol values
        if (moduleResults.type === 'DI-32') {
            // Handle DI-32 module (32 channels)
            for (let j = 1; j <= 32; j++) {
                // Get values from saved results
                const iec101Value = moduleResults.iec101Values?.[`DI_${i}_IEC101_${j}`] || '';
                const iec104Value = moduleResults.iec104Values?.[`DI_${i}_IEC104_${j}`] || '';
                const dnp3Value = moduleResults.dnp3Values?.[`DI_${i}_DNP3_${j}`] || '';
                
                // Use generic field names with channel number only
                try {
                    if (iec101Value) currentForm.getTextField(`IEC101_${j}`).setText(iec101Value);
                    if (iec104Value) currentForm.getTextField(`IEC104_${j}`).setText(iec104Value);
                    if (dnp3Value) currentForm.getTextField(`DNP3_${j}`).setText(dnp3Value);
                } catch (e) {
                    console.warn(`Could not find PDF field for channel ${j}`);
                }
            }
        } else if (moduleResults.type === 'DI-16') {
            // Handle DI-16 module (16 channels)
            for (let j = 1; j <= 16; j++) {
                const inputIndex = (j - 1) * 5 + 2;
                const iec101Value = moduleResults.inputs?.[inputIndex] || '';
                const iec104Value = moduleResults.inputs?.[inputIndex + 1] || '';
                const dnp3Value = moduleResults.inputs?.[inputIndex + 2] || '';
                
                try {
                    if (iec101Value) currentForm.getTextField(`IEC101_${j}`).setText(iec101Value);
                    if (iec104Value) currentForm.getTextField(`IEC104_${j}`).setText(iec104Value);
                    if (dnp3Value) currentForm.getTextField(`DNP3_${j}`).setText(dnp3Value);
                } catch (e) {
                    console.warn(`Could not find PDF field for channel ${j}`);
                }
            }
        }

        // Handle checkbox values
        if (moduleResults.checkboxValues) {
            for (const [fieldName, isChecked] of Object.entries(moduleResults.checkboxValues)) {
                try {
                    // Extract the column and row number from the field name
                    // Expected format: "DI_1_FT_1_1" where:   Check_Box_DI_1_FT_1_1
                    // - First number is module number (ignored)
                    // - Second number is column (1-4)
                    // - Third number is row number
                    
                    // Split the field name to get components
                    const parts = fieldName.split('_');
                    if (parts.length >= 5) {
                        const column = parts[5]; // 1-4
                        const row = parts[6];    // row number
                        
                        const standardizedFieldName = `Check_Box_DI_FT_${column}_${row}`;
                        const pdfField = currentForm.getCheckBox(standardizedFieldName);
                        
                        if (isChecked) {
                            pdfField.check();
                        } else {
                            pdfField.uncheck();
                        }
                    } else {
                        console.warn(`Unexpected field name format: ${fieldName}`);
                    }
                } catch (e) {
                    console.warn(`Could not find PDF checkbox field for ${fieldName}`);
                }
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    }
}

// DO modules processing
async function processDOModules(pdfDoc, currentUserData, doModulesDetails, doTestResults) {
    console.log(`Processing ${currentUserData.doModulesToTest} DO modules`);
    
    // Load the DO template just once
    const templateUrl = `./PDF/DO/DF1725IED FAT Test Record DO.pdf`; // Single template
    const templateBytes = await fetch(templateUrl).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
        return res.arrayBuffer();
    });

    DOCount = parseInt(localStorage.getItem('doModulesToTest'));

    for (let i = 1; i <= currentUserData.doModulesToTest; i++) {
        console.log(`Processing DO module ${i}`);
        // Create a new PDF document for each DO module
        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        
        // Get module details
        const moduleDetails = doModulesDetails[i-1] || {};
        const subrack = moduleDetails.subrack || 'N/A';
        const slot = moduleDetails.slot || 'N/A';
        const serial = moduleDetails.serial || 'N/A';
        const partNo = moduleDetails.partNo || 'N/A';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic module info - using generic field names
        currentForm.getTextField('ModuleNo').setText(i.toString());
        currentForm.getTextField('DOCount').setText(DOCount.toString());
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);
        currentForm.getTextField('SubrackNo').setText(subrack);
        currentForm.getTextField('SlotNo').setText(slot);
        currentForm.getTextField('SN').setText(serial);
        currentForm.getTextField('PartNo').setText(partNo);
        
        // Get the test results for this specific module
        const moduleResults = doTestResults[i] || {};
        const moduleType = moduleResults.type || 'CO-16-A';
        const channelCount = moduleType === 'CO-16-A' ? 16 : 8;
        
        // Fill quality inspection checkboxes (standardized field names)
        try {
            // Quality Inspection 1
            const quality1 = moduleResults.qualityInspections?.quality1 || 'NO';
            if (quality1 === 'OK') {
                currentForm.getCheckBox('QI1_OK').check();
            } else {
                currentForm.getCheckBox('QI1_NO').check();
            }
            
            // Quality Inspection 2
            const quality2 = moduleResults.qualityInspections?.quality2 || 'NO';
            if (quality2 === 'OK') {
                currentForm.getCheckBox('QI2_OK').check();
            } else {
                currentForm.getCheckBox('QI2_NO').check();
            }

        } catch (e) {
            console.warn(`Could not set quality/functional test checkboxes for DO module ${i}:`, e);
        }

        // Fill protocol values
        for (let j = 1; j <= channelCount; j++) {
            // Get values from saved results
            const iec101Value = moduleResults.iec101Values?.[`DO_${i}_IEC101_${j}`] || '';
            const iec104Value = moduleResults.iec104Values?.[`DO_${i}_IEC104_${j}`] || '';
            const dnp3Value = moduleResults.dnp3Values?.[`DO_${i}_DNP3_${j}`] || '';
            
            // Use generic field names with channel number only
            try {
                if (iec101Value) currentForm.getTextField(`IEC101_${j}`).setText(iec101Value);
                if (iec104Value) currentForm.getTextField(`IEC104_${j}`).setText(iec104Value);
                if (dnp3Value) currentForm.getTextField(`DNP3_${j}`).setText(dnp3Value);
            } catch (e) {
                console.warn(`Could not find PDF field for channel ${j}`);
            }
        }

        // Handle checkbox values
        if (moduleResults.checkboxValues) {
            for (const [fieldName, isChecked] of Object.entries(moduleResults.checkboxValues)) {
                try {
                    // Extract the column and row number from the field name
                    // Expected format: "DO_1_FT_1_1" where: Check_Box_DO_1_FT_1_1
                    // - First number is module number (ignored)
                    // - Second number is column (1-4)
                    // - Third number is row number
                    
                    // Split the field name to get components
                    const parts = fieldName.split('_');
                    if (parts.length >= 5) {
                        const column = parts[5]; // 1-4
                        const row = parts[6];   // row number
                        
                        const standardizedFieldName = `Check_Box_DO_FT_${column}_${row}`;
                        const pdfField = currentForm.getCheckBox(standardizedFieldName);
                        
                        if (isChecked) {
                            pdfField.check();
                        } else {
                            pdfField.uncheck();
                        }
                    } else {
                        console.warn(`Unexpected field name format: ${fieldName}`);
                    }
                } catch (e) {
                    console.warn(`Could not find PDF checkbox field for ${fieldName}`);
                }
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    }
}


// AI modules processing
async function processAIModules(pdfDoc, currentUserData, aiModulesDetails, aiTestResults) {
    console.log(`Processing ${currentUserData.aiModulesToTest} AI modules`);
    
    // Load the AI template just once
    const templateUrl = `./PDF/AI/DF1725IED FAT Test Record AI.pdf`;
    const templateBytes = await fetch(templateUrl).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
        return res.arrayBuffer();
    });
    AICount = parseInt(localStorage.getItem('aiModulesToTest'));

    for (let i = 1; i <= currentUserData.aiModulesToTest; i++) {
        console.log(`Processing AI module ${i}`);
        // Create a new PDF document for each AI module
        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        
        // Get module details
        const moduleDetails = aiModulesDetails[i-1] || {};
        const subrack = moduleDetails.subrack || 'N/A';
        const slot = moduleDetails.slot || 'N/A';
        const serial = moduleDetails.serial || 'N/A';
        const partNo = moduleDetails.partNo || 'N/A';
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';
        // Fill basic module info - using generic field names
        currentForm.getTextField('ModuleNo').setText(i.toString());
        currentForm.getTextField('AICount').setText(AICount.toString());
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);
        currentForm.getTextField('SubrackNo').setText(subrack);
        currentForm.getTextField('SlotNo').setText(slot);
        currentForm.getTextField('SN').setText(serial);
        currentForm.getTextField('PartNo').setText(partNo);
        
        // Get the test results for this specific module
        const moduleResults = aiTestResults[i] || {};
        
        // Fill quality inspection checkboxes
        try {
            const quality1 = moduleResults.qualityInspections?.quality1 || 'NO';
            const quality2 = moduleResults.qualityInspections?.quality2 || 'NO';
            
            if (quality1 === 'OK') {
                currentForm.getCheckBox('QI1_OK').check();
            } else {
                currentForm.getCheckBox('QI1_NO').check();
            }
            
            if (quality2 === 'OK') {
                currentForm.getCheckBox('QI2_OK').check();
            } else {
                currentForm.getCheckBox('QI2_NO').check();
            }
        } catch (e) {
            console.warn(`Could not set quality checkboxes for AI module ${i}:`, e);
        }

        // Fill current test values for each channel (8 channels)
        for (let channel = 1; channel <= 8; channel++) {
            // Current test values (0mA, 4mA, etc.)
            const currentFields = ['0mA', '4mA', '8mA', '12mA', '16mA', '20mA'];
            
            currentFields.forEach(field => {
                const value = moduleResults.currentValues?.[`AI_${i}_${field}_${channel}`] || '';
                try {
                    // Field names in format: "0mA_1", "4mA_1", etc. for channel 1
                    currentForm.getTextField(`AI_${channel}_${field}`).setText(value);
                } catch (e) {
                    console.warn(`Could not find PDF field ${channel}_${field} for AI module ${i}`);
                }
            });

            // Protocol values (IEC101, IEC104, DNP3)
            const protocolFields = ['IEC101', 'IEC104', 'DNP3'];
            
            protocolFields.forEach(protocol => {
                const value = moduleResults[`${protocol.toLowerCase()}Values`]?.[`AI_${i}_${protocol}_${channel}`] || '';
                try {
                    // Field names in format: "IEC101_1", "IEC104_1", etc. for channel 1
                    currentForm.getTextField(`AI_${channel}_${protocol}`).setText(value);
                } catch (e) {
                    console.warn(`Could not find PDF field AI_${channel}_${protocol} for AI module ${i}`);
                }
            });
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    }
}

//Processor Parameter Setting section
async function processParameterSetting(pdfDoc, currentUserData) {
    console.log("Processing Parameter Setting section");
    try {
        // Load the Parameter Setting template
        const templateUrl = `./PDF/DF1725IED FAT Test Record Param Setting.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved parameter results
        const processorParamResults = JSON.parse(localStorage.getItem('processorParamResults') || '{}');
        
        // Process MCU-1-A parameters (4 items)
        for (let i = 1; i <= 4; i++) {
            const result = processorParamResults.mcu1aParams?.[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_ParamMCU-1-A_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_ParamMCU-1-A_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find parameter checkbox for MCU-1-A item ${i}`);
            }
        }

        // Process MCU-4-A parameters (4 items)
        for (let i = 1; i <= 4; i++) {
            const result = processorParamResults.mcu4aParams?.[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_ParamMCU-4-A_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_ParamMCU-4-A_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find parameter checkbox for MCU-4-A item ${i}`);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Parameter Setting section:", error);
        throw error;
    }
}

// Digital Input Parameter Setting section
async function processDIParameterSetting(pdfDoc, currentUserData) {
    console.log("Processing Digital Input Parameter Setting section");
    try {
        // Load the Parameter Setting template (page 2)
        const templateUrl = `./PDF/DF1725IED FAT Test Record Param Setting.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved digital input parameter results
        const diParamResults = JSON.parse(localStorage.getItem('digitalInputParamResults') || '{}');
        
        // Process Under Card Module parameters (5 items)
        for (let i = 1; i <= 5; i++) {
            const result = diParamResults.underCardParams?.[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_ParamDI_UCM_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_ParamDI_UCM_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find parameter checkbox for Under Card Module item ${i}`);
            }
        }

        // Process Under Logical Module parameters (7 items)
        for (let i = 1; i <= 7; i++) {
            const result = diParamResults.underLogicParams?.[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_ParamDI_ULM_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_ParamDI_ULM_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find parameter checkbox for Under Logical Module item ${i}`);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [1]); // Using page 1 (second page) for DI parameters
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Digital Input Parameter Setting section:", error);
        throw error;
    }
}

// Digital Output Parameter Setting section
async function processDOParameterSetting(pdfDoc, currentUserData) {
    console.log("Processing Digital Output Parameter Setting section");
    try {
        // Load the Parameter Setting template (page 3)
        const templateUrl = `./PDF/DF1725IED FAT Test Record Param Setting.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved digital output parameter results
        const doParamResults = JSON.parse(localStorage.getItem('digitalOutputParamResults') || '{}');
        
        // Process Under Card Module parameters (3 items)
        for (let i = 1; i <= 3; i++) {
            const result = doParamResults.underCardParams?.[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_ParamDO_UCM_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_ParamDO_UCM_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find parameter checkbox for Digital Output Under Card Module item ${i}`);
            }
        }

        // Process Under Logical Module parameters (4 items)
        for (let i = 1; i <= 4; i++) {
            const result = doParamResults.underLogicParams?.[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_ParamDO_ULM_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_ParamDO_ULM_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find parameter checkbox for Digital Output Under Logical Module item ${i}`);
            }
        }

        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [2]); // Using page 2 (third page) for DO parameters
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Digital Output Parameter Setting section:", error);
        throw error;
    }
}

// Analog Input Parameter Setting section
async function processAIParameterSetting(pdfDoc, currentUserData) {
    console.log("Processing Analog Input Parameter Setting section");
    try {
        // Load the Parameter Setting template (page 4)
        const templateUrl = `./PDF/DF1725IED FAT Test Record Param Setting.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved analog input parameter results
        const aiParamResults = JSON.parse(localStorage.getItem('analogInputParamResults') || '{}');
        
        // Process Under Card Module parameters (3 items)
        for (let i = 1; i <= 3; i++) {
            const result = aiParamResults.underCardParams?.[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_ParamAI_UCM_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_ParamAI_UCM_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find parameter checkbox for Analog Input Under Card Module item ${i}`);
            }
        }

        // Process Under Logical Module parameters (10 items)
        for (let i = 1; i <= 10; i++) {
            const result = aiParamResults.underLogicParams?.[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_ParamAI_ULM_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_ParamAI_ULM_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find parameter checkbox for Analog Input Under Logical Module item ${i}`);
            }
        }

        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [3]); // Using page 3 (fourth page) for AI parameters
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Analog Input Parameter Setting section:", error);
        throw error;
    }
}

// IEC101 Parameter Setting section
async function processIEC101ParameterSetting(pdfDoc, currentUserData) {
    console.log("Processing IEC101 Parameter Setting section");
    try {
        // Load the Parameter Setting template (page 5)
        const templateUrl = `./PDF/DF1725IED FAT Test Record Param Setting.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        
        // Get the saved IEC101 parameter results
        const iec101ParamResults = JSON.parse(localStorage.getItem('iec101ParamResults') || '{}');
        
        // Process IEC101 parameters (18 items)
        for (let i = 1; i <= 18; i++) {
            const result = iec101ParamResults.iec101Params?.[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_ParamIEC101_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_ParamIEC101_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find parameter checkbox for IEC101 item ${i}`);
            }
        }

        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [4]); // Using page 4 (5th page) for IEC101 parameters
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process IEC101 Parameter Setting section:", error);
        throw error;
    }
}

// IEC104 Parameter Setting section
async function processIEC104ParameterSetting(pdfDoc, currentUserData) {
    console.log("Processing IEC104 Parameter Setting section");
    try {
        // Load the Parameter Setting template (page 6)
        const templateUrl = `./PDF/DF1725IED FAT Test Record Param Setting.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved IEC104 parameter results
        const iec104ParamResults = JSON.parse(localStorage.getItem('iec104ParamResults') || '{}');
        
        // Process IEC104 parameters (16 items)
        for (let i = 1; i <= 16; i++) {
            const result = iec104ParamResults.iec104Params?.[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_ParamIEC104_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_ParamIEC104_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find parameter checkbox for IEC104 item ${i}`);
            }
        }

        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [5]); // Using page 5 (6th page) for IEC104 parameters
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process IEC104 Parameter Setting section:", error);
        throw error;
    }
}

// Channel Redundancy Test processing section
async function processChannelRedundancyTest(pdfDoc, currentUserData) {
    console.log("Processing Channel Redundancy Test section");
    try {
        // Load the Channel Redundancy Test template
        const templateUrl = `./PDF/DF1725IED FAT Test Record Channel Redundacy Test.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved channel redundancy test results
        const channelRedundancyResults = JSON.parse(localStorage.getItem('channelRedundancyResults') || {
            iec101: {},
            iec104: {}
        });

        // Fill IEC101 test results (5 items)
        for (let i = 1; i <= 5; i++) {
            const result = channelRedundancyResults.iec101[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_CRT_IEC101_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_CRT_IEC101_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find checkbox for IEC101 Channel Redundancy Test item ${i}`);
            }
        }

        // Fill IEC104 test results (5 items)
        for (let i = 1; i <= 5; i++) {
            const result = channelRedundancyResults.iec104[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_CRT_IEC104_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_CRT_IEC104_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find checkbox for IEC104 Channel Redundancy Test item ${i}`);
            }
        }

        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Channel Redundancy Test section:", error);
        throw error;
    }
}

// Virtual Alarm Test processing section
// Virtual Alarm Test processing section
async function processVirtualAlarmTest(pdfDoc, currentUserData) {
    console.log("Processing Virtual Alarm Test section");
    try {
        // Load the Virtual Alarm Test template
        const templateUrl = `./PDF/DF1725IED FAT Test Record Virtual Alarm Test.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved virtual alarm test results
        const virtualAlarmResults = JSON.parse(localStorage.getItem('virtualAlarmTestResults') || {});
        
        // Process each virtual alarm test item (7 items)
        for (let i = 1; i <= 7; i++) {
            const testResult = virtualAlarmResults.virtualAlarmTests?.[`item_${i}`] || {};
            
            // Initialize to unchecked if no result exists
            
            try {
                // Handle IEC101 checkbox
                const iec101Checkbox = currentForm.getCheckBox(`Check_Box_VAT_IEC101_${i}`);
                iec101Checkbox.uncheck(); // First uncheck to ensure clean state
                if (testResult.iec101 == "OK") {
                    iec101Checkbox.check();
                }
                
                // Handle IEC101 IOA value if exists
                if (testResult.iec101IOA) {
                    currentForm.getTextField(`VAT_IEC101_${i}`).setText(testResult.iec101IOA);
                }
            } catch (e) {
                console.warn(`Could not find checkbox or text field for Virtual Alarm Test IEC101 item ${i}`);
            }

            try {
                // Handle IEC104 checkbox
                const iec104Checkbox = currentForm.getCheckBox(`Check_Box_VAT_IEC104_${i}`);
                iec104Checkbox.uncheck(); // First uncheck to ensure clean state
                if (testResult.iec104 == "OK") {
                    iec104Checkbox.check();
                }

                // Handle IEC104 IOA value if exists
                if (testResult.iec104IOA) {
                    currentForm.getTextField(`VAT_IEC104_${i}`).setText(testResult.iec104IOA);
                }
            } catch (e) {
                console.warn(`Could not find checkbox or text field for Virtual Alarm Test IEC104 item ${i}`);
            }
        }

        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Virtual Alarm Test section:", error);
        throw error;
    }
}

// RTU Panel Accessories processing
async function processRTUPanelAccessories(pdfDoc, currentUserData) {
    console.log("Processing RTU Panel Accessories section");
    try {
        // Load the RTU Panel Accessories template
        const templateUrl = `./PDF/DF1725IED FAT Test Record-RTU Panel Accesories.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved RTU Panel Accessories results
        const rtuPanelResults = JSON.parse(localStorage.getItem('rtuPanelAccessoriesResults') || '{}');
        const accessories = rtuPanelResults.accessories || {};

        // Fill each accessory item (25 items)
        for (let i = 1; i <= 25; i++) {
            const item = accessories[`item_${i}`];
            if (!item) continue;

            // Fill brand, model, quantity, datasheet and OK status
            try {
                // Brand (text field)
                currentForm.getTextField(`Item_${i}_Brand`).setText(item.brand || '');
                
                // Model (text field)
                currentForm.getTextField(`Item_${i}_Model`).setText(item.model || '');
                
                // Quantity (text field)
                currentForm.getTextField(`Item_${i}_Quantity`).setText(item.quantity || '');
                
                // Datasheet checkbox
                if (item.datasheet === 'YES') {
                    currentForm.getTextField(`Item_${i}_Data`).setText(item.datasheet || '');
                } else {
                    currentForm.getTextField(`Item_${i}_Data`).setText('NO');
                }
                
                // OK checkbox
                if (item.ok === 'OK') {
                    currentForm.getCheckBox(`Item_${i}_OK`).check();
                } else {
                    currentForm.getCheckBox(`Item_${i}_OK`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not find fields for accessory item ${i}:`, e);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const copiedPages = await pdfDoc.copyPages(currentPdf, [0, 1, 2]); // Copy all 3 pages
        for (const page of copiedPages) {
            pdfDoc.addPage(page);
        }
    } catch (error) {
        console.error("Failed to process RTU Panel Accessories section:", error);
        throw error;
    }
}

// Electronic Accessories processing
async function processElectronicAccessories(pdfDoc, currentUserData) {
    console.log("Processing Electronic Accessories section");
    try {
        // Load the Electronic Accessories template
        const templateUrl = `./PDF/DF1725IED FAT Test Record-electronic accessories.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';


        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);

        // Get the saved Electronic Accessories results
        const electronicAccResults = JSON.parse(localStorage.getItem('electronicAccessoriesResults') || '{}');
        const accessories = electronicAccResults.accessories || {};

        // Fill each accessory item (12 items)
        for (let i = 1; i <= 12; i++) {
            const item = accessories[`item_${i}`];
            if (!item) continue;

            // Fill brand, model, quantity, datasheet and OK status
            try {
                // Brand (text field)
                currentForm.getTextField(`Item_EA_${i}_brand`).setText(item.brand || '');
                
                // Model (text field)
                currentForm.getTextField(`Item_EA_${i}_model`).setText(item.model || '');
                
                // Quantity (text field)
                currentForm.getTextField(`Item_EA_${i}_quantity`).setText(item.quantity || '');
                
                // Datasheet checkbox
                if (item.datasheet === 'YES') {
                    currentForm.getTextField(`Item_EA_${i}_data`).setText(item.datasheet || '');
                } else {
                    currentForm.getTextField(`Item_EA_${i}_data`).setText('NO');
                }
                
                // OK checkbox
                if (item.ok === 'OK') {
                    currentForm.getCheckBox(`Item_EA_${i}_OK`).check();
                } else {
                    currentForm.getCheckBox(`Item_EA_${i}_OK`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not find fields for electronic accessory item ${i}:`, e);
            }
        }
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Electronic Accessories section:", error);
        throw error;
    }
}

async function processProductDeclarationSection(pdfDoc, currentUserData) {
    console.log("Processing Product Declaration section");

    try {
        const templateUrl = `./PDF/DF1725IED FAT Test Record-Product Declaration.pdf`; // your template
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        const declarationResults = JSON.parse(localStorage.getItem('productDeclarationResults') || '{}');
        const declarations = declarationResults.declarations || {};

        // Loop through 4 items
        for (let i = 1; i <= 4; i++) {
            const item = declarations[`item_${i}`];
            if (!item) continue;

            // Fill remarks
            if (i === 2 && Array.isArray(item.remarks)) {
                // Handle multi-remark format for item 2
                const protocols = ['IEC101', 'IEC104', 'DNP3'];
                for (let j = 0; j < item.remarks.length; j++) {
                    const fieldName = `Item_${i}_Remark_${protocols[j]}`;
                    try {
                        currentForm.getTextField(fieldName).setText(item.remarks[j]);
                    } catch (e) {
                        console.warn(`Could not set field ${fieldName}`);
                    }
                }
            } else {
                // Handle single remark
                const fieldName = `Item_${i}_Remark_${item.remarks?.startsWith("Others") ? "Others" : "1"}`;

                try {
                    const cleanRemarks = (item.remarks || '').replace(/^Others:\s*/, '');
                    
                    if (fieldName === "Item_4_Remark_Others") {
                        currentForm.getTextField(fieldName).setText((cleanRemarks + ' VDC').trim());
                    } else {
                        currentForm.getTextField(fieldName).setText(cleanRemarks);
                    }
                } catch (e) {
                    console.warn(`Could not set field ${fieldName}`);
                }
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();

        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);

    } catch (error) {
        console.error("Failed to process Product Declaration section:", error);
        throw error;
    }
}

// Panel Information processing
async function processPanelInformation(pdfDoc, currentUserData) {
    console.log("Processing Panel Information section");
    try {
        // Load the Panel Information template
        const templateUrl = `./PDF/DF1725IED FAT Test Record-Panel Information.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved panel test results
        const panelTestResults = JSON.parse(localStorage.getItem('panelTestResults')) || {
            physicalInspections: {},
            qualityTests: {},
            measurements: {}
        };

        // Fill physical inspection results (3 items)
        for (let i = 1; i <= 3; i++) {
            const result = panelTestResults.physicalInspections[`panel_${i}`] || 'NO';
            const measurement = panelTestResults.measurements[`panel_${i}`] || '';
            
            try {
                // Set measurement value
                currentForm.getTextField(`Panel_Measurement_${i}`).setText(measurement);
                
                // Set OK/NO radio buttons
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_Panel_Physical_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_Panel_Physical_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find fields for panel physical inspection item ${i}`);
            }
        }

        // Fill quality inspection results (6 items)
        for (let i = 1; i <= 6; i++) {
            const result = panelTestResults.qualityTests[`panel_${i}`] || 'NO';
            
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_Panel_Quality_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_Panel_Quality_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find fields for panel quality inspection item ${i}`);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Panel Information section:", error);
        throw error;
    }
}

// Subrack Inspection processing
async function processSubrackInspection(pdfDoc, currentUserData) {
    console.log("Processing Subrack Inspection section");
    try {
        // Load the Subrack Inspection template
        const templateUrl = `./PDF/DF1725IED FAT Test Record-Subrack Inspection.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved subrack test results
        const subrackTestResults = JSON.parse(localStorage.getItem('subrackTestResults')) || {
            qualityInspections: {}
        };

        // Get subrack details from session storage
        const subrackModulesDetails = JSON.parse(localStorage.getItem('subrackModulesDetails')) || [];
        const subrackCount = parseInt(localStorage.getItem('session_subrackCount')) || 0;

        // Fill subrack numbers, part numbers, serial numbers and quality inspection results
        for (let i = 1; i <= subrackCount; i++) {
            const subrackDetails = subrackModulesDetails[i-1] || {};
            
            try {
                // Set the subrack number
                currentForm.getTextField(`Subrack${i}`).setText(i.toString());
                
                // Set part number if field exists
                try {
                    currentForm.getTextField(`PN_Subrack${i}`).setText(subrackDetails.partNo || 'N/A');
                } catch (e) {
                    console.log(`Part number field not found for subrack ${i}`);
                }
                
                // Set serial number if field exists
                try {
                    currentForm.getTextField(`SN_Subrack${i}`).setText(subrackDetails.serial || 'N/A');
                } catch (e) {
                    console.log(`Serial number field not found for subrack ${i}`);
                }

                // Set the quality inspection result
                const qualityResult = subrackTestResults.qualityInspections[`subrack_${i}`] || 'NO';
                if (qualityResult === 'OK') {
                    currentForm.getCheckBox(`Check_Box_Subrack_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_Subrack_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find fields for Subrack ${i}`, e);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Subrack Inspection section:", error);
        throw error;
    }
}


// Add this function to generatePDF.js (place it with other similar functions)
async function processPreRequisiteSection(pdfDoc, currentUserData) {
    console.log("Processing Pre-Requisite section");
    try {
        // Load the Pre-Requisite template
        const templateUrl = `./PDF/DF1725IED FAT Test Record-Pre-requisite.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Add Experience field from localStorage
        const experience = localStorage.getItem('session_experience') || 'N/A';
        try {
            currentForm.getTextField('Experience').setText(experience);
        } catch (e) {
            console.warn("Could not find Experience field in PDF template");
        }
        
        // Get the saved pre-requisite results
        const preRequisiteResults = JSON.parse(localStorage.getItem('preRequisiteTestResults')) || {};
        
        // 1. Approved Drawings (6 items)
        for (let i = 1; i <= 6; i++) {
            const item = preRequisiteResults.approvedDrawings?.[i-1] || {};
            try {
                // Set revision if field exists
                try {
                    currentForm.getTextField(`AD_${i}_Revision`).setText(item.revision || '');
                } catch (e) {
                    console.log(`Revision field not found for Approved Drawing ${i}`);
                }
                
                // Set date if field exists
                try {
                    currentForm.getTextField(`AD_${i}_Date`).setText(item.date || '');
                } catch (e) {
                    console.log(`Date field not found for Approved Drawing ${i}`);
                }
                
                // Set OK/NO status
                if (item.ok) {
                    currentForm.getCheckBox(`Check_Box_AD_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_AD_${i}_1`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not process Approved Drawing item ${i}:`, e);
            }
        }

        // 2. Panel IP Certificate (4 items)
        for (let i = 1; i <= 4; i++) {
            const item = preRequisiteResults.panelIPCertificate?.[i-1] || {};
            try {
                if (item.applicable) {
                    currentForm.getCheckBox(`Check_Box_PIC_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_PIC_${i}_1`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not process Panel IP Certificate item ${i}:`, e);
            }
        }

        // 3. Test Equipment Record (3 items)
        for (let i = 1; i <= 3; i++) {
            const item = preRequisiteResults.testEquipmentRecord?.[i-1] || {};
            try {
                // Set item details if fields exist
                try {
                    currentForm.getTextField(`TER_${i}_Item`).setText(item.item || '');
                    currentForm.getTextField(`TER_${i}_Brand`).setText(item.brand || '');
                    currentForm.getTextField(`TER_${i}_Model`).setText(item.model || '');
                    currentForm.getTextField(`TER_${i}_Serial`).setText(item.serialNumber || '');
                } catch (e) {
                    console.log(`Some fields not found for Test Equipment Record ${i}`);
                }
            } catch (e) {
                console.warn(`Could not process Test Equipment Record item ${i}:`, e);
            }
        }

        // 4. Measuring Equipment Record (4 items)
        for (let i = 1; i <= 4; i++) {
            const item = preRequisiteResults.measuringEquipmentRecord?.[i-1] || {};
            try {
                // Set item details if fields exist
                try {
                    currentForm.getTextField(`MER_${i}_Item`).setText(item.item || '');
                    currentForm.getTextField(`MER_${i}_Brand`).setText(item.brand || '');
                    currentForm.getTextField(`MER_${i}_Model`).setText(item.model || '');
                    currentForm.getTextField(`MER_${i}_Serial`).setText(item.serialNumber || '');
                    currentForm.getTextField(`MER_${i}_CalDate`).setText(item.calDate || '');
                    currentForm.getTextField(`MER_${i}_CalDueDate`).setText(item.calDueDate || '');
                } catch (e) {
                    console.log(`Some fields not found for Measuring Equipment Record ${i}`);
                }
            } catch (e) {
                console.warn(`Could not process Measuring Equipment Record item ${i}:`, e);
            }
        }

        // 5. Software Record (2 items)
        for (let i = 1; i <= 2; i++) {
            const item = preRequisiteResults.softwareRecord?.[i-1] || {};
            try {
                if (item.ok) {
                    currentForm.getCheckBox(`Check_Box_SR_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_SR_${i}_1`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not process Software Record item ${i}:`, e);
            }
        }

        // Add module quantities
        const moduleQuantities = {
            // Initialize all quantities to 0 - we'll calculate them based on actual part numbers
            "1725IED_SUBRACK 19\"": '0',
            "1725IED_SUBRACK 2/3 19\"": '0',
            "1725IED_SUBRACK 1/2 19\"": '0',
            "1725IED_MCU-1-A": '0',
            "1725IED_MCU-4-A": '0',
            "1725IED_DI-32-24V": '0',
            "1725IED_DI-16-24V-A": '0',
            "1725IED_DI-16-110V": '0',
            "1725IED_CO-8-A": '0',
            "1725IED_CO-16-A": '0',
            "1725IED_DCAI-8-A": '0',
            "1725IED_POWER-110/220V": '0',
            "1725IED_POWER-24V-A": '0',
            "1725IED_COM-6-A": localStorage.getItem('session_comCount') || '0' // Only this one stays as session storage value
        };

        // Get all module details from session storage
        const diModulesDetails = JSON.parse(localStorage.getItem('diModulesDetails')) || [];
        const doModulesDetails = JSON.parse(localStorage.getItem('doModulesDetails')) || [];
        const processorModulesDetails = JSON.parse(localStorage.getItem('processorModulesDetails')) || [];
        const powerModulesDetails = JSON.parse(localStorage.getItem('powerModulesDetails')) || [];
        const subrackModulesDetails = JSON.parse(localStorage.getItem('subrackModulesDetails')) || [];
        const aiModulesDetails = JSON.parse(localStorage.getItem('aiModulesDetails')) || [];

        // Count subrack modules based on part numbers
        subrackModulesDetails.forEach(module => {
            const partNo = module.partNo || '';
            if (partNo.includes("Subrack 19\"")) {
                moduleQuantities["1725IED_SUBRACK 19\""] = (parseInt(moduleQuantities["1725IED_SUBRACK 19\""]) + 1).toString();
            } else if (partNo.includes("Subrack 2/3 19\"")) {
                moduleQuantities["1725IED_SUBRACK 2/3 19\""] = (parseInt(moduleQuantities["1725IED_SUBRACK 2/3 19\""]) + 1).toString();
            } else if (partNo.includes("Subrack 1/2 19\"")) {
                moduleQuantities["1725IED_SUBRACK 1/2 19\""] = (parseInt(moduleQuantities["1725IED_SUBRACK 1/2 19\""]) + 1).toString();
            }
        });

        // Count processor modules based on part numbers
        processorModulesDetails.forEach(module => {
            const partNo = module.partNo || '';
            if (partNo.includes("MCU-1-A")) {
                moduleQuantities["1725IED_MCU-1-A"] = (parseInt(moduleQuantities["1725IED_MCU-1-A"]) + 1).toString();
            } else if (partNo.includes("MCU-4-A")) {
                moduleQuantities["1725IED_MCU-4-A"] = (parseInt(moduleQuantities["1725IED_MCU-4-A"]) + 1).toString();
            }
        });

        // Count DI modules based on part numbers
        diModulesDetails.forEach(module => {
            const partNo = module.partNo || '';
            if (partNo.includes("DI-32-24V")) {
                moduleQuantities["1725IED_DI-32-24V"] = (parseInt(moduleQuantities["1725IED_DI-32-24V"]) + 1).toString();
            } else if (partNo.includes("DI-16-24V-A")) {
                moduleQuantities["1725IED_DI-16-24V-A"] = (parseInt(moduleQuantities["1725IED_DI-16-24V-A"]) + 1).toString();
            } else if (partNo.includes("DI-16-110V")) {
                moduleQuantities["1725IED_DI-16-110V"] = (parseInt(moduleQuantities["1725IED_DI-16-110V"]) + 1).toString();
            }
        });

        // Count DO modules based on part numbers
        doModulesDetails.forEach(module => {
            const partNo = module.partNo || '';
            if (partNo.includes("CO-8-A")) {
                moduleQuantities["1725IED_CO-8-A"] = (parseInt(moduleQuantities["1725IED_CO-8-A"]) + 1).toString();
            } else if (partNo.includes("CO-16-A")) {
                moduleQuantities["1725IED_CO-16-A"] = (parseInt(moduleQuantities["1725IED_CO-16-A"]) + 1).toString();
            }
        });

        // Count AI modules (only one type in this case)
        aiModulesDetails.forEach(() => {
            moduleQuantities["1725IED_DCAI-8-A"] = (parseInt(moduleQuantities["1725IED_DCAI-8-A"]) + 1).toString();
        });

        // Count power modules based on part numbers
        powerModulesDetails.forEach(module => {
            const partNo = module.partNo || '';
            if (partNo.includes("POWER-110/220V")) {
                moduleQuantities["1725IED_POWER-110/220V"] = (parseInt(moduleQuantities["1725IED_POWER-110/220V"]) + 1).toString();
            } else if (partNo.includes("POWER-24V-A")) {
                moduleQuantities["1725IED_POWER-24V-A"] = (parseInt(moduleQuantities["1725IED_POWER-24V-A"]) + 1).toString();
            }
        });

        // Fill the quantities in the PDF form
        let i = 1;
        for (const [moduleName, quantity] of Object.entries(moduleQuantities)) {
            try {
                const fieldName = `BQ_${i}_Quantity`;
                currentForm.getTextField(fieldName).setText(quantity);
                i++;
            } catch (e) {
                console.warn(`Could not find quantity field for module ${moduleName}`);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const copiedPages = await pdfDoc.copyPages(currentPdf, [0, 1, 2]); // Copy all 3 pages
        for (const page of copiedPages) {
            pdfDoc.addPage(page);
        }
    } catch (error) {
        console.error("Failed to process Pre-Requisite section:", error);
        throw error;
    }
}

function validateModuleCounts() {
    const processorCount = parseInt(localStorage.getItem('processorCount')) || 0;
    const processorModules = JSON.parse(localStorage.getItem('processorModulesDetails') || []);
    
    if (processorCount !== processorModules.length) {
        console.error(`Mismatch: processorCount=${processorCount}, actual modules=${processorModules.length}`);
        return false;
    }
    // Add similar checks for other module types
    return true;
}

// Add this function with other similar functions
async function processRTUPowerUp(pdfDoc, currentUserData) {
    console.log("Processing RTU Power Up section");
    try {
        // Load the RTU Power Up template
        const templateUrl = `./PDF/DF1725IED FAT Test Record RTU Power Up.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';
        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved RTU Power Up test results
        const rtuPowerUpResults = JSON.parse(localStorage.getItem('rtuPowerUpTestResults') || {
            RTUPowerUpTest: {},
            RTUPowerUpInspection: {}
        });

        // Process RTU Power Up Test (voltage measurements)
        for (let i = 1; i <= 2; i++) {
            const testItem = rtuPowerUpResults.RTUPowerUpTest[`item_${i}`] || {};
            const result = testItem.result || 'NO';
            const voltageValue = testItem.voltage || '';
            
            try {
                // Set voltage value if field exists
                currentForm.getTextField(`RTU_PowerUp_Voltage_${i}`).setText(voltageValue);
                
                // Set OK/NO status
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_RTU_PowerUp_Test_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_RTU_PowerUp_Test_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not process RTU Power Up Test item ${i}:`, e);
            }
        }

        // Process RTU Power Up Inspection (visual checks)
        for (let i = 1; i <= 5; i++) {
            const result = rtuPowerUpResults.RTUPowerUpInspection[`item_${i}`] || 'NO';
            
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_RTU_PowerUp_Inspect_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_RTU_PowerUp_Inspect_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not process RTU Power Up Inspection item ${i}:`, e);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process RTU Power Up section:", error);
        throw error;
    }
}

// Add this function with other similar functions in generatePDF.js
async function processDummyCesTest(pdfDoc, currentUserData) {
    console.log("Processing Dummy Breaker, CES & Buzzer Functional Test section");
    try {
        // Load the Dummy & CES Functional Test template
        const templateUrl = `./PDF/DF1725IED FAT Test Record Dummy&CES.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved test results
        const dummyCesResults = JSON.parse(localStorage.getItem('dummyCesTestResults')) || {
            DummyBreakerCESFunctionalTest: {},
            BuzzerTest: {}
        };

        // Process Dummy Breaker & CES Functional Test items (4 items)
        for (let i = 1; i <= 4; i++) {
            const result = dummyCesResults.DummyBreakerCESFunctionalTest[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_Dummy_CES_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_Dummy_CES_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find checkbox for Dummy Breaker & CES Functional Test item ${i}`);
            }
        }

        // Process Buzzer Test items (2 items)
        for (let i = 1; i <= 2; i++) {
            const result = dummyCesResults.BuzzerTest[`item_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_Buzzer_${i}_1`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_Buzzer_${i}_2`).check();
                }
            } catch (e) {
                console.warn(`Could not find checkbox for Buzzer Test item ${i}`);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Dummy Breaker, CES & Buzzer Functional Test section:", error);
        throw error;
    }
}

// Test Setup processing
async function processTestSetup(pdfDoc, currentUserData) {
    console.log("Processing Test Setup section");
    try {
        // Load the Test Setup template
        const templateUrl = `./PDF/DF1725IED FAT Test Record-Test Setup.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';

        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved test setup results from localStorage
        const testSetupResults = JSON.parse(localStorage.getItem('testSetupResults')) || {
            connections: {}
        };

        // Fill connection checkboxes (4 items)
        for (let i = 1; i <= 4; i++) {
            const result = testSetupResults.connections[`connection_${i}`] || 'NO';
            try {
                if (result === 'OK') {
                    currentForm.getCheckBox(`Check_Box_Connection_${i}`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_Connection_${i}`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not find checkbox for connection ${i}`);
            }
        }
        // Add signature
        await addSignatureToForm(currentForm, currentPdf);
        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Test Setup section:", error);
        throw error;
    }
}

async function processLimitOfAuthority(pdfDoc, currentUserData) {
    console.log("Processing Limit of Authority section");
    try {
        // Load the Limit of Authority template
        const templateUrl = `./PDF/DF1725IED FAT Test Record Limit of Authority.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const rtuSerial = localStorage.getItem('session_rtuSerial') || 'N/A';
        const contractNo = localStorage.getItem('session_contractNo') || 'N/A';
        const projectName = localStorage.getItem('session_projectName') || 'N/A';
        const testerName = localStorage.getItem('session_name') || 'N/A';
        
        // Fill basic info
        currentForm.getTextField('RTUSerialNumber').setText(rtuSerial);
        currentForm.getTextField('ContractNo').setText(contractNo);
        currentForm.getTextField('TesterName').setText(testerName);

        // Get the saved limit of authority results
        const limitOfAuthorityResults = JSON.parse(localStorage.getItem('limitOfAuthorityResults') || '{}');
        const users = limitOfAuthorityResults.users || {};

        // Process each user (4 users: admin, operator, engineer, viewer)
        const userTypes = ['admin', 'operator', 'engineer', 'viewer'];
        
        for (let i = 0; i < userTypes.length; i++) {
            const userType = userTypes[i];
            const user = users[userType] || {};
            const authorities = user.authorities || {};

            // Data Viewing
            try {
                if (authorities.dataViewing) {
                    currentForm.getCheckBox(`Check_Box_User_${i+1}_DataViewing`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_User_${i+1}_DataViewing`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not find checkboxes for User ${i+1} Data Viewing`);
            }

            // Control Operation
            try {
                if (authorities.controlOperation) {
                    currentForm.getCheckBox(`Check_Box_User_${i+1}_ControlOperation`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_User_${i+1}_ControlOperation`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not find checkboxes for User ${i+1} Control Operation`);
            }

            // Edit Configuration
            try {
                if (authorities.editConfiguration) {
                    currentForm.getCheckBox(`Check_Box_User_${i+1}_EditConfiguration`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_User_${i+1}_EditConfiguration`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not find checkboxes for User ${i+1} Edit Configuration`);
            }

            // Manage User
            try {
                if (authorities.manageUser) {
                    currentForm.getCheckBox(`Check_Box_User_${i+1}_ManageUser`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_User_${i+1}_ManageUser`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not find checkboxes for User ${i+1} Manage User`);
            }

            // Security Setup
            try {
                if (authorities.securitySetup) {
                    currentForm.getCheckBox(`Check_Box_User_${i+1}_SecuritySetup`).check();
                } else {
                    currentForm.getCheckBox(`Check_Box_User_${i+1}_SecuritySetup`).uncheck();
                }
            } catch (e) {
                console.warn(`Could not find checkboxes for User ${i+1} Security Setup`);
            }
        }

        // Add signature
        await addSignatureToForm(currentForm, currentPdf);

        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);
    } catch (error) {
        console.error("Failed to process Limit of Authority section:", error);
        throw error;
    }
}




// Reusable function to add signature to a PDF form
async function addSignatureToForm(currentForm, currentPdf) {
    try {
        // Get the saved signature data
        const signatureData = JSON.parse(localStorage.getItem('signatureData')) || {};
        
        if (signatureData.signatureImagePath) {
            let imageBytes;
            
            // Handle data URL
            if (signatureData.signatureImagePath.startsWith('data:')) {
                const base64Data = signatureData.signatureImagePath.split(',')[1];
                imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            } 
            // Handle blob URL
            else {
                const response = await fetch(signatureData.signatureImagePath);
                imageBytes = await response.arrayBuffer();
            }

            // Embed the image
            let signatureImage;
            try {
                signatureImage = await currentPdf.embedPng(imageBytes);
            } catch (e) {
                console.log('Not a PNG, trying JPG...');
                signatureImage = await currentPdf.embedJpg(imageBytes);
            }

            // Try to find and fill the signature field
            try {
                const signatureField = currentForm.getField('TesterSignature');
                if (signatureField) {
                    signatureField.setImage(signatureImage);
                } else {
                    console.warn('TesterSignature field not found in the form');
                }
            } catch (e) {
                console.error('Failed to set signature field:', e);
            }
        }
    } catch (error) {
        console.error("Failed to add signature:", error);
    }
}


//--------------------------Testing Signature ----------------------------------------------------------------------------------


// Signature processing
/*async function processSignatureSection(pdfDoc, currentUserData) {
    console.log("Processing Signature section");
    try {
        // Load the Signature template
        const templateUrl = `./PDF/Testing signature.pdf`;
        const templateBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
            return res.arrayBuffer();
        });

        const currentPdf = await PDFLib.PDFDocument.load(templateBytes);
        const currentForm = currentPdf.getForm();
        const pages = currentPdf.getPages();
        const firstPage = pages[0];

        // Get the saved signature data
        const signatureData = JSON.parse(localStorage.getItem('signatureData')) || {};
        
        // Set name and title
        try {
            currentForm.getTextField('TesterName').setText(signatureData.signerName || currentUserData.name || '');
            currentForm.getTextField('Designation').setText(signatureData.signerTitle || currentUserData.designation || '');
        } catch (e) {
            console.warn("Could not set name/title fields", e);
        }

        // Add signature image if available
        if (signatureData.signatureImagePath) {
            try {
                let imageBytes;
                
                // Handle data URL
                if (signatureData.signatureImagePath.startsWith('data:')) {
                    const base64Data = signatureData.signatureImagePath.split(',')[1];
                    imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                } 
                // Handle blob URL
                else {
                    const response = await fetch(signatureData.signatureImagePath);
                    imageBytes = await response.arrayBuffer();
                }

                // Embed the image
                let signatureImage;
                try {
                    signatureImage = await currentPdf.embedPng(imageBytes);
                } catch (e) {
                    console.log('Not a PNG, trying JPG...');
                    signatureImage = await currentPdf.embedJpg(imageBytes);
                }

                // Try to find and fill the signature field
                try {
                    const signatureField = currentForm.getField('TesterSignature');
                    if (signatureField) {
                        signatureField.setImage(signatureImage);
                    } else {
                        console.warn('SignatureField not found, drawing directly on page');
                        firstPage.drawImage(signatureImage, {
                            x: 100,
                            y: 100,
                            width: 150,
                            height: 50,
                        });
                    }
                } catch (e) {
                    console.error('Failed to set signature field:', e);
                }
            } catch (imageError) {
                console.error("Failed to process signature image:", imageError);
            }
        }

        const dateOnly = formTiming.generationStartTime?.toLocaleDateString() || 'N/A';
        currentForm.getTextField('GenerationTime').setText(dateOnly);
        currentForm.flatten();
        
        // Copy filled page from current PDF into the main PDF
        const [filledPage] = await pdfDoc.copyPages(currentPdf, [0]);
        pdfDoc.addPage(filledPage);

    } catch (error) {
        console.error("Failed to process Signature section:", error);
        throw error;
    }
}*/

