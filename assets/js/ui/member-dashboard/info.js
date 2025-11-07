///////////////// Marks the local storage
///////////////// Static info
if (sessionStorage.getItem("sonic_email")) 
    document.getElementById("userEmail").textContent = sessionStorage.getItem("sonic_email");
// Dynamic info
if (sessionStorage.getItem("full_name")) 
    document.getElementById("userFullName").textContent = sessionStorage.getItem("full_name");

if (sessionStorage.getItem("phone_number")) 
    document.getElementById("userPhone").textContent = sessionStorage.getItem("phone_number");

if (sessionStorage.getItem("user_address")) 
    document.getElementById("userAddress").textContent = sessionStorage.getItem("user_address");

// ---- Active UI ----
setInterval(function() {
    const resetTim = sessionStorage.getItem("reset_timeout");
    if (!resetTim) return; // safety check

    const resetTimeout = new Date(resetTim);
    const now = new Date();
    let remainingMs = resetTimeout - now;

    if (remainingMs <= 0) {
        document.getElementById("recoveryContainer").classList.remove("active-recovery-container");
    } else {
        document.getElementById("recoveryContainer").classList.add("active-recovery-container");

        // Convert ms → D/H/M/S
        const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

        // make sure code is updated
        const savedCode = sessionStorage.getItem("reset_password");
        if (document.getElementById("recoveryCode").textContent !== "Recovery Code: "+savedCode)
            document.getElementById("recoveryCode").textContent = "Recovery Code: "+savedCode;
        
        const durationText = "Remaining Time: " + `${hours}h ${minutes}m ${seconds}s`;
        document.getElementById("timeLeft").textContent = durationText;
    }
}, 1000);