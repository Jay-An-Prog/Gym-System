//Database connection
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = {
    action: "login", // tell Apps Script it's a login request
    sonic_email: e.target.sonic_email.value,
    user_password: e.target.user_password.value
  };

  fetch("https://script.google.com/macros/s/AKfycbyCZ25uaJo_08vntZ_N4ck_ZEHHhgx0SgJYEigxwhd-ULzKmKDCDjXwLdnbES3reiF-/exec", {
    method: "POST",
    body: JSON.stringify(formData)
  })
  
  .then(res => res.json())
  .then(data => {
    if (data.result === "success") {
      // Save the member id to local storage for later use
      ///////////////// Marks the local storage
      localStorage.setItem("member_id", data.member_id);
      localStorage.setItem("user_name", data.user_name);
      localStorage.setItem("sonic_email", data.sonic_email);
          
      // You can redirect to admin page here
      window.location.href = "../../member-dashboard/index/profile.html";
    } else if (data.result === "error") {
      alert("Invalid username or password");
    } else {
      alert("No response from server or invalid response format.");
    }
  })
  .catch(err => console.error("Error:", err));
});