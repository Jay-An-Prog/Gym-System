//************************* Marks the database connection
const uploadURL = "https://script.google.com/macros/s/AKfycbxmCXK48T7DjKpRgoc2kpQgCxKQ3BTx4SLEmSK_YDgQANObwlsMr67WIdZMq681bdyq/exec";
const activationURL = "https://script.google.com/macros/s/AKfycbxb2RdOIyOZcrNItkS1LRVNzhO0H7o5JP_f3ZK-3Hri23x2s8NsLylYiXgnqXGR0NC7qA/exec";

document.getElementById("uploadForm").addEventListener("submit", function(e) {
    e.preventDefault(); // prevent normal submit
    
    const formData = {
        action: "upload", // tell Apps Script it's upload request
        member_id: localStorage.getItem("member_id"),
        first_name: e.target.first_name.value,
        middle_name: e.target.middle_name.value+".",
        last_name: e.target.last_name.value,
        phone_number: e.target.phone_number.value,
        user_address: e.target.user_address.value,
        status: "pending"
    };

    alert("Submitting info...");

    //Upload details
    const uploadPromise = fetch(uploadURL, {   // Store as promise
        method: "POST",
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.response.result === "success") {
            ///////////////// Marks the local storage 
            localStorage.setItem("needs_update", "yes");

            e.target.reset();
            alert("Upload successful!");
        } else {
            alert("Upload failed!");
        }   
    })
    .catch(err => console.error("Error:", err));


    //Account Activation
    const activationPromise = fetch(activationURL, {   // Store as promise
        method: "POST",
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.result === "success") {
            alert("Your account is under review for validation!");
        } else {
            alert("Account validation was unsuccessful.");
        }   
    })
    .catch(err => console.error("Error:", err));


    // Reload page only after both fetches are done
    Promise.all([uploadPromise, activationPromise]).then(() => {
        location.reload(); // refresh the page
    });
});