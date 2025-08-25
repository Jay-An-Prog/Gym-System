function requestPlan(plan) {
    let confirmRequest = confirm("Are you sure you want to upgrade to membership?");
    if (confirmRequest) {
        document.getElementById("subscriptionStatus").textContent = "Pending";
        document.getElementById("subscriptionDuration").textContent = plan + " selected – Please pay at the counter";
        
        // Hide plan buttons
        document.getElementById("monthlyBtn").classList.add("hidden");
        document.getElementById("yearlyBtn").classList.add("hidden");
        // Show cancel button
        document.getElementById("cancelBtn").classList.remove("hidden");
        
        // Future backend:
        // fetch('/api/subscription/request', { ... })   
    }
}

function cancelPlan() {
    let confirmCancel = confirm("Are you sure you want to cancel your subscription request?");
    if (confirmCancel) {
        document.getElementById("subscriptionStatus").textContent = "Inactive";
        document.getElementById("subscriptionDuration").textContent = "No active membership";
        
        // Show plan buttons again
        document.getElementById("monthlyBtn").classList.remove("hidden");
        document.getElementById("yearlyBtn").classList.remove("hidden");
        // Hide cancel button
        document.getElementById("cancelBtn").classList.add("hidden");
        
        // Future backend:
        // fetch('/api/subscription/cancel', { ... })
    }
}

// Later: when admin activates, backend will call this
function updateActivatedSubscription(plan, startDate, endDate) {
    document.getElementById("subscriptionStatus").textContent = "Active (" + plan + ")";
    document.getElementById("subscriptionDuration").textContent = "Valid from " + startDate + " to " + endDate;
}

    
