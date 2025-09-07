function requestPlan(plan) {
    ///////////////// Marks the local storage 
    localStorage.setItem("plan", plan);
}

function updater() {
    if (localStorage.getItem("subscription_status") === "pending") {
        document.getElementById("subscriptionStatus").textContent = "Pending";
        document.getElementById("subscriptionDuration").textContent = localStorage.getItem("plan") + " selected – Please pay at the counter";
        
        // Hide plan buttons
        document.getElementById("monthlyBtn").classList.add("hidden");
        document.getElementById("yearlyBtn").classList.add("hidden");
        // Show cancel button
        document.getElementById("cancelBtn").classList.remove("hidden");
    } else {
        document.getElementById("subscriptionStatus").textContent = "Inactive";
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