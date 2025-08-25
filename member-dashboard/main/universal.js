//For sidebar toggle
function toggleSidebar() {
    document.getElementById("sideBar").classList.toggle("open");
}

function logout() {
    // Show confirm dialog
    let confirmLogout = confirm("Are you sure you want to log out?");
    
    if (confirmLogout) {
        // Redirect to another HTML page (e.g., login.html)
        window.location.href = "../../login-form/users/login.html";
    }
}