// Universal Navigation System
document.addEventListener('DOMContentLoaded', function() {
    // Toggle universal nav dropdown
    const navToggle = document.querySelector('.universal-nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const nav = document.querySelector('.universal-nav');
            nav.classList.toggle('active');
            this.classList.toggle('collapsed');
        });
    }
    
    initializeUniversalNavigation();
});

function initializeUniversalNavigation() {
    // Load module counts from sessionStorage
    const diCount = parseInt(sessionStorage.getItem('diModulesToTest')) || 0;
    const doCount = parseInt(sessionStorage.getItem('doModulesToTest')) || 0;
    const aiCount = parseInt(sessionStorage.getItem('aiModulesToTest')) || 0;
    
    // Get current page type
    const currentPage = window.location.pathname.split('/').pop();
    const isDIPage = currentPage.includes('FunctionalityDIPage');
    const isDOPage = currentPage.includes('FunctionalityDOPage');
    const isAIPage = currentPage.includes('FunctionalityAIPage');
    
    // Initialize dropdowns with blank options for non-current module types
    if (isDIPage) {
        initializeModuleDropdown('diModuleJump', diCount, 'DI');
        initializeBlankDropdown('doModuleJump', 'DO');
        initializeBlankDropdown('aiModuleJump', 'AI');
    } else if (isDOPage) {
        initializeBlankDropdown('diModuleJump', 'DI');
        initializeModuleDropdown('doModuleJump', doCount, 'DO');
        initializeBlankDropdown('aiModuleJump', 'AI');
    } else if (isAIPage) {
        initializeBlankDropdown('diModuleJump', 'DI');
        initializeBlankDropdown('doModuleJump', 'DO');
        initializeModuleDropdown('aiModuleJump', aiCount, 'AI');
    }
    
    // Update counters
    updateModuleCounters();
    
    // Apply special styling for blank dropdowns
    styleBlankDropdowns();
}
function initializeBlankDropdown(elementId, moduleType) {
    const dropdown = document.getElementById(elementId);
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    // Add blank option
    const blankOption = document.createElement('option');
    blankOption.value = '';
    blankOption.textContent = `Select ${moduleType} Module`;
    blankOption.disabled = true;
    blankOption.selected = true;
    dropdown.appendChild(blankOption);
    
    // Add actual options but hidden
    const count = parseInt(sessionStorage.getItem(`${moduleType.toLowerCase()}ModulesToTest`)) || 0;
    for (let i = 1; i <= count; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${moduleType}-${i}`;
        dropdown.appendChild(option);
    }
}

function initializeModuleDropdown(elementId, count, moduleType) {
    const dropdown = document.getElementById(elementId);
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    // Add blank option first
    const blankOption = document.createElement('option');
    blankOption.value = '';
    blankOption.textContent = `Select ${moduleType} Module`;
    blankOption.disabled = true;
    dropdown.appendChild(blankOption);
    
    // Add module options
    for (let i = 1; i <= count; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${moduleType}-${i}`;
        dropdown.appendChild(option);
    }
    
    // Set current module as selected
    const currentModule = parseInt(sessionStorage.getItem(`current${moduleType}Module`)) || 1;
    dropdown.value = currentModule;
    
    // Remove blank option if a module is selected
    if (dropdown.value !== '') {
        dropdown.remove(0);
    }
}

function styleBlankDropdowns() {
    const dropdowns = document.querySelectorAll('.module-selector select');
    dropdowns.forEach(dropdown => {
        if (dropdown.value === '') {
            dropdown.style.color = '#999';
            dropdown.style.fontStyle = 'italic';
        } else {
            dropdown.style.color = '';
            dropdown.style.fontStyle = '';
        }
    });
}

function updateModuleCounters() {
    const diCount = parseInt(sessionStorage.getItem('diModulesToTest')) || 0;
    const doCount = parseInt(sessionStorage.getItem('doModulesToTest')) || 0;
    const aiCount = parseInt(sessionStorage.getItem('aiModulesToTest')) || 0;
    
    const currentDI = parseInt(sessionStorage.getItem('currentDIModule')) || 1;
    const currentDO = parseInt(sessionStorage.getItem('currentDOModule')) || 1;
    const currentAI = parseInt(sessionStorage.getItem('currentAIModule')) || 1;
    
    // Only show counter for current module type
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage.includes('FunctionalityDIPage')) {
        document.getElementById('doModuleCounter').textContent = '';
        document.getElementById('aiModuleCounter').textContent = '';
    } else if (currentPage.includes('FunctionalityDOPage')) {
        document.getElementById('diModuleCounter').textContent = '';
        document.getElementById('aiModuleCounter').textContent = '';
    } else if (currentPage.includes('FunctionalityAIPage')) {
        document.getElementById('diModuleCounter').textContent = '';
        document.getElementById('doModuleCounter').textContent = '';
    }
}

function navigateToModule(moduleType, moduleNumber) {
    // Save current module data before navigating
    saveCurrentModuleData();
    
    // Update session storage with the selected module
    sessionStorage.setItem(`current${moduleType}Module`, moduleNumber);
    
    // Determine which page we need to go to
    let targetPage = '';
    switch(moduleType) {
        case 'DI':
            targetPage = 'FunctionalityDIPage.html';
            break;
        case 'DO':
            targetPage = 'FunctionalityDOPage.html';
            break;
        case 'AI':
            targetPage = 'FunctionalityAIPage.html';
            break;
        default:
            return;
    }
    
    // Navigate to the selected page
    window.location.href = targetPage;
}

function saveCurrentModuleData() {
    // Determine which page we're currently on and save its data
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage.includes('FunctionalityDIPage')) {
        const currentModule = parseInt(sessionStorage.getItem('currentDIModule')) || 1;
        saveDITestData(currentModule);
    } 
    else if (currentPage.includes('FunctionalityDOPage')) {
        const currentModule = parseInt(sessionStorage.getItem('currentDOModule')) || 1;
        saveDOTestData(currentModule);
    }
    else if (currentPage.includes('FunctionalityAIPage')) {
        const currentModule = parseInt(sessionStorage.getItem('currentAIModule')) || 1;
        saveAITestData(currentModule);
    }
}

function saveAndGoBack() {
    saveCurrentModuleData();
    
    // Determine which page to go back to based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage.includes('FunctionalityDIPage')) {
        // If we're on the first DI module, go back to BQ page
        const currentModule = parseInt(sessionStorage.getItem('currentDIModule')) || 1;
        if (currentModule === 1) {
            window.location.href = 'BQ.html';
        } else {
            // Go to previous DI module
            sessionStorage.setItem('currentDIModule', currentModule - 1);
            window.location.href = 'FunctionalityDIPage.html';
        }
    }
    else if (currentPage.includes('FunctionalityDOPage')) {
        const currentModule = parseInt(sessionStorage.getItem('currentDOModule')) || 1;
        if (currentModule === 1) {
            // If we're on the first DO module, go to last DI module
            const diCount = parseInt(sessionStorage.getItem('diModulesToTest')) || 0;
            sessionStorage.setItem('currentDIModule', diCount);
            window.location.href = 'FunctionalityDIPage.html';
        } else {
            // Go to previous DO module
            sessionStorage.setItem('currentDOModule', currentModule - 1);
            window.location.href = 'FunctionalityDOPage.html';
        }
    }
    else if (currentPage.includes('FunctionalityAIPage')) {
        const currentModule = parseInt(sessionStorage.getItem('currentAIModule')) || 1;
        if (currentModule === 1) {
            // If we're on the first AI module, go to last DO module
            const doCount = parseInt(sessionStorage.getItem('doModulesToTest')) || 0;
            sessionStorage.setItem('currentDOModule', doCount);
            window.location.href = 'FunctionalityDOPage.html';
        } else {
            // Go to previous AI module
            sessionStorage.setItem('currentAIModule', currentModule - 1);
            window.location.href = 'FunctionalityAIPage.html';
        }
    }
}

function saveAndContinue() {
    saveCurrentModuleData();
    
    // Determine which page to continue to based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage.includes('FunctionalityDIPage')) {
        const currentModule = parseInt(sessionStorage.getItem('currentDIModule')) || 1;
        const diCount = parseInt(sessionStorage.getItem('diModulesToTest')) || 0;
        
        if (currentModule < diCount) {
            // Go to next DI module
            sessionStorage.setItem('currentDIModule', currentModule + 1);
            window.location.href = 'FunctionalityDIPage.html';
        } else {
            // Go to first DO module
            sessionStorage.setItem('currentDOModule', 1);
            window.location.href = 'FunctionalityDOPage.html';
        }
    }
    else if (currentPage.includes('FunctionalityDOPage')) {
        const currentModule = parseInt(sessionStorage.getItem('currentDOModule')) || 1;
        const doCount = parseInt(sessionStorage.getItem('doModulesToTest')) || 0;
        
        if (currentModule < doCount) {
            // Go to next DO module
            sessionStorage.setItem('currentDOModule', currentModule + 1);
            window.location.href = 'FunctionalityDOPage.html';
        } else {
            // Go to first AI module
            sessionStorage.setItem('currentAIModule', 1);
            window.location.href = 'FunctionalityAIPage.html';
        }
    }
    else if (currentPage.includes('FunctionalityAIPage')) {
        const currentModule = parseInt(sessionStorage.getItem('currentAIModule')) || 1;
        const aiCount = parseInt(sessionStorage.getItem('aiModulesToTest')) || 0;
        
        if (currentModule < aiCount) {
            // Go to next AI module
            sessionStorage.setItem('currentAIModule', currentModule + 1);
            window.location.href = 'FunctionalityAIPage.html';
        } else {
            // All modules completed - go to final page or generate PDF
            generateFinalPDF(loadUserData());
        }
    }
}