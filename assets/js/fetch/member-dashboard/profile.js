// ===================================================
// 🔥 FIREBASE IMPORTS
// ===================================================
import { db } from "../../utils/firebase.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const rtdb = getDatabase();

// ===================================================
// 📦 APPWRITE IMPORTS
// ===================================================
import { Client, Storage, ID } 
from "https://cdn.jsdelivr.net/npm/appwrite@13.0.0/+esm";

// ===================================================
// ⚙️ APPWRITE CONFIG (CHANGE THESE)
// ===================================================
const appwriteClient = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1") // <-- YOUR ENDPOINT
    .setProject("69457b7f000459b00a9a");               // <-- YOUR PROJECT ID

const storage = new Storage(appwriteClient);
const BUCKET_ID = "6945804c00349e47cb42"; // <-- YOUR BUCKET ID

// ===================================================
// ===== DOM ELEMENT REFERENCES =====
// ===================================================
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
    // Check if user is on in-app browser
    function isInAppBrowser() {
        return /FBAN|FBAV|Instagram|Messenger/i.test(navigator.userAgent);
    }
    if (isInAppBrowser()) {
        modalMsg("Please open this page in your browser to enable camera access.");
        return;
    }

    cameraWrapper.style.display = "flex";
    try {
        modalMsg(
            "This web needs access to your camera.\n\n" +
            "Please tap 'Allow' on the next prompt to continue.\n\n" +
            "If you block it, you will need to enable it manually in your phone or browser settings."
        );
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        modalMsg(
            "Camera access was blocked.\n\n" +
            "Please enable camera permission in your phone settings:\n" +
            "Settings → Apps → Camera → Permissions → Your Browser → Allow\n\n" +
            "OR\n\n" +
            "To enable it in your current browser:\n" +
            "1. Click the 🔒 lock icon in the address bar\n" +
            "2. Go to Permissions\n" +
            "3. Set Camera to Allow\n" +
            "4. Reload the page"
        );
        cameraWrapper.style.display = "none";
    }
});

captureBtn.addEventListener("click", () => {
    const ctx = faceCanvas.getContext("2d");

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Determine square size
    const size = Math.min(vw, vh);

    // Center crop coordinates
    const sx = (vw - size) / 2;
    const sy = (vh - size) / 2;

    // Force square canvas
    faceCanvas.width = size;
    faceCanvas.height = size;

    // Mirror + draw cropped square
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(
        video,
        sx, sy, size, size,        // source crop (square)
        -size, 0, size, size       // destination (mirrored)
    );
    ctx.restore();

    faceCanvas.style.display = "block";

    // Stop camera
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

// ===================================================
// 🔁 BASE64 → FILE (REQUIRED FOR APPWRITE)
// ===================================================
function base64ToFile(base64, filename) {
    const byteString = atob(base64);
    const buffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(buffer);

    for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
    }

    return new File([uintArray], filename, { type: "image/jpeg" });
}

// CHECK IF CANVAS HAS IMAGE
function canvasHasImage(canvas) {
    const ctx = canvas.getContext("2d");
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    return pixels.some(channel => channel !== 0);
}

// ==============================
// 🧠 SHARED FORM DATA COLLECTOR
// ==============================
function getFormData(form) {
    return {
        first_name: form.first_name.value,
        middle_name: form.middle_name.value,
        last_name: form.last_name.value,
        phone_number: "#" + form.phone_number.value,
        user_address: form.user_address.value,
        updated_at: serverTimestamp()
    };
}

// ==================================
// 🟦 IMAGE UPLOAD (APPWRITE)
// ==================================
async function uploadImages() {
    let faceFileId = "";
    let idFileId = "";

    try {
        const memberId = sessionStorage.getItem("member_id");

        const faceBase64 = canvasToBase64(faceCanvas);
        if (!faceBase64) {
            throw new Error("Face image missing");
        }

        const idFile = document.getElementById("id").files[0];
        const idBase64 = idFile ? await compressFileToBase64(idFile) : "";

        const faceFile = base64ToFile(faceBase64, `members/${memberId}/face.jpg`);
        const idImageFile = idBase64
            ? base64ToFile(idBase64, `members/${memberId}/id.jpg`)
            : null;

        // --- DELETE OLD FILES IF EXIST ---
        const memberDoc = await getDoc(doc(db, "members", memberId));
        if (memberDoc.exists()) {
            const data = memberDoc.data();

            if (data.face_file_id) {
                try {
                    await storage.deleteFile(BUCKET_ID, data.face_file_id);
                } catch (e) {
                    console.warn("Old face file delete failed:", e);
                }
            }

            if (data.id_file_id) {
                try {
                    await storage.deleteFile(BUCKET_ID, data.id_file_id);
                } catch (e) {
                    console.warn("Old ID file delete failed:", e);
                }
            }
        }

        // --- UPLOAD NEW FILES ---
        const faceUpload = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            faceFile
        );
        faceFileId = faceUpload.$id;

        if (idImageFile) {
            const idUpload = await storage.createFile(
                BUCKET_ID,
                ID.unique(),
                idImageFile
            );
            idFileId = idUpload.$id;
        }

        // Generate preview URL so it can be reuse
        const faceImageURL = storage
            .getFileView(BUCKET_ID, faceFileId)
            .toString();

        return { faceFileId, idFileId, faceImageURL };

    } catch (err) {
        console.error("Appwrite Upload Error:", err);
        modalMsg("Image upload failed.");
        sessionStorage.setItem("loading_box", "hide");
        throw err; // important
    }
}

// ==================================
// 🔥 FIRESTORE UPDATE (ONE SOURCE)
// ==================================
async function updateFirestore(data) {
    const memberId = sessionStorage.getItem("member_id");
    const memberRef = doc(db, "members", memberId);

    const snap = await getDoc(memberRef);
    if (!snap.exists()) {
        throw new Error("Member document does not exist.");
    }

    // Upload in firestore
    await setDoc(memberRef, data, { merge: true });

    sessionStorage.setItem("profile_update", "yes");
    sessionStorage.setItem("needs_update", "yes");
}

// ==================================
// 📤 FULL UPLOAD (IMAGES REQUIRED)
// ==================================
uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!canvasHasImage(faceCanvas)) {
        modalMsg("Please take a selfie first.");
        return;
    }

    let confirmRequest = confirm(
        "Please review your information carefully before submitting."
    );
    if (!confirmRequest) return;

    try {
        modalMsg("Submitting info...");
        sessionStorage.setItem("loading_box", "show");

        const { faceFileId, idFileId, faceImageURL } = await uploadImages();

        await updateFirestore({
            ...getFormData(uploadForm),
            face_file_id: faceFileId,
            face_image_url: faceImageURL,
            id_file_id: idFileId
        });

        // Upload in realtime database
        const memberId = sessionStorage.getItem("member_id");
        const statusRef = ref(rtdb, `member_status/${memberId}/status`);
        await set(statusRef, "pending");

        sessionStorage.setItem("face_file_id", faceFileId);
        sessionStorage.setItem("id_file_id", idFileId);

        modalMsg("Upload successful!");
        modalMsg("Your account is under review!");

    } catch (err) {
        console.error(err);
        modalMsg("Upload failed.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});

// ==================================
// ✏️ UPDATE ONLY (NO IMAGES)
// ==================================
updateBtn.addEventListener("click", async () => {
    let confirmRequest = confirm(
        "Are you sure you want to save your new info?"
    );
    if (!confirmRequest) return;

    try {
        sessionStorage.setItem("loading_box", "show");

        await updateFirestore({
            ...getFormData(uploadForm),
        });

        modalMsg("Update successful!");

    } catch (err) {
        console.error(err);
        modalMsg("Update failed.");
    } finally {
        sessionStorage.setItem("loading_box", "hide");
    }
});


// Show modal message
function modalMsg(Msg) {
    sessionStorage.setItem("modal_box", "show")
    sessionStorage.setItem("modal_message", Msg)
}