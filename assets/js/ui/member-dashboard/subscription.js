function requestPlan(plan) {
    ///////////////// Marks the session storage 
    sessionStorage.setItem("plan", plan);
}

function updater() {
    const status = sessionStorage.getItem("status");
    const subscriptionStatus = sessionStorage.getItem("subscription_status");

    if (subscriptionStatus === "pending" && status === "activated" && sessionStorage.getItem("first_name")) {
        // ---- Pending ----
        document.getElementById("subscriptionStatus").textContent = "Pending";
        document.getElementById("subscriptionDuration").textContent = sessionStorage.getItem("plan") + " selected – Please pay at the counter";

        document.getElementById("monthlyBtn").classList.add("hidden");
        document.getElementById("yearlyBtn").classList.add("hidden");
        document.getElementById("cancelBtn").classList.remove("hidden");

    } else if (subscriptionStatus === "active") {
        // ---- Active ----
        const expirationStr = sessionStorage.getItem("expiration_date");
        if (!expirationStr) return; // safety check

        const expirationDate = new Date(expirationStr);
        const now = new Date();
        let remainingMs = expirationDate - now;

        if (remainingMs <= 0) {
            sessionStorage.setItem("subscription_status", "pending");
        } else {
            // Convert ms → D/H/M/S
            const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

            document.getElementById("subscriptionStatus").textContent =
                "Active (" + sessionStorage.getItem("plan") + ")";
            document.getElementById("subscriptionDuration").textContent =
                "Expiration Date: " + expirationStr.split("T")[0] +
                " | Remaining Time: " + `${days}d ${hours}h ${minutes}m ${seconds}s`;

            // Hide plan buttons
            document.getElementById("monthlyBtn").classList.add("hidden");
            document.getElementById("yearlyBtn").classList.add("hidden");
            document.getElementById("cancelBtn").classList.add("hidden");
        }

    } else {
        // ---- Inactive ----
        document.getElementById("subscriptionStatus").textContent = "Inactive";
        document.getElementById("subscriptionDuration").textContent = "No active membership";

        document.getElementById("monthlyBtn").classList.remove("hidden");
        document.getElementById("yearlyBtn").classList.remove("hidden");
        document.getElementById("cancelBtn").classList.add("hidden");
    }
}

// Run immediately
updater();

// Save interval ID so we can clear it later
const updaterInterval = setInterval(updater, 500);
