const getURL = "https://script.google.com/macros/s/AKfycbxlGNAY85KE9Mxuny1NS1cbBHz2TBd0AcZJuBD0Q471zMyYfFJrEgLqih_9kHSO821MNw/exec";

const generateBtn = document.getElementById("generateBtn");

generateBtn.addEventListener("click", async (e) => {
    if (!sessionStorage.getItem("first_name")) {
        alert("Kindly ensure that your details are uploaded first.");
        return;
    }
    let confirmRequest = confirm("Are you sure you want to generate QR Code Identity?");
    if (!confirmRequest) return;
    
    sessionStorage.setItem("loading_box", "show");

    try {    
        const resDrive = await fetch(`${getURL}?name=${encodeURIComponent(sessionStorage.getItem("full_name"))}`);
        const dataDrive = await resDrive.json();
    
        if (dataDrive.status === "success") {
            localStorage.setItem("face_image_bytes", dataDrive.faceData);
            
            alert("✅ Upload complete!");
        } else {
            alert("Failed to retrieve image from Drive.");
        }    
    } catch (err) {
        alert("Upload failed: " + err);
    }

    const formData = {
        action: "generate_qr", // tell Apps Script it's qr generation request
        member_id: sessionStorage.getItem("member_id"),
        full_name: sessionStorage.getItem("full_name")
    };

    fetch("https://script.google.com/macros/s/AKfycbyK5leJgTtgxztnh0jN5wHVnrrzN_4jteAyAbJOT2YfQU1yxf134cid7zlaFgAsg3s5/exec", {
        method: "POST",
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        switch (data.result) {
            case "success":
                ///////////////// Marks the session storage
                sessionStorage.setItem("needs_update", "yes");
                alert("Your QR code generation request has been submitted successfully!");
                break;                 
            case "fail":
                switch (data.reason) {
                    case "member doesn't exist":
                        alert("We couldn’t find your account under pending activation.");
                        break;             
                    case "no approval yet":
                        alert("Your information is under review. QR Generation requests will be available after approval.");
                        break;
                    default:
                        alert("Request failed. Please refresh the page and try again or contact support.");
                }
                break;
            default:
                alert("Unexpected response from server. Please try again.");
                console.error("Unexpected response:", data);
        }
    })
    .catch(err => console.error("Error:", err))
    .finally(() => {
        sessionStorage.setItem("loading_box", "hide"); // hide AFTER request finishes
    });
});
