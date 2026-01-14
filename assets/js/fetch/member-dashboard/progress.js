import { db } from "../../utils/firebase.js";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// FORM ELEMENTS
const progressForm = document.querySelector(".progress-form");
const progressHistory = document.getElementById("progressHistory");

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
    const sets = parseInt(document.getElementById("sets").value);
    const reps = parseInt(document.getElementById("reps").value);
    const weight = parseFloat(document.getElementById("weight").value) || 0;
    const date = document.getElementById("workoutDate").value;

    if (!exercise_name || !sets || !reps || !date) {
        modalMsg("Please fill in all required fields.");
        return;
    }

    const confirmSave = await modalConfirm("Confirm to save this workout?");
    if (!confirmSave) return;

    try {
        // Save to Firestore with random document ID
        const historyRef = collection(db, "progresses", memberId, "workout_history");
        const docRef = await addDoc(historyRef, {
            exercise_name,
            sets,
            reps,
            weight,
            date,
            timestamp: serverTimestamp()
        });

        modalMsg("Workout saved successfully!");
        progressForm.reset();

        // Update sessionStorage cache, include docId for deletion
        let cachedWorkouts = JSON.parse(sessionStorage.getItem("workouts")) || [];
        cachedWorkouts.unshift({
            docId: docRef.id,  // store Firestore doc ID
            exercise_name,
            sets,
            reps,
            weight,
            date
        });
        sessionStorage.setItem("workouts", JSON.stringify(cachedWorkouts));

        renderWorkoutHistory(cachedWorkouts); // refresh history
    } catch (err) {
        console.error("Error saving workout:", err);
        modalMsg("Failed to save workout. Please try again.");
    }
});

// LOAD WORKOUT HISTORY
async function loadWorkoutHistory() {
    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    // Check sessionStorage cache first
    const cached = sessionStorage.getItem("workouts");
    if (cached) {
        renderWorkoutHistory(JSON.parse(cached));
        console.log("History loaded via session");
        return;
    }

    try {
        const historyRef = collection(db, "progresses", memberId, "workout_history");
        const q = query(historyRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        // Map data and include docId
        const workouts = snapshot.docs.map(doc => ({
            docId: doc.id,
            ...doc.data()
        }));

        // Save to sessionStorage
        sessionStorage.setItem("workouts", JSON.stringify(workouts));

        renderWorkoutHistory(workouts);
        console.log("History loaded via firestore");
    } catch (err) {
        console.error("Error loading workout history:", err);
    }
}

// RENDER WORKOUT HISTORY TO UI
function renderWorkoutHistory(workouts) {
    // SHOW EMPTY STATE
    if (!workouts || workouts.length === 0) {
        progressHistory.innerHTML = emptyHistoryHTML;
        return;
    }

    // SHOW WORKOUT CARDS
    progressHistory.innerHTML = '<h4>Recent Workouts</h4>'; // reset

    workouts.forEach(data => {
        const card = document.createElement("div");
        card.className = "history-card";
        card.dataset.id = data.docId; // attach Firestore doc ID

        card.innerHTML = `
            <div>
                <p><strong>${data.exercise_name}</strong></p>
                <small>${data.sets} sets × ${data.reps} reps @ ${data.weight}kg</small>
            </div>
            <span class="history-date">
                ${new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <button class="delete-btn">X</button>
        `;

        progressHistory.appendChild(card);

        // DELETE WORKOUT EVENT
        card.querySelector(".delete-btn").addEventListener("click", async () => {
            const confirmDelete = await modalConfirm("Are you sure you want to delete this workout?");
            if (!confirmDelete) return;
            deleteWorkout(data.docId);
        });
    });
}

// DELETE WORKOUT FUNCTION
async function deleteWorkout(docId) {
    const memberId = sessionStorage.getItem("member_id");
    if (!memberId) return;

    const workoutRef = doc(db, "progresses", memberId, "workout_history", docId);

    try {
        await deleteDoc(workoutRef);
        modalMsg("Workout deleted successfully!");

        // Update sessionStorage cache
        let cachedWorkouts = JSON.parse(sessionStorage.getItem("workouts")) || [];
        cachedWorkouts = cachedWorkouts.filter(w => w.docId !== docId);
        sessionStorage.setItem("workouts", JSON.stringify(cachedWorkouts));

        // Re-render UI
        renderWorkoutHistory(cachedWorkouts);
    } catch (err) {
        console.error("Error deleting workout:", err);
        modalMsg("Failed to delete workout. Please try again.");
    }
}