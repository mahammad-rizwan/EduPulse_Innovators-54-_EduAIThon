document.addEventListener('DOMContentLoaded', function() {
    // User dropdown toggle
    const userProfile = document.querySelector(".user-profile");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    userProfile.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle("active");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!userProfile.contains(event.target)) {
            dropdownMenu.classList.remove("active");
        }
    });
    
    // Form validation
    const complaintForm = document.getElementById("complaintForm");
    
    complaintForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        // Basic form validation
        const complaintType = document.getElementById("complaintType").value;
        const department = document.getElementById("department").value;
        const subject = document.getElementById("subject").value;
        const description = document.getElementById("description").value;
        const agreement = document.getElementById("agreement").checked;
        
        if (!complaintType || !department || !subject || !description) {
            alert("Please fill in all required fields");
            return;
        }
        
        if (!agreement) {
            alert("Please confirm that the information provided is accurate");
            return;
        }
        
        // Simulate form submission
        const complaintNumber = "EDU-" + Math.floor(10000 + Math.random() * 90000);
        alert(`Complaint submitted successfully!\n\nYour complaint reference number is: ${complaintNumber}\n\nYou can track the status of your complaint in your dashboard.`);
        
        // Reset form
        complaintForm.reset();
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 2000);
    });

    // File input validation
    const fileInput = document.getElementById("supportingEvidence");
    if (fileInput) {
        fileInput.addEventListener("change", function() {
            const fileSize = this.files[0]?.size / 1024 / 1024; // in MB
            if (fileSize > 5) {
                alert("File size exceeds 5MB limit. Please choose a smaller file.");
                this.value = "";
            }
        });
    }
});