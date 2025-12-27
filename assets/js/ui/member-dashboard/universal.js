document.body.insertAdjacentHTML("beforeend", `
    <div class="page-wrapper" id="pageWrapper"></div>
`);
// For sidebar toggle
function toggleSidebar() {
    document.getElementById("sideBar").classList.toggle("open");
    document.getElementById("pageWrapper").classList.toggle("page-wrapper-active");
}

const sideBar = document.getElementById("sideBar");
// Hide when clicking outside content
pageWrapper.addEventListener("click", function(event) {
  if (!sideBar.contains(event.target)) {
    document.getElementById("sideBar").classList.remove("open");
    document.getElementById("pageWrapper").classList.remove("page-wrapper-active");
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

// Inject modal box html code
document.body.insertAdjacentHTML("beforeend", `
  <div id="modalBox" class="modal-box" style="display: none;">
    <div class="modal-container" id="modalContainer">
      <img src="/assets/images/modal-symbol.png">
      <p id="modalMessage">Please wait…</p>
    </div>
  </div>
`);

// Hide when clicking outside content
modalBox.addEventListener("click", function(event) {
  if (!modalContainer.contains(event.target)) {
    sessionStorage.setItem("modal_box", "hide");
  }
});

function createSessionBox({ 
    elementId, 
    storageKey, 
    pollInterval = 500, 
    updateInterval = 100 
}) {
    const box = document.getElementById(elementId);
    let timer = null;
    let lastState = null;

    function start() {
        if (timer) return;

        timer = setInterval(() => {
            if (!box) return;

            const state = sessionStorage.getItem(storageKey);

            if (state !== lastState) {
                box.style.display = (state === "show") ? "flex" : "none";
                lastState = state;
            }

            if (state !== "show") stop();
        }, updateInterval);
    }

    function stop() {
        clearInterval(timer);
        timer = null;
        lastState = null;
    }

    setInterval(() => {
        if (sessionStorage.getItem(storageKey) === "show") {
            start();
            document.getElementById("modalMessage").textContent = sessionStorage.getItem("modal_message");
        }
    }, pollInterval);
}

// Activate boxes
createSessionBox({
    elementId: "loadingBox",
    storageKey: "loading_box"
});

createSessionBox({
    elementId: "modalBox",
    storageKey: "modal_box"

});
