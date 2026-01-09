function updater() {
    const qrImg = document.getElementById("qrWrapper");
    if (sessionStorage.getItem("id_name") && sessionStorage.getItem("phone_number") && 
        sessionStorage.getItem("user_address") && sessionStorage.getItem("status") === "activated") { // Check if the current card is valid to update the UI
        // Show and render profile image so it can be viewed, manipulated by js like download, and print.
        window.addEventListener("DOMContentLoaded", async () => {
            const url = sessionStorage.getItem("face_image_url");
            if (!url) return;
            
            try {
                const response = await fetch(url, { mode: 'cors' }); // fetch the image
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onload = function() {
                    document.getElementById("defaultPic").src = reader.result; // set as data URL
                };
                reader.readAsDataURL(blob);
            } catch (err) {
                console.error("Failed to load image for ID card:", err);
            }
        });
            
        if (document.getElementById("idName").textContent !== sessionStorage.getItem("id_name"))
            document.getElementById("idName").textContent = sessionStorage.getItem("id_name");
        
        if (document.getElementById("phoneNumber").textContent !== "Phone no: " + sessionStorage.getItem("phone_number"))
            document.getElementById("phoneNumber").textContent = "Phone no: " + sessionStorage.getItem("phone_number");
        
        if (document.getElementById("userAddress").textContent !== "Address: " + sessionStorage.getItem("user_address"))
            document.getElementById("userAddress").textContent = "Address: " + sessionStorage.getItem("user_address");

        let qrCode = sessionStorage.getItem("qr_code");
        if (qrCode) {
            // Only regenerate QR if it changed
            if (qrImg.dataset.qrValue !== qrCode) {
                const tempDiv = document.createElement("div");
                new QRCode(tempDiv, {
                    text: qrCode,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
    
                const canvas = tempDiv.querySelector("canvas");
                if (canvas) {
                    let newSrc = canvas.toDataURL("image/png");
                    if (qrImg.src !== newSrc)
                        qrImg.src = newSrc;
    
                    // Cache last QR code value
                    qrImg.dataset.qrValue = qrCode;
                }
            }
        }
        
        if (sessionStorage.getItem("subscription_status") === "active") {
            document.getElementById("memberDetails").classList.add("active-member-details");
        } else {
            document.getElementById("memberDetails").classList.remove("active-member-details");
        }

        const resetTim = sessionStorage.getItem("qr_checkin");
        if (!resetTim) { // safety check
            // expired → hide UI
            document.getElementById("checkinSection").classList.remove("active-checkin-section");
        } else {
            const timeCheckedin = new Date(resetTim);        
            // still valid → show UI
            document.getElementById("checkinSection").classList.add("active-checkin-section");
        
            // Show check-in time only
            const formattedTime = timeCheckedin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit',  second: '2-digit' });
            document.getElementById("checkinTime").textContent = formattedTime;
        }       
    } else {
        if (document.getElementById("idName").textContent !== "User full name")
            document.getElementById("idName").textContent = "User full name";
        
        if (document.getElementById("phoneNumber").textContent !== "Phone no: ")
            document.getElementById("phoneNumber").textContent = "Phone no: ";
        
        if (document.getElementById("userAddress").textContent !== "Address: ")
            document.getElementById("userAddress").textContent = "Address: ";
        // Reset the QR wrapper cleanly
        if (qrImg.src || qrImg.dataset.qrValue) {
            qrImg.removeAttribute("src");       // remove the current QR image
            delete qrImg.dataset.qrValue;       // clear cached QR value
        }
        document.getElementById("memberDetails").classList.remove("active-member-details"); // A safety to remove active member class
    }
}
// Run immediately
updater();
// Then run every 5 seconds
setInterval(updater, 5000);


function downloadBtn() {
    if (!sessionStorage.getItem("first_name")) {
        modalMsg("Kindly ensure that your details are uploaded first.");
        document.getElementById("optionBox").style.display = "none";
        return;
    }
    if (document.getElementById("idName").textContent === "User full name") {
        modalMsg("No current valid ID, cannot proceed.");
        document.getElementById("optionBox").style.display = "none";
        return;
    }
    // Show the option box
    document.getElementById("optionBox").style.display = "flex";
}

const idCard = document.getElementById("idCard");
const qrWrapper = document.getElementById("qrWrapper");

async function choose(option) {
    if (option === "A") {
        const confirm = await modalConfirm("Are you sure you want to download?");
        if (!confirm) return;     
        // Add special class for download
        idFormatDownload();
        
        html2canvas(idCard, { scale: 3 })
        .then(canvas => {
            // Create a download link
            const link = document.createElement("a");
            link.download = "IDCard.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        })
        .finally(() => {
            // Remove the class after capture
            idFormatRemove();
        });

        // Hide the option box
        document.getElementById("optionBox").style.display = "none";
    }

    if (option === "B") {
        const confirm = await modalConfirm("Are you sure you want to print?");
        if (!confirm) return;
        
        // Add special class for download formatting
        idFormatDownload();
        
        const idCard = document.getElementById("idCard");
        
        // Get computed width/height from the element (desktop size)
        const computedStyle = getComputedStyle(idCard);
        const width = parseFloat(computedStyle.width);
        const height = parseFloat(computedStyle.height);
        
        // Capture div with html2canvas
        html2canvas(idCard, {
            width: width,       // desktop width
            height: height,     // desktop height
            scale: 3            // preserve exact size
        }).then(canvas => {
            const imgData = canvas.toDataURL("image/png");
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`      
                <html>
                <head>
                    <title>Print ID Card</title>
                    <style>
                        body { margin: 0; padding: 0; text-align: center; }
                        img { width: ${width}px; height: ${height}px; }
                    </style>
                </head>
                <body>
                    <img src="${imgData}" />
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
    
            // Remove download formatting
            idFormatRemove();
        });
    
        // Hide the option box
        document.getElementById("optionBox").style.display = "none";
    }
}

function idFormatDownload() {
    idCard.classList.add("id-card-download");
    document.getElementById("memberDetails").classList.add("member-details-download");
    document.getElementById("qrWrapper").classList.add("qr-wrapper-download");
}
function idFormatRemove() {
    idCard.classList.remove("id-card-download");
    document.getElementById("memberDetails").classList.remove("member-details-download");
    document.getElementById("qrWrapper").classList.remove("qr-wrapper-download");
}


document.body.insertAdjacentHTML("beforeend", `
  <div id="optionBox" class="option-box">
    <div id="optionContent" class="option-content">
      <p>Choose an option:</p>
      <button class="image-btn" onclick="choose('A')">
        📷 Save as Image
      </button>

      <button class="print-btn" onclick="choose('B')">
        🖨️ Print ID
      </button>      
    </div>
  </div>
`);
const optionContent = document.getElementById("optionContent");
// Hide when clicking outside content
optionBox.addEventListener("click", function(event) {
  if (!optionContent.contains(event.target)) {
    optionBox.style.display = "none";
  }
});