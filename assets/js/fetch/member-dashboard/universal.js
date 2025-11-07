function logout() {
    const confirmLogout = confirm("Are you sure you’d like to log out?");
    if (!confirmLogout) return;

    sessionStorage.setItem("loading_box", "show"); // Permanently show loading box until logout

    const formData = {
        action: "logout",
        login_token: localStorage.getItem("login_token")
    };

    if (localStorage.getItem("login_token")) {
        fetch("https://script.google.com/macros/s/AKfycbyCZ25uaJo_08vntZ_N4ck_ZEHHhgx0SgJYEigxwhd-ULzKmKDCDjXwLdnbES3reiF-/exec", {
            method: "POST",
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                clearAndRedirect();
            } else if (data.result === "error") {
                alert("Logout failed: No matching session found. You may already be logged out.");
                clearAndRedirect();
            } else {
                console.error("Unexpected logout error:", data);
                sessionStorage.setItem("loading_box", "hide");
            }
        })
        .catch(err => {
            console.error("Error:", err);
            sessionStorage.setItem("loading_box", "hide");
        });
    } else {
        clearAndRedirect();
    }
}

let logoutNotExecuted = true; // flag
function clearAndRedirect() {
    sessionStorage.clear();
    localStorage.removeItem("login_token");

    logoutNotExecuted = false;
    setTimeout(() => redirectTo("/pages/portal/login.html"), 500);
}

let alertNotShown = true; // flag
function autoLogout() {
    if (alertNotShown && !localStorage.getItem("login_token")) {
        alert("Your session has expired. Please log in again to continue.");
        alertNotShown = false;
    }

    logoutNotExecuted = false;
    
    sessionStorage.setItem("loading_box", "show");
    redirectTo("/pages/portal/login.html");    
}

function redirectTo(path) {
    // Get current URL parts
    const origin = window.location.origin;         // e.g. http://localhost:5500
    const pathname = window.location.pathname;     // e.g. /repo-name/index.html or /index.html
    
    // Detect base (for GitHub Pages with repo name)
    const segments = pathname.split("/").filter(Boolean);
    const base = (segments.length > 0 && segments[0] !== "pages") ? "/" + segments[0] : "";
    
    // Build final URL
    const redirectUrl = origin + base + path;
    
    window.location.href = redirectUrl;
}

setInterval(() => {
    if (!sessionStorage.getItem("member_id") && logoutNotExecuted) autoLogout(); // Immediately logout when the member id is undefined or empty
}, 1000); // 500 ms = 0.5 seconds

// Make the personal info sidebar glow accross all page
setInterval(function() {
    const resetTim = sessionStorage.getItem("reset_timeout");
    if (!resetTim) return; // safety check

    const resetTimeout = new Date(resetTim);
    const now = new Date();
    let remainingMs = resetTimeout - now;

    if (remainingMs <= 0) {
        document.getElementById("personalInfo").classList.remove("active-info-sidebar");
    } else {
        document.getElementById("personalInfo").classList.add("active-info-sidebar");
    }
}, 1000);