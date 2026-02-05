import * as admin from 'firebase-admin';

// Load JSON from secret file path
let serviceAccount: any;
try {
    if (process.env.FIREBASE_SECRET) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SECRET);
    } else {
        console.warn('FIREBASE_SECRET is missing in environment variables.');
    }
} catch (error) {
    console.error('Failed to parse FIREBASE_SECRET:', error);
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export default admin;
