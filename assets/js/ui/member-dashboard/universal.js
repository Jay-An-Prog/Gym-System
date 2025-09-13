function logout() {
    // Show confirm dialog
    let confirmLogout = confirm("Are you sure you want to log out?");
    
    if (confirmLogout) {
        ///////////////// Marks the session storage
        sessionStorage.clear();
        
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

function startBox() {
    if (loadingBoxTimer) return; // already running
    loadingBoxTimer = setInterval(() => {
        if (!box) return;
        box.style.display = sessionStorage.getItem("loading_box") === "show"
        ? "flex" : "none";
        
        if (sessionStorage.getItem("loading_box") !== "show") stopBox();
    }, 100); // run every 0.1s 
}
function stopBox() {
    clearInterval(loadingBoxTimer);
    loadingBoxTimer = null;
}
setInterval(() => {
    if (sessionStorage.getItem("loading_box") === "show") startBox(); // Check current state on page load
}, 500); // 500 ms = 0.5 seconds