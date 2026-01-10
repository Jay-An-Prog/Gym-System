import { db } from "../../utils/firebase.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// CALCULATE + SAVE
document.getElementById("calculateBtn").addEventListener("click", async () => {
    if (!sessionStorage.getItem("first_name")) {
        modalMsg("Kindly ensure that your details are uploaded first.");
        return;
    }

    if (sessionStorage.getItem("status") !== "activated") {
            modalMsg("Your account is not yet activated. Please wait for staff approval before requesting a membership.");
            return;
        }

    if (sessionStorage.getItem("subscription_status") !== "active") {
        modalMsg("It looks like you’re not a member yet. Subscribe now to generate your QR ID!");
        return;
    }

    const sex = document.getElementById("sex").value;
    const age = parseFloat(document.getElementById("age").value);
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const activity = parseFloat(document.getElementById("activity").value);
    const goal = document.getElementById("goal").value;

    if (!sex || !age || !height || !weight || !activity || !goal) {
        modalMsg("Please fill in all fields.");
        return;
    }

    const confirm = await modalConfirm("Confirm to save your nutrition calculation for your profile.");
    if (!confirm) return;

    // 1 Calculate BMR
    let bmr = sex === "male"
        ? (10 * weight) + (6.25 * height) - (5 * age) + 5
        : (10 * weight) + (6.25 * height) - (5 * age) - 161;

    // 2 Total Daily Energy Expenditure
    let tdee = bmr * activity;

    // 3 Adjust for goal
    let caloriesTarget = goal === "lose" ? tdee - 500
                     : goal === "gain" ? tdee + 300
                     : tdee;

    // 4 Protein target
    let proteinPerKg = goal === "gain" ? 2.0
                     : goal === "lose" ? 1.8
                     : 1.6;
    let proteinTarget = weight * proteinPerKg;

    // 5 Update UI
    document.getElementById("caloriesResult").innerText = Math.round(caloriesTarget);
    document.getElementById("proteinResult").innerText = Math.round(proteinTarget);
    document.getElementById("nutritionResult").style.display = "block";

    // 6 Save to Firestore
    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) {
        console.warn("No member ID found. Cannot save nutrition data.");
        return;
    }

    sessionStorage.setItem("loading_box", "show");

    try {
        const nutritionRef = doc(db, "nutritions", memberId);
        await setDoc(nutritionRef, {
            calories_target: Math.round(caloriesTarget),
            protein_target: Math.round(proteinTarget),
            nutrition_goal: goal,
            age: age,
            height: height,
            weight: weight,
            activity: activity,
            sex: sex,
            timestamp: serverTimestamp()
        });

        sessionStorage.setItem("needs_update", "yes");
        modalMsg("Nutrition data saved successfully!");
    } catch (err) {
        console.error("Error saving nutrition data:", err);
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});