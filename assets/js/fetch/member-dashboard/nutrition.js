import { db } from "../../utils/firebase.js";
import { doc, setDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const aiScriptURL = "https://script.google.com/macros/s/AKfycby1-dIfjcyUeIEJKsWgjbqpv3k7gVKS48z53ZQroj488Q65RTaruTymG62odWMTD--S/exec";

// AI SESSION CACHE KEYS
const NUTRITION_AI_CACHE_KEY = "ai_nutrition_output";
const NUTRITION_AI_UPDATED_KEY = "ai_nutrition_updated";

// INITIAL LOAD
loadNutritionData();
getAIOutputFromFirestore();

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
        
        // 5 Update UI (Temporarily)
        document.getElementById("caloriesResult").innerText = Math.round(caloriesTarget);
        document.getElementById("proteinResult").innerText = Math.round(proteinTarget);
        document.getElementById("nutritionCalculationNote").style.display = "block";

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

// ------------------------------
// AI OUTPUT / GROQ INTEGRATION
// ------------------------------
window.loadAIOutput = loadAIOutput;

async function loadAIOutput() {
    if (sessionStorage.getItem("status") !== "activated") {
        modalMsg("AI Coaching is currently unavailable. You will be able to analyze your nutrition once your account is activated and your membership is active.");
        return;
    }

    if (sessionStorage.getItem("subscription_status") !== "active") {
        modalMsg("It looks like you’re not a member yet. Subscribe now to unlock personalized nutrition.");
        return;
    }

    const confirm = await modalConfirm("Are you sure you want to analyze your current nutrition data?");
    if (!confirm) return;

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    sessionStorage.setItem("loading_box", "show");

    try {
        const aiDocRef = doc(db, "aioutput", memberId);
        const snapshot = await getDoc(aiDocRef);

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // 1️⃣ LOAD FROM FIRESTORE CACHE IF RECENT
        if (snapshot.exists()) {
            const data = snapshot.data();
            const lastTimestamp = data.nutrition_timestamp?.toDate?.();

            if (lastTimestamp && lastTimestamp >= oneHourAgo) {
                sessionStorage.setItem(NUTRITION_AI_CACHE_KEY, data.nutrition_output);
                sessionStorage.setItem(NUTRITION_AI_UPDATED_KEY, Date.now());

                modalMsg("You can refresh the nutrition analysis only once every hour.");
                console.log("AI nutrition loaded from Firestore (cached).");
                return;
            }
        }

        // 2️⃣ BUILD NUTRITION AI INPUT (SESSION-BASED)
        const aiInput = `
        Profile:
        age=${sessionStorage.getItem("age")},
        sex=${sessionStorage.getItem("sex")},
        height=${sessionStorage.getItem("body_height_cm")}cm,
        bodyweight=${sessionStorage.getItem("body_weight_kg")}kg

        Activity factor=${sessionStorage.getItem("activity")}
        Goal=${sessionStorage.getItem("nutrition_goal")}

        Targets:
        Calories=${sessionStorage.getItem("calories_target")} kcal/day
        Protein=${sessionStorage.getItem("protein_target")} g/day
        `;

        const aiOutputText = await generateAIOutput(aiInput);

        await setDoc(aiDocRef, {
            nutrition_output: aiOutputText,
            nutrition_timestamp: serverTimestamp()
        }, { merge: true });

        sessionStorage.setItem(NUTRITION_AI_CACHE_KEY, aiOutputText);
        sessionStorage.setItem(NUTRITION_AI_UPDATED_KEY, Date.now());

        console.log("AI nutrition output generated and cached.");

    } catch (err) {
        console.error("Error generating AI nutrition output:", err);
        sessionStorage.setItem(NUTRITION_AI_CACHE_KEY, "Failed to load nutrition coaching. Please try again later.");
        sessionStorage.setItem(NUTRITION_AI_UPDATED_KEY, Date.now());
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}

// ------------------------------
// GENERATE AI OUTPUT
// ------------------------------
async function generateAIOutput(aiInput) {
    const aiEndpoint = `${aiScriptURL}?action=nutrition&ai_input=${encodeURIComponent(aiInput)}`;

    try {
        const res = await fetch(aiEndpoint);
        const data = await res.json();

        switch (data.result) {

            case "success": {
                const aiOutput = data.aiOutput || "No AI response";
                return aiOutput; // ✅ IMPORTANT
            }

            case "fail":
                console.error("AI Error:", data.reason);
                return null;

            default:
                console.warn("Unknown AI result:", data.result);
                return null;
        }

    } catch (err) {
        console.error("AI Fetch Error:", err);
        return null;
    }
}

// ------------------------------
// INITIAL LOAD AI OUTPUT
// ------------------------------
async function getAIOutputFromFirestore() {
    if (
        sessionStorage.getItem("status") !== "activated" &&
        sessionStorage.getItem("subscription_status") !== "active"
    ) return;

    const sessionAI = sessionStorage.getItem(NUTRITION_AI_CACHE_KEY);
    if (sessionAI) {
        sessionStorage.setItem(NUTRITION_AI_UPDATED_KEY, Date.now());
        console.log("AI output loaded from session");
        return;
    }

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    const aiDocRef = doc(db, "aioutput", memberId);
    const snapshot = await getDoc(aiDocRef);

    if (snapshot.exists()) {
        const data = snapshot.data();
        sessionStorage.setItem(NUTRITION_AI_CACHE_KEY, data.nutrition_output);
        sessionStorage.setItem(NUTRITION_AI_UPDATED_KEY, Date.now());
        console.log("AI output loaded from firestore");
    }
}