/* Features: Anti spam fetch while 
   keeping the data up to date, achieved by a 
   complex combination of "need update"
   and "can update" logics */

///////////////// Marks the local storage
// Run immediately after load once
if (localStorage.getItem("needs_update") === "yes") {
    updateUserInfo();
}

function updateUserInfo() {
    if (!localStorage.getItem("member_id")) return;

    localStorage.setItem("loading_box", "show");

    fetch(`https://script.google.com/macros/s/AKfycbwj3sSp21IZwEqIrWftCDbXbIP0WijPQiOHx4jnH4itdt6uRaDXbEkTtcHTFP07ylih/exec?member_id=${localStorage.getItem("member_id")}`)
    .then(res => res.json())
    .then(data => {
        if (data.result === "success") {
            ///////////////// Marks the local storage
            const fullName = [data.first_name, data.middle_name, data.last_name]
                .filter(Boolean)
                .join(" ");
            localStorage.setItem("full_name", fullName);
            localStorage.setItem("phone_number", data.phone_number);
            localStorage.setItem("user_address", data.user_address);
            console.log(data);
        }
        localStorage.setItem("needs_update", "no");
    })
    .catch(err => console.error("Error:", err))
    .finally(() => {
        localStorage.setItem("loading_box", "hide"); // hide AFTER request finishes
    });
}