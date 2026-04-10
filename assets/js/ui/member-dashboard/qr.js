let lastFaceImageUrl = null;

function updater() {
    const qrImg = document.getElementById("qrWrapper");

    if (sessionStorage.getItem("id_name") && sessionStorage.getItem("phone_number") && 
        sessionStorage.getItem("user_address") && sessionStorage.getItem("status") === "activated") { // Check if the current card is valid to update the UI
            
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
            document.getElementById("idHeader").classList.add("active-id-header");
            document.getElementById("memberDetails").classList.add("active-member-details");
        } else {
            document.getElementById("idHeader").classList.remove("active-id-header");
            document.getElementById("memberDetails").classList.remove("active-member-details");
        }
       
    } else {
        // Clear face image cache in fetch\qr.js
        sessionStorage.removeItem("face_image_base64");

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
        document.getElementById("idHeader").classList.remove("active-id-header");
        document.getElementById("memberDetails").classList.remove("active-member-details"); // A safety to remove active member class
    }
}
// Run immediately
updater();
// Then run every 5 seconds
setInterval(updater, 5000);


const checkinSection = document.getElementById("checkinSection");
const checkinTimeEl = document.getElementById("checkinTime");
const checkoutTimeEl = document.getElementById("checkoutTime");

function normalizeTimestamp(value) {
    const ts = Number(value);
    if (!ts) return null;
    return ts < 1e12 ? ts * 1000 : ts; // seconds → ms if needed
}
function formatTimestamp(value) {
    const ts = normalizeTimestamp(value);
    if (!ts) return null;

    return new Date(ts).toLocaleTimeString();
}
function updateCheckinCheckoutUI() {
    const isAllowed =
        sessionStorage.getItem("status") === "activated" &&
        sessionStorage.getItem("subscription_status") === "active";

    const checkinRaw = sessionStorage.getItem("qr_checkin");
    const checkoutRaw = sessionStorage.getItem("qr_checkout");

    const checkinFormatted = formatTimestamp(checkinRaw);
    const checkoutFormatted = formatTimestamp(checkoutRaw);

    checkinTimeEl.textContent = checkinFormatted || "No check-in time available";
    checkoutTimeEl.textContent = checkoutFormatted || "No check-out time yet";

    const hasAnyTimestamp = !!(checkinFormatted || checkoutFormatted);

    if (isAllowed && hasAnyTimestamp) {
        checkinSection.classList.add("active-checkin-section");
    } else {
        checkinSection.classList.remove("active-checkin-section");
    }
}
setInterval(updateCheckinCheckoutUI, 500);


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
    // toggle button depend on user device
    const isMobileDevice = window.matchMedia("(any-hover: none)").matches;
    if (isMobileDevice) {
        document.getElementById("printBtn").classList.add("hidden");
        document.getElementById("pdfBtn").classList.remove("hidden");
    } else {
        document.getElementById("printBtn").classList.remove("hidden");
        document.getElementById("pdfBtn").classList.add("hidden");
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
            setTimeout(() => { // Give time for images to render before popping up print preview
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 100);
    
            // Remove download formatting
            idFormatRemove();
        });
    
        // Hide the option box
        document.getElementById("optionBox").style.display = "none";
    }

    if (option === "C") {
        const confirm = await modalConfirm("Are you sure you want to download PDF?");
        if (!confirm) return;
    
        idFormatDownload();
    
        const idCard = document.getElementById("idCard");
    
        const computedStyle = getComputedStyle(idCard);
        const width = parseFloat(computedStyle.width);
        const height = parseFloat(computedStyle.height);
    
        html2canvas(idCard, {
            width: width,
            height: height,
            scale: 3
        }).then(canvas => {
    
            const imgData = canvas.toDataURL("image/png");
    
            const { jsPDF } = window.jspdf;
    
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: "a4"
            });
    
            const pageWidth = pdf.internal.pageSize.getWidth();
    
            const scale = 0.6; // adjust slightly if needed
    
            const pdfWidth = width * scale;
            const pdfHeight = height * scale;
    
            const x = (pageWidth - pdfWidth) / 2;
            const y = 20;
    
            pdf.addImage(imgData, "PNG", x, y, pdfWidth, pdfHeight);
    
            pdf.save("IDCard.pdf");
    
        }).finally(() => {
            idFormatRemove();
        });
    
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

      <button class="print-btn" id="printBtn" onclick="choose('B')">
        🖨️ Print ID
      </button>     
      
      <button class="pdf-btn" id="pdfBtn" onclick="choose('C')">
        📄 Download PDF
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