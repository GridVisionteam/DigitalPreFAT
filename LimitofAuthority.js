// Initialize with empty data structures
if (!window.limitOfAuthorityResults) window.limitOfAuthorityResults = {
    users: {}
};

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved authority settings if available
    const savedResults = localStorage.getItem('limitOfAuthorityResults');
    if (savedResults) {
        window.limitOfAuthorityResults = JSON.parse(savedResults);
    }

    // Generate rows for all users
    generateAuthorityRows();

    // Load any saved data
    loadAuthorityData();
});

// Function to generate authority rows
function generateAuthorityRows() {
    const tbody = document.getElementById('LimitofAuthorityTbody');
    if (!tbody) return;

    // Sample users with flexible YES/NO values
    const users = [
        { 
            id: 'admin', 
            name: 'Superadmin',
            defaults: {
                dataViewing: 'YES',
                controlOperation: 'YES',
                editConfiguration: 'YES',
                manageUser: 'YES',
                securitySetup: 'YES'
            }
        },
        { 
            id: 'operator', 
            name: 'Operator',
            defaults: {
                dataViewing: 'YES',
                controlOperation: 'YES',  // Example of NO value
                editConfiguration: 'NO',
                manageUser: 'NO',
                securitySetup: 'NO'
            }
        },
        { 
            id: 'engineer', 
            name: 'Engineer',
            defaults: {
                dataViewing: 'YES',
                controlOperation: 'NO',
                editConfiguration: 'YES',
                manageUser: 'NO',
                securitySetup: 'NO'
            }
        },
        { 
            id: 'viewer', 
            name: 'Viewer',
            defaults: {
                dataViewing: 'YES',
                controlOperation: 'NO',
                editConfiguration: 'NO',
                manageUser: 'NO',
                securitySetup: 'NO'
            }
        }
    ];

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;">${user.name}</td>
            <td style="text-align: center;">${user.defaults.dataViewing}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="${user.id}_dataViewing" unchecked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">${user.defaults.controlOperation}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="${user.id}_controlOperation"  unchecked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">${user.defaults.editConfiguration}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="${user.id}_editConfiguration" unchecked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">${user.defaults.manageUser}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="${user.id}_manageUser" unchecked>
                    <span class="toggle-text"></span>
                </label>
            </td>
            <td style="text-align: center;">${user.defaults.securitySetup}</td>
            <td style="text-align: center;">
                <label class="toggle-button">
                    <input type="checkbox" name="${user.id}_securitySetup" unchecked>
                    <span class="toggle-text"></span>
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save authority settings
function saveAuthorityData() {
    // Ensure the results object has the proper structure
    window.limitOfAuthorityResults = window.limitOfAuthorityResults || {};
    window.limitOfAuthorityResults.users = window.limitOfAuthorityResults.users || {};

    // Get all user rows
    const rows = document.querySelectorAll('#LimitofAuthorityTbody tr');
    
    rows.forEach(row => {
        // Extract user ID from the first checkbox name (removing the suffix)
        const firstCheckbox = row.querySelector('input[type="checkbox"]');
        if (!firstCheckbox) return;
        
        const userId = firstCheckbox.name.replace('_dataViewing', '');
        const userName = row.cells[0].textContent;
        
        // Create user entry if it doesn't exist
        window.limitOfAuthorityResults.users[userId] = window.limitOfAuthorityResults.users[userId] || {
            name: userName,
            authorities: {}
        };

        // Save each authority setting
        window.limitOfAuthorityResults.users[userId].authorities.dataViewing = row.querySelector(`input[name="${userId}_dataViewing"]`).checked;
        window.limitOfAuthorityResults.users[userId].authorities.controlOperation = row.querySelector(`input[name="${userId}_controlOperation"]`).checked;
        window.limitOfAuthorityResults.users[userId].authorities.editConfiguration = row.querySelector(`input[name="${userId}_editConfiguration"]`).checked;
        window.limitOfAuthorityResults.users[userId].authorities.manageUser = row.querySelector(`input[name="${userId}_manageUser"]`).checked;
        window.limitOfAuthorityResults.users[userId].authorities.securitySetup = row.querySelector(`input[name="${userId}_securitySetup"]`).checked;
    });

    // Save to session storage
    localStorage.setItem('limitOfAuthorityResults', JSON.stringify(window.limitOfAuthorityResults));
}

// Load authority settings
function loadAuthorityData() {
    // Ensure we have a valid limitOfAuthorityResults object with the expected structure
    window.limitOfAuthorityResults = window.limitOfAuthorityResults || {};
    window.limitOfAuthorityResults.users = window.limitOfAuthorityResults.users || {};

    // Get all user rows
    const rows = document.querySelectorAll('#LimitofAuthorityTbody tr');
    
    rows.forEach(row => {
        // Extract user ID from the first checkbox name (removing the suffix)
        const firstCheckbox = row.querySelector('input[type="checkbox"]');
        if (!firstCheckbox) return;
        
        const userId = firstCheckbox.name.replace('_dataViewing', '');
        const userData = window.limitOfAuthorityResults.users[userId];
        
        if (userData && userData.authorities) {
            // Set each checkbox state
            row.querySelector(`input[name="${userId}_dataViewing"]`).checked = userData.authorities.dataViewing || false;
            row.querySelector(`input[name="${userId}_controlOperation"]`).checked = userData.authorities.controlOperation || false;
            row.querySelector(`input[name="${userId}_editConfiguration"]`).checked = userData.authorities.editConfiguration || false;
            row.querySelector(`input[name="${userId}_manageUser"]`).checked = userData.authorities.manageUser || false;
            row.querySelector(`input[name="${userId}_securitySetup"]`).checked = userData.authorities.securitySetup || false;
        }
    });
}

// Navigation functions
function goToPreviousPage() {
    // Save the current settings
    saveAuthorityData();
    window.location.href = 'ChannelRedundacyTest.html';
}

function handleLimitofAuthoritySubmission() {    
    // Save the current settings
    saveAuthorityData();
    navigationGuard.markPageAsCompleted();
    window.location.href = 'signature.html';
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
