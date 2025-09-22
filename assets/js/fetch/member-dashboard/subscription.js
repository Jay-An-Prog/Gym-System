const userRequest = "https://script.google.com/macros/s/AKfycbyK5leJgTtgxztnh0jN5wHVnrrzN_4jteAyAbJOT2YfQU1yxf134cid7zlaFgAsg3s5/exec";

document.querySelectorAll(".planBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        if (!sessionStorage.getItem("first_name")) {
            alert("Kindly ensure that your details are uploaded first.");
            return;
        }
        let confirmRequest = confirm("Are you sure you want to upgrade to membership?");
        if (!confirmRequest) return;

        const formData = {
            action: "plan", // tell Apps Script it's plan request
            member_id: sessionStorage.getItem("member_id"),
            subscription_status: "pending",
            plan: sessionStorage.getItem("plan") ///////////////// Marks the session storage 
        };

        sessionStorage.setItem("loading_box", "show");

        fetch(userRequest, {
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
                            alert("We couldn’t find your account under pending activation.");
                            break;             
                        case "no approval yet":
                            alert("Your information is under review. Subscription requests will be available after approval.");
                            break;
                        default:
                            alert("Request failed. Please refresh the page and try again or contact support.");
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
            plan: "" 
        };
        
        sessionStorage.setItem("loading_box", "show");
        
        fetch(userRequest, {
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