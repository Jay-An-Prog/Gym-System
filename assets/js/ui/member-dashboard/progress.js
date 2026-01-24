// ==============================
// PROGRESS UI UPDATER (UI ONLY)
// ==============================

// DOM ELEMENTS
const progressHistory = document.getElementById("progressHistory");
const aiCoaching = document.getElementById("aiCoaching");

// SESSION KEYS
const WORKOUTS_CACHE_KEY = "workouts";
const WORKOUTS_UPDATED_KEY = "workouts_updated";
const AI_CACHE_KEY = "ai_output";
const AI_UPDATED_KEY = "ai_updated";

// UI STATE CACHE
let lastWorkoutStamp = null;
let lastAIStamp = null;

// EMPTY STATE
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
progressHistory.innerHTML = emptyHistoryHTML;

function progressUpdater() {
    const statusNotice = document.getElementById("statusNotice");
    statusNotice.className = "status-notice"; // Reset classes safely
    switch (sessionStorage.getItem("status")) {    
        case "pending":
            statusNotice.textContent = "Your account is awaiting activation. Workout progress and tracking features will be available once your account is active.";
            statusNotice.classList.add("status-pending");
            statusNotice.style.display = "block";     // make sure message is visible
            break;                
        case "activated":
            statusNotice.className = "status-notice"; // reset CSS style
            statusNotice.style.display = "none";     // make sure message is visible
            break;
        case "rejected":            
            statusNotice.textContent = "Your account verification was not approved. Workout progress tracking is unavailable until your account is activated.";
            statusNotice.classList.add("status-rejected");
            statusNotice.style.display = "block";     // make sure message is visible
            break;                
        case null:                
        case "":
        default:
            statusNotice.textContent = "Workout progress tracking is currently unavailable. You’ll be able to save and view your progress once your account is activated.";
            statusNotice.classList.add("status-pending"); // reset CSS style
            statusNotice.style.display = "block";     // make sure message is visible
            break;
    }

    updateWorkoutHistoryUI();
    updateAIOutputUI();
}

// Run immediately
progressUpdater();

// Save interval ID so we can clear it later
setInterval(progressUpdater, 500);

// ==============================
// WORKOUT HISTORY UI
// ==============================
function updateWorkoutHistoryUI() {
    if (!progressHistory) return;

    const stamp = sessionStorage.getItem(WORKOUTS_UPDATED_KEY);
    if (stamp === lastWorkoutStamp) return;

    lastWorkoutStamp = stamp;

    const workouts = JSON.parse(sessionStorage.getItem(WORKOUTS_CACHE_KEY) || "[]");
    renderWorkoutHistory(workouts);
}

function renderWorkoutHistory(workouts) {
    if (!progressHistory) return;

    if (!workouts.length) {
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
                <small>
                    ${data.exercise_mode} | ${data.workout_goal} |
                    ${data.sets} sets × ${data.reps} reps @ ${data.weight}kg
                </small>
            </div>
            <span class="history-date">
                ${new Date(data.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric"
                })}
            </span>
            <button class="delete-btn" onclick="deleteWorkout('${data.docId}')">X</button>
        `;

        progressHistory.appendChild(card);
    });
}

// ==============================
// AI OUTPUT UI
// ==============================
function updateAIOutputUI() {
    if (!aiCoaching) return;

    const stamp = sessionStorage.getItem(AI_UPDATED_KEY);
    if (stamp === lastAIStamp) return;

    lastAIStamp = stamp;

    const output = sessionStorage.getItem(AI_CACHE_KEY);
    displayAIOutput(output);
}

function displayAIOutput(output) {
    const smallEl = aiCoaching?.querySelector("small");
    if (!smallEl) return;

    smallEl.textContent = output || "AI coaching will appear here.";
}