function requestPlan(plan) {
    ///////////////// Marks the session storage 
    sessionStorage.setItem("plan", plan);
}

function updater() {
    // For membership -----------
    if (sessionStorage.getItem("subscription_status") === "pending" && sessionStorage.getItem("status") === "activated" && 
        sessionStorage.getItem("first_name")) {
        // ---- Pending UI ----
        if (document.getElementById("subscriptionStatus").textContent !== "Pending")
            document.getElementById("subscriptionStatus").textContent = "Pending";
        const pendingText = sessionStorage.getItem("plan") + " selected – Please pay at the counter";
        if (document.getElementById("subscriptionDuration").textContent !== pendingText)
            document.getElementById("subscriptionDuration").textContent = pendingText;
        // Add color effect of status box
        document.getElementById("statusBox").classList.add("pending-status-box");
        document.getElementById("statusBox").classList.remove("active-status-box");
        document.getElementById("statusBox").classList.remove("expired-status-box");
        // Hide expiration date
        document.getElementById("expirationDate").classList.add("hidden");
        // Hide plan related UI and show cancel btn
        document.getElementById("planBox").classList.add("hidden");
        document.getElementById("monthlyBtn").classList.add("hidden");
        document.getElementById("yearlyBtn").classList.add("hidden");
        document.getElementById("cancelBtn").classList.remove("hidden");

    } else if (sessionStorage.getItem("subscription_status") === "active" || sessionStorage.getItem("subscription_status") === "expired" 
            && sessionStorage.getItem("status") === "activated") {
        // ---- Active UI ----
        const expirationStr = sessionStorage.getItem("expiration_date");
        if (!expirationStr) return; // safety check

        const expirationDate = new Date(expirationStr);
        const now = new Date();
        let remainingMs = expirationDate - now;

        if (remainingMs <= 0) {
            sessionStorage.setItem("subscription_status", "expired"); // Set the subscription status automatically in front end
            // ---- Expired UI ----
            if (document.getElementById("subscriptionStatus").textContent !== "Expired")
                document.getElementById("subscriptionStatus").textContent = "Expired";
            if (document.getElementById("subscriptionDuration").textContent !== "Subscription Expired")
                document.getElementById("subscriptionDuration").textContent = "Subscription Expired";
            // Add color effect of status box
            document.getElementById("statusBox").classList.remove("pending-status-box");
            document.getElementById("statusBox").classList.remove("active-status-box");
            document.getElementById("statusBox").classList.add("expired-status-box");
            // Hide expiration date
            document.getElementById("expirationDate").classList.add("hidden");
            // Hide plan related UI and show cancel btn
            document.getElementById("planBox").classList.add("hidden");
            document.getElementById("monthlyBtn").classList.add("hidden");
            document.getElementById("yearlyBtn").classList.add("hidden");
            document.getElementById("cancelBtn").classList.remove("hidden");
        } else {
            // Convert ms → D/H/M/S
            const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

            const statusText = "Active (" + sessionStorage.getItem("plan") + ")";
            if (document.getElementById("subscriptionStatus").textContent !== statusText)
                document.getElementById("subscriptionStatus").textContent = statusText;
            
            const expText = "Expiration Date: " + (function () {
                let date = new Date(expirationStr.split("T")[0]); 
                date.setDate(date.getDate() + 1); // add 1 day
                let mm = String(date.getMonth() + 1).padStart(2, '0');
                let dd = String(date.getDate()).padStart(2, '0');
                let yyyy = date.getFullYear();
                return mm + "-" + dd + "-" + yyyy;
            })();
            if (document.getElementById("expirationDate").textContent !== expText)
                document.getElementById("expirationDate").textContent = expText;
            
            const durationText = "Remaining Time: " + `${days}d ${hours}h ${minutes}m ${seconds}s`;
            document.getElementById("subscriptionDuration").textContent = durationText;

            // Add color effect of status box
            document.getElementById("statusBox").classList.remove("pending-status-box");
            document.getElementById("statusBox").classList.add("active-status-box");
            document.getElementById("statusBox").classList.remove("expired-status-box"); 
            // Show expiration date
            document.getElementById("expirationDate").classList.remove("hidden");
            // Hide plan and buttons
            document.getElementById("planBox").classList.add("hidden");
            document.getElementById("monthlyBtn").classList.add("hidden");
            document.getElementById("yearlyBtn").classList.add("hidden");
            document.getElementById("cancelBtn").classList.add("hidden");
        }

    } else {
        // ---- Inactive UI ----
        if (document.getElementById("subscriptionStatus").textContent !== "Inactive")
            document.getElementById("subscriptionStatus").textContent = "Inactive";
        if (document.getElementById("subscriptionDuration").textContent !== "No active membership")
            document.getElementById("subscriptionDuration").textContent = "No active membership";
        // Remove color effect of status box
        document.getElementById("statusBox").classList.remove("pending-status-box");
        document.getElementById("statusBox").classList.remove("active-status-box");
        document.getElementById("statusBox").classList.remove("expired-status-box");
        // Hide expiration date
        document.getElementById("expirationDate").classList.add("hidden");
        // Show plan related UI and hide cancel btn
        document.getElementById("planBox").classList.remove("hidden");
        document.getElementById("monthlyBtn").classList.remove("hidden");
        document.getElementById("yearlyBtn").classList.remove("hidden");
        document.getElementById("cancelBtn").classList.add("hidden");
    }
}

// Run immediately
updater();

// Save interval ID so we can clear it later
setInterval(updater, 500);
