import { db } from "../../utils/firebase.js";
import { doc, setDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// INITIAL LOAD
loadNutritionData();

// CALCULATE + SAVE
document.getElementById("calculateBtn").addEventListener("click", async () => {

    // Holds the latest calculated values for optional saving
    let caloriesTarget, proteinTarget, age, bodyHeightCm, bodyWeightKg, activity, sex, goal;

    function calculateUserInput() {
        sex = document.getElementById("sex").value;
        age = parseFloat(document.getElementById("age").value);
        bodyHeightCm = parseFloat(document.getElementById("bodyHeightCm").value);
        bodyWeightKg = parseFloat(document.getElementById("bodyWeightKg").value);
        activity = parseFloat(document.getElementById("activity").value);
        goal = document.getElementById("goal").value;
        
        if (!sex || !age || !bodyHeightCm || !bodyWeightKg || !activity || !goal) {
            modalMsg("Please fill in all fields.");
            return false;
        }
        
        // 1 Calculate BMR
        let bmr = sex === "male"
            ? (10 * bodyWeightKg) + (6.25 * bodyHeightCm) - (5 * age) + 5
            : (10 * bodyWeightKg) + (6.25 * bodyHeightCm) - (5 * age) - 161;
        
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

        proteinTarget = bodyWeightKg * proteinPerKg;
        
        // 5 Update UI
        document.getElementById("caloriesResult").innerText = Math.round(caloriesTarget);
        document.getElementById("proteinResult").innerText = Math.round(proteinTarget);
        document.getElementById("nutritionResult").style.display = "block";

        return true;
    }

    // Skip confirmation & persistence when account is not activated
    if (sessionStorage.getItem("status") !== "activated") {
        calculateUserInput();
        return;
    }

    if (!sessionStorage.getItem("first_name")) return;

    const confirm = await modalConfirm("Confirm to save your nutrition calculation for your profile.");
    if (!confirm) return;

    const isValid = calculateUserInput();
    if (!isValid) return;

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
            body_height_cm: bodyHeightCm,
            body_weight_kg: bodyWeightKg,
            activity: activity,
            sex: sex,
            timestamp: serverTimestamp()
        });

        // ------------------------------
        // UPDATE SESSION STORAGE CACHE
        // ------------------------------
        sessionStorage.setItem("activity", activity);
        sessionStorage.setItem("age", age);
        sessionStorage.setItem("body_weight_kg", bodyWeightKg);
        sessionStorage.setItem("body_height_cm", bodyHeightCm);
        sessionStorage.setItem("sex", sex);
        sessionStorage.setItem("calories_target", Math.round(caloriesTarget));
        sessionStorage.setItem("protein_target", Math.round(proteinTarget));
        sessionStorage.setItem("nutrition_goal", goal);
        sessionStorage.setItem("nutrition_last_update", new Date().toISOString());

        sessionStorage.setItem("needs_update", "yes");
        modalMsg("Nutrition data saved successfully!");
    } catch (err) {
        console.error("Error saving nutrition data:", err);
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});

// ------------------------------
// LOAD NUTRITION DATA
// ------------------------------
async function loadNutritionData() {
    if (sessionStorage.getItem("status") !== "activated") return;

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    // Check sessionStorage cache first
    if (sessionStorage.getItem("calories_target")) {
        console.log("Nutrition data loaded via session");
        return;
    }

    sessionStorage.setItem("loading_box", "show");

    try {
        // --- Firestore reference for nutritions ---
        const nutritionRef = doc(db, "nutritions", memberId);

        // --- Get existing nutrition document ---
        const nutritionSnap = await getDoc(nutritionRef);
        const nutritionData = nutritionSnap.exists() ? nutritionSnap.data() : {};

        // Store in sessionStorage
        sessionStorage.setItem("activity", nutritionData.activity || "");
        sessionStorage.setItem("age", nutritionData.age || "");
        sessionStorage.setItem("body_weight_kg", nutritionData.body_weight_kg || "");
        sessionStorage.setItem("body_height_cm", nutritionData.body_height_cm || "");
        sessionStorage.setItem("sex", nutritionData.sex || "");
        sessionStorage.setItem("calories_target", nutritionData.calories_target || "");
        sessionStorage.setItem("protein_target", nutritionData.protein_target || "");
        sessionStorage.setItem("nutrition_goal", nutritionData.nutrition_goal || "");
        sessionStorage.setItem("nutrition_last_update", nutritionData.timestamp?.toDate ? nutritionData.timestamp.toDate().toISOString() : "");

        console.log("Nutrition data loaded via Firestore");
    } catch (err) {
        console.error("Error loading nutrition data:", err);
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}