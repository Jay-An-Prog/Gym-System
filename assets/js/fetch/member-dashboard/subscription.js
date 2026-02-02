import { db } from "../../utils/firebase.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { Client, Storage, ID } 
from "https://cdn.jsdelivr.net/npm/appwrite@13.0.0/+esm";

const appwriteClient = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("69457b7f000459b00a9a"); // your project

const storage = new Storage(appwriteClient);
const BUCKET_ID = "6945804c00349e47cb42"; // your bucket

document.querySelectorAll(".planBtn").forEach(btn => {
    btn.addEventListener("click", async () => {

        if (!sessionStorage.getItem("first_name")) {
            modalMsg("Kindly ensure that your details are uploaded first.");
            return;
        }

        if (sessionStorage.getItem("status") !== "activated") {
            modalMsg("Your account is not yet activated. Please wait for staff approval before requesting a membership.");
            return;
        }

        // confirm only AFTER validation
        const confirm = await modalConfirm("Are you sure you want to upgrade to membership?");
        if (!confirm) return;

        const memberId = sessionStorage.getItem("member_id");
        const selectedPlan = sessionStorage.getItem("plan");

        if (!memberId || !selectedPlan) {
            modalMsg("Missing member or plan information.");
            return;
        }

        sessionStorage.setItem("loading_box", "show");

        try {
            // Submit subscription request
            const subscriptionRef = doc(db, "subscriptions", memberId);

            // Auto-create or update the subscription document safely
            await setDoc(subscriptionRef, {
                expiration_date: null,
                plan: selectedPlan,
                start_date: null,
                subscription_status: "pending",
                payment_method: "counter"
            });

            sessionStorage.setItem("needs_update", "yes");
            modalMsg("Your plan request has been successfully submitted!");

        } catch (err) {
            console.error("Plan request error:", err);

            // Handles cases where the write fails
            modalMsg("Request failed. Please contact the gym staff or try again.");
        } finally {
            sessionStorage.setItem("loading_box", "hide");
        }
    });
});

document.getElementById("cancelBtn").addEventListener("click", async () => {
    const confirm = await modalConfirm("Are you sure you want to cancel your request?");
    if (!confirm) return;

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    sessionStorage.setItem("loading_box", "show");

    try {
        const subscriptionRef = doc(db, "subscriptions", memberId);

        // 🔍 Fetch existing data
        const snap = await getDoc(subscriptionRef);
        if (snap.exists()) {
            const data = snap.data();

            // 🗑️ Delete receipt if exists
            if (data.receipt_file_id) {
                try {
                    await storage.deleteFile(BUCKET_ID, data.receipt_file_id);
                } catch (e) {
                    console.warn("Receipt delete failed:", e);
                }
            }
        }

        // 🧹 Reset subscription fields
        await setDoc(subscriptionRef, {
            expiration_date: null,
            plan: "",
            start_date: null,
            subscription_status: "",
            payment_method: "",
            receipt_file_id: "",
            receipt_image_url: "",
            receipt_filename: ""
        }, { merge: true });

        sessionStorage.setItem("needs_update", "yes");
        modalMsg("Your plan request has been cancelled!");

    } catch (err) {
        console.error("Cancel request error:", err);
        modalMsg("Cancellation failed.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});

document.getElementById("uploadButton").addEventListener("click", async () => {
    const fileInput = document.getElementById("gcashProof");
    const file = fileInput.files[0];

    if (!file) {
        modalMsg("Please upload your GCash receipt screenshot.");
        return;
    }

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) {
        modalMsg("Member session not found.");
        return;
    }

    const confirm = await modalConfirm(
        "Are you sure you want to submit this GCash receipt?\n\nActivation will be done after verification."
    );
    if (!confirm) return;

    sessionStorage.setItem("loading_box", "show");

    try {
        // 👇 Create a renamed file with virtual folder path
        const renamedFile = new File(
            [file],
            `gcash/${memberId}/proof.jpg`,
            { type: file.type }
        );

        // 1️⃣ Upload to Appwrite
        const upload = await storage.createFile(
            BUCKET_ID,
            ID.unique(), // ALWAYS keep this unique
            renamedFile
        );

        const receiptFileId = upload.$id;
        const receiptURL = storage
            .getFileView(BUCKET_ID, receiptFileId)
            .toString();

        // 2️⃣ Save reference to Firestore
        const subscriptionRef = doc(db, "subscriptions", memberId);

        await setDoc(subscriptionRef, {
            payment_method: "gcash",
            receipt_file_id: receiptFileId,
            receipt_image_url: receiptURL,
            submitted_at: new Date()
        }, { merge: true });

        sessionStorage.setItem("needs_update", "yes");
        await modalMsg("GCash receipt uploaded successfully!");
        modalMsg("Your payment is now under verification.");

        fileInput.value = "";

    } catch (err) {
        console.error("GCash upload error:", err);
        modalMsg("Upload failed. Please try again or contact staff.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});