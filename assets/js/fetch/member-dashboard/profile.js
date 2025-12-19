import { db } from "../../utils/firebase.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// FORM SUBMIT → FIRESTORE
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    let confirmRequest = confirm(
        "Please review your information carefully. Click OK to proceed or Cancel to make changes."
    );
    if (!confirmRequest) return;

    if (sessionStorage.getItem("status") === "activated") {
        confirmRequest = confirm(
            "Caution: Updating your information will remove your active status until it is reviewed by the admin. Do you want to continue?"
        );
        if (!confirmRequest) return;
    }

    alert("Submitting info...");
    sessionStorage.setItem("loading_box", "show");

    try {
        const memberId = sessionStorage.getItem("member_id");
        if (!memberId) {
            alert("Session expired. Please sign in again.");
            return;
        }

        const formData = {
            first_name: e.target.first_name.value,
            middle_name: e.target.middle_name.value,
            last_name: e.target.last_name.value,
            phone_number: "#" + e.target.phone_number.value,
            user_address: e.target.user_address.value,
            status: "pending",
            updated_at: serverTimestamp()
        };

        const memberRef = doc(db, "members", memberId);

        // STRICT CHECK: document must exist
        const snap = await getDoc(memberRef);
        if (!snap.exists()) {
            throw new Error("Member document does not exist.");
        }

        // Update only (no creation allowed)
        await setDoc(memberRef, formData, { merge: true });

        sessionStorage.setItem("needs_update", "yes");
        sessionStorage.setItem("profile_update", "yes");

        alert("Upload successful!");
        alert("Your account is under review for validation!");

    } catch (error) {
        console.error("Firestore Error:", error);
        alert("Upload failed!");
        alert("Account validation was unsuccessful.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});
