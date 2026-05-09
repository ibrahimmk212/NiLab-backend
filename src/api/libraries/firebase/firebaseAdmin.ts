import * as admin from 'firebase-admin';

// Load JSON from secret file path
let serviceAccount: any;
if (process.env.FIREBASE_SECRET) {
    try {
        // Handle potential escaped newlines in production env vars
        const secret = process.env.FIREBASE_SECRET.replace(/\\n/g, '\n');
        serviceAccount = JSON.parse(secret);
        
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
