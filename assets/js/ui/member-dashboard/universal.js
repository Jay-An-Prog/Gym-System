function logout() {
    let confirmLogout = true;
    confirmLogout = confirm("Are you sure you’d like to log out?");
    // Redirect to another HTML page (e.g., login.html)
    // window.location.href = "../../../../pages/portal/login.html";
    if (confirmLogout) {
        localStorage.clear();
        setTimeout(() => redirectTo("/pages/portal/login.html"), 500);

        sessionStorage.setItem("loading_box", "show"); // Permanently show loading box until logout
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

document.body.insertAdjacentHTML("beforeend", `
    <div class="page-wrapper" id="pageWrapper"></div>
`);
// For sidebar toggle
function toggleSidebar() {
    document.getElementById("sideBar").classList.toggle("open");
    document.getElementById("pageWrapper").classList.toggle("wrapper-active");
}

const sideBar = document.getElementById("sideBar");
// Hide when clicking outside content
pageWrapper.addEventListener("click", function(event) {
  if (!sideBar.contains(event.target)) {
    document.getElementById("sideBar").classList.remove("open");
    document.getElementById("pageWrapper").classList.remove("wrapper-active");
  }
});

// Inject loading box html code
document.body.insertAdjacentHTML("beforeend", `
  <div id="loadingBox" class="loading" style="display: none;">
    <div class="spinner"></div>
    <p>Please wait…</p>
  </div>
`);

// Loading box deployer
let loadingBoxTimer = null;
const box = document.getElementById("loadingBox");
let lastState = null;

function startBox() {
    if (loadingBoxTimer) return; // Return if already running
    loadingBoxTimer = setInterval(() => {
        if (!box) return;
        const state = sessionStorage.getItem("loading_box");
        
        if (state !== lastState) {
            box.style.display = (state === "show") ? "flex" : "none";
            lastState = state;
        }

        if (state !== "show") stopBox();
    }, 100); // run every 0.1s
}

function stopBox() {
    clearInterval(loadingBoxTimer);
    loadingBoxTimer = null;
    lastState = null;
}

setInterval(() => {
    if (sessionStorage.getItem("loading_box") === "show") startBox(); // Check current state on page load
}, 500); // 500 ms = 0.5 seconds

setInterval(() => {
    if (!sessionStorage.getItem("member_id")) autoLogout(); // Immediately logout when the member id is undefined or empty
}, 1000); // 500 ms = 0.5 seconds