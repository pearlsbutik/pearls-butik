import dotenv from "dotenv";
import * as admin from "firebase-admin";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

// 1. Ensure environment variables are loaded first
dotenv.config();

let config: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.error("Failed to parse firebase-applet-config.json:", e);
}

// 2. Resolve credentials & config options
const projectId = process.env.FIREBASE_PROJECT_ID || config.projectId;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || config.clientEmail;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

let cleanPrivateKey = privateKey?.trim();
if (cleanPrivateKey) {
  if (cleanPrivateKey.startsWith('"') && cleanPrivateKey.endsWith('"')) {
    cleanPrivateKey = cleanPrivateKey.substring(1, cleanPrivateKey.length - 1);
  }
  if (cleanPrivateKey.startsWith("'") && cleanPrivateKey.endsWith("'")) {
    cleanPrivateKey = cleanPrivateKey.substring(1, cleanPrivateKey.length - 1);
  }
  cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, "\n");
}

// 3. Resolve storage bucket with auto-fallback
let storageBucket = process.env.FIREBASE_STORAGE_BUCKET || config.storageBucket;
if (!storageBucket && projectId) {
  storageBucket = `${projectId}.firebasestorage.app`;
}

let appInstance: any = null;
let dbInstance: any = null;
let bucketInstance: any = null;
let authInstance: any = null;

try {
  const apps = getApps();
  if (apps.length > 0) {
    appInstance = apps[0];
    console.log("Firebase Admin already initialized.");
  } else {
    const hasEnvCredentials = !!(projectId && clientEmail && cleanPrivateKey);

    if (hasEnvCredentials) {
      const isKeyValid = cleanPrivateKey!.includes("-----BEGIN PRIVATE KEY-----") && cleanPrivateKey!.includes("-----END PRIVATE KEY-----");
      if (!isKeyValid) {
        throw new Error("Invalid private key format in environment variables (missing PEM headers).");
      }

      appInstance = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: cleanPrivateKey,
        }),
        storageBucket: storageBucket,
      });
    } else {
      // Fallback/Local config initialization
      appInstance = initializeApp({
        projectId: projectId,
        storageBucket: storageBucket,
      });
    }
  }

  // 4. Initialize services safely
  // Connect to the custom firestore database ID if specified in configuration
  const firestoreDbId = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)" 
    ? config.firestoreDatabaseId 
    : undefined;

  dbInstance = getFirestore(appInstance, firestoreDbId);
  authInstance = getAuth(appInstance);

  const storageService = getStorage(appInstance);
  if (storageBucket) {
    bucketInstance = storageService.bucket(storageBucket);
  } else {
    bucketInstance = storageService.bucket();
  }

  // 5. Success Prints
  console.log("✅ Firebase Admin initialized");
  console.log("✅ Firestore connected");
  console.log("✅ Firebase Storage connected");
  console.log(`Project ID: ${projectId || "Not configured"}`);
  console.log(`Storage Bucket: ${storageBucket || "Not configured"}`);

} catch (err: any) {
  console.error("❌ Firebase Admin Initialization Failed!");
  console.error("Exact reason:", err?.stack || err?.message || err);
  throw err;
}

// Export references
export {
  admin,
  dbInstance as Firestore,
  dbInstance as firestore,
  bucketInstance as StorageBucket,
  bucketInstance as storageBucket,
  authInstance as Auth,
  authInstance as auth,
  storageBucket as storageBucketName
};
