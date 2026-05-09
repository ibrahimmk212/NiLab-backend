/**
 * Usage: node validate_firebase.js '<JSON_CONTENT>'
 */
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node validate_firebase.js \'<JSON_CONTENT>\'');
    process.exit(1);
}

try {
    const raw = args[0];
    const data = JSON.parse(raw);
    const keys = ['project_id', 'private_key', 'client_email'];
    const missing = keys.filter(k => !data[k]);

    if (missing.length) {
        console.error('❌ Missing fields:', missing.join(', '));
    } else {
        console.log('✅ Valid JSON for project:', data.project_id);
        console.log('Email:', data.client_email);
        console.log('\n--- COPY THIS TO PRODUCTION .env ---');
        console.log(`FIREBASE_SECRET='${JSON.stringify(data)}'`);
    }
} catch (e) {
    console.error('❌ Error parsing JSON:', e.message);
}
