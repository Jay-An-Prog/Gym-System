// ==============================
// PROGRESS UI UPDATER (UI ONLY)
// ==============================

// DOM ELEMENTS
const progressHistory = document.getElementById("progressHistory");
const aiCoaching = document.getElementById("aiCoaching");
const attendanceTableBody = document.querySelector("[data-attendance-body]");

// SESSION KEYS
const WORKOUTS_CACHE_KEY = "workouts";
const WORKOUTS_UPDATED_KEY = "workouts_updated";
const WORKOUT_AI_CACHE_KEY = "ai_output";
const WORKOUT_AI_UPDATED_KEY = "ai_updated";
const year = new Date().getFullYear();
const ATTENDANCE_CACHE_KEY = `ATTENDANCE_${year}`;
const ATTENDANCE_UPDATED_KEY = `ATTENDANCE_${year}_UPDATED`;

// UI STATE CACHE
let lastWorkoutStamp = null;
let lastAIStamp = null;
let lastAttendanceStamp = null;

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
const emptyAttendanceHTML = `
    <tr>
        <td colspan="3" style="text-align: center;">No attendance records yet</td>
    </tr>
`;

// INITIAL LOAD
progressHistory.innerHTML = emptyHistoryHTML;
attendanceTableBody.innerHTML = emptyAttendanceHTML;

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
    updateAttendanceUI()
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

    const stamp = sessionStorage.getItem(WORKOUT_AI_UPDATED_KEY);
    if (stamp === lastAIStamp) return;

    lastAIStamp = stamp;

    const output = sessionStorage.getItem(WORKOUT_AI_CACHE_KEY);
    displayAIOutput(output);
}

function displayAIOutput(output) {
    const smallEl = aiCoaching?.querySelector("small");
    if (!smallEl) return;

    smallEl.textContent = output || "AI coaching will appear here.";
}


// ==============================
// ATTENDANCE UI UPDATER (UI ONLY)
// ==============================
function updateAttendanceUI() {
    if (!attendanceTableBody) return;

    // Get the last update timestamp from sessionStorage
    const stamp = sessionStorage.getItem(ATTENDANCE_UPDATED_KEY);
    if (stamp === lastAttendanceStamp) return; // no change, skip

    lastAttendanceStamp = stamp;

    // Get cached attendance data
    const cached = JSON.parse(sessionStorage.getItem(ATTENDANCE_CACHE_KEY) || "{}");

    renderAttendance(cached);
}

function renderAttendance(attendanceData = {}) {
    if (!attendanceTableBody) return;

    attendanceTableBody.innerHTML = ""; // clear existing rows

    // List of months
    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    months.forEach((month, i) => {
        // Default to "-" if no data
        const monthKey = String(i + 1).padStart(2, "0"); // "01" to "12"
        const data = attendanceData[monthKey] || { total_sessions: "-", last_visit: "-" };

        // Convert timestamp to readable format if needed
        let lastVisit = data.last_visit;
        if (lastVisit && typeof lastVisit === "object" && "seconds" in lastVisit) {
            // Convert Firestore timestamp to JS Date
            lastVisit = new Date(lastVisit.seconds * 1000 + (lastVisit.nanoseconds || 0) / 1_000_000);

            lastVisit = lastVisit.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric"
            });
        }

        const row = document.createElement("tr");
        row.dataset.month = month;

        row.innerHTML = `
            <td>${month}</td>
            <td data-sessions>${data.total_sessions}</td>
            <td data-last-visit>${lastVisit}</td>
        `;

        attendanceTableBody.appendChild(row);
    });
}