function requestPlan(plan) {
    ///////////////// Marks the session storage 
    sessionStorage.setItem("plan", plan);
}

function updater() {
    if (sessionStorage.getItem("subscription_status") === "pending") {
        if (document.getElementById("subscriptionStatus").textContent !== "Pending")
            document.getElementById("subscriptionStatus").textContent = "Pending";

        let newDuration = sessionStorage.getItem("plan") + " selected – Please pay at the counter";
        if (document.getElementById("subscriptionDuration").textContent !== newDuration)
            document.getElementById("subscriptionDuration").textContent = newDuration;
        
        // Hide plan buttons
        document.getElementById("monthlyBtn").classList.add("hidden");
        document.getElementById("yearlyBtn").classList.add("hidden");
        // Show cancel button
        document.getElementById("cancelBtn").classList.remove("hidden");
    } else {
        if (document.getElementById("subscriptionStatus").textContent !== "Inactive")
            document.getElementById("subscriptionStatus").textContent = "Inactive";

        if (document.getElementById("subscriptionDuration").textContent !== "No active membership")
            document.getElementById("subscriptionDuration").textContent = "No active membership";

        // Show plan buttons again
        document.getElementById("monthlyBtn").classList.remove("hidden");
        document.getElementById("yearlyBtn").classList.remove("hidden");
        // Hide cancel button
        document.getElementById("cancelBtn").classList.add("hidden");  
    }
}
// Run immediately
updater();
// Then run every 0.5 seconds
setInterval(updater, 500);