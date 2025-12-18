// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
    getAuth, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firestore imports
import { 
    getFirestore, doc, getDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDaWdPdqBZKfC9499kv57GxfkP5hu0SP10",
    authDomain: "sonic-gym-database.firebaseapp.com",
    projectId: "sonic-gym-database",
    storageBucket: "sonic-gym-database.firebasestorage.app",
    messagingSenderId: "268824699214",
    appId: "1:268824699214:web:b121f7be07e34c85907e1f",
    measurementId: "G-5KVTHY26TP"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// CHANGED: Firestore init
const db = getFirestore(app);

// Provider
const provider = new GoogleAuthProvider();

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
        console.error(error);
        alert("Google sign-in failed.");
    }
}

// HANDLE USER AFTER LOGIN
async function handleUser(user) {
    sessionStorage.setItem("portal_loading_box", "show"); // Show loading box

    const email = user.email;
    const username = user.displayName || "Unnamed User";
    const member_id = user.uid;
    sessionStorage.setItem("user_photo", user.photoURL || "../../assets/images/profile-icon.png");

    // Firestore document reference
    const userRef = doc(db, "members", member_id);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        await setDoc(userRef, {
            email,
            username,
            created_at: Date.now()
        });
        console.log("New user added to Firestore.");
    } else {
        console.log("User already exists in Firestore.");
    }
    // Session storage (unchanged)
    sessionStorage.setItem("member_id", member_id);
    sessionStorage.setItem("user_name", username);
    sessionStorage.setItem("sonic_email", email);
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