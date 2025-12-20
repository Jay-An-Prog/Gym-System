// --- Firebase Imports ---
import { auth } from "../../utils/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Make logout available to HTML onclick=""
window.logout = logout;

// --- LOGOUT FUNCTION ---
async function logout() {
    const confirmLogout = confirm("Are you sure you’d like to log out?");
    if (!confirmLogout) return;

    try {
        await signOut(auth); // Secure Firebase logout
        sessionStorage.clear(); // Clear local session

        redirectTo("/pages/portal.html");
    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed.");
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
    if (!sessionStorage.getItem("member_id")) {    // Immediately logout when the member id is undefined or empty
        alert("Session expired.");

        sessionStorage.clear(); // Clear local session
        redirectTo("/pages/portal.html");
    } 
}, 1000); // 500 ms = 0.5 seconds