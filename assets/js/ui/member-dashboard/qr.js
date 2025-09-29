let qrCodeInstance = null;

function updater() {
    if (sessionStorage.getItem("id_name") && sessionStorage.getItem("phone_number") && sessionStorage.getItem("user_address")) { // Check if the current card is valid to update the UI
        if (document.getElementById("idName").textContent !== sessionStorage.getItem("id_name"))
            document.getElementById("idName").textContent = sessionStorage.getItem("id_name");
        
        if (document.getElementById("phoneNumber").textContent !== "Phone no: " + sessionStorage.getItem("phone_number"))
            document.getElementById("phoneNumber").textContent = "Phone no: " + sessionStorage.getItem("phone_number");
        
        if (document.getElementById("userAddress").textContent !== "Address: " + sessionStorage.getItem("user_address"))
            document.getElementById("userAddress").textContent = "Address: " + sessionStorage.getItem("user_address");

        const qrImg = document.getElementById("qrWrapper");
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
    }
}
// Run immediately
updater();
// Then run every 5 seconds
setInterval(updater, 5000);


function downloadBtn() {
    if (!sessionStorage.getItem("first_name")) {
        alert("Kindly ensure that your details are uploaded first.");
        document.getElementById("optionBox").style.display = "none";
        return;
    }
    if (document.getElementById("idName").textContent === "User full name") {
        alert("No current valid ID, cannot proceed.");
        document.getElementById("optionBox").style.display = "none";
        return;
    }
    // Show the option box
    document.getElementById("optionBox").style.display = "flex";
}

const idCard = document.getElementById("idCard");
const qrWrapper = document.getElementById("qrWrapper");

function choose(option) {
    if (option === "A") {
        let confirmRequest = confirm("Are you sure you want to download?");
        if (!confirmRequest) return;     
        // Add special class for download
        idFormatDownload();
        
        html2canvas(idCard, { scale: 2 })
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
        let confirmRequest = confirm("Are you sure you want to print?");
        if (!confirmRequest) return;
        
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
            scale: 1            // preserve exact size
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
    idCard.classList.add("id-header-download");
    idCard.classList.add("member-details-download");
}
function idFormatRemove() {
    idCard.classList.remove("id-card-download");
    idCard.classList.remove("id-header-download");
    idCard.classList.remove("member-details-download");
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