import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import AppConfig from '../config/appConfig';
import OrderModel from '../api/models/Order';

async function runRepair() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(AppConfig.db.mongo_url);
        console.log("Connected successfully.");

        // Find orders missing transactionReference
        const orders = await OrderModel.find({ transactionReference: { $exists: false } });
        console.log(`Found ${orders.length} orders lacking transactionReference.`);

        if (orders.length === 0) {
            console.log("No orders need repair.");
            process.exit(0);
        }

        let updatedCount = 0;
        for (let i = 0; i < orders.length; i++) {
            try {
                // Generate a unique dummy reference to satisfy unique constraint
                // Format: REPAIR-[Timestamp]-[Index]
                const dummyRef = `REPAIR-${Date.now()}-${i + 1}`;
                
                await OrderModel.updateOne(
                    { _id: orders[i]._id },
                    { $set: { transactionReference: dummyRef } }
                );
                updatedCount++;
            } catch (err: any) {
                console.error(`Failed to update order ${orders[i]._id}: ${err.message}`);
            }
        }

        console.log(`Repair complete. Updated ${updatedCount} orders.`);
        process.exit(0);
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

runRepair();
