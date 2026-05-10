const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mds-food';

async function clearAllLocations() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGO_URL);
        console.log('Connected successfully.');

        const db = mongoose.connection.db;

        // 1. Clear all User addresses (Customers, Riders, Staff, etc.)
        console.log('Clearing all User addresses...');
        const userResult = await db.collection('users').updateMany(
            {}, 
            { $set: { addresses: [] } }
        );
        console.log(`Cleared addresses for ${userResult.modifiedCount} users.`);

        // 2. Clear all Vendor locations and addresses
        // We also set them to 'inactive' to ensure they don't appear in searches without a valid location
        console.log('Clearing all Vendor locations...');
        const vendorResult = await db.collection('vendors').updateMany(
            {}, 
            { 
                $set: { 
                    location: null, 
                    address: "",
                    state: "",
                    lga: "",
                    status: "inactive"
                } 
            }
        );
        console.log(`Cleared locations for ${vendorResult.modifiedCount} vendors.`);

        console.log('\n--- CLEAN SWEEP COMPLETED ---');
        console.log('All Users and Vendors are now required to re-input their locations.');
        console.log('Vendors have been set to "inactive" until they update their profile.');
        
        process.exit(0);
    } catch (error) {
        console.error('Clear failed:', error);
        process.exit(1);
    }
}

clearAllLocations();
