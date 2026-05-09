const fs = require('fs');
const path = require('path');
require('dotenv').config();

const secret = process.env.FIREBASE_SECRET;
console.log('Secret Length:', secret.length);

try {
    const data = JSON.parse(secret);
    console.log('Successfully parsed!');
} catch (e) {
    console.log('Error:', e.message);
    const pos = parseInt(e.message.match(/position (\d+)/)[1]);
    console.log('Context at error:', secret.substring(pos - 20, pos + 20));
    console.log('Character at position:', secret[pos], '(code:', secret.charCodeAt(pos), ')');
}
