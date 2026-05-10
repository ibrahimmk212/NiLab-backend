const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mds-food';

async function migrate() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGO_URL);
        console.log('Connected successfully.');

        const db = mongoose.connection.db;

        // 1. Migrate Users
        console.log('Migrating User addresses...');
        const users = await db.collection('users').find({ 'addresses.0': { $exists: true } }).toArray();
        let userCount = 0;

        for (const user of users) {
            let modified = false;
            const updatedAddresses = user.addresses.map(addr => {
                if (addr.coordinates && addr.coordinates.length === 2) {
                    // Logic: If the first coordinate is > 20 (roughly), it's definitely Latitude in Nigeria context
                    // Or if we know the app ALWAYS sent [Lat, Lng], we just swap them all.
                    // Given the user's confirmation, we swap all existing coordinates.
                    const [lat, lng] = addr.coordinates;
                    
                    // Basic sanity check: Latitude in Nigeria is roughly 4-14, Longitude 3-15.
                    // If they are flipped, swapping them is safe.
                    addr.coordinates = [lng, lat];
                    modified = true;
                }
                return addr;
            });

            if (modified) {
                await db.collection('users').updateOne(
                    { _id: user._id },
                    { $set: { addresses: updatedAddresses } }
                );
                userCount++;
            }
        }
        console.log(`Updated ${userCount} users.`);

        // 2. Migrate Vendors
        console.log('Migrating Vendor locations...');
        const vendors = await db.collection('vendors').find({ 'location.coordinates': { $exists: true } }).toArray();
        let vendorCount = 0;

        for (const vendor of vendors) {
            if (vendor.location && vendor.location.coordinates && vendor.location.coordinates.length === 2) {
                const [lat, lng] = vendor.location.coordinates;
                await db.collection('vendors').updateOne(
                    { _id: vendor._id },
                    { $set: { 'location.coordinates': [lng, lat] } }
                );
                vendorCount++;
            }
        }
        console.log(`Updated ${vendorCount} vendors.`);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
