let qrCodeInstance = null;

function updater() {
    const qrImg = document.getElementById("qrWrapper");

    if (sessionStorage.getItem("qr_code")) {
        document.getElementById("idName").textContent = sessionStorage.getItem("id_name");
        document.getElementById("phoneNumber").textContent = "Phone no: "+sessionStorage.getItem("phone_number");
        document.getElementById("userAddress").textContent = "Address: "+sessionStorage.getItem("user_address");

        // Generate QR code on a temporary div
        const tempDiv = document.createElement("div");
        const qrCodeInstance = new QRCode(tempDiv, {
            text: sessionStorage.getItem("qr_code"),
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Convert canvas to image URL
        const canvas = tempDiv.querySelector("canvas");
        if (canvas) {
            qrImg.src = canvas.toDataURL("image/png");
        }
    }
}

// Run immediately
updater();
// Then run every 5 seconds
setInterval(updater, 5000);


document.body.insertAdjacentHTML("beforeend", `
  <div id="optionBox" class="option-box">
    <div id="optionContent" class="option-content">
      <p>Choose an option:</p>
      <button class="image-btn" onclick="choose('A')">
        📷 Save as Image
      </button>

      <button class="print-btn" onclick="choose('B')">
        🖨️ Print Document
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

function downloadBtn() {
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

        // Add special class for download
        idFormatDownload();
        window.print();
        // Remove the class after capture
        idFormatRemove();

        // Hide the option box
        document.getElementById("optionBox").style.display = "none";
    }
}

function idFormatDownload() {
    idCard.classList.add("id-card-download");
    idCard.classList.add("id-header-download");
    qrWrapper.classList.add("qr-code-download");
}
function idFormatRemove() {
    idCard.classList.remove("id-card-download");
    idCard.classList.remove("id-header-download");
    qrWrapper.classList.remove("qr-code-download");
}