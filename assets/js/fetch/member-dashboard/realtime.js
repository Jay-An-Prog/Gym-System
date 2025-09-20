/* Features: Anti spam fetch while 
   keeping the data up to date, achieved by a 
   complex combination of "need update"
   and "can update" logics */

const getUserInfo = "https://script.google.com/macros/s/AKfycbynTA2ySil8BBNUD9fLxvVppV5CRl1RqqfKpWUp_ekXmdgSK5QokeRs5pPKrRRklEjk/exec";
const memberId = sessionStorage.getItem("member_id");

///////////////// Marks the session storage
// Run immediately after load once
setInterval(() => {
    if (sessionStorage.getItem("needs_update") === "yes" 
     && sessionStorage.getItem("loading_box") !== "show") {
        updateUserInfo();
    }
}, 500); // 500 ms = 0.5 seconds

function updateUserInfo() {
    if (!sessionStorage.getItem("member_id")) return;

    sessionStorage.setItem("loading_box", "show");

    fetch(`${getUserInfo}?member_id=${memberId}`)
    .then(res => res.json())
    .then(data => {
        switch (data.result) {
            case "incomplete":
            case "success": { // Put curly braces so const fullName stays properly scoped (otherwise, in some strict setups, declaring const inside a switch without {} can cause issues).
                // Build full name
                const fullName = [data.first_name, data.middle_name, data.last_name]
                .filter(Boolean)
                .join(" ");
                
                // Basic info (common to both)
                sessionStorage.setItem("full_name", fullName);
                sessionStorage.setItem("first_name", data.first_name);
                sessionStorage.setItem("middle_name", data.middle_name);
                sessionStorage.setItem("last_name", data.last_name);
                sessionStorage.setItem("phone_number", data.phone_number.slice(1)); // Remove "#"
                sessionStorage.setItem("user_address", data.user_address);
                
                if (data.result === "success") {
                    // Extra details only for activated accounts
                    sessionStorage.setItem("qr_code", data.qr_code);
                    sessionStorage.setItem("id_name", data.id_name);
                    sessionStorage.setItem("subscription_status", data.subscription_status);
                    sessionStorage.setItem("expiration_date", data.expiration_date);
                    sessionStorage.setItem("plan", data.plan);                    
                }
                break;
            }     
            case "fail": 
                // Clear personal info
                sessionStorage.removeItem("first_name");
                sessionStorage.removeItem("middle_name");
                sessionStorage.removeItem("last_name");
                sessionStorage.removeItem("phone_number");
                sessionStorage.removeItem("user_address");
            
                // Clear QR + Subscription
                sessionStorage.removeItem("qr_code");
                sessionStorage.removeItem("id_name");
                sessionStorage.removeItem("subscription_status");
                sessionStorage.removeItem("expiration_date");
                sessionStorage.removeItem("plan");
                break;
            default:
              console.warn("Unknown result type:", data.result);
        }          
        // Status
        sessionStorage.setItem("status", data.status);
        
        console.log("User Info & Account:", data);

        sessionStorage.setItem("needs_update", "no"); // Prevents fetch looping
    })
    .catch(err => console.error("User Info Error:", err))
    .finally(() => {
        sessionStorage.setItem("loading_box", "hide"); // hides only after both are done
    });
}

// Reload page to trigger updateUserInfo
const navEntries = performance.getEntriesByType("navigation");
const navType = navEntries.length > 0 ? navEntries[0].type : "navigate";

// If it's a reload/refresh
if (navType === "reload") {
    sessionStorage.setItem("needs_update", "yes");
}