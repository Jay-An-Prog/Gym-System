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
//Highlight selected sidebar
document.querySelectorAll(".sidebar li a").forEach(link => {
    const linkPage = link.getAttribute("href");
    const currentPage = window.location.pathname.split("/").pop();

    if (linkPage === currentPage) {
        link.parentElement.classList.add("active");
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