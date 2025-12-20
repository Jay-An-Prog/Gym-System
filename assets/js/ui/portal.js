// Inject loading box html code
document.body.insertAdjacentHTML("beforeend", `
  <div id="loadingBox" class="loading" style="display: none;">
    <div class="spinner"></div>
    <p>Loading, hang tight…</p>
  </div>
`);

// Loading box deployer
let loadingBoxTimer = null;
const box = document.getElementById("loadingBox");

function startBox() {
    if (loadingBoxTimer) return; // already running
    loadingBoxTimer = setInterval(() => {
        if (!box) return;
        box.style.display = sessionStorage.getItem("portal_loading_box") === "show"
        ? "flex" : "none";
        
        if (sessionStorage.getItem("portal_loading_box") !== "show") stopBox();
    }, 100); // run every 0.1s 
}
function stopBox() {
    clearInterval(loadingBoxTimer);
    loadingBoxTimer = null;
}
setInterval(() => {
    if (sessionStorage.getItem("portal_loading_box") === "show") startBox(); // Check current state on page load
}, 500); // 500 ms = 0.5 seconds