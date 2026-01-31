import { db } from "../../utils/firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

        // Auto-create or update safely when cancelling
        await setDoc(subscriptionRef, {
            expiration_date: null,
            plan: "",
            start_date: null,
            subscription_status: "",
            payment_method: ""
        });

        sessionStorage.setItem("needs_update", "yes");
        modalMsg("Your plan request has been cancelled!");

    } catch (err) {
        console.error("Cancel request error:", err);
        modalMsg("Cancellation failed.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});