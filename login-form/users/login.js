document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = {
    action: "login", // tell Apps Script it's a login request
    sonic_account: e.target.sonic_account.value,
    user_password: e.target.user_password.value
  };

  fetch("https://script.google.com/macros/s/AKfycbxzcZPxrcvKcrmUwwbQqx99Z93waPcafcr5L3rwNWIPueuKqCdFyjG8R0rcBbriqG6M/exec", {
    method: "POST",
    body: JSON.stringify(formData)
  })
  
  .then(res => res.json())
  .then(data => {
    if (data.result === "success") {
      // You can redirect to admin page here
      window.location.href = "../../member-dashboard/index/profile.html";
    } else {
      alert("Invalid username or password");
    }
  })
  .catch(err => console.error("Error:", err));
});