import { db } from "../../utils/firebase.js";
import { collection, addDoc, serverTimestamp, query, orderBy, where, doc, getDoc, setDoc, deleteDoc, Timestamp, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// FORM ELEMENTS
const progressForm = document.querySelector(".progress-form");
const progressHistory = document.getElementById("progressHistory");
const aiCoaching = document.getElementById("aiCoaching");

// SESSION STORAGE KEYS
const WORKOUTS_CACHE_KEY = "workouts";
const AI_CACHE_KEY = "ai_output";

// EMPTY STATE TEMPLATE
const emptyHistoryHTML = `
    <h4>Recent Workouts</h4>
    <div class="history-card">
        <div>
            <p><strong>No workouts recorded</strong></p>
            <small>Start logging your workouts to see them here.</small>
        </div>
    </div>
`;

// INITIAL LOAD
loadWorkoutHistory();
getAIOutputFromFirestore();


// HANDLE FORM SUBMISSION
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

        // Update sessionStorage cache
        const cachedWorkouts = JSON.parse(sessionStorage.getItem(WORKOUTS_CACHE_KEY)) || [];
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

        renderWorkoutHistory(cachedWorkouts);

        // Optional: clear AI cache so next analysis regenerates
        sessionStorage.removeItem(AI_CACHE_KEY);

    } catch (err) {
        console.error("Error saving workout:", err);
        modalMsg("Failed to save workout. Please try again.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});

// LOAD WORKOUT HISTORY
async function loadWorkoutHistory() {
    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    // Check sessionStorage cache first
    const cachedWorkouts = sessionStorage.getItem(WORKOUTS_CACHE_KEY);
    if (cachedWorkouts) {
        renderWorkoutHistory(JSON.parse(cachedWorkouts));
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
        renderWorkoutHistory(workouts);

        console.log("History loaded via firestore (last 3 days)");
    } catch (err) {
        console.error("Error loading workout history:", err);
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}

// RENDER WORKOUT HISTORY TO UI
function renderWorkoutHistory(workouts) {
    if (!workouts || workouts.length === 0) {
        progressHistory.innerHTML = emptyHistoryHTML;
        return;
    }

    progressHistory.innerHTML = "<h4>Recent Workouts</h4>";

    workouts.forEach(data => {
        const card = document.createElement("div");
        card.className = "history-card";
        card.dataset.id = data.docId;

        card.innerHTML = `
            <div>
                <p><strong>${data.exercise_name}</strong></p>
                <small>${data.exercise_mode} | ${data.workout_goal} | ${data.sets} sets × ${data.reps} reps @ ${data.weight}kg</small>
            </div>
            <span class="history-date">
                ${new Date(data.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            <button class="delete-btn">X</button>
        `;

        card.querySelector(".delete-btn").addEventListener("click", async () => {
            const confirm = await modalConfirm("Are you sure you want to delete this workout?");
            if (!confirm) return;
            deleteWorkout(data.docId);
        });

        progressHistory.appendChild(card);
    });
}

// DELETE WORKOUT FUNCTION
async function deleteWorkout(docId) {
    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    const workoutRef = doc(db, "progresses", memberId, "workout_history", docId);
    sessionStorage.setItem("loading_box", "show");

    try {
        await deleteDoc(workoutRef);
        modalMsg("Workout deleted successfully!");

        let cachedWorkouts = JSON.parse(sessionStorage.getItem(WORKOUTS_CACHE_KEY)) || [];
        cachedWorkouts = cachedWorkouts.filter(w => w.docId !== docId);
        sessionStorage.setItem(WORKOUTS_CACHE_KEY, JSON.stringify(cachedWorkouts));

        renderWorkoutHistory(cachedWorkouts);

    } catch (err) {
        console.error("Error deleting workout:", err);
        modalMsg("Failed to delete workout. Please try again.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
}

// ------------------------------
// AI OUTPUT / GROQ INTEGRATION
// ------------------------------
// Triggered by button
window.loadAIOutput = loadAIOutput;

async function loadAIOutput() {
    if (sessionStorage.getItem("status") !== "activated") {
        modalMsg("Your information is under review. AI Coaching will be available after approval.");
        return;
    }

    if (sessionStorage.getItem("subscription_status") !== "active") {
        modalMsg("It looks like you’re not a member yet. Subscribe now to activate AI COaching!");
        return;
    }

    const confirm = await modalConfirm("Are you sure you want to analyze your current workout?");
    if (!confirm) return;
    
    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    sessionStorage.setItem("loading_box", "show");

    try {
        const cachedWorkouts = JSON.parse(sessionStorage.getItem(WORKOUTS_CACHE_KEY)) || [];
        if (!cachedWorkouts.length) {
            displayAIOutput("Log some workouts first to receive AI coaching!");
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
                displayAIOutput(data.output);
                sessionStorage.setItem(AI_CACHE_KEY, data.output); // cache in session

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

        sessionStorage.setItem(AI_CACHE_KEY, aiOutputText); // update session cache
        displayAIOutput(aiOutputText);
        console.log("AI output generated and cached.");

    } catch (err) {
        console.error("Error generating AI output:", err);
        displayAIOutput("Failed to load AI coaching. Please try again later.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }

    // ------------------------------
    // NESTED FUNCTION: GENERATE AI OUTPUT
    // ------------------------------
    async function generateAIOutput(aiInput) {
        const apiKey = "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"; // Replace with your Groq API key
        const model = "llama-3.3-70b-versatile"; // A fast model available on free tier:contentReference[oaicite:2]{index=2}
        const url = "https://api.groq.com/openai/v1/chat/completions";
        
        const body = {
            model: model,
            messages: [
                {
                    role: "system",
                    content: `
                        You are a certified strength and conditioning coach. 
                        Analyze the workout log below using evidence-based training principles. 
                        Give coaching advice to user as a natural chat message in plain sentences.

                        Rules: Use plain sentences only. 
                        No bullets, numbers, symbols, or markdown. 
                        Use digits for reps, sets, weight, rest, and ranges. 
                        Chat like you are talking one-on-one. 
                        Be supportive, realistic, and clear.
                        No question, just answer only.
                        
                        Coaching focus: 
                        Refer to sets, reps, and weight when relevant. 
                        Suggest increasing or decreasing volume only if justified. 
                        Mention common ranges like 6 to 12 reps for hypertrophy and 3 to 6 reps for strength. 
                        Encourage progressive overload in small steps. 
                        Point out technique mistakes or muscle imbalances. 
                        For bodyweight exercises, suggest progression with reps, sets, tempo, or difficulty. 
                        Suggest exercise variations to target muscles better if needed. 
                        Emphasize rest and recovery if volume or intensity is high. 
                        Encourage explosive and strength work with proper sets, reps, and rest. 
                        Advise proper warm-up and cool-down if relevant. 
                        Focus on good form over heavier weight. 
                        Encourage consistency and tracking progress over time.
                        
                        User workout log:
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
        
        // Groq returns the assistant reply in choices[0].message.content
        return data.choices?.[0]?.message?.content || "No AI response.";
    }
}

// DISPLAY AI OUTPUT
function displayAIOutput(output) {
    const smallEl = aiCoaching.querySelector("small");
    if (smallEl) smallEl.textContent = output;
}

// INITIAL LOAD AI OUTPUT AT FIRESTORE
async function getAIOutputFromFirestore() {
    if (sessionStorage.getItem("status") !== "activated" && sessionStorage.getItem("subscription_status") !== "active") return;

    const sessionAI = sessionStorage.getItem(AI_CACHE_KEY);

    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    const aiDocRef = doc(db, "aioutput", memberId);
    const snapshot = await getDoc(aiDocRef);

    if (snapshot.exists() && !sessionAI) {
        const data = snapshot.data();
        sessionStorage.setItem(AI_CACHE_KEY, data.output); // cache in session
        displayAIOutput(data.output);

        console.log("AI output loaded from firestore cache.");
    } else {
        displayAIOutput(sessionStorage.getItem(AI_CACHE_KEY));

        console.log("AI output loaded from session cache.");
    }
}