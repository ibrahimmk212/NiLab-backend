import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Load JSON from secret file path
let serviceAccount: any;

// 1. Try to load from local JSON file first (easiest for development)
const filePath = path.join(process.cwd(), 'terminus-app-5f523-firebase-adminsdk-fbsvc-3012e5c879.json');
if (fs.existsSync(filePath)) {
    serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} else if (process.env.FIREBASE_SECRET) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SECRET);
    } catch (error) {
        console.error('❌ Failed to parse FIREBASE_SECRET:', (error as any).message);
    }
}

if (serviceAccount) {
    try {
        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log(`✅ Firebase Admin initialized for project: ${serviceAccount.project_id}`);
        }
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', (error as any).message);
    }
} else {
    console.warn('⚠️ FIREBASE_SECRET is missing in environment variables.');
}

export default admin;
