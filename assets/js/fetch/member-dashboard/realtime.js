/* Features: Anti spam fetch while 
   keeping the data up to date, achieved by a 
   complex combination of "need update"
   and "can update" logics */

import { db } from "../../utils/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Run every 0.5s to check for updates
const memberId = sessionStorage.getItem("member_id");

setInterval(() => {
    if (sessionStorage.getItem("needs_update") === "yes" && sessionStorage.getItem("loading_box") !== "show") {
        updateUserInfo();
    }
}, 500);

async function updateUserInfo() {
    if (!memberId) return;

    sessionStorage.setItem("loading_box", "show");

    try {
        // --- Firestore references ---
        const memberRef = doc(db, "members", memberId);
        const subscriptionRef = doc(db, "subscriptions", memberId);
        const qrRef = doc(db, "qr_codes", memberId);

        // --- Get documents ---
        const memberSnap = await getDoc(memberRef);
        const subscriptionSnap = await getDoc(subscriptionRef);
        const qrSnap = await getDoc(qrRef);

        if (!memberSnap.exists()) {
            console.warn("Member document does not exist.");
            // Clear session storage
            clearUserSession();
            return;
        }

        const memberData = memberSnap.data();
        const subscriptionData = subscriptionSnap.exists() ? subscriptionSnap.data() : {};
        const qrData = qrSnap.exists() ? qrSnap.data() : {};

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

        // Status
        sessionStorage.setItem("status", memberData.status || "pending");

        // If activated, include QR and subscription info
        if (memberData.status === "activated") {
            sessionStorage.setItem("qr_code", qrData.qr_code || "");
            sessionStorage.setItem("id_name", qrData.id_name || "");
            sessionStorage.setItem("subscription_status", subscriptionData.subscription_status || "");
            sessionStorage.setItem("plan", subscriptionData.plan || "");
            if (subscriptionData.expiration_date?.toDate) {
                sessionStorage.setItem("expiration_date", subscriptionData.expiration_date.toDate().toISOString());
            } else {
                sessionStorage.setItem("expiration_date", "");
            }

            if (qrData.qr_checkin?.toDate) {
                sessionStorage.setItem("qr_checkin", qrData.qr_checkin.toDate().toISOString());
            } else {
                sessionStorage.setItem("qr_checkin", "");
            }
        }
        
        console.log("User Info & Account:", { memberData, subscriptionData, qrData });

        // Prevent looping
        sessionStorage.setItem("needs_update", "no");

    } catch (err) {
        console.error("User Info Error:", err);
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}

function clearUserSession() {
    sessionStorage.removeItem("full_name");
    sessionStorage.removeItem("first_name");
    sessionStorage.removeItem("middle_name");
    sessionStorage.removeItem("last_name");
    sessionStorage.removeItem("phone_number");
    sessionStorage.removeItem("user_address");
    sessionStorage.removeItem("qr_code");
    sessionStorage.removeItem("id_name");
    sessionStorage.removeItem("subscription_status");
    sessionStorage.removeItem("expiration_date");
    sessionStorage.removeItem("plan");
    sessionStorage.removeItem("qr_checkin");
}

// Reload page to trigger updateUserInfo
const navEntries = performance.getEntriesByType("navigation");
const navType = navEntries.length > 0 ? navEntries[0].type : "navigate";

// If it's a reload/refresh
if (navType === "reload") {
    sessionStorage.setItem("needs_update", "yes");
}
