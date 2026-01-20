import { db } from "../../utils/firebase.js";
import { collection, addDoc, serverTimestamp, query, orderBy, where, doc, getDoc, setDoc, deleteDoc, Timestamp, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// FORM ELEMENTS (READ ONLY – allowed)
const progressForm = document.querySelector(".progress-form");

// SESSION STORAGE KEYS
const WORKOUTS_CACHE_KEY = "workouts";
const WORKOUTS_UPDATED_KEY = "workouts_updated";
const AI_CACHE_KEY = "ai_output";
const AI_UPDATED_KEY = "ai_updated";

// INITIAL LOAD
loadWorkoutHistory();
getAIOutputFromFirestore();

// ------------------------------
// HANDLE FORM SUBMISSION
// ------------------------------
progressForm.addEventListener("submit", async (e) => {
    e.preventDefault();

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

        // Clear AI cache so next analysis regenerates
        sessionStorage.removeItem(AI_CACHE_KEY);
        sessionStorage.setItem(AI_UPDATED_KEY, Date.now());

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
        modalMsg("AI Coaching is currently unavailable. You will be able to analyze your progress once your account is activated.");
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

    sessionStorage.setItem("loading_box", "show");

    try {
        const cachedWorkouts = JSON.parse(
            sessionStorage.getItem(WORKOUTS_CACHE_KEY)
        ) || [];

        if (!cachedWorkouts.length) {
            sessionStorage.setItem(AI_CACHE_KEY, "Log some workouts first to receive AI coaching!");
            sessionStorage.setItem(AI_UPDATED_KEY, Date.now());
            return;
        }

        const aiDocRef = doc(db, "aioutput", memberId);
        const snapshot = await getDoc(aiDocRef);

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // 1️⃣ LOAD FROM FIRESTORE CACHE IF RECENT
        if (snapshot.exists()) {
            const data = snapshot.data();
            const lastTimestamp = data.timestamp?.toDate?.();

            if (lastTimestamp && lastTimestamp >= oneHourAgo) {
                sessionStorage.setItem(AI_CACHE_KEY, data.output);
                sessionStorage.setItem(AI_UPDATED_KEY, Date.now());

                modalMsg("You can refresh the analysis only once every hour.");
                console.log("AI output loaded from Firestore (cached).");
                return;
            }

            await deleteDoc(aiDocRef);
        }

        // 2️⃣ GENERATE NEW AI OUTPUT
        const aiInput = cachedWorkouts
            .map(w => `${w.date}: ${w.exercise_name} - ${w.exercise_mode} | ${w.workout_goal} - ${w.sets}×${w.reps} @ ${w.weight}kg`)
            .join("\n");

        const aiOutputText = await generateAIOutput(aiInput);

        await setDoc(aiDocRef, {
            output: aiOutputText,
            timestamp: serverTimestamp(),
        });

        sessionStorage.setItem(AI_CACHE_KEY, aiOutputText);
        sessionStorage.setItem(AI_UPDATED_KEY, Date.now());

        console.log("AI output generated and cached.");

    } catch (err) {
        console.error("Error generating AI output:", err);
        sessionStorage.setItem(AI_CACHE_KEY, "Failed to load AI coaching. Please try again later.");
        sessionStorage.setItem(AI_UPDATED_KEY, Date.now());
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}

// ------------------------------
// GENERATE AI OUTPUT
// ------------------------------
async function generateAIOutput(aiInput) {
    const apiKey = "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";
    const model = "llama-3.3-70b-versatile";
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const body = {
        model: model,
        messages: [
            {
                role: "system",
                content: `
                    You are a certified strength and conditioning coach. I will give you a workout log. 
                    Give coaching feedback in plain, friendly sentences, like you are talking directly to me. 
                    Do not use bullets, numbers, symbols, or markdown. Do not ask questions. Only give advice.

                    Before giving any analysis, mentally verify that you clearly recognize and understand 
                    each exercise name in the log. If an exercise name is unfamiliar, briefly acknowledge that 
                    it is not clearly identified and do not analyze it or give advice for it. Continue coaching 
                    only on the exercises you clearly understand.

                    Give feedback based on research-backed evidence and current training science. 
                    Adjust sets, reps, weight, and rest dynamically according to the exercise type, intensity, 
                    and goal. Encourage progressive overload in safe, small steps. Point out technique issues 
                    or muscle imbalances only when the exercise is clearly understood. Suggest exercise 
                    variations or progressions only for recognized movements. For bodyweight exercises, 
                    suggest progression by reps, sets, tempo, or difficulty. Emphasize warm-up, cool-down, 
                    rest, and recovery according to evidence. Encourage consistency and tracking progress. 
                    Use digits for sets, reps, weight, and rest. If the latest studies are not available, 
                    base guidance on the strongest current evidence in training science.

                    Here is the workout log:
                    ${aiInput}
                `
            }
        ],
        max_tokens: 1024,
        temperature: 0.7
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No AI response.";
}

// ------------------------------
// INITIAL LOAD AI OUTPUT
// ------------------------------
async function getAIOutputFromFirestore() {
    if (
        sessionStorage.getItem("status") !== "activated" &&
        sessionStorage.getItem("subscription_status") !== "active"
    ) return;

    const sessionAI = sessionStorage.getItem(AI_CACHE_KEY);
    if (sessionAI) {
        sessionStorage.setItem(AI_UPDATED_KEY, Date.now());
        console.log("AI output loaded from session cache.");
        return;
    }

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    const aiDocRef = doc(db, "aioutput", memberId);
    const snapshot = await getDoc(aiDocRef);

    if (snapshot.exists()) {
        const data = snapshot.data();
        sessionStorage.setItem(AI_CACHE_KEY, data.output);
        sessionStorage.setItem(AI_UPDATED_KEY, Date.now());
        console.log("AI output loaded from firestore cache.");
    }

}

