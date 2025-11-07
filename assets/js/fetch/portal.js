//************************* Database connection
const loginURL = signupURL = resetURL = 
"https://script.google.com/macros/s/AKfycbyCZ25uaJo_08vntZ_N4ck_ZEHHhgx0SgJYEigxwhd-ULzKmKDCDjXwLdnbES3reiF-/exec";

let loginForm = document.getElementById("loginForm");
// Auto-login using saved token
if (localStorage.getItem("login_token")) {
  const formData = {
    action: "login", // tell Apps Script it's a login request
    login_token: localStorage.getItem("login_token")
  };
  handleLogin(formData);
}

// Manual login via form
else if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = {
      action: "login", // tell Apps Script it's a login request
      sonic_email: e.target.sonic_email.value.toLowerCase(),
      user_password: e.target.user_password.value
    };    

    // Condition to add extra data
    if (e.target.remember_me.checked) 
      formData.checkbox = true; // dynamically add property

    handleLogin(formData);
  });
}

// Shared login handler
function handleLogin(formData) {
  sessionStorage.setItem("portal_loading_box", "show"); // Show loading box

  fetch(loginURL, {
    method: "POST",
    body: JSON.stringify(formData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.result === "success") {
      // Make sure it cleans the session before users enter
      sessionStorage.clear();
      ///////////////// Marks the session storage
      ///////////////// Static info
      sessionStorage.setItem("member_id", data.member_id);
      sessionStorage.setItem("user_name", data.user_name);
      sessionStorage.setItem("sonic_email", data.sonic_email);
      sessionStorage.setItem("reset_password", data.reset_password);
      sessionStorage.setItem("reset_timeout", data.reset_timeout);
      sessionStorage.setItem("needs_update", "yes");

      localStorage.setItem("login_token", data.login_token);
      redirectTo("/pages/member-dashboard/profile.html");
    } 
    else if (data.result === "token invalid") {
      localStorage.clear();
      alert("Looks like your session timed out. Please log in again.");
    } 
    else if (data.result === "error") {
      alert("Invalid username or password");
    } 
    else {
      alert("No response from server or invalid response format.");
    }
  })
  .catch(err => console.error("Error:", err))
  .finally(() => {
    sessionStorage.setItem("portal_loading_box", "hide"); // hide AFTER request finishes
  });
}

// redirect to member dashboard
// window.location.href = "../../../pages/member-dashboard/profile.html";
function redirectTo(path) {
  // Get current URL parts
  const origin = window.location.origin;         // e.g. http://localhost:5500
  const pathname = window.location.pathname;     // e.g. /repo-name/index.html or /index.html

  // Detect base (for GitHub Pages with repo name)
  const segments = pathname.split("/").filter(Boolean);
  const base = (segments.length > 0 && segments[0] !== "pages") ? "/" + segments[0] : "";

  // Build final URL
  const redirectUrl = origin + base + path;

  window.location.href = redirectUrl;
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
      sonic_email: e.target.sonic_email.value.toLowerCase(),
      user_password: e.target.user_password.value
    };
    
    sessionStorage.setItem("portal_loading_box", "show"); // Show loading box

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
    .catch(err => console.error("Error:", err))
    .finally(() => {
            sessionStorage.setItem("portal_loading_box", "hide"); // hide AFTER request finishes
    });
  });
}

//************************* Database connection
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", function(e) {
    e.preventDefault(); // prevent normal submit
    
    const password = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
      alert("Password do not match!");
      return;
    }
    
    const formData = {
      action: "reset", // tell Apps Script it's a signup request
      sonic_email: e.target.sonic_email.value.toLowerCase(),
      recovery_code: e.target.recovery_code.value,
      new_password: e.target.new_password.value
    };
    
    sessionStorage.setItem("portal_loading_box", "show"); // Show loading box

    fetch(resetURL, {
      method: "POST",
      body: JSON.stringify(formData)
    })
    
    .then(res => res.json())
    .then(data => {
      if (data.result === "success") {
        alert("Password changed successfully!");
        e.target.reset();  
      } else if (data.result === "error") {
        alert("Wrong email or recovery code.");
      } else {
        alert("No response from server or invalid response format.");
      }
    })
    .catch(err => console.error("Error:", err))
    .finally(() => {
            sessionStorage.setItem("portal_loading_box", "hide"); // hide AFTER request finishes
    });
  });
}