// Check if user is on in-app browser
function isInAppBrowser() {
    return /FBAN|FBAV|Instagram|Messenger/i.test(navigator.userAgent);
}
if (isInAppBrowser() && !sessionStorage.getItem("dismiss_inapp_notice")) {
    document.body.insertAdjacentHTML("afterbegin", `
        <div id="inAppNotice">
            <span>
                For more features, open in your browser for best experience
                <button id="dismissInAppNotice">✕</button>
            </span>
        </div>
    `);
    document.getElementById("dismissInAppNotice").addEventListener("click", () => {
        document.getElementById("inAppNotice").remove();
        sessionStorage.setItem("dismiss_inapp_notice", "yes");
    });
}

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
      <img id="modalSymbol" src="">
      <p id="modalMessage">Please wait…</p>
      <div class="modal-btn-wrapper">
        <button id="modalOk">OK</button>
      </div>
    </div>
  </div>
`);

let modalResolve = null;
// Hide when clicking outside content
modalBox.addEventListener("click", function(event) {
  if (!modalContainer.contains(event.target)) {
    sessionStorage.setItem("modal_box", "hide");
      if (modalResolve) modalResolve(); // resolve promise if user clicks outside
  }
});

// Promise-based modal function
function modalMsg(Msg) {
    return new Promise(resolve => {
        sessionStorage.setItem("modal_box", "show");
        sessionStorage.setItem("modal_message", Msg);

        modalResolve = () => {
            sessionStorage.setItem("modal_box", "hide");
            modalResolve = null;
            resolve();
        };

        modalOk.onclick = modalResolve;
    });
}

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


modalSymbol.src = redirectTo("/assets/images/modal-symbol.png");
function redirectTo(path) {
    // Get current URL parts
    const origin = window.location.origin;         // e.g. http://localhost:5500
    const pathname = window.location.pathname;     // e.g. /repo-name/index.html or /index.html
    
    // Detect base (for GitHub Pages with repo name)
    const segments = pathname.split("/").filter(Boolean);
    const base = (segments.length > 0 && segments[0] !== "pages") ? "/" + segments[0] : "";
    
    // Build final URL
    const redirectUrl = origin + base + path;
    
    return redirectUrl;
}