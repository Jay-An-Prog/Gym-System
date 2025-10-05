//************************* Marks the database connection
const uploadURL = "https://script.google.com/macros/s/AKfycbwSzWqFZhcpiiNvgPUDOTFZ-YNb0e646JdEBRcbr1Pixpe4JrNaoJgzl-A_4D-cNv5K/exec";

document.getElementById("uploadForm").addEventListener("submit", function(e) {
    e.preventDefault(); // prevent normal submit

    let confirmRequest = confirm("Please review your information carefully. Click OK to proceed or Cancel to make changes.");
    if (!confirmRequest) return;

    // Check if status is 'activated'
    if (sessionStorage.getItem("status") === "activated") {
        confirmRequest = confirm(
            "Caution: Updating your information will remove your active status until it is reviewed by the admin. Do you want to continue?"
        );
        if (!confirmRequest) return;
    }
    
    const formData = {
        action: "upload", // tell Apps Script it's upload request
        member_id: sessionStorage.getItem("member_id"), ///////////////// Marks the session storage 
        first_name: e.target.first_name.value,
        middle_name: e.target.middle_name.value,
        last_name: e.target.last_name.value,
        phone_number: "#"+e.target.phone_number.value,
        user_address: e.target.user_address.value,
        status: "pending"
    };

    alert("Submitting info...");
    sessionStorage.setItem("loading_box", "show");

    //Upload details
    fetch(uploadURL, {   // Store as promise
        method: "POST",
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.response.result === "success") {
            ///////////////// Marks the session storage 
            sessionStorage.setItem("needs_update", "yes");

            alert("Upload successful!");
            alert("Your account is under review for validation!");
        } else {
            alert("Upload failed!");
            alert("Account validation was unsuccessful.");
        }   
    })
    .catch(err => console.error("Error:", err))
    .finally(() => {
        sessionStorage.setItem("loading_box", "hide");

        // update profile related 
        sessionStorage.setItem("profile_update", "yes");
    });
});