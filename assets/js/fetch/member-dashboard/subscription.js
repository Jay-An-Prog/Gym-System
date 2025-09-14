document.querySelectorAll(".planBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        let confirmRequest = confirm("Are you sure you want to upgrade to membership?");
        if (!confirmRequest) return;

        const formData = {
            action: "plan", // tell Apps Script it's plan request
            member_id: sessionStorage.getItem("member_id"),
            subscription_status: "pending",
            plan: sessionStorage.getItem("plan") ///////////////// Marks the session storage 
        };

        sessionStorage.setItem("loading_box", "show");

        fetch("https://script.google.com/macros/s/AKfycbxb2RdOIyOZcrNItkS1LRVNzhO0H7o5JP_f3ZK-3Hri23x2s8NsLylYiXgnqXGR0NC7qA/exec", {
            method: "POST",
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            switch (data.result) {
                case "success":
                    ///////////////// Marks the session storage
                    sessionStorage.setItem("needs_update", "yes");
                    alert("Your plan request has been successfully submitted!");
                    break;            
                case "fail":
                    switch (data.reason) {
                        case "member doesn't exist":
                            alert("Kindly ensure that your details are uploaded first.");
                            break;             
                        case "no approval yet":
                            alert("Your information is under review. Subscription requests will be available after approval.");
                            break;
                        default:
                            alert("Request failed. Please try again or contact support.");
                            console.error("Unhandled failure reason:", data);
                    }
                    break;
                default:
                    alert("Unexpected response from server. Please try again.");
                    console.error("Unexpected response:", data);
            }
        })
        .catch(err => console.error("Error:", err))
        .finally(() => {
            sessionStorage.setItem("loading_box", "hide"); // hide AFTER request finishes
        });
    });
});


const cancelBtn = document.getElementById("cancelBtn");

cancelBtn.addEventListener("click", function() {
        let confirmRequest = confirm("Are you sure you want to cancel your request?");
        if (!confirmRequest) return;
        
        const formData = {
            action: "plan", // tell Apps Script it's plan request
            member_id: sessionStorage.getItem("member_id"),
            subscription_status: "",
            plan: "" ///////////////// Marks the session storage 
        };
        
        sessionStorage.setItem("loading_box", "show");
        
        fetch("https://script.google.com/macros/s/AKfycbxb2RdOIyOZcrNItkS1LRVNzhO0H7o5JP_f3ZK-3Hri23x2s8NsLylYiXgnqXGR0NC7qA/exec", {
            method: "POST",
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                ///////////////// Marks the session storage 
                sessionStorage.setItem("needs_update", "yes");
                
                alert("Your plan request has been cancelled!");
            }
        })
        .catch(err => console.error("Error:", err))
        .finally(() => {
            sessionStorage.setItem("loading_box", "hide"); // hide AFTER request finishes
        });
});