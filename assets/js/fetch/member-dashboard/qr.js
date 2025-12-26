import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "../../utils/firebase.js";

// QR Generator
function generateQRString() {
    const now = new Date();

    const pad = n => n.toString().padStart(2, "0");

    const dateTime =
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        now.getFullYear() +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds());

    const random6 = Math.floor(100000 + Math.random() * 900000);

    return `Q${dateTime}-${random6}`;
}


const generateBtn = document.getElementById("generateBtn");

generateBtn.addEventListener("click", async () => {
    if (!sessionStorage.getItem("first_name")) {
        alert("Kindly ensure that your details are uploaded first.");
        return;
    }

    if (sessionStorage.getItem("subscription_status") !== "active") {
        alert("It looks like you’re not a member yet. Subscribe now to generate your QR ID!");
        return;
    }

    // Confirm AFTER validation
    const confirmRequest = confirm("Are you sure you want to generate QR Code Identity?");
    if (!confirmRequest) return;

    const memberId = sessionStorage.getItem("member_id");
    const fullName = sessionStorage.getItem("full_name");

    sessionStorage.setItem("loading_box", "show");

    try {
        // Check member activation
        const memberRef = doc(db, "members", memberId);
        const memberSnap = await getDoc(memberRef);

        if (!memberSnap.exists()) {
            alert("We couldn’t find your account.");
            return;
        }

        if (memberSnap.data().status !== "activated") {
            alert("Your information is under review. QR generation will be available after approval.");
            return;
        }
        // Generate QR
        const qrCodeValue = generateQRString();

        // Save to qr_codes/{member_id}
        const qrRef = doc(db, "qr_codes", memberId);

        await setDoc(qrRef, {
            id_name: fullName,
            qr_code: qrCodeValue
        }, { merge: true });

        sessionStorage.setItem("needs_update", "yes");
        alert("Your QR code has been generated successfully!");

    } catch (err) {
        console.error("QR generation error:", err);
        alert("Request failed. Please try again or contact support.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});