/* Features: Anti spam fetch while 
   keeping the data up to date, achieved by a 
   complex combination of "need update"
   and "can update" logics */

import { db } from "../../utils/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getDatabase, ref as rtdbRef, onValue, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const memberId = sessionStorage.getItem("member_id");
const rtdb = getDatabase(); // Realtime DB reference

const currentPage = window.location.pathname.split("/").pop();
const isInQRPage = currentPage === "qr.html";

let qrListenerAttached = false;

// Listen for real-time status changes
if (memberId) {
    const statusRef = rtdbRef(rtdb, `member_status/${memberId}/status`);
    onValue(statusRef, (snapshot) => {
        if (!snapshot.exists()) return;
        
        const status = snapshot.val()?.toString().trim();
        sessionStorage.setItem("status", status);
        console.log("Realtime status updated:", sessionStorage.getItem("status"));
        
        if (
            isInQRPage &&
            !qrListenerAttached &&
            status === "activated" &&
            sessionStorage.getItem("subscription_status") === "active" &&
            sessionStorage.getItem("qr_code")
        ) {
            qrListenerAttached = true;
            initializeQrCheckinRT();
        }
    });
}
function initializeQrCheckinRT() {
    const currentQr = sessionStorage.getItem("qr_code");

    const qrCheckinRef = rtdbRef(
        rtdb,
        `stored_qrs/${currentQr}/qr_checkin`
    );

    onValue(qrCheckinRef, (snap) => {
        const checkin = snap.val();


            sessionStorage.setItem(
                "qr_checkin",
                new Date(checkin).toISOString()
            );
            
        if (sessionStorage.getItem("qr_checkin") === "1970-01-01T00:00:00.000Z")
            sessionStorage.setItem("qr_checkin", "");

        console.log("Realtime qr_checkin updated:", checkin + sessionStorage.getItem("qr_checkin"));
    });
}

// Run every 0.5s to check for updates
setInterval(() => {
    if (!sessionStorage.getItem("status")) return;
    if (sessionStorage.getItem("needs_update") !== "yes") return;
    if (sessionStorage.getItem("loading_box") === "show") return;

    // lock immediately
    sessionStorage.setItem("needs_update", "no");
    updateUserInfo();
}, 500);

async function updateUserInfo() {
    if (!memberId) return;

    sessionStorage.setItem("loading_box", "show");

    try {
        // Reset table data in progress.js
        const isInProgressPage = currentPage === "progress.html";
        if (isInProgressPage) sessionStorage.removeItem(ATTENDANCE_CACHE_KEY);
        
        // --- Firestore references ---
        const memberRef = doc(db, "members", memberId);

        // --- Get documents ---
        const memberSnap = await getDoc(memberRef);

        if (!memberSnap.exists()) {
            console.warn("Member document does not exist.");
            // Clear session storage
            clearUserSession();
            return;
        }

        const memberData = memberSnap.data();

        // Build full name
        const fullName = [memberData.first_name, memberData.middle_name, memberData.last_name]
            .filter(Boolean)
            .join(" ");

        // Store basic info
        sessionStorage.setItem("full_name", fullName);
        sessionStorage.setItem("first_name", memberData.first_name || "");
        sessionStorage.setItem("middle_name", memberData.middle_name || "");
        sessionStorage.setItem("last_name", memberData.last_name || "");
        sessionStorage.setItem("phone_number", (memberData.phone_number || "").replace(/^#/, ""));
        sessionStorage.setItem("user_address", memberData.user_address || "");

        // If activated, include QR and subscription info
        if (sessionStorage.getItem("status") === "activated") {
            // --- Firestore references ---
            const subscriptionRef = doc(db, "subscriptions", memberId);

            // --- Get documents ---
            const subscriptionSnap = await getDoc(subscriptionRef);    
            const subscriptionData = subscriptionSnap.exists() ? subscriptionSnap.data() : {};

            sessionStorage.setItem("face_image_url", memberData.face_image_url || "");
            sessionStorage.setItem("subscription_status", subscriptionData.subscription_status || "");
            sessionStorage.setItem("plan", subscriptionData.plan || "");
            sessionStorage.setItem("payment_method", subscriptionData.payment_method || "");
            if (subscriptionData.expiration_date?.toDate) {
                sessionStorage.setItem("expiration_date", subscriptionData.expiration_date.toDate().toISOString());
            } else {
                sessionStorage.setItem("expiration_date", "");
            }

            // --- RTDB references ---
            const sessionQrRef = rtdbRef(rtdb, `session_qr/${memberId}`);
            
            // --- Get documents ---
            const sessionQrSnap = await get(sessionQrRef);
            const sessionQrData = sessionQrSnap.exists() ? sessionQrSnap.val() : {};
            
            sessionStorage.setItem("qr_code", sessionQrData.current_qr || "");
            sessionStorage.setItem("id_name", sessionQrData.id_name || "");       

            console.log("User Info & Account:", { memberData, subscriptionData, sessionQrData });
        } else {
            console.log("User Info:", { memberData });
            clearUserSession()
        }
    } catch (err) {
        console.error("User Info Error:", err);
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}

function clearUserSession() {
    sessionStorage.removeItem("face_image_url");
    sessionStorage.removeItem("subscription_status");
    sessionStorage.removeItem("plan");
    sessionStorage.removeItem("expiration_date");
    sessionStorage.removeItem("qr_checkin");
    sessionStorage.removeItem("qr_code");
    sessionStorage.removeItem("id_name");
}

// Reload page to trigger updateUserInfo
const navEntries = performance.getEntriesByType("navigation");
const navType = navEntries.length > 0 ? navEntries[0].type : "navigate";

// If it's a reload/refresh
if (navType === "reload") {
    sessionStorage.setItem("needs_update", "yes");
    sessionStorage.setItem("loading_box", "hide"); // Remove stuck up loading box bug
}
