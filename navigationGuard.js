// Define the correct page sequence
const PAGE_SEQUENCE = [
    'Pre-requisite.html',
    'ProductDeclaration.html',
    'TestSetup.html',
    'ElectronicAcc.html',
    'RTUPanelAcc.html',
    'PanelInformation.html',
    'SubrackInspection.html',
    'FunctionalityPowerSupply.html',
    'FunctionalityProcessor.html',
    'FunctionalityCOM6.html',
    'FunctionalityDIPage.html',
    'FunctionalityDOPage.html',
    'Dummy&CESFunctionalTest.html',
    'FunctionalityAIPage.html',
    'RTUPowerUp.html',
    'ParameterSettingProc.html',
    'ParameterSettingDI.html',
    'ParameterSettingDO.html',
    'ParameterSettingAI.html',
    'ParameterSettingIEC101.html',
    'ParameterSettingIEC104.html',
    'VirtualAlarmTest.html',
    'ChannelRedundacyTest.html',
    'LimitofAuthority.html',
    'signature.html'
];

// Function to check if navigation is allowed
function checkNavigationPermission(targetPage = null) {
    const currentPage = window.location.pathname.split('/').pop();
    const currentIndex = PAGE_SEQUENCE.indexOf(currentPage);
    
    if (currentIndex === -1) return true;
    if (currentIndex === 0) return true;

    if (targetPage) {
        const targetIndex = PAGE_SEQUENCE.indexOf(targetPage);
        if (targetIndex === -1) return true;

        // If going backward, clear all forward pages' completion status
        if (targetIndex < currentIndex) {
            for (let i = currentIndex; i < PAGE_SEQUENCE.length; i++) {
                localStorage.removeItem(`${PAGE_SEQUENCE[i]}_completed`);
            }
            return true;
        }

        // Check if all previous pages are completed
        for (let i = 0; i < targetIndex; i++) {
            const requiredPage = PAGE_SEQUENCE[i];
            const pageCompleted = localStorage.getItem(`${requiredPage}_completed`);
            
            if (!pageCompleted) {
                alert('Please complete all previous pages in order.');
                window.location.href = 'index.html';
                return false;
            }
        }

        return true;
    }

    // For non-targeted navigation (like direct URL access)
    for (let i = 0; i < currentIndex; i++) {
        const requiredPage = PAGE_SEQUENCE[i];
        const pageCompleted = localStorage.getItem(`${requiredPage}_completed`);
        
        if (!pageCompleted) {
            alert('Please complete all previous pages in order.');
            window.location.href = 'index.html';
            return false;
        }
    }

    return true;
}


// Function to mark current page as completed
function markPageAsCompleted() {
    const currentPage = window.location.pathname.split('/').pop();
    localStorage.setItem(`${currentPage}_completed`, 'true');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check navigation permission
    if (!checkNavigationPermission()) return;
    
    // For all navigation buttons, use the validation version with target page info
    const navButtons = document.querySelectorAll('button[onclick*="goTo"], button[onclick*="handle"]');
    navButtons.forEach(button => {
        const originalOnClick = button.getAttribute('onclick');
        const match = originalOnClick.match(/['"]([^'"]+)['"]/);
        const targetPage = match ? match[1] : null;
        
        button.setAttribute('onclick', `
            if (navigationGuard.markPageAsCompletedWithValidation('${targetPage}')) {
                ${originalOnClick}
            }
        `);
    });
});

function isPageInSequence(page) {
    return PAGE_SEQUENCE.includes(page);
}

// Update the navigationGuard object at the bottom
window.navigationGuard = {
    checkNavigationPermission,
    markPageAsCompleted,
    markPageAsCompletedWithValidation,
    isPageInSequence
};

function markPageAsCompletedWithValidation(targetPage = null) {
    const currentPage = window.location.pathname.split('/').pop();
    const currentIndex = PAGE_SEQUENCE.indexOf(currentPage);
    const targetIndex = PAGE_SEQUENCE.indexOf(targetPage);

    // If we have a target page and it's a backward navigation, skip validation
    if (targetPage && targetIndex < currentIndex) {
        return true;
    }

    // Check if page has a validation function
    if (typeof canMarkPageAsCompleted === 'function') {
        if (!canMarkPageAsCompleted()) {
            alert('You did not complete this page.');
            window.location.href = 'index.html';
            return false;
        }
    }

    // If validation passes or no validation needed
    localStorage.setItem(`${currentPage}_completed`, 'true');
    return true;
}