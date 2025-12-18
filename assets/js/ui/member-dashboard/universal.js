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