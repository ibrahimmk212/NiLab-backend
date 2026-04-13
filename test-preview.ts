import mongoose from 'mongoose';
import OrderService from './src/api/services/OrderService';

async function test() {
    const mongoUrl = 'mongodb+srv://ibrahimmk212:1234567812345678@cluster0.usyizql.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUrl);
    console.log("Connected to DB");

    const sampleOrder = {
        vendor: "69234dc3a53c960e496eb7fb",
        user: "6923094fd3ee05fba6dc4790",
        addressId: "69271d43193d7bcabc157825",
        products: [
            {
                product: "6925ebcff1c338d7485b0766",
                quantity: 2
            }
        ]
    };

    try {
        const preview = await OrderService.previewOrder(sampleOrder);
        console.log("Preview Result:", JSON.stringify(preview, null, 2));
    } catch (err: any) {
        console.error("Preview Failed:", err.message);
    }

    process.exit();
}

test();
