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

    if (sessionStorage.getItem("subscription_status") !== "active") {
        modalMsg("It looks like you’re not a member yet. Subscribe now to generate your QR ID!");
        return;
    }

    // Confirm AFTER validation
    const confirmRequest = confirm("Are you sure you want to generate QR Code Identity?");
    if (!confirmRequest) return;

    const memberId = sessionStorage.getItem("member_id");
    const fullName = sessionStorage.getItem("full_name");

    sessionStorage.setItem("loading_box", "show");

    try {
        if (sessionStorage.getItem("status") !== "activated") {
            modalMsg("Your information is under review. QR generation will be available after approval.");
            return;
        }
        // Define RTDB references here
        const sessionQrRef = ref(rtdb, `session_qr/${memberId}id_name`);
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
            qr_checkin_expiration: 0
        });
        
        // Update session_qr
        await set(memberQrRef, newQr);
        await set(ref(rtdb, `session_qr/${memberId}/id_name`), fullName);
        await set(qrCountRef, qrCount + 1);

        sessionStorage.setItem("needs_update", "yes");
        modalMsg("Your QR code has been generated successfully! " + (qrCount + 1) + "/3");

    } catch (err) {
        console.error("QR generation error:", err);
        modalMsg("Request failed. Please try again or contact support.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});


// Show modal message
function modalMsg(Msg) {
    sessionStorage.setItem("modal_box", "show")
    sessionStorage.setItem("modal_message", Msg)
}