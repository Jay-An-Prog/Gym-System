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
    fetch("https://script.google.com/macros/s/AKfycbxzcZPxrcvKcrmUwwbQqx99Z93waPcafcr5L3rwNWIPueuKqCdFyjG8R0rcBbriqG6M/exec", {
        method: "POST",
        body: JSON.stringify(formData)
    })
    
    .then(res => res.json())
    .then(data => {
        alert("Signup successful!");
        e.target.reset();
    })
    .catch(err => console.error("Error:", err));
});

