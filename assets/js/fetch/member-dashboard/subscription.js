import { db } from "../../utils/firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.querySelectorAll(".planBtn").forEach(btn => {
    btn.addEventListener("click", async () => {

        if (!sessionStorage.getItem("first_name")) {
            alert("Kindly ensure that your details are uploaded first.");
            return;
        }

        // onfirm only AFTER validation
        const confirmRequest = confirm("Are you sure you want to upgrade to membership?");
        if (!confirmRequest) return;

        const memberId = sessionStorage.getItem("member_id");
        const selectedPlan = sessionStorage.getItem("plan");

        if (!memberId || !selectedPlan) {
            alert("Missing member or plan information.");
            return;
        }

        sessionStorage.setItem("loading_box", "show");

        try {
            // Check member activation status
            const memberRef = doc(db, "members", memberId);
            const memberSnap = await getDoc(memberRef);

            if (!memberSnap.exists()) {
                alert("Your account does not exist. Please contact the gym staff.");
                return;
            }

            const memberData = memberSnap.data();

            if (memberData.status !== "activated") {
                alert("Your account is not yet activated. Please wait for staff approval before requesting a membership.");
                return;
            }
            // Submit subscription request
            const subscriptionRef = doc(db, "subscriptions", memberId);

            await updateDoc(subscriptionRef, {
                subscription_status: "pending",
                plan: selectedPlan
            });

            sessionStorage.setItem("needs_update", "yes");
            alert("Your plan request has been successfully submitted!");

        } catch (err) {
            console.error("Plan request error:", err);
            alert("Request failed. Please try again.");
        } finally {
            sessionStorage.setItem("loading_box", "hide");
        }
    });
});

document.getElementById("cancelBtn").addEventListener("click", async () => {
    const confirmRequest = confirm("Are you sure you want to cancel your request?");
    if (!confirmRequest) return;

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    sessionStorage.setItem("loading_box", "show");

    try {
        const subscriptionRef = doc(db, "subscriptions", memberId);

        await updateDoc(subscriptionRef, {
            subscription_status: "",
            plan: ""
        });

        sessionStorage.setItem("needs_update", "yes");
        alert("Your plan request has been cancelled!");

    } catch (err) {
        console.error("Cancel request error:", err);
        alert("Cancellation failed.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});