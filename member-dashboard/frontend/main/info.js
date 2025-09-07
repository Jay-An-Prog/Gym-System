///////////////// Marks the local storage
///////////////// Static info
if (localStorage.getItem("sonic_email")) {
    document.getElementById("userEmail").textContent = localStorage.getItem("sonic_email");
}
///////////////// Dynamic info
if (localStorage.getItem("full_name")) {
    document.getElementById("userFullName").textContent = localStorage.getItem("full_name");
}
if (localStorage.getItem("phone_number")) {
    document.getElementById("userPhone").textContent = localStorage.getItem("phone_number");
}
if (localStorage.getItem("user_address")) {
    document.getElementById("userAddress").textContent = localStorage.getItem("user_address");
}