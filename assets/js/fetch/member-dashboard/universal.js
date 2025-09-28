function logout() {
    const confirmLogout = confirm("Are you sure you’d like to log out?");
    // Redirect to another HTML page (e.g., login.html)
    // window.location.href = "../../../../pages/portal/login.html";
    if (confirmLogout) {
        sessionStorage.setItem("loading_box", "show"); // Permanently show loading box until logout

        const formData = {
            action: "logout", // tell Apps Script it's a login request
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
                    // Make sure it cleans the storages after logout
                    localStorage.clear();
    
                    setTimeout(() => redirectTo("/pages/portal/login.html"), 500);
            
                } else if (data.result === "error") {
                    // No token found in DB
                    alert("Logout failed: No matching session found. You may already be logged out.");
                    
                    // Safety: clear storages anyway
                    localStorage.clear();
    
                    setTimeout(() => redirectTo("/pages/portal/login.html"), 500);
            
                } else {
                    // fallback error case
                    console.error("Unexpected logout error:", data);
                    // Hide the loading box again in case of logout failure
                    sessionStorage.setItem("loading_box", "hide"); // hide AFTER request finishes
                }
            })
            .catch(err => console.error("Error:", err));
        } else {
            // Safety: clear storages anyway
            localStorage.clear();
    
            setTimeout(() => redirectTo("/pages/portal/login.html"), 500);
        }
    }   
}

let alertNotShown = true; // flag
let logoutNotExecuted = true; // flag

function autoLogout() {
    if (alertNotShown && !localStorage.getItem("login_token")) {
        alert("Your session has expired. Please log in again to continue.");        
        alertNotShown = false; // Set flag so it only shows once
    }

    if (logoutNotExecuted) {
        logoutNotExecuted = false;
        redirectTo("/pages/portal/login.html")
        
        sessionStorage.setItem("loading_box", "show"); // Permanently show loading box until logout
    }    
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
    if (!sessionStorage.getItem("member_id")) autoLogout(); // Immediately logout when the member id is undefined or empty
}, 1000); // 500 ms = 0.5 seconds