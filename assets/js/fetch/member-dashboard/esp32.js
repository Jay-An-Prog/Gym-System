import { getDatabase, ref as rtdbRef, get, update 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import { app } from "../../utils/firebase.js";

const rtdb = getDatabase(app);

async function getQR() {
    const currentQrRef = rtdbRef(rtdb, `session_qr/${sessionStorage.getItem("member_id")}/current_qr`);
    const currentQrSnap = await get(currentQrRef);        
    const currentQr = currentQrSnap.exists() ? currentQrSnap.val() : "";
    return currentQr;
}

async function syncStatusToStoredQRS(status) {
    try {
        let currentQr = await getQR();
        if (!currentQr) return;

        const storedQrRef = rtdbRef(rtdb, `stored_qrs/${currentQr}`);

        // ?? Check if node exists first
        const snapshot = await get(storedQrRef);

        if (!snapshot.exists()) {
            console.log("stored_qrs node does not exist. Skipping update.");
            return;
        }

        // ? Only updates the status field
        await update(storedQrRef, {
            status: status
        });

        console.log("stored_qrs status synced successfully.");

    } catch (error) {
        console.error("Error syncing stored_qrs:", error);
    }
}

async function syncSubsExpDateToStoredQRS(expirationDate) {
    try {
        let currentQr = await getQR();
        if (!currentQr) return;

        const storedQrRef = rtdbRef(rtdb, `stored_qrs/${currentQr}`);

        // ?? Check if node exists first
        const snapshot = await get(storedQrRef);

        if (!snapshot.exists()) {
            console.log("stored_qrs node does not exist. Skipping update.");
            return;
        }

        // ? Only updates the status field
        await update(storedQrRef, {
            expiration_date: expirationDate
        });

        console.log("stored_qrs status synced successfully.");

    } catch (error) {
        console.error("Error syncing stored_qrs:", error);
    }
}

export { syncStatusToStoredQRS };
export { syncSubsExpDateToStoredQRS };