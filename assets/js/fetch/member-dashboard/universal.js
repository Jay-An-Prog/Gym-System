// --- Firebase Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
    getAuth, GoogleAuthProvider, signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyDaWdPdqBZKfC9499kv57GxfkP5hu0SP10",
    authDomain: "sonic-gym-database.firebaseapp.com",
    databaseURL: "https://sonic-gym-database-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sonic-gym-database",
    storageBucket: "sonic-gym-database.firebasestorage.app",
    messagingSenderId: "268824699214",
    appId: "1:268824699214:web:b121f7be07e34c85907e1f",
    measurementId: "G-5KVTHY26TP"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

// Make logout available to HTML onclick=""
window.logout = logout;

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