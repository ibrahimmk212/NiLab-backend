const fs = require('fs');
require('dotenv').config();

const secret = process.env.FIREBASE_SECRET;
console.log('Total Length:', secret.length);

const start = Math.max(0, 161 - 20);
const end = Math.min(secret.length, 161 + 20);

console.log('Char codes around 161:');
for (let i = start; i < end; i++) {
    const char = secret[i];
    const code = secret.charCodeAt(i);
    console.log(`${i}: ${JSON.stringify(char)} (code: ${code}) ${i === 161 ? '<-- HERE' : ''}`);
}
