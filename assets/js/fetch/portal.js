// portal.js
import { auth, provider, db } from "../utils/firebase.js";
import { setPersistence, browserLocalPersistence, signInWithPopup, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const rtdb = getDatabase();

// Force to let user choose accounts
provider.setCustomParameters({
    prompt: "select_account"
});

// Detect in-app browsers (Messenger / FB / IG)
function isInAppBrowser() {
    return /FBAN|FBAV|Instagram|Messenger/i.test(navigator.userAgent);
}

// GOOGLE SIGN-IN BUTTON
const btnText = document.getElementById("btnText");
const btn = document.getElementById("googleLoginBtn");

btn.disabled = true;

// HANDLE REDIRECT RESULT (important for Messenger / mobile)
let redirectHandled = false; // Flag
window.addEventListener("DOMContentLoaded", async () => {
    btnText.textContent = "Checking account...";
    try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
            redirectHandled = true;  // mark handled
            await handleUser(result.user);
        }
    } catch (error) {
        console.error("Redirect login error:", error);
    }
});

// SECURE AUTO-LOGIN ON PAGE LOAD
auth.onAuthStateChanged(async (user) => {
    if (user && !redirectHandled) {
        // only run if redirect result didn't already handle it
        await handleUser(user);
    } else {
        btnText.textContent = "Sign in with Google";
        btn.disabled = false;
    }
});

btn.addEventListener("click", loginWithGoogle);

async function loginWithGoogle() {
    redirectHandled = true;  // mark handled, prevent running onAuthStateChanged twice
    try {
        await setPersistence(auth, browserLocalPersistence);
        // Use redirect for in-app browsers, popup otherwise
        if (isInAppBrowser()) {
            await signInWithRedirect(auth, provider);
        } else {
            const result = await signInWithPopup(auth, provider);
            await handleUser(result.user);
        }
    } catch (error) {
        console.error("Google login error:", error);
    }
}

// HANDLE USER AFTER LOGIN
async function handleUser(user) {
    btnText.textContent = "Signed in";
    btn.disabled = true; // Lock google button

    sessionStorage.setItem("portal_loading_box", "show"); // Show loading box

    const email = user.email;
    const username = user.displayName || "Unnamed User";
    const member_id = user.uid;
    sessionStorage.setItem("user_photo", user.photoURL || "../../assets/images/profile-icon.png");

    // Firestore references
    const userRef = doc(db, "members", member_id);
    const subscriptionRef = doc(db, "subscriptions", member_id);

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

        console.log("Default subscription documents created.");
    } else {
        console.log("User already exists in Firestore.");
    }

    // Realtime DB: member status reference
    const statusRef = ref(rtdb, `member_status/${member_id}`);
    
    // Check if status already exists
    const statusSnap = await get(statusRef);
    
    if (!statusSnap.exists()) {
        await set(statusRef, {
            status: "",           // default empty status
            updated_at: Date.now()
        });
        console.log("Realtime DB member status initialized.");
    } else {
        console.log("Realtime DB member status already exists.");
    }

    // Session storage (unchanged)
    sessionStorage.setItem("member_id", member_id);
    sessionStorage.setItem("user_name", username);
    sessionStorage.setItem("sonic_email", email);
    sessionStorage.setItem("needs_update", "yes"); // Retrieve user info after signed in
    sessionStorage.setItem("portal_loading_box", "hide"); // hide AFTER request finishes

    window.location.href = redirectTo("/pages/member-dashboard/profile.html");
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
  
    return redirectUrl;
}