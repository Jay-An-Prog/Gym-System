function nutritionUpdater() {
    // For nutrition -----------
    if (sessionStorage.getItem("subscription_status") === "active" && sessionStorage.getItem("status") === "activated" && 
        sessionStorage.getItem("first_name")) {
        // ---- Update nutrition UI ----
        if (document.getElementById("sex").value !== sessionStorage.getItem("sex") || "")
            document.getElementById("sex").value = sessionStorage.getItem("sex") || "";

        if (document.getElementById("age").value !== sessionStorage.getItem("age") || "")
            document.getElementById("age").value = sessionStorage.getItem("age") || "";

        if (document.getElementById("height").value !== sessionStorage.getItem("height") || "")
            document.getElementById("height").value = sessionStorage.getItem("height") || "";

        if (document.getElementById("weight").value !== sessionStorage.getItem("weight") || "")
            document.getElementById("weight").value = sessionStorage.getItem("weight") || "";

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

        // Update last update timestamp
        if (sessionStorage.getItem("nutrition_last_update")) {
            const dateObj = new Date(sessionStorage.getItem("nutrition_last_update"));
            const formatted = dateObj.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            if (document.getElementById("nutritionLastUpdate").textContent !== `Last updated: ${formatted}`)
                document.getElementById("nutritionLastUpdate").textContent = `Last updated: ${formatted}`;
        }

        document.getElementById("sex").disabled = false;
        document.getElementById("age").disabled = false;
        document.getElementById("height").disabled = false;
        document.getElementById("weight").disabled = false;
        document.getElementById("activity").disabled = false;
        document.getElementById("goal").disabled = false;
    } else {
        document.getElementById("sex").disabled = true;
        document.getElementById("age").disabled = true;
        document.getElementById("height").disabled = true;
        document.getElementById("weight").disabled = true;
        document.getElementById("activity").disabled = true;
        document.getElementById("goal").disabled = true;
    }
}

// Run immediately
nutritionUpdater();

// Save interval ID so we can clear it later
setInterval(nutritionUpdater, 500);