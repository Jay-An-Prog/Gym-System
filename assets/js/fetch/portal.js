// portal.js
import { auth, provider, db } from "../utils/firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { setPersistence, browserLocalPersistence, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// SECURE AUTO-LOGIN ON PAGE LOAD
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await handleUser(user);
    }
});

// GOOGLE SIGN-IN BUTTON
document.getElementById("googleLoginBtn").addEventListener("click", loginWithGoogle);

async function loginWithGoogle() {
    try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await signInWithPopup(auth, provider);
        await handleUser(result.user);
    } catch (error) {
        sessionStorage.setItem("portal_loading_box", "hide"); // hide AFTER request finishes
        console.error(error);
    }
}

// HANDLE USER AFTER LOGIN
async function handleUser(user) {
    sessionStorage.setItem("portal_loading_box", "show"); // Show loading box

    const email = user.email;
    const username = user.displayName || "Unnamed User";
    const member_id = user.uid;
    sessionStorage.setItem("user_photo", user.photoURL || "../../assets/images/profile-icon.png");

    // Firestore references
    const userRef = doc(db, "members", member_id);
    const subscriptionRef = doc(db, "subscriptions", member_id);
    const qrCodeRef = doc(db, "qr_codes", member_id);

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        // Create default member document
        await setDoc(userRef, {
            email,
            username,
            created_at: Date.now(),
        });
        console.log("New user added to Firestore.");

        // Create default subscription document
        await setDoc(subscriptionRef, {
            subscription_status: "", // default value
            start_date: null,
            expiration_date: null,
            plan: ""
        });

        // Create default QR code document
        await setDoc(qrCodeRef, {
            qr_code: "", // default empty
            id_name: "",
            qr_checkin: null,
            end_date: null
        });

        console.log("Default subscription and QR code documents created.");
    } else {
        console.log("User already exists in Firestore.");
    }

    // Session storage (unchanged)
    sessionStorage.setItem("member_id", member_id);
    sessionStorage.setItem("user_name", username);
    sessionStorage.setItem("sonic_email", email);
    sessionStorage.setItem("needs_update", "yes"); // Retrieve user info after signed in
    sessionStorage.setItem("portal_loading_box", "hide"); // hide AFTER request finishes

    redirectTo("/pages/member-dashboard/profile.html");
}

// REDIRECT HELPER
function redirectTo(path) {
    // Get current URL parts
    const origin = window.location.origin;         // e.g. http://localhost:5500
    const pathname = window.location.pathname;     // e.g. /repo-name/index.html or /index.html
  
    // Detect base (for GitHub Pages with repo name)
    const segments = pathname.split("/").filter(Boolean);
    const base = (segments.length > 0 && segments[0] !== "pages") ? "/" + segments[0] : "";
  
    // Build final URL
    const redirectUrl = origin + base + path;
  
    window.location.href = redirectUrl;
}