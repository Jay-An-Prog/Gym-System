function logout() {
    // Show confirm dialog
    let confirmLogout = confirm("Are you sure you want to log out?");
    
    if (confirmLogout) {
        // Redirect to another HTML page (e.g., login.html)
        window.location.href = "../../../portal/frontend/admin/login.html";
    }
}