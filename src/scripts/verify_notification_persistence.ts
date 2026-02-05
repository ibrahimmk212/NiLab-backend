
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../database';
import NotificationService from '../api/services/NotificationService';
import NotificationModel from '../api/models/Notification';
import { generateShortCode } from '../utils/keygen/idGenerator'; 
// Assuming helper exists, if not I'll just use random string

const verifyPersistence = async () => {
    console.log('1. Connecting to Database...');
    await connectDB();
    
    // Wait for connection to be ready (connectDB is async but doesn't return the promise of connection state immediately in some patterns, but here it returns void and handles promise internally. 
    // However, mongoose.connect is async. The export connectDB calls it. 
    // Let's rely on mongoose.connection.once('open') or just wait a bit if needed, but usually awaiting the connect call in index.ts would be better if it returned the promise.
    // Looking at src/database/index.ts: it returns void. 
    // So we might need to wait or modify connectDB to return promise, OR just await mongoose.connect directly if we had config.
    // Actually, `connectDB` imports AppConfig. Let's just trust it connects or wait 2s.
    
    // Better: let's duplicate connection logic for reliable script execution or checking mongoose.connection.readyState
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (mongoose.connection.readyState !== 1) {
        console.log('Database not connected yet, waiting...');
        await new Promise(resolve => mongoose.connection.once('open', resolve));
    }
    console.log('Database Connected.');

    const testId = new mongoose.Types.ObjectId();
    const testTitle = `Test Notification ${Date.now()}`;
    const testMessage = 'This is a verification message to ensure persistence.';

    console.log('2. Creating Test Notification...');
    try {
        const created = await NotificationService.create({
            userId: testId, // using random ID
            title: testTitle,
            message: testMessage,
            status: 'unread'
        });
        console.log('Notification Created via Service:', created._id);

        console.log('3. Verifying in Database Direct Query...');
        const found = await NotificationModel.findById(created._id);
        
        if (found) {
            console.log('SUCCESS: Notification found directly in MongoDB!');
            console.log('Data:', found.toJSON());
            
            if (found.title === testTitle) {
                console.log('Data Integrity Check: PASSED');
            } else {
                console.error('Data Integrity Check: FAILED (Title mismatch)');
            }

            // Cleanup
            console.log('4. Cleaning up...');
            await NotificationModel.findByIdAndDelete(created._id);
            console.log('Test record deleted.');
        } else {
            console.error('FAILURE: Notification NOT found in database!');
        }

    } catch (error) {
        console.error('Test Failed with Error:', error);
    } finally {
        console.log('Closing Connection...');
        await mongoose.connection.close();
        process.exit(0);
    }
};

verifyPersistence();
