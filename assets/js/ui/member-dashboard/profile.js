///////////////// Marks the session storage
///////////////// Static Info
if (sessionStorage.getItem("user_name")) 
    document.getElementById("welcome").textContent ="Welcome, " + sessionStorage.getItem("user_name") + "!";

if (sessionStorage.getItem("member_id"))
    document.getElementById("memberId").textContent ="Member ID: " + sessionStorage.getItem("member_id");

// This function connects a <input type="file"> to a preview box
// so that when the user uploads a file, it shows an image + delete button
function setupFileInput(inputId, previewId) {
    // Like Java's `Scanner scanner = new Scanner(System.in);`
    // Here we "grab" HTML elements from the page by their ID
    let input = document.getElementById(inputId);   // file input (face or ID)
    let preview = document.getElementById(previewId); // div where preview will appear
    
    // Add an event listener (like Java's ActionListener)
    // This triggers when the user selects a file
    input.addEventListener("change", function () {
        
        preview.innerHTML = ""; // clear old preview (like resetting state)
        
        // If input has a file (like checking null in Java)
        if (input.files && input.files[0]) {
            
            // Create an <img> element dynamically
            let img = document.createElement("img");
            // Set the image source to the file that user picked
            // URL.createObjectURL → temporary link for local file
            img.src = URL.createObjectURL(input.files[0]);
            
            // Create a delete button ("X")
            let btn = document.createElement("button");
            btn.textContent = "X";       // the label of the button
            btn.className = "remove-btn"; // optional CSS styling
            
            // Add event listener to button (like actionPerformed in Java)
            btn.addEventListener("click", function (e) {
                e.preventDefault();      // prevent form from auto-submitting
                input.value = "";        // clear the file input
                preview.innerHTML = "";  // remove preview from screen
            });
            
            // Finally, add the image and the button to the preview box
            preview.appendChild(img);
            preview.appendChild(btn);
        }
    });
}

// Call the function twice, one for "face" input, another for "ID" input
// This is like reusing a method in Java instead of duplicating code
setupFileInput("face", "facePreview");
setupFileInput("id", "idPreview");



sessionStorage.setItem("profile_update", "yes"); // Declare for auto update

function updater() {
    if (sessionStorage.getItem("profile_update") !== "yes") return;

    const statusNotice = document.getElementById("statusNotice");

    if (sessionStorage.getItem("first_name")) {
        document.getElementById("statusWrapper").classList.remove("status-wrapper-hide"); // Taking up space between user name & member id and status notice when showed
        document.getElementById("editInfo").style.display = "block";
        document.getElementById("hideInfo").style.display = "none";
        document.getElementById("uploadForm").style.display = "none";

        // Reset classes safely
        statusNotice.className = "status-notice";
        switch (sessionStorage.getItem("status")) {
            case "pending":
                statusNotice.textContent = "Welcome to Smart Sonic Gym! Your account is waiting for activation. Hang tight, you’ll be ready to train in no time!";
                statusNotice.classList.add("status-pending");
                break;
            case "activated":
                statusNotice.textContent = "Your account is now active, time to power up your fitness journey! Get ready and start training today.";
                statusNotice.classList.add("status-activated");
                break;
            default: // Set back to pending activation UI when 
                statusNotice.textContent = "We couldn’t find your account in the pending activation list. Please re-upload your details or contact the admin for assistance.";
                statusNotice.classList.add("status-pending");
                break;
        }

        // Only update inputs if values differ (performance boost)
        if (document.getElementById("firstName").value !== sessionStorage.getItem("first_name"))
            document.getElementById("firstName").value = sessionStorage.getItem("first_name");

        if (document.getElementById("middleName").value !== sessionStorage.getItem("middle_name"))
            document.getElementById("middleName").value = sessionStorage.getItem("middle_name");

        if (document.getElementById("lastName").value !== sessionStorage.getItem("last_name"))
            document.getElementById("lastName").value = sessionStorage.getItem("last_name");

        if (document.getElementById("telPhone").value !== sessionStorage.getItem("phone_number"))
            document.getElementById("telPhone").value = sessionStorage.getItem("phone_number");

        if (document.getElementById("homeAddress").value !== sessionStorage.getItem("user_address"))
            document.getElementById("homeAddress").value = sessionStorage.getItem("user_address");
    } else {
        document.getElementById("statusWrapper").classList.add("status-wrapper-hide"); // Prevents taking up space between user name & member id and status notice when hide
        statusNotice.textContent = "";
        statusNotice.className = "status-notice"; // reset
        document.getElementById("uploadForm").style.display = "block"; // Display upload form again when the condition are not met
    }
}

// Run immediately
updater();

// Then run every 1 second
setInterval(updater, 1000);

function showForm() {
    document.getElementById("editInfo").style.display = "none";
    document.getElementById("hideInfo").style.display = "block";
    document.getElementById("uploadForm").style.display = "block";
    sessionStorage.setItem("profile_update", "no");
}
function hideForm() {
    document.getElementById("editInfo").style.display = "block";
    document.getElementById("hideInfo").style.display = "none";
    document.getElementById("uploadForm").style.display = "none";
    sessionStorage.setItem("profile_update", "yes");
}

