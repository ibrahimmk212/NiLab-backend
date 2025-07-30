import admin, { ServiceAccount } from 'firebase-admin';

// Load your service account key JSON file
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount: ServiceAccount = JSON.parse(
    process.env.FIREBASE_SECRET || '{}'
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default admin;
