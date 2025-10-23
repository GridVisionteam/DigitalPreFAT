        // BQ Module Sheets functionality
        document.addEventListener('DOMContentLoaded', function() {
            setupDIModuleTypeListeners();
            generateDIRows(); // For DI page
            generateDORows(); // For DO page
            generateAIRows(); // For AI page
            const doModuleTypeSelect = document.getElementById('doModuleType');
            if (doModuleTypeSelect) {
                doModuleTypeSelect.addEventListener('change', handleDOModuleTypeChange);
            }

            document.addEventListener('change', function(e) {
                if (e.target.type === 'checkbox' && 
                    document.getElementById('functionalityDIPage').classList.contains('hidden') === false) {
                    updateSubmitButtonState();
                }
            });

            const generateBtn = document.getElementById('generateBtn');
            const clearBtn = document.getElementById('clearBtn');
            const submitBtn = document.getElementById('submitBtn');
            const sheetsContainer = document.getElementById('sheetsContainer');

            generateBtn.addEventListener('click', function() {
                const diCount = parseInt(document.getElementById('diCount').value) || 0;
                const doCount = parseInt(document.getElementById('doCount').value) || 0;
                const aiCount = parseInt(document.getElementById('aiCount').value) || 0;
                const aoCount = parseInt(document.getElementById('aoCount').value) || 0;

                const totalCount = diCount + doCount + aiCount + aoCount;
                if (totalCount === 0) {
                    alert('Please enter at least one module count to generate sheets.');
                    return;
                }

                sheetsContainer.innerHTML = ""; // Clear previous sheets

                if (diCount > 0) {
                    sheetsContainer.appendChild(createDISheet(diCount));
                }
                if (doCount > 0) {
                    sheetsContainer.appendChild(createDOSheet(doCount));
                }
                if (aiCount > 0) {
                    sheetsContainer.appendChild(createAISheet(aiCount));
                }
                if (aoCount > 0) {
                    sheetsContainer.appendChild(createAOSheet(aoCount));
                }
            });

            clearBtn.addEventListener('click', function() {
                sheetsContainer.innerHTML = "";
                ['diCount','doCount','aiCount','aoCount'].forEach(id => {
                    document.getElementById(id).value = 0;
                });
            });

        });