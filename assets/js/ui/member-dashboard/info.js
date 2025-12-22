///////////////// Marks the local storage
///////////////// Static info
if (sessionStorage.getItem("sonic_email")) 
    document.getElementById("userEmail").textContent = sessionStorage.getItem("sonic_email");
// Dynamic info
if (sessionStorage.getItem("full_name")) 
    document.getElementById("userFullName").textContent = sessionStorage.getItem("full_name");

if (sessionStorage.getItem("phone_number")) 
    document.getElementById("userPhone").textContent = sessionStorage.getItem("phone_number");

if (sessionStorage.getItem("user_address")) 
    document.getElementById("userAddress").textContent = sessionStorage.getItem("user_address");