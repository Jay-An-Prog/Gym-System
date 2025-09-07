//************************* Database connection
const loginURL = "https://script.google.com/macros/s/AKfycbyCZ25uaJo_08vntZ_N4ck_ZEHHhgx0SgJYEigxwhd-ULzKmKDCDjXwLdnbES3reiF-/exec";
const signupURL = "https://script.google.com/macros/s/AKfycbyCZ25uaJo_08vntZ_N4ck_ZEHHhgx0SgJYEigxwhd-ULzKmKDCDjXwLdnbES3reiF-/exec";

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const formData = {
      action: "login", // tell Apps Script it's a login request
      sonic_email: e.target.sonic_email.value,
      user_password: e.target.user_password.value
    };
    
    fetch(loginURL, {
      method: "POST",
      body: JSON.stringify(formData)
    })
    
    .then(res => res.json())
    .then(data => {
      if (data.result === "success") {
        ///////////////// Marks the local storage
        ///////////////// Static info
        localStorage.setItem("member_id", data.member_id);
        localStorage.setItem("user_name", data.user_name);
        localStorage.setItem("sonic_email", data.sonic_email);
        localStorage.setItem("needs_update", "yes");
        localStorage.setItem("can_update", "yes");

        // redirect to member dashboard
        window.location.href = "../../../html/member-dashboard/profile.html";
      } else if (data.result === "error") {
        alert("Invalid username or password");
      } else {
        alert("No response from server or invalid response format.");
      }
    })
    .catch(err => console.error("Error:", err));
  });
}

//************************* Database connection
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function(e) {
    e.preventDefault(); // prevent normal submit
    
    const password = document.getElementById("userPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
      alert("Password do not match!");
      return;
    }
    
    const formData = {
      action: "signup", // tell Apps Script it's a signup request
      user_name: e.target.user_name.value,
      sonic_email: e.target.sonic_email.value,
      user_password: e.target.user_password.value
    };
    
    alert("Submitting info...");
    fetch(signupURL, {
      method: "POST",
      body: JSON.stringify(formData)
    })
    
    .then(res => res.json())
    .then(data => {
      if (data.result === "success") {
        alert("Signup successful!");
        e.target.reset();  
      } else if (data.result === "error") {
        alert("This email account has already been registered.");
      } else {
        alert("No response from server or invalid response format.");
      }
    })
    .catch(err => console.error("Error:", err));
  });

}  



