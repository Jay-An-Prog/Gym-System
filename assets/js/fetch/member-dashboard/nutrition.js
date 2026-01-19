import { db } from "../../utils/firebase.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// CALCULATE + SAVE
document.getElementById("calculateBtn").addEventListener("click", async () => {

    // Holds the latest calculated values for optional saving
    let caloriesTarget, proteinTarget, age, height, weight, activity, sex, goal;

    function calculateUserInput() {
        sex = document.getElementById("sex").value;
        age = parseFloat(document.getElementById("age").value);
        height = parseFloat(document.getElementById("height").value);
        weight = parseFloat(document.getElementById("weight").value);
        activity = parseFloat(document.getElementById("activity").value);
        goal = document.getElementById("goal").value;
        
        if (!sex || !age || !height || !weight || !activity || !goal) {
            modalMsg("Please fill in all fields.");
            return false;
        }
        
        // 1 Calculate BMR
        let bmr = sex === "male"
            ? (10 * weight) + (6.25 * height) - (5 * age) + 5
            : (10 * weight) + (6.25 * height) - (5 * age) - 161;
        
        // 2 Total Daily Energy Expenditure
        let tdee = bmr * activity;
        
        // 3 Adjust for goal
        caloriesTarget = goal === "lose" ? tdee - 500
            : goal === "gain" ? tdee + 300
            : tdee;
        
        // 4 Protein target
        let proteinPerKg = goal === "gain" ? 2.0
            : goal === "lose" ? 1.8
            : 1.6;

        proteinTarget = weight * proteinPerKg;
        
        // 5 Update UI
        document.getElementById("caloriesResult").innerText = Math.round(caloriesTarget);
        document.getElementById("proteinResult").innerText = Math.round(proteinTarget);
        document.getElementById("nutritionResult").style.display = "block";
    }

    // Skip confirmation & persistence when account is not activated
    if (sessionStorage.getItem("status") !== "activated") {
        calculateUserInput();
        return;
    }

    if (!sessionStorage.getItem("first_name")) return;

    const confirm = await modalConfirm("Confirm to save your nutrition calculation for your profile.");
    if (!confirm) return;

    calculateUserInput();

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