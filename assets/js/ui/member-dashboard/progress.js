function progressUpdater() {
    const statusNotice = document.getElementById("statusNotice");
    statusNotice.className = "status-notice"; // Reset classes safely
    switch (sessionStorage.getItem("status")) {    
        case "pending":
            statusNotice.textContent = "Your account is awaiting activation. Workout progress and tracking features will be available once your account is active.";
            statusNotice.classList.add("status-pending");
            statusNotice.style.display = "block";     // make sure message is visible
            break;                
        case "activated":
            statusNotice.className = "status-notice"; // reset CSS style
            statusNotice.style.display = "none";     // make sure message is visible
            break;
        case "rejected":            
            statusNotice.textContent = "Your account verification was not approved. Workout progress tracking is unavailable until your account is activated.";
            statusNotice.classList.add("status-rejected");
            statusNotice.style.display = "block";     // make sure message is visible
            break;                
        case null:                
        case "":
        default:
            statusNotice.textContent = "Workout progress tracking is currently unavailable. You’ll be able to save and view your progress once your account is activated.";
            statusNotice.classList.add("status-pending"); // reset CSS style
            statusNotice.style.display = "block";     // make sure message is visible
            break;
    }
}

// Run immediately
progressUpdater();

// Save interval ID so we can clear it later
setInterval(progressUpdater, 500);