//For sidebar toggle
function toggleSidebar() {
    document.getElementById("sideBar").classList.toggle("open");
}

function logout() {
    // Show confirm dialog
    let confirmLogout = confirm("Are you sure you want to log out?");
    
    if (confirmLogout) {
        ///////////////// Marks the local storage
        localStorage.clear();
        
        // Redirect to another HTML page (e.g., login.html)
        window.location.href = "../../../portal/frontend/users/login.html";
    }
}

// Inject loading box html code
document.body.insertAdjacentHTML("beforeend", `
  <div id="loadingBox" class="loading" style="display: none;">
    <div class="spinner"></div>
    <p>Loading...</p>
  </div>
`);

let loadingBoxTimer = null;
const box = document.getElementById("loadingBox");

function startBox() {
    if (loadingBoxTimer) return; // already running
    loadingBoxTimer = setInterval(() => {
        if (!box) return;
        box.style.display = localStorage.getItem("loading_box") === "show"
        ? "flex" : "none";
        
        if (localStorage.getItem("loading_box") !== "show") stopBox();
        console.log("Hi");
    }, 100); // run every 0.1s 
}

function stopBox() {
    clearInterval(loadingBoxTimer);
    loadingBoxTimer = null;
}

// Check current state on page load
if (localStorage.getItem("needs_update") === "yes") startBox();