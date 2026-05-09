const fs = require('fs');
const path = require('path');
require('dotenv').config();

try {
    const secret = process.env.FIREBASE_SECRET;
    console.log('Raw length:', secret.length);
    const parsed = JSON.parse(secret);
    console.log('Type:', parsed.type);
    console.log('Email:', parsed.client_email);
    console.log('Key length:', parsed.private_key.length);
    console.log('Key contains \\n:', parsed.private_key.includes('\n'));
    console.log('Key contains \\\\n:', parsed.private_key.includes('\\n'));
} catch (e) {
    console.error('Error:', e.message);
}
