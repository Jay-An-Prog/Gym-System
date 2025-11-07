//************************* Marks the database connection
const uploadURL = "https://script.google.com/macros/s/AKfycbwSzWqFZhcpiiNvgPUDOTFZ-YNb0e646JdEBRcbr1Pixpe4JrNaoJgzl-A_4D-cNv5K/exec";
// ===== GOOGLE APPS SCRIPT WEB APP ENDPOINTS =====
const scriptURL = "https://script.google.com/macros/s/AKfycbwQGivP8rRqVD1vSgMN3YW9IbN6hmR5JKDwffT3OqPMlum8pjE8K7x1LKdVdff7Ytvc/exec";

// ===== DOM ELEMENT REFERENCES =====
const toggleCameraBtn = document.getElementById("toggleCamera");
const cameraWrapper = document.getElementById("cameraWrapper");
const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const faceCanvas = document.getElementById("faceCanvas");
const uploadForm = document.getElementById("uploadForm");

// ===================================================
// ✅ CAMERA TOGGLE + SELFIE CAPTURE
// ===================================================
toggleCameraBtn.addEventListener("click", async () => {
  cameraWrapper.style.display = "flex";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    alert("Camera access denied: " + err);
    cameraWrapper.style.display = "none";
  }
});

captureBtn.addEventListener("click", () => {
  const ctx = faceCanvas.getContext("2d");

  faceCanvas.width = video.videoWidth;
  faceCanvas.height = video.videoHeight;

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight);
  ctx.restore();

  faceCanvas.style.display = "block";

  video.srcObject.getTracks().forEach(track => track.stop());
  cameraWrapper.style.display = "none";
});

// Close modal when clicking outside camera
cameraWrapper.addEventListener("click", (e) => {
  if (e.target === cameraWrapper) {
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    cameraWrapper.style.display = "none";
  }
});

// ===================================================
// ✅ IMAGE COMPRESSION HELPERS
// ===================================================
function canvasToBase64(canvas, maxWidth = 480, maxHeight = 480, quality = 0.6) {
  const tmpCanvas = document.createElement("canvas");
  const ctx = tmpCanvas.getContext("2d");

  let width = canvas.width;
  let height = canvas.height;

  if (width > height && width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  } else if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  tmpCanvas.width = width;
  tmpCanvas.height = height;
  ctx.drawImage(canvas, 0, 0, width, height);

  return tmpCanvas.toDataURL("image/jpeg", quality).split(",")[1];
}

function compressFileToBase64(file, maxWidth = 480, maxHeight = 480, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        if (width > height && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
      };

      img.onerror = reject;
      img.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// ===================================================
// ✅ FORM SUBMISSION — UPLOAD FACE & ID
// ===================================================

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent normal submit

    let confirmRequest = confirm("Please review your information carefully. Click OK to proceed or Cancel to make changes.");
    if (!confirmRequest) return;

    // Check if status is 'activated'
    if (sessionStorage.getItem("status") === "activated") {
        confirmRequest = confirm(
            "Caution: Updating your information will remove your active status until it is reviewed by the admin. Do you want to continue?"
        );
        if (!confirmRequest) return;
    }

    alert("Submitting info...");
    sessionStorage.setItem("loading_box", "show");
    
    try {
        const firstName = e.target.first_name.value.trim();
        const middleName = e.target.middle_name.value.trim();
        const lastName = e.target.last_name.value.trim();        
        // ✅ Build full name (skip middle if blank)
        const name = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
        const idFile = document.getElementById("id").files[0];
        
        const faceBase64 = canvasToBase64(faceCanvas);
        const idBase64 = idFile ? await compressFileToBase64(idFile) : "";
        
        const formData = new URLSearchParams();
        formData.append("member_id", sessionStorage.getItem("member_id"));
        formData.append("name", name);
        formData.append("face", faceBase64);
        formData.append("id", idBase64);
        
        const res = await fetch(scriptURL, { method: "POST", body: formData });
        const data = await res.json();
        
        if (data.status !== "success") {
            alert("Error: " + data.message);
            return;
        }       
    } catch (err) {
        alert("Upload failed: " + err);
    }

    const formData = {
        action: "upload", // tell Apps Script it's upload request
        member_id: sessionStorage.getItem("member_id"), ///////////////// Marks the session storage 
        first_name: e.target.first_name.value,
        middle_name: e.target.middle_name.value,
        last_name: e.target.last_name.value,
        phone_number: "#"+e.target.phone_number.value,
        user_address: e.target.user_address.value,
        status: "pending"
    };

    //Upload details
    fetch(uploadURL, {   // Store as promise
        method: "POST",
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.response.result === "success") {
            ///////////////// Marks the session storage 
            sessionStorage.setItem("needs_update", "yes");

            alert("Upload successful!");
            alert("Your account is under review for validation!");
        } else {
            alert("Upload failed!");
            alert("Account validation was unsuccessful.");
        }   
    })
    .catch(err => console.error("Error:", err))
    .finally(() => {
        sessionStorage.setItem("loading_box", "hide");

        // update profile related 
        sessionStorage.setItem("profile_update", "yes");
    });
});