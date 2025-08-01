import * as admin from 'firebase-admin';
import * as fs from 'fs';

// Load JSON from secret file path
const serviceAccount = JSON.parse(
    fs.readFileSync('/etc/secrets/firebase_secret.json', 'utf-8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default admin;
