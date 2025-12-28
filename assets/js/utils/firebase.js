// js/utils/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyDaWdPdqBZKfC9499kv57GxfkP5hu0SP10",
    authDomain: "sonic-gym-database.firebaseapp.com",
    databaseURL: "https://sonic-gym-database-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sonic-gym-database",
    storageBucket: "sonic-gym-database.firebasestorage.app",
    messagingSenderId: "268824699214",
    appId: "1:268824699214:web:b121f7be07e34c85907e1f",
    measurementId: "G-5KVTHY26TP"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);

// --- Exports ---
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, provider, db };