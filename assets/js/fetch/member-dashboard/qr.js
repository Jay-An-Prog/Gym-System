import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const rtdb = getDatabase();

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
        modalMsg("Kindly ensure that your details are uploaded first.");
        return;
    }

    if (sessionStorage.getItem("status") !== "activated") {
        modalMsg("Your information is under review. QR generation will be available after approval.");
        return;
    }

    if (sessionStorage.getItem("subscription_status") !== "active") {
        modalMsg("It looks like you’re not a member yet. Subscribe now to generate your QR ID!");
        return;
    }

    // Confirm AFTER validation
    const confirm = await modalConfirm("Are you sure you want to generate QR Code Identity?");
    if (!confirm) return;

    const memberId = sessionStorage.getItem("member_id");
    const fullName = sessionStorage.getItem("full_name");

    sessionStorage.setItem("loading_box", "show");

    try {
        // Define RTDB references here
        const sessionQrRef = ref(rtdb, `session_qr/${memberId}/id_name`);
        const memberQrRef = ref(rtdb, `session_qr/${memberId}/current_qr`);
        const qrCountRef = ref(rtdb, `session_qr/${memberId}/qr_count`);

        // Get current QR count
        const qrCountSnap = await get(qrCountRef);
        const qrCount = qrCountSnap.exists() ? qrCountSnap.val() : 0;
        
        if (qrCount >= 3) {
            modalMsg("You have reached your QR generation limit. Please wait until it resets.");
            return;
        }
        
        // Generate new QR
        const newQr = generateQRString();
        
        // Get old QR
        const oldQrSnap = await get(memberQrRef);
        const oldQr = oldQrSnap.exists() ? oldQrSnap.val() : null;
        
        // Delete old QR in stored_qrs
        if (oldQr) {
            await remove(ref(rtdb, `stored_qrs/${oldQr}`));
        }
        
        // Store new QR
        await set(ref(rtdb, `stored_qrs/${newQr}`), {
            member_id: memberId,
            id_name: fullName,
            qr_checkin: 0,
            qr_checkout: 0
        });
        
        // Update session_qr
        await set(memberQrRef, newQr);
        await set(sessionQrRef, fullName);
        await set(qrCountRef, qrCount + 1);

        // Clear face image cache
        sessionStorage.removeItem("face_image_base64");

        sessionStorage.setItem("needs_update", "yes");
        modalMsg("Your QR code has been generated successfully! " + (qrCount + 1) + "/3");

    } catch (err) {
        console.error("QR generation error:", err);
        modalMsg("Request failed. Please try again or contact support.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});

// Show and render profile image so it can be viewed, manipulated by js like download, and print.
// Profile image update wrapped in anonymous async function
(async () => {
    if (sessionStorage.getItem("status") !== "activated") 
        return;
    if (sessionStorage.getItem("subscription_status") !== "active")
        return;
    if (!sessionStorage.getItem("qr_code")) // Profile will appear when a qr is generated
        return;

    const url = sessionStorage.getItem("face_image_url");
    const defaultPic = document.getElementById("defaultPic");

    if (!url || url === lastFaceImageUrl) return; // guard

    lastFaceImageUrl = url;

    // Check if Base64 already cached
    const cachedBase64 = sessionStorage.getItem("face_image_base64");

    if (cachedBase64) {
        defaultPic.src = cachedBase64;
        return; // no need to call Apps Script
    }

    try {
        sessionStorage.setItem("loading_box", "show");
        const proxyUrl = `https://script.google.com/macros/s/AKfycbxmzFbJifIcYMKCQYiFXRLcQnMM0DcJQYLPb3V3adQ57iDhJ9g_vPyYoEc2esFVzw-e/exec?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(proxyUrl);
        const base64Data = await response.text();

        // Save to sessionStorage
        sessionStorage.setItem("face_image_base64", base64Data);

        defaultPic.src = base64Data;

        await new Promise(resolve => {
            defaultPic.onload = resolve;
            defaultPic.onerror = resolve;
        });

    } catch (err) {
        console.error("Failed to load image via proxy:", err);
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
})(); // <-- immediately invoked