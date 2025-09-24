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
        // Hide expiration date
        document.getElementById("expirationDate").classList.add("hidden");
        // Hide plan related UI and show cancel btn
        document.getElementById("planBox").classList.add("hidden");
        document.getElementById("monthlyBtn").classList.add("hidden");
        document.getElementById("yearlyBtn").classList.add("hidden");
        document.getElementById("cancelBtn").classList.remove("hidden");
        // Remove filter as only active UI
        document.getElementById("dailyContainer").classList.remove("hidden");

    } else if (sessionStorage.getItem("subscription_status") === "active") {
        // ---- Active UI ----
        const expirationStr = sessionStorage.getItem("expiration_date");
        if (!expirationStr) return; // safety check

        const expirationDate = new Date(expirationStr);
        const now = new Date();
        let remainingMs = expirationDate - now;

        if (remainingMs <= 0) {
            // ---- Expired UI ----
            if (document.getElementById("subscriptionStatus").textContent !== "Expired")
                document.getElementById("subscriptionStatus").textContent = "Expired";
            if (document.getElementById("subscriptionDuration").textContent !== "Subscription Expired")
                document.getElementById("subscriptionDuration").textContent = "Subscription Expired";
            // Hide expiration date
            document.getElementById("expirationDate").classList.add("hidden");
            // Hide plan related UI and show cancel btn
            document.getElementById("planBox").classList.add("hidden");
            document.getElementById("monthlyBtn").classList.add("hidden");
            document.getElementById("yearlyBtn").classList.add("hidden");
            document.getElementById("cancelBtn").classList.remove("hidden");
            // Remove filter as only active UI
            document.getElementById("dailyContainer").classList.remove("hidden");
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

            // Show expiration date
            document.getElementById("expirationDate").classList.remove("hidden");
            // Hide plan and buttons
            document.getElementById("planBox").classList.add("hidden");
            document.getElementById("monthlyBtn").classList.add("hidden");
            document.getElementById("yearlyBtn").classList.add("hidden");
            document.getElementById("cancelBtn").classList.add("hidden");
            // Filter as only active UI
            document.getElementById("dailyContainer").classList.add("hidden");
        }

    } else {
        // ---- Inactive UI ----
        if (document.getElementById("subscriptionStatus").textContent !== "Inactive")
            document.getElementById("subscriptionStatus").textContent = "Inactive";
        if (document.getElementById("subscriptionDuration").textContent !== "No active membership")
            document.getElementById("subscriptionDuration").textContent = "No active membership";
        // Hide expiration date
        document.getElementById("expirationDate").classList.add("hidden");
        // Show plan related UI and hide cancel btn
        document.getElementById("planBox").classList.remove("hidden");
        document.getElementById("monthlyBtn").classList.remove("hidden");
        document.getElementById("yearlyBtn").classList.remove("hidden");
        document.getElementById("cancelBtn").classList.add("hidden");
        // Remove filter as only active UI
        document.getElementById("dailyContainer").classList.remove("hidden");
    }


    // For daily members -----------
    if (sessionStorage.getItem("status") === "activated" && sessionStorage.getItem("daily_expiration")) {
        // Active UI
        let expirationDate = new Date(sessionStorage.getItem("daily_expiration"));
        let now = new Date();
    
        // Calculate difference in ms
        let diffMs = expirationDate - now;
    
        if (diffMs <= 0) {
            // Expired UI
            if (document.getElementById("dailyStatus").textContent !== "Expired")
                document.getElementById("dailyStatus").textContent = "Expired";
            if (document.getElementById("dailyDuration").textContent !== "Daily plan expired")
                document.getElementById("dailyDuration").textContent = "Daily plan expired";
            document.getElementById("dailyExpiration").classList.add("hidden");
            // Remove filter as only active UI
            document.getElementById("subscriptionContainer").classList.remove("hidden");
        } else {
            // Convert to hours, minutes, seconds
            let diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            let diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            let diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
            // Format with leading zero for better look (e.g., 05s instead of 5s)
            let formattedTime = 
                `${diffHours}h ${diffMinutes}m ${diffSeconds < 10 ? "0" : ""}${diffSeconds}s`;
    
            // Format expiration date (only show date part)
            let formattedDate = expirationDate.toLocaleDateString("en-US"); // e.g. 9/23/2025
    
            // Update UI
            if (document.getElementById("dailyStatus").textContent !== "Active") 
                document.getElementById("dailyStatus").textContent = "Active";
            document.getElementById("dailyDuration").textContent = `Remaining Time: ${formattedTime}`;            
            document.getElementById("dailyExpiration").classList.remove("hidden");    
            if (document.getElementById("dailyExpiration").textContent !== "Expiration Date: " + formattedDate)
                document.getElementById("dailyExpiration").textContent = "Expiration Date: " + formattedDate;
            // Filter as only active UI
            document.getElementById("subscriptionContainer").classList.add("hidden");
        }

    } else {
        // Inactive UI
        if (document.getElementById("dailyStatus").textContent !== "Awaiting Coin")
            document.getElementById("dailyStatus").textContent = "Awaiting Coin";
        if (document.getElementById("dailyDuration").textContent !== "Daily not active")
            document.getElementById("dailyDuration").textContent = "Daily not active";
        document.getElementById("dailyExpiration").classList.add("hidden");
        // Remove filter as only active UI
        document.getElementById("subscriptionContainer").classList.remove("hidden");
    }
}

// Run immediately
updater();

// Save interval ID so we can clear it later
setInterval(updater, 500);
