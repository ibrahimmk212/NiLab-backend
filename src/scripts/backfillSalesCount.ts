import mongoose from 'mongoose';
import OrderModel from '../api/models/Order';
import ProductModel from '../api/models/Product';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('Failed to load .env file:', result.error);
}

const backfillSalesCount = async () => {
    try {
        const mongoUri = process.env.MONGO_URL || 'mongodb://localhost:27017/terminus';
        console.log(`Connecting to: ${mongoUri.substring(0, 20)}...`);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        console.log('Fetching all delivered orders...');
        const orders = await OrderModel.find({ status: 'delivered' });
        console.log(`Found ${orders.length} delivered orders.`);

        const productSales: Record<string, number> = {};

        // Aggregate sales
        for (const order of orders) {
            for (const item of order.products) {
                const productId = item.product.toString();
                productSales[productId] = (productSales[productId] || 0) + (item.quantity || 0);
            }
        }

        const productIds = Object.keys(productSales);
        console.log(`Updating ${productIds.length} products...`);

        let updatedCount = 0;
        for (const productId of productIds) {
            const count = productSales[productId];
            await ProductModel.findByIdAndUpdate(productId, { salesCount: count });
            updatedCount++;
            if (updatedCount % 10 === 0) console.log(`Updated ${updatedCount} products...`);
        }

        console.log('Backfill completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Backfill failed:', error);
        process.exit(1);
    }
};

backfillSalesCount();
