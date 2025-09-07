/* Features: Anti spam fetch while 
   keeping the data up to date, achieved by a 
   complex combination of "need update"
   and "can update" logics */

const getUserInfo = "https://script.google.com/macros/s/AKfycbwj3sSp21IZwEqIrWftCDbXbIP0WijPQiOHx4jnH4itdt6uRaDXbEkTtcHTFP07ylih/exec";
const getUserRequest = "https://script.google.com/macros/s/AKfycbzt0QCdUMglWNoCD1pa92IkOl4qikAJ3-fxJw1JVPuuzo4y3RmJ-AY-qJQj5aTziM9f1w/exec";
const memberId = localStorage.getItem("member_id");

///////////////// Marks the local storage
// Run immediately after load once
setInterval(() => {
    if (localStorage.getItem("needs_update") === "yes" 
     && localStorage.getItem("loading_box") !== "show") {
        updateUserInfo();
    }
}, 500); // 500 ms = 0.5 seconds

function updateUserInfo() {
    if (!localStorage.getItem("member_id")) return;

    localStorage.setItem("loading_box", "show");

    // First fetch
    const userInfoPromise = fetch(`${getUserInfo}?member_id=${memberId}`)
    .then(res => res.json())
    .then(data => {
        if (data.result === "success") {
            const fullName = [data.first_name, data.middle_name, data.last_name]
            .filter(Boolean)
            .join(" ");
            localStorage.setItem("full_name", fullName);
            localStorage.setItem("phone_number", data.phone_number);
            localStorage.setItem("user_address", data.user_address);
            console.log("User Info:", data);
        }
        localStorage.setItem("needs_update", "no"); // This placed here unlike other that's inside IF Success, so it prevents fetch looping
    })
    .catch(err => console.error("User Info Error:", err));
    
    // Second fetch
    const userRequestPromise = fetch(`${getUserRequest}?member_id=${memberId}`)
    .then(res => res.json())
    .then(data => {
        if (data.result === "success") {
            localStorage.setItem("subscription_status", data.subscription_status);
            localStorage.setItem("plan", data.plan);
            console.log("User Request:", data);
        }
        localStorage.setItem("needs_update", "no"); // This placed here unlike other that's inside IF Success, so it prevents fetch looping
    })
    .catch(err => console.error("User Request Error:", err));
    
    // Wait for BOTH to finish
    Promise.all([userInfoPromise, userRequestPromise])
    .finally(() => {
        localStorage.setItem("loading_box", "hide"); // hides only after both are done
    });
}