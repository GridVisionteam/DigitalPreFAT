        // JavaScript specific to userDetails.html
        document.getElementById("logo").addEventListener("click", () => {
            // Decide if logo click should save data or clear it
            // saveCurrentUserDetails(); // Optionally save before navigating
            localStorage.clear(); // Or clear all session data for a fresh start
            window.location.href = 'index.html';
        });

        function saveCurrentUserDetails() {
            localStorage.setItem('session_name', document.getElementById('name').value.trim());
            localStorage.setItem('session_designation', document.getElementById('designation').value.trim());
            localStorage.setItem('session_experience', document.getElementById('experience').value.trim());
        }

    document.addEventListener('DOMContentLoaded', () => {
        const nameInput = document.getElementById('name');
        const designationInput = document.getElementById('designation');
        const experienceInput = document.getElementById('experience');

        // Load data from localStorage and remove extra quotes if present
        const getName = () => {
            let name = localStorage.getItem('session_name') || '';
            if (name.startsWith('"') && name.endsWith('"')) {
                name = name.slice(1, -1);
            }
            return name;
        };

        const getDesignation = () => {
            let designation = localStorage.getItem('session_designation') || '';
            if (designation.startsWith('"') && designation.endsWith('"')) {
                designation = designation.slice(1, -1);
            }
            return designation;
        };

        const getExperience = () => {
            let experience = localStorage.getItem('session_experience') || '';
            if (experience.startsWith('"') && experience.endsWith('"')) {
                experience = experience.slice(1, -1);
            }
            return experience;
        };

        if (nameInput) nameInput.value = getName();
        if (designationInput) designationInput.value = getDesignation();
        if (experienceInput) experienceInput.value = getExperience();
    });

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

        function goBackToLogin() {
            saveCurrentUserDetails(); // Save current details before going back
            window.location.href = 'index.html';
        }

        function goToRTUPage() {
            const name = document.getElementById("name").value.trim();
            const designation = document.getElementById("designation").value.trim();
            const experience = document.getElementById("experience").value.trim();

            if (!name || !designation || experience === "") {
                showCustomAlert("Please fill in all user details.");
                return;
            }
            saveCurrentUserDetails(); // Save details before proceeding

            // Navigate to the next page (e.g., rtuInfo.html)
           window.location.href ='rtudetail.html';
        }
