import mongoose from 'mongoose';
import VendorModel from '../api/models/Vendor';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/ibrahim/Desktop/projects/terminus/NiLab-backend/.env' });

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
    const vendor = await VendorModel.findOne({ email: 'vendor_burger@nilab.com' });
    console.log(JSON.stringify(vendor, null, 2));
    process.exit(0);
});
