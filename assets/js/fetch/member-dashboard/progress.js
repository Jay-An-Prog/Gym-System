import { db } from "../../utils/firebase.js";
import { collection, addDoc, serverTimestamp, query, orderBy, where, doc, getDoc, setDoc, deleteDoc, Timestamp, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const aiScriptURL = "https://script.google.com/macros/s/AKfycby1-dIfjcyUeIEJKsWgjbqpv3k7gVKS48z53ZQroj488Q65RTaruTymG62odWMTD--S/exec";

// FORM ELEMENTS (READ ONLY – allowed)
const progressForm = document.querySelector(".progress-form");

// SESSION STORAGE KEYS
const WORKOUTS_CACHE_KEY = "workouts";
const WORKOUTS_UPDATED_KEY = "workouts_updated";
const WORKOUT_AI_CACHE_KEY = "ai_output";
const WORKOUT_AI_UPDATED_KEY = "ai_updated";
const year = new Date().getFullYear();
const ATTENDANCE_CACHE_KEY = `ATTENDANCE_${year}`;
const ATTENDANCE_UPDATED_KEY = `ATTENDANCE_${year}_UPDATED`;

// INITIAL LOAD
loadWorkoutHistory();
getAIOutputFromFirestore();
setTimeout(loadAttendance, 700); // Delay to let the function in realtime.js get the data from firestore

// ------------------------------
// HANDLE FORM SUBMISSION
// ------------------------------
document.getElementById("saveBtn").addEventListener("click", async () => {

    if (sessionStorage.getItem("status") !== "activated") {
        modalMsg("Your account must be activated to save workouts.");
        return;
    }

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    // COLLECT FORM DATA
    const exercise_name = document.getElementById("exerciseName").value.trim();
    const exercise_mode = document.getElementById("exerciseMode").value;
    const workout_goal = document.getElementById("workoutGoal").value;
    const sets = parseInt(document.getElementById("sets").value, 10);
    const reps = parseInt(document.getElementById("reps").value, 10);
    const weight = parseFloat(document.getElementById("weight").value) || 0;
    const date = document.getElementById("workoutDate").value;

    if (!exercise_name || !exercise_mode || !workout_goal || !sets || !reps || !date) {
        modalMsg("Please fill in all required fields.");
        return;
    }

    const confirm = await modalConfirm("Confirm to save this workout?");
    if (!confirm) return;

    sessionStorage.setItem("loading_box", "show");

    try {
        // Save to Firestore with random document ID
        const historyRef = collection(db, "progresses", memberId, "workout_history");
        const docRef = await addDoc(historyRef, {
            exercise_name,
            exercise_mode,
            workout_goal,
            sets,
            reps,
            weight,
            date,
            timestamp: serverTimestamp()
        });

        modalMsg("Workout saved successfully!");
        progressForm.reset();

        // Update sessionStorage cache (UI will react)
        const cachedWorkouts = JSON.parse(
            sessionStorage.getItem(WORKOUTS_CACHE_KEY)
        ) || [];

        cachedWorkouts.unshift({
            docId: docRef.id,
            exercise_name,
            exercise_mode,
            workout_goal,
            sets,
            reps,
            weight,
            date
        });

        sessionStorage.setItem(WORKOUTS_CACHE_KEY, JSON.stringify(cachedWorkouts));
        sessionStorage.setItem(WORKOUTS_UPDATED_KEY, Date.now());

        sessionStorage.setItem(WORKOUT_AI_UPDATED_KEY, Date.now());

    } catch (err) {
        console.error("Error saving workout:", err);
        modalMsg("Failed to save workout. Please try again.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});

// ------------------------------
// LOAD WORKOUT HISTORY
// ------------------------------
async function loadWorkoutHistory() {
    if (sessionStorage.getItem("status") !== "activated") return;

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    // Check sessionStorage cache first
    const cachedWorkouts = sessionStorage.getItem(WORKOUTS_CACHE_KEY);
    if (cachedWorkouts) {
        sessionStorage.setItem(WORKOUTS_UPDATED_KEY, Date.now());
        console.log("History loaded via session");
        return;
    }

    sessionStorage.setItem("loading_box", "show");

    try {
        const historyRef = collection(db, "progresses", memberId, "workout_history");

        // GET DATE 3 DAYS AGO
        const threeDaysAgo = Timestamp.fromDate(
            new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        );

        // QUERY LAST 3 DAYS ONLY
        const q = query(
            historyRef,
            where("timestamp", ">=", threeDaysAgo),
            orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        const workouts = snapshot.docs.map(d => ({
            docId: d.id,
            ...d.data()
        }));

        sessionStorage.setItem(WORKOUTS_CACHE_KEY, JSON.stringify(workouts));
        sessionStorage.setItem(WORKOUTS_UPDATED_KEY, Date.now());

        console.log("History loaded via firestore (last 3 days)");
    } catch (err) {
        console.error("Error loading workout history:", err);
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}

// ------------------------------
// DELETE WORKOUT
// ------------------------------
async function deleteWorkout(docId) {
    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    const confirm = await modalConfirm("Are you sure you want to delete this workout?");
    if (!confirm) return;

    const workoutRef = doc(db, "progresses", memberId, "workout_history", docId);
    sessionStorage.setItem("loading_box", "show");

    try {
        await deleteDoc(workoutRef);
        modalMsg("Workout deleted successfully!");

        let cachedWorkouts = JSON.parse(
            sessionStorage.getItem(WORKOUTS_CACHE_KEY)
        ) || [];

        cachedWorkouts = cachedWorkouts.filter(w => w.docId !== docId);

        sessionStorage.setItem(WORKOUTS_CACHE_KEY, JSON.stringify(cachedWorkouts));
        sessionStorage.setItem(WORKOUTS_UPDATED_KEY, Date.now());

    } catch (err) {
        console.error("Error deleting workout:", err);
        modalMsg("Failed to delete workout. Please try again.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}

// Expose delete function for UI buttons (logic-only bridge)
window.deleteWorkout = deleteWorkout;

// ------------------------------
// AI OUTPUT / GROQ INTEGRATION
// ------------------------------
window.loadAIOutput = loadAIOutput;

async function loadAIOutput() {
    if (sessionStorage.getItem("status") !== "activated") {
        modalMsg("AI Coaching is currently unavailable. You will be able to analyze your progress once your account is activated and your membership is active.");
        return;
    }

    if (sessionStorage.getItem("subscription_status") !== "active") {
        modalMsg("It looks like you’re not a member yet. Subscribe now to activate AI Coaching!");
        return;
    }

    const confirm = await modalConfirm("Are you sure you want to analyze your current workout?");
    if (!confirm) return;

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    // COLLECT FROM SESSION NUTRITION
    const age = sessionStorage.getItem("age");
    const sex = sessionStorage.getItem("sex");
    const body_weight_kg = sessionStorage.getItem("body_weight_kg");

    if (!age || !sex || !body_weight_kg) {
        modalMsg("Please fill in all required fields on nutritional tracker.");
        return;
    }

    sessionStorage.setItem("loading_box", "show");

    try {
        const cachedWorkouts = JSON.parse(
            sessionStorage.getItem(WORKOUTS_CACHE_KEY)
        ) || [];

        if (!cachedWorkouts.length) {
            sessionStorage.setItem(WORKOUT_AI_CACHE_KEY, "Log some workouts first to receive AI coaching!");
            sessionStorage.setItem(WORKOUT_AI_UPDATED_KEY, Date.now());
            return;
        }

        const aiDocRef = doc(db, "aioutput", memberId);
        const snapshot = await getDoc(aiDocRef);

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // 1️⃣ LOAD FROM FIRESTORE CACHE IF RECENT
        if (snapshot.exists()) {
            const data = snapshot.data();
            const lastTimestamp = data.progress_timestamp?.toDate?.();

            if (lastTimestamp && lastTimestamp >= oneHourAgo) {
                sessionStorage.setItem(WORKOUT_AI_CACHE_KEY, data.progress_output);
                sessionStorage.setItem(WORKOUT_AI_UPDATED_KEY, Date.now());

                modalMsg("You can refresh the analysis only once every hour.");
                console.log("AI output loaded from Firestore (cached).");
                return;
            }
        }

        // 2️⃣ GENERATE NEW AI OUTPUT
        const aiInput = `
        Profile: age=${age}, sex=${sex}, bodyweight=${body_weight_kg}kg
        
        Log schema: date|exercise|mode|goal|setsxreps|kg

        ${cachedWorkouts
          .map(w => `${w.date}|${w.exercise_name}|${w.exercise_mode}|${w.workout_goal}|${w.sets}x${w.reps}|${w.weight}`)
          .join("\n")}
        `;     

        const aiOutputText = await generateAIOutput(aiInput);

        await setDoc(aiDocRef, {
            progress_output: aiOutputText,
            progress_timestamp: serverTimestamp(),
        }, { merge: true });

        sessionStorage.setItem(WORKOUT_AI_CACHE_KEY, aiOutputText);
        sessionStorage.setItem(WORKOUT_AI_UPDATED_KEY, Date.now());

        console.log("AI output generated and cached.");

    } catch (err) {
        console.error("Error generating AI output:", err);
        sessionStorage.setItem(WORKOUT_AI_CACHE_KEY, "Failed to load AI coaching. Please try again later.");
        sessionStorage.setItem(WORKOUT_AI_UPDATED_KEY, Date.now());
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}

// ------------------------------
// GENERATE AI OUTPUT
// ------------------------------
async function generateAIOutput(aiInput) {
    const aiEndpoint = `${aiScriptURL}?action=progress&ai_input=${encodeURIComponent(aiInput)}`;

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

    const sessionAI = sessionStorage.getItem(WORKOUT_AI_CACHE_KEY);
    if (sessionAI) {
        sessionStorage.setItem(WORKOUT_AI_UPDATED_KEY, Date.now());
        console.log("AI output loaded from session");
        return;
    }

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    const aiDocRef = doc(db, "aioutput", memberId);
    const snapshot = await getDoc(aiDocRef);

    if (snapshot.exists()) {
        const data = snapshot.data();
        sessionStorage.setItem(WORKOUT_AI_CACHE_KEY, data.progress_output);
        sessionStorage.setItem(WORKOUT_AI_UPDATED_KEY, Date.now());
        console.log("AI output loaded from firestore");
    }
}


// ------------------------------
// LOAD ATTENDANCE SUMMARY
// ------------------------------
async function loadAttendance() {
    if (sessionStorage.getItem("status") !== "activated") return;

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    // Check sessionStorage cache first
    const cachedAttendance = sessionStorage.getItem(ATTENDANCE_CACHE_KEY);
    if (cachedAttendance) {
        sessionStorage.setItem(ATTENDANCE_UPDATED_KEY, Date.now());
        console.log("Attendance loaded via session");
        return;
    }

    sessionStorage.setItem("loading_box", "show");

    try {
        const monthsRef = collection(
            db,
            "progresses",
            memberId,
            "attendance",
            String(year),
            "months"
        );

        const snapshot = await getDocs(monthsRef);

        const attendance = {};

        snapshot.forEach(doc => {
            attendance[doc.id] = doc.data();
        });

        sessionStorage.setItem(ATTENDANCE_CACHE_KEY, JSON.stringify(attendance));
        sessionStorage.setItem(ATTENDANCE_UPDATED_KEY, Date.now());

        console.log("Attendance loaded via firestore");
    } catch (err) {
        console.error("Error loading attendance:", err);
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}