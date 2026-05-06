import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import UserModel from '../api/models/User';
import AdminModel from '../api/models/Admin';
import AppConfig from '../config/appConfig';

const initializeSuperAdmin = async () => {
    try {
        // 1. Connect to Database
        console.log('🔌 Connecting to database...');
        await mongoose.connect(AppConfig.db.mongo_url);

        const adminEmail = 'admin@terminusdrive.com';
        const defaultPassword = '4dm1n01'; // User should change this immediately

        console.log(`🚀 Initializing Super Admin: ${adminEmail}`);

        // 2. Find or Create User
        let user = await UserModel.findOne({ email: adminEmail });

        if (!user) {
            console.log('✨ Creating new User record...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(defaultPassword, salt);

            user = await UserModel.create({
                firstName: 'System',
                lastName: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                phoneNumber: '08011111111',
                role: 'admin',
                kycStatus: 'verified',
                status: 'active',
                isBanned: false,
                mustChangePassword: false
            });
        } else {
            console.log('🔄 Updating existing User record...');
            user.firstName = 'System';
            user.lastName = 'Admin';
            user.phoneNumber = '08011111111';
            user.role = 'admin';
            user.kycStatus = 'verified';
            user.status = 'active';
            user.isBanned = false;
            await user.save();
        }

        // 3. Find or Create Admin Record
        let admin = await AdminModel.findOne({ userId: user._id });

        if (!admin) {
            console.log('✨ Creating new Admin record...');
            admin = await AdminModel.create({
                name: 'System Admin',
                role: 'superadmin',
                email: adminEmail,
                phone: '08011111111',
                userId: user._id,
                status: 'active',
                permissions: [] // admin@nilab.com has universal permissions via middleware bypass
            });
        } else {
            console.log('🔄 Updating existing Admin record...');
            admin.name = 'System Admin';
            admin.role = 'superadmin';
            admin.email = adminEmail;
            admin.phone = '08011111111';
            admin.status = 'active';
            // We keep existing permissions if any, or reset to empty since it's a superadmin
            admin.permissions = [];
            await admin.save();
        }

        console.log('✅ Super Admin initialization complete!');
        console.log('-----------------------------------');
        console.log(`User ID: ${user._id}`);
        console.log(`Admin ID: ${admin._id}`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Role: superadmin`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
};

initializeSuperAdmin();
