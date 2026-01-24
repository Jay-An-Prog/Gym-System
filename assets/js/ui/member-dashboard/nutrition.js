sessionStorage.setItem("nutrition_update", "yes"); // Declare for auto update

let lastNutritionUpdate = null; // store last seen sessionStorage value

function nutritionUpdater() {
    const statusNotice = document.getElementById("statusNotice");
    statusNotice.className = "status-notice"; // Reset classes safely
    switch (sessionStorage.getItem("status")) {
        case "pending":
            statusNotice.textContent = "Your account is still pending activation. Nutrition tracking will be available once your account is active.";
            statusNotice.classList.add("status-pending");
            statusNotice.style.display = "block";     // make sure message is visible
            break;                
        case "activated":
            statusNotice.className = "status-notice"; // reset CSS style
            statusNotice.style.display = "none";     // make sure message is visible
            break;
        case "rejected":            
            statusNotice.textContent = "Your account verification was not approved. Nutrition tracking is unavailable until your account is activated.";
            statusNotice.classList.add("status-rejected");
            statusNotice.style.display = "block";     // make sure message is visible
            break;                
        case null:                
        case "":
        default:
            statusNotice.textContent = "Nutrition tracking is currently unavailable. You’ll be able to save your data once your account is activated.";
            statusNotice.classList.add("status-pending"); // reset CSS style
            statusNotice.style.display = "block";     // make sure message is visible
            break;
    }

    const currentUpdate = sessionStorage.getItem("nutrition_last_update");
    // Only run if sessionStorage changed
    if (currentUpdate && currentUpdate !== lastNutritionUpdate) {
        lastNutritionUpdate = currentUpdate; // update the tracker

        const dateObj = new Date(currentUpdate);
        const formatted = dateObj.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        document.getElementById("nutritionLastUpdate").textContent = `Last updated: ${formatted}`;
    }

    // For nutrition -----------
    if (sessionStorage.getItem("nutrition_update") !== "yes") return;

    if (sessionStorage.getItem("sex")) {
        document.getElementById("statusWrapper").classList.remove("status-wrapper-hide"); // Taking up space between user name & member id and status notice when showed
        document.getElementById("viewInfo").style.display = "block";
        document.getElementById("hideInfo").style.display = "none";
        document.getElementById("nutritionForm").style.display = "none";

        // ---- Update nutrition UI ----
        if (document.getElementById("sex").value !== sessionStorage.getItem("sex") || "")
            document.getElementById("sex").value = sessionStorage.getItem("sex") || "";

        if (document.getElementById("age").value !== sessionStorage.getItem("age") || "")
            document.getElementById("age").value = sessionStorage.getItem("age") || "";

        if (document.getElementById("bodyHeightCm").value !== sessionStorage.getItem("body_height_cm") || "")
            document.getElementById("bodyHeightCm").value = sessionStorage.getItem("body_height_cm") || "";

        if (document.getElementById("bodyWeightKg").value !== sessionStorage.getItem("body_weight_kg") || "")
            document.getElementById("bodyWeightKg").value = sessionStorage.getItem("body_weight_kg") || "";

        if (document.getElementById("activity").value !== sessionStorage.getItem("activity") || "1.2")
            document.getElementById("activity").value = sessionStorage.getItem("activity") || "1.2";

        if (document.getElementById("goal").value !== sessionStorage.getItem("nutrition_goal") || "maintain")
            document.getElementById("goal").value = sessionStorage.getItem("nutrition_goal") || "maintain";

        // Update results if available
        if (sessionStorage.getItem("calories_target") && sessionStorage.getItem("protein_target")) {
            if (document.getElementById("caloriesResult").textContent !== sessionStorage.getItem("calories_target"))
                document.getElementById("caloriesResult").textContent = sessionStorage.getItem("calories_target");
            
            if (document.getElementById("proteinResult").textContent !== sessionStorage.getItem("protein_target"))
                document.getElementById("proteinResult").textContent = sessionStorage.getItem("protein_target");

            document.getElementById("nutritionResult").style.display = "block";
        }

        document.getElementById("nutritionLastUpdate").style.display = "block";
    } else {
        document.getElementById("nutritionLastUpdate").style.display = "none";
        document.getElementById("nutritionForm").style.display = "grid"; // Display upload form again when the condition are not met
    }
}

// Run immediately
nutritionUpdater();

// Save interval ID so we can clear it later
setInterval(nutritionUpdater, 500);

function showForm() {
    document.getElementById("viewInfo").style.display = "none";
    document.getElementById("hideInfo").style.display = "block";
    document.getElementById("nutritionForm").style.display = "grid";
    sessionStorage.setItem("nutrition_update", "no");
}
function hideForm() {
    document.getElementById("viewInfo").style.display = "block";
    document.getElementById("hideInfo").style.display = "none";
    document.getElementById("nutritionForm").style.display = "none";
    sessionStorage.setItem("nutrition_update", "yes");
}