//Database connection
document.getElementById("signupForm").addEventListener("submit", function(e) {
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
        sonic_account: e.target.sonic_account.value,
        user_password: e.target.user_password.value
    };
    
    alert("Submitting info...");
    fetch("https://script.google.com/macros/s/AKfycbyCZ25uaJo_08vntZ_N4ck_ZEHHhgx0SgJYEigxwhd-ULzKmKDCDjXwLdnbES3reiF-/exec", {
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

