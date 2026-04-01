import { Client, Storage, ID } from "https://cdn.jsdelivr.net/npm/appwrite@13.0.0/+esm";

// 1. Initialize Appwrite Client
const appwriteClient = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1") // your Appwrite endpoint
    .setProject("69457b7f000459b00a9a"); // your project ID

// 2. Initialize Storage
const storage = new Storage(appwriteClient);
const BUCKET_ID = "6945804c00349e47cb42"; // your bucket ID

// 3. Export for use in other JS files
export { appwriteClient, storage, BUCKET_ID, ID };