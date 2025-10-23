// --- PDF Generation Functions ---
function generatePdfReport(currentUserData) {
    try {

        // Record completion time
        formTiming.pdfGeneratedTime = new Date();
        // Check for required libraries
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            showCustomAlert("Error: jsPDF library not found. Please check HTML includes.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        if (typeof doc.autoTable !== 'function') {
            showCustomAlert("Error: jsPDF-AutoTable plugin not found. Please check HTML includes.");
            return;
        }

        // Constants for consistent layout
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const headerHeight = 50; // Total height of header section
        const contentStartY = headerHeight + 5; // Starting Y for content after header

        // Image configuration
        const imageConfig = {
            url: 'Icon/GV.png',
            format: 'PNG',
            width: 15,
            height: 15,
            x: pageWidth - 30, // Right-aligned with margin
            y: 10
        };

        // Function to add header to any page
        const addHeader = () => {
            try {
                // Add logo
                doc.addImage(
                    imageConfig.url,
                    imageConfig.format,
                    imageConfig.x,
                    imageConfig.y,
                    imageConfig.width,
                    imageConfig.height
                );
                
                // Add title
                doc.setFontSize(20);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(40);
                doc.text('DF1725IED RTU Pre-FAT Report', pageWidth / 2, 25, { align: 'center' });
                
                // Add RTU information
                doc.setFontSize(14);
                doc.text(`RTU Serial No.: ${currentUserData.rtuSerial}`, pageWidth / 2, 35, { align: 'center' });
                doc.text(`Contract No.: ${currentUserData.contractNo}`, pageWidth / 2, 42, { align: 'center' });
                
                // Add separator line
                doc.setDrawColor(40);
                doc.setLineWidth(0.5);
                doc.line(margin, 47, pageWidth - margin, 47);
            } catch (error) {
                console.error("Error adding header:", error);
            }
        };

        // Function to create a new page with consistent header
        const addNewPage = () => {
            doc.addPage();
            addHeader();
            return contentStartY; // Return the starting Y position for content
        };

        // Set document properties
        doc.setProperties({
            title: `RTU Pre-FAT Report - ${currentUserData.rtuSerial}`,
            subject: 'RTU Module Configuration',
            author: currentUserData.username,
            keywords: 'RTU, FAT, Report',
            creator: 'RTU Pre-FAT Tool'
        });

        // Add header to first page
        addHeader();
        let currentY = contentStartY;

        // --- Tester Information Section ---
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Tester Information', margin, currentY);
        doc.setFont(undefined, 'normal');
        currentY += 10;

        const userInfo = [
            ['Name:', currentUserData.name],
            ['Designation:', currentUserData.designation],
            ['Experience:', `${currentUserData.experience} years`],
            ['Date:', new Date().toLocaleDateString()]
        ];

        doc.setFontSize(12);
        userInfo.forEach(info => {
            if (currentY > pageHeight - 30) {
                currentY = addNewPage();
                // Re-add section title if we're on a new page
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text('Tester Information', margin, currentY);
                doc.setFont(undefined, 'normal');
                currentY += 10;
            }
            doc.text(info[0], margin, currentY);
            doc.text(info[1], margin + 40, currentY);
            currentY += 7;
        });

        currentY += 15; // Extra space before next section

        // --- Bill of Quantity Section ---
        if (currentY > pageHeight - 50) {
            currentY = addNewPage();
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Bill of Quantity', margin, currentY);
        doc.setFont(undefined, 'normal');
        currentY += 10;

        const diCount = parseInt(document.getElementById('diCount')?.value) || 0;
        const doCount = parseInt(document.getElementById('doCount')?.value) || 0;
        const aiCount = parseInt(document.getElementById('aiCount')?.value) || 0;
        const aoCount = parseInt(document.getElementById('aoCount')?.value) || 0;

        const moduleSummary = [
            ['Module Type', 'Quantity'],
            ['DI Modules', diCount],
            ['DO Modules', doCount],
            ['AI Modules', aiCount],
            ['AO Modules', aoCount],
            ['Total Modules', diCount + doCount + aiCount + aoCount]
        ];

        // AutoTable configuration with consistent styling
        const baseTableConfig = {
            margin: { top: contentStartY, left: margin, right: margin },
            styles: {
                fontSize: 10,
                cellPadding: 3,
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                textColor: [0, 0, 0],
                halign: 'center'
            },
            headStyles: {
                fillColor: [211, 211, 211],
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            didDrawPage: function(data) {
                // Add header to any new pages created by autoTable
                if (data.pageNumber > 1) {
                    addHeader();
                }
                // Add footer to every page
                updatePageFooter(doc, data.pageNumber, data.totalPages, currentUserData);
            }
        };

        doc.autoTable({
            ...baseTableConfig,
            startY: currentY,
            head: [moduleSummary[0]],
            body: moduleSummary.slice(1)
        });

        // --- Module Detail Sections ---
        const createModuleSection = (moduleType) => {
            const prefix = moduleType.toLowerCase();
            const count = parseInt(document.getElementById(`${prefix}Count`)?.value) || 0;
            
            if (count <= 0) return;

            currentY = addNewPage(); // Start each module section on new page

            // Section title
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`${moduleType.toUpperCase()} Modules Detail`, pageWidth / 2, currentY);
            doc.setFont(undefined, 'normal');
            currentY += 15;

            // Prepare table data
            const headers = ['Module No.', 'Part Number', 'Subrack No.', 'Slot No.', 'Serial No.'];
            const body = [];
            
            for (let i = 1; i <= count; i++) {
                const partNoSelect = document.querySelector(`select[name="${prefix}_${i}_part_no"]`);
                const subrackInput = document.querySelector(`input[name="${prefix}_${i}_subrack"]`);
                const slotInput = document.querySelector(`input[name="${prefix}_${i}_slot"]`);
                const serialInput = document.querySelector(`input[name="${prefix}_${i}_serial"]`);
                
                body.push([
                    i,
                    partNoSelect?.value || 'N/A',
                    subrackInput?.value || 'N/A',
                    slotInput?.value || 'N/A',
                    serialInput?.value || 'N/A'
                ]);
            }

            // Generate module table
            doc.autoTable({
                ...baseTableConfig,
                startY: currentY,
                head: [headers],
                body: body,
                headStyles: {
                    ...baseTableConfig.headStyles,
                    fillColor: getModuleColor(moduleType)
                },
                columnStyles: {
                    0: { cellWidth: 20 },  // Module No.
                    1: { cellWidth: 40 },  // Part Number
                    2: { cellWidth: 30 },  // Subrack No.
                    3: { cellWidth: 30 },  // Slot No.
                    4: { cellWidth: 40 }   // Serial No.
                }
            });
        };

        // Generate sections for each module type
        createModuleSection('DI');
        createModuleSection('DO');
        createModuleSection('AI');
        createModuleSection('AO');

        // Final save
        doc.save(`DF1725IED RTU PreFAT Report ${currentUserData.contractNo}-${currentUserData.rtuSerial}.pdf`);
        showCustomAlert("PDF report generated successfully!");

    } catch (error) {
        console.error("Error generating PDF:", error);
        showCustomAlert("Failed to generate PDF. Check console. Error: " + error.message);
    }
}

// Helper function to update page footer
function updatePageFooter(doc, pageNumber, totalPages, currentUserData) {
    doc.setFontSize(8);
    doc.setTextColor(150);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text(`RTU Serial No: ${currentUserData.rtuSerial} | Contract No: ${currentUserData.contractNo}`, 
             pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Generated by ${currentUserData.name} on ${new Date().toLocaleString()}`, 
             pageWidth / 2, pageHeight - 5, { align: 'center' });
}

// Helper function to get module color
function getModuleColor(moduleType) {
    switch(moduleType.toUpperCase()) {
        case 'DI': return [52, 152, 219]; // Blue
        case 'DO': return [46, 204, 113]; // Green
        case 'AI': return [241, 196, 15]; // Yellow
        case 'AO': return [231, 76, 60];  // Red
        default: return [149, 165, 166];  // Gray
    }
}