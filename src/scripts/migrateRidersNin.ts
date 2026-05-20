import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import AppConfig from '../config/appConfig';
import RiderModel from '../api/models/Rider';
import KycModel from '../api/models/Kyc';

async function migrateRidersNin() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(AppConfig.db.mongo_url);
        console.log('Database connected successfully.');

        const riders = await RiderModel.find({});
        console.log(`Found ${riders.length} riders to check.`);

        let createdCount = 0;
        let updatedCount = 0;

        for (const rider of riders) {
            if (!rider.userId) {
                console.log(`Rider ${rider._id} has no userId, skipping.`);
                continue;
            }

            const kyc = await KycModel.findOne({ user: rider.userId, role: 'rider' });

            if (!kyc) {
                // Create a default KYC record with NIN "00000000000"
                await KycModel.create({
                    user: rider.userId,
                    role: 'rider',
                    nin: { nin: '00000000000' },
                    ninStatus: 'not_submitted',
                    status: 'not_submitted'
                });
                createdCount++;
                console.log(`Created default KYC with NIN for rider userId: ${rider.userId}`);
            } else if (!kyc.nin || !kyc.nin.nin) {
                // Kyc exists, but NIN is missing/empty. Update it.
                kyc.nin = { nin: '00000000000' };
                if (kyc.ninStatus === 'not_submitted' || !kyc.ninStatus) {
                    kyc.ninStatus = 'not_submitted';
                }
                await kyc.save();
                updatedCount++;
                console.log(`Updated existing KYC with default NIN for rider userId: ${rider.userId}`);
            }
        }

        console.log(`Migration finished! Created: ${createdCount}, Updated: ${updatedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateRidersNin();
