function logout(bypass = false) {
    let confirmLogout = true;
    // Show confirm dialog only if bypass is false
    if (!bypass) {
        confirmLogout = confirm("Are you sure you want to log out?");
    } else {
        alert("Your session has expired. Please log in again.")
    }
    
    if (confirmLogout) {
        // Redirect to another HTML page (e.g., login.html)
        window.location.href = "../../../../pages/portal/login.html";
    }
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
    if (!sessionStorage.getItem("member_id")) logout(true); // Immediately logout when the member id is undefined or empty
}, 500); // 500 ms = 0.5 seconds