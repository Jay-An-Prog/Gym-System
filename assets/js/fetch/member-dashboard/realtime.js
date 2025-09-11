/* Features: Anti spam fetch while 
   keeping the data up to date, achieved by a 
   complex combination of "need update"
   and "can update" logics */

const getUserInfo = "https://script.google.com/macros/s/AKfycbwj3sSp21IZwEqIrWftCDbXbIP0WijPQiOHx4jnH4itdt6uRaDXbEkTtcHTFP07ylih/exec";
const getUserRequest = "https://script.google.com/macros/s/AKfycbzt0QCdUMglWNoCD1pa92IkOl4qikAJ3-fxJw1JVPuuzo4y3RmJ-AY-qJQj5aTziM9f1w/exec";
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

    // First fetch
    const userInfoPromise = fetch(`${getUserInfo}?member_id=${memberId}`)
    .then(res => res.json())
    .then(data => {
        if (data.result === "success") {
            const fullName = [data.first_name, data.middle_name, data.last_name]
            .filter(Boolean)
            .join(" ");
            sessionStorage.setItem("full_name", fullName);
            sessionStorage.setItem("phone_number", data.phone_number.slice(1)); // Remove "#"
            sessionStorage.setItem("user_address", data.user_address);
            console.log("User Info:", data);
        }
        sessionStorage.setItem("needs_update", "no"); // Prevents fetch looping
    })
    .catch(err => console.error("User Info Error:", err));
    
    // Second fetch
    const userRequestPromise = fetch(`${getUserRequest}?member_id=${memberId}`)
    .then(res => res.json())
    .then(data => {
        if (data.result === "success") {
            //Subscription
            sessionStorage.setItem("subscription_status", data.subscription_status);
            sessionStorage.setItem("plan", data.plan);
            //QR Code
            sessionStorage.setItem("qr_code", data.qr_code);
            sessionStorage.setItem("id_name", data.id_name);
            console.log("User Request:", data);
        }
        sessionStorage.setItem("needs_update", "no"); // Prevents fetch looping
    })
    .catch(err => console.error("User Request Error:", err));
    
    // Wait for BOTH to finish
    Promise.all([userInfoPromise, userRequestPromise])
    .finally(() => {
        sessionStorage.setItem("loading_box", "hide"); // hides only after both are done
    });
}