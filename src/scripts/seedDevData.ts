import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import AppConfig from '../config/appConfig';
import UserModel from '../api/models/User';
import VendorModel from '../api/models/Vendor';
import RiderModel from '../api/models/Rider';
import ProductModel from '../api/models/Product';
import CategoryModel from '../api/models/Category';
import MarketCategoryModel from '../api/models/MarketCategory';
import VehicleTypeModel from '../api/models/VehicleType';
import OrderModel from '../api/models/Order';
import DeliveryModel from '../api/models/Delivery';
import AdminModel from '../api/models/Admin';
import TransactionModel from '../api/models/Transaction';
import ReviewModel from '../api/models/Review';
import WalletModel from '../api/models/Wallet';
import PlatformRevenueModel from '../api/models/PlatformRevenue';
import PayoutModel from '../api/models/Payout';
import RefundModel from '../api/models/Refund';
import ComplaintModel from '../api/models/Complaint';
import BannerModel from '../api/models/Banner';
import PerformanceMetricsModel from '../api/models/PerformanceMetrics';
import CouponModel from '../api/models/Coupon';
import KycModel from '../api/models/Kyc';

const PW = 'password123';
const uid = () => Math.random().toString(36).substr(2, 8).toUpperCase();
const ref = () => `REF-${uid()}`;
const isoBack = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
};

// ─── helpers ───────────────────────────────────────────────────────────────────

async function createOrder(data: any) {
    const doc = new OrderModel({ ...data, status: 'pending' });
    await doc.save();
    if (data.status !== 'pending') {
        await OrderModel.updateOne({ _id: doc._id }, { status: data.status });
    }
    return doc;
}

async function createWallet(role: string, owner: any, available = 0, pending = 0) {
    const existing = await WalletModel.findOne({ owner });
    if (existing) {
        await WalletModel.updateOne({ _id: existing._id }, { availableBalance: available, pendingBalance: pending });
        return existing;
    }
    return WalletModel.create({ role, owner, availableBalance: available, pendingBalance: pending });
}

// ─── main ──────────────────────────────────────────────────────────────────────

const seed = async () => {
    try {
        console.log('🚀 Connecting to database...');
        await mongoose.connect(AppConfig.db.mongo_url);
        console.log('✅ Connected to MongoDB\n');

        // ── 1. CLEAN UP ──────────────────────────────────────────────────────
        console.log('🧹 Cleaning up old seed data...');
        const seedEmails = [
            'admin@nilab.com',
            'vendor_burger@nilab.com',
            'vendor_pizza@nilab.com',
            'vendor_drinks@nilab.com',
            'rider_jason@nilab.com',
            'rider_mark@nilab.com',
            'customer_alice@nilab.com',
            'customer_bob@nilab.com',
            'customer_carol@nilab.com'
        ];
        const oldUsers = await UserModel.find({ email: { $in: seedEmails } });
        const oldIds = oldUsers.map((u) => u._id);
        const oldAdminUsers = oldUsers.filter((u) => u.role === 'admin').map((u) => u._id);

        await AdminModel.deleteMany({ userId: { $in: oldAdminUsers } });
        await VendorModel.deleteMany({ userId: { $in: oldIds } });
        await RiderModel.deleteMany({ userId: { $in: oldIds } });
        await OrderModel.deleteMany({ user: { $in: oldIds } });
        await DeliveryModel.deleteMany({ order: { $in: [] } }); // cascade handled below
        await TransactionModel.deleteMany({ userId: { $in: oldIds } });
        await ReviewModel.deleteMany({ user: { $in: oldIds } });
        await WalletModel.deleteMany({ owner: { $in: oldIds } });
        await UserModel.deleteMany({ email: { $in: seedEmails } });
        await PlatformRevenueModel.deleteMany({});
        await PayoutModel.deleteMany({});
        await RefundModel.deleteMany({});
        await ComplaintModel.deleteMany({});
        await PerformanceMetricsModel.deleteMany({});
        await CouponModel.deleteMany({});
        await KycModel.deleteMany({});
        console.log('✅ Cleanup done\n');

        // ── 2. FOUNDATIONAL DATA ─────────────────────────────────────────────
        console.log('🏗️  Seeding foundational data...');

        // Market Categories
        let foodMkt = await MarketCategoryModel.findOne({ name: 'Food & Restaurants' });
        if (!foodMkt) {
            foodMkt = await MarketCategoryModel.create({
                name: 'Food & Restaurants',
                description: 'Order from the best local restaurants',
                thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500'
            });
        }
        let parcelMkt = await MarketCategoryModel.findOne({ name: 'Parcel Delivery' });
        if (!parcelMkt) {
            parcelMkt = await MarketCategoryModel.create({
                name: 'Parcel Delivery',
                description: 'Fast and safe package deliveries',
                thumbnail: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?w=500'
            });
        }

        // Categories
        const catNames = ['Burgers', 'Pizza', 'Drinks & Beverages', 'Chicken', 'Desserts'];
        const catMap: Record<string, any> = {};
        for (const name of catNames) {
            let cat = await CategoryModel.findOne({ name });
            if (!cat) cat = await CategoryModel.create({ name, description: name, status: 'active' });
            catMap[name] = cat;
        }

        // Vehicle Types
        let bikeType = await VehicleTypeModel.findOne({ slug: 'motorbike' });
        if (!bikeType) {
            bikeType = await VehicleTypeModel.create({ name: 'Motorbike', slug: 'motorbike', feePerKm: 150, icon: 'directions_bike', active: true });
        }
        let carType = await VehicleTypeModel.findOne({ slug: 'car' });
        if (!carType) {
            carType = await VehicleTypeModel.create({ name: 'Car', slug: 'car', feePerKm: 250, icon: 'directions_car', active: true });
        }

        console.log('✅ Foundational data OK\n');

        // ── 3. USERS ─────────────────────────────────────────────────────────
        console.log('👥 Seeding users...');

        const adminUser = await UserModel.create({ firstName: 'System', lastName: 'Admin', email: 'admin@nilab.com', password: PW, role: 'admin', phoneNumber: '08011111111', kycStatus: 'verified' });
        await AdminModel.create({ name: 'System Admin', role: 'admin', userId: adminUser._id, status: 'active', email: 'admin@nilab.com', phone: '08011111111' });

        const vendorUser1 = await UserModel.create({ firstName: 'Burger', lastName: 'Palace', email: 'vendor_burger@nilab.com', password: PW, role: 'vendor', phoneNumber: '08022222221', kycStatus: 'verified' });
        const vendorUser2 = await UserModel.create({ firstName: 'Pizza', lastName: 'Hub', email: 'vendor_pizza@nilab.com', password: PW, role: 'vendor', phoneNumber: '08022222222', kycStatus: 'verified' });
        const vendorUser3 = await UserModel.create({ firstName: 'Drinks', lastName: 'World', email: 'vendor_drinks@nilab.com', password: PW, role: 'vendor', phoneNumber: '08022222223', kycStatus: 'verified' });

        const riderUser1 = await UserModel.create({ firstName: 'Jason', lastName: 'Swift', email: 'rider_jason@nilab.com', password: PW, role: 'rider', phoneNumber: '08033333331', kycStatus: 'verified' });
        const riderUser2 = await UserModel.create({ firstName: 'Mark', lastName: 'Speed', email: 'rider_mark@nilab.com', password: PW, role: 'rider', phoneNumber: '08033333332', kycStatus: 'verified' });

        const custUser1 = await UserModel.create({ firstName: 'Alice', lastName: 'Johnson', email: 'customer_alice@nilab.com', password: PW, role: 'user', phoneNumber: '08044444441', kycStatus: 'verified', addresses: [{ label: 'Home', address: '123 VI Close', street: 'VI Close', city: 'Lagos', state: 'Lagos', coordinates: [3.4215, 6.4281], default: true }] });
        const custUser2 = await UserModel.create({ firstName: 'Bob', lastName: 'Williams', email: 'customer_bob@nilab.com', password: PW, role: 'user', phoneNumber: '08044444442', kycStatus: 'verified', addresses: [{ label: 'Office', address: '5 Marina Road', street: 'Marina Road', city: 'Lagos', state: 'Lagos', coordinates: [3.3958, 6.4531], default: true }] });
        const custUser3 = await UserModel.create({ firstName: 'Carol', lastName: 'Davis', email: 'customer_carol@nilab.com', password: PW, role: 'user', phoneNumber: '08044444443', kycStatus: 'verified' });

        // Wallets for customers and admin
        await createWallet('user', custUser1._id, 25000, 0);
        await createWallet('user', custUser2._id, 10000, 0);
        await createWallet('user', custUser3._id, 5000, 0);

        console.log('✅ Users & wallets OK\n');

        // ── 4. VENDORS & PRODUCTS ─────────────────────────────────────────────
        console.log('🍔 Seeding vendors & products...');

        // Vendor 1 – Burger Palace
        const vendor1 = await VendorModel.create({
            name: 'Burger Palace',
            email: 'info@burgerpalace.com',
            phoneNumber: '08022222221',
            userId: vendorUser1._id,
            marketCategoryId: foodMkt._id,
            categories: [catMap['Burgers']._id, catMap['Chicken']._id],
            description: 'The juiciest burgers in Lagos',
            location: { type: 'Point', coordinates: [3.4245, 6.4311], formattedAddress: '45 Burger Ave, VI, Lagos', street: 'Burger Ave', city: 'Lagos', state: 'Lagos' },
            status: 'active',
            isAvailable: true,
            acceptDelivery: true,
            ratings: 4.5
        });
        await createWallet('vendor', vendorUser1._id, 185000, 42000);

        const p_burger1 = await ProductModel.create({ name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, lettuce, tomato', price: 4500, vendor: vendor1._id, category: catMap['Burgers']._id, thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', stock: 50 });
        const p_burger2 = await ProductModel.create({ name: 'Double BBQ Burger', description: 'Two patties, BBQ sauce, crispy onions', price: 6500, vendor: vendor1._id, category: catMap['Burgers']._id, thumbnail: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500', stock: 30 });
        const p_burger3 = await ProductModel.create({ name: 'Spicy Chicken Burger', description: 'Crispy chicken, spicy mayo, pickles', price: 5000, vendor: vendor1._id, category: catMap['Chicken']._id, thumbnail: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500', stock: 40 });
        const p_burger4 = await ProductModel.create({ name: 'Chicken Strip Basket', description: '6 crispy strips with dipping sauce', price: 3500, vendor: vendor1._id, category: catMap['Chicken']._id, thumbnail: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=500', stock: 60 });

        // Vendor 2 – Pizza Hub
        const vendor2 = await VendorModel.create({
            name: 'Pizza Hub',
            email: 'info@pizzahub.com',
            phoneNumber: '08022222222',
            userId: vendorUser2._id,
            marketCategoryId: foodMkt._id,
            categories: [catMap['Pizza']._id, catMap['Drinks & Beverages']._id],
            description: 'Wood-fired pizzas delivered fresh',
            location: { type: 'Point', coordinates: [3.3980, 6.4550], formattedAddress: '12 Marina Drive, Lagos', street: 'Marina Drive', city: 'Lagos', state: 'Lagos' },
            status: 'active',
            isAvailable: true,
            acceptDelivery: true,
            ratings: 4.2
        });
        await createWallet('vendor', vendorUser2._id, 97000, 18000);

        const p_pizza1 = await ProductModel.create({ name: 'Margherita Pizza', description: 'Tomato, mozzarella, fresh basil', price: 7500, vendor: vendor2._id, category: catMap['Pizza']._id, thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500', stock: 20 });
        const p_pizza2 = await ProductModel.create({ name: 'Pepperoni Feast', description: 'Double pepperoni, cheese blend', price: 9000, vendor: vendor2._id, category: catMap['Pizza']._id, thumbnail: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500', stock: 15 });

        // Vendor 3 – Drinks World
        const vendor3 = await VendorModel.create({
            name: 'Drinks World',
            email: 'info@drinksworld.com',
            phoneNumber: '08022222223',
            userId: vendorUser3._id,
            marketCategoryId: foodMkt._id,
            categories: [catMap['Drinks & Beverages']._id, catMap['Desserts']._id],
            description: 'Refreshing beverages and sweet treats',
            location: { type: 'Point', coordinates: [3.4100, 6.4400], formattedAddress: '8 Island Close, Lagos', street: 'Island Close', city: 'Lagos', state: 'Lagos' },
            status: 'active',
            isAvailable: true,
            acceptDelivery: true,
            ratings: 4.0
        });
        await createWallet('vendor', vendorUser3._id, 43000, 5000);

        const p_drink1 = await ProductModel.create({ name: 'Tropical Smoothie', description: 'Mango, pineapple, coconut', price: 2500, vendor: vendor3._id, category: catMap['Drinks & Beverages']._id, thumbnail: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', stock: 100 });
        const p_dessert1 = await ProductModel.create({ name: 'Chocolate Lava Cake', description: 'Warm chocolate cake, molten centre', price: 3000, vendor: vendor3._id, category: catMap['Desserts']._id, thumbnail: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', stock: 25 });

        console.log('✅ Vendors & products OK\n');

        // ── 5. RIDERS ─────────────────────────────────────────────────────────
        console.log('🏍️  Seeding riders...');

        const rider1 = await RiderModel.create({ userId: riderUser1._id, vehicleTypeId: bikeType._id, name: 'Jason Swift', email: 'rider_jason@nilab.com', phoneNumber: '08033333331', state: 'Lagos', city: 'Lagos', gender: 'male', status: 'verified', available: true, ratings: 4.7 });
        await createWallet('rider', riderUser1._id, 38000, 0);

        const rider2 = await RiderModel.create({ userId: riderUser2._id, vehicleTypeId: carType._id, name: 'Mark Speed', email: 'rider_mark@nilab.com', phoneNumber: '08033333332', state: 'Lagos', city: 'Lagos', gender: 'male', status: 'verified', available: true, ratings: 4.3 });
        await createWallet('rider', riderUser2._id, 21000, 0);

        console.log('✅ Riders OK\n');

        // ── 6. ORDERS + DELIVERIES + TRANSACTIONS ─────────────────────────────
        console.log('📦 Seeding orders, deliveries & transactions...');

        const pickupV1 = { street: 'Burger Ave', city: 'Lagos', state: 'Lagos', coordinates: [3.4245, 6.4311], label: 'Burger Palace' };
        const pickupV2 = { street: 'Marina Drive', city: 'Lagos', state: 'Lagos', coordinates: [3.398, 6.455], label: 'Pizza Hub' };
        const destAlice = { street: 'VI Close', city: 'Lagos', state: 'Lagos', coordinates: [3.4215, 6.4281], label: 'Alice Home' };
        const destBob = { street: 'Marina Road', city: 'Lagos', state: 'Lagos', coordinates: [3.3958, 6.4531], label: 'Bob Office' };
        const destCarol = { street: 'Surulere Way', city: 'Lagos', state: 'Lagos', coordinates: [3.3580, 6.5050], label: 'Carol Home' };

        // helper to create a delivery alongside a completed order
        const addDelivery = async (order: any, rider: any, imageUrl: string, notes: string, daysAgo: number) => {
            const ts = isoBack(daysAgo);
            return DeliveryModel.create({
                order: order._id,
                rider: rider._id,
                status: 'delivered',
                deliveryCode: order.code,
                deliveryFee: order.deliveryFee,
                pickup: order.pickup,
                destination: order.destination,
                receiverDetails: { name: 'Customer', contactNumber: '08044444441' },
                senderDetails: { name: 'NiLab Vendor', contactNumber: '08022222221' },
                deliveryImage: imageUrl,
                customerSignature: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
                deliveryNotes: notes,
                createdAt: ts,
                updatedAt: ts
            });
        };

        const addTx = async (userId: any, orderId: any, amount: number, type: 'CREDIT' | 'DEBIT', category: string, role: string, daysAgo: number) => {
            const ts = isoBack(daysAgo);
            return TransactionModel.create({
                userId,
                order: orderId,
                amount,
                type,
                category,
                role,
                reference: ref(),
                status: 'successful',
                remark: `${category} transaction for order`,
                balanceBefore: 0,
                balanceAfter: amount,
                createdAt: ts,
                updatedAt: ts
            });
        };

        // ── COMPLETED ORDERS (historical, across last 30 days) ─────────────────

        // Order A – Alice at Burger Palace, delivered 28 days ago
        const orderA = await createOrder({ user: custUser1._id, vendor: vendor1._id, rider: riderUser1._id, code: `ORD-${uid()}`, orderType: 'products', paymentType: 'wallet', paymentCompleted: true, amount: 11000, totalAmount: 12500, deliveryFee: 1000, serviceFee: 500, vat: 0, status: 'delivered', completed: true, pickupLocation: [3.4245, 6.4311], deliveryLocation: [3.4215, 6.4281], pickup: pickupV1, destination: destAlice, products: [{ product: p_burger1._id, name: p_burger1.name, quantity: 1, price: 4500, category: 'Burgers' }, { product: p_burger2._id, name: p_burger2.name, quantity: 1, price: 6500, category: 'Burgers' }], createdAt: isoBack(28), updatedAt: isoBack(28) });
        await addDelivery(orderA, rider1, 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?w=800', 'Delivered to gate. Customer confirmed.', 28);
        await addTx(custUser1._id, orderA._id, 12500, 'DEBIT', 'ORDER', 'user', 28);
        await addTx(vendorUser1._id, orderA._id, 9625, 'CREDIT', 'SETTLEMENT', 'vendor', 27);
        await addTx(riderUser1._id, orderA._id, 1000, 'CREDIT', 'DELIVERY', 'rider', 27);

        // Order B – Bob at Pizza Hub, delivered 21 days ago
        const orderB = await createOrder({ user: custUser2._id, vendor: vendor2._id, rider: riderUser2._id, code: `ORD-${uid()}`, orderType: 'products', paymentType: 'card', paymentCompleted: true, amount: 16500, totalAmount: 18000, deliveryFee: 1000, serviceFee: 500, vat: 0, status: 'delivered', completed: true, pickupLocation: [3.398, 6.455], deliveryLocation: [3.3958, 6.4531], pickup: pickupV2, destination: destBob, products: [{ product: p_pizza1._id, name: p_pizza1.name, quantity: 1, price: 7500, category: 'Pizza' }, { product: p_pizza2._id, name: p_pizza2.name, quantity: 1, price: 9000, category: 'Pizza' }], createdAt: isoBack(21), updatedAt: isoBack(21) });
        await addDelivery(orderB, rider2, 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800', 'Left at reception. Signed by security.', 21);
        await addTx(custUser2._id, orderB._id, 18000, 'DEBIT', 'ORDER', 'user', 21);
        await addTx(vendorUser2._id, orderB._id, 13695, 'CREDIT', 'SETTLEMENT', 'vendor', 20);
        await addTx(riderUser2._id, orderB._id, 1000, 'CREDIT', 'DELIVERY', 'rider', 20);

        // Order C – Alice at Burger Palace, delivered 14 days ago
        const orderC = await createOrder({ user: custUser1._id, vendor: vendor1._id, rider: riderUser1._id, code: `ORD-${uid()}`, orderType: 'products', paymentType: 'wallet', paymentCompleted: true, amount: 8500, totalAmount: 10000, deliveryFee: 1000, serviceFee: 500, vat: 0, status: 'delivered', completed: true, pickupLocation: [3.4245, 6.4311], deliveryLocation: [3.4215, 6.4281], pickup: pickupV1, destination: destAlice, products: [{ product: p_burger3._id, name: p_burger3.name, quantity: 1, price: 5000, category: 'Chicken' }, { product: p_burger4._id, name: p_burger4.name, quantity: 1, price: 3500, category: 'Chicken' }], createdAt: isoBack(14), updatedAt: isoBack(14) });
        await addDelivery(orderC, rider1, 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800', 'Customer met at the door. Quick delivery!', 14);
        await addTx(custUser1._id, orderC._id, 10000, 'DEBIT', 'ORDER', 'user', 14);
        await addTx(vendorUser1._id, orderC._id, 7225, 'CREDIT', 'SETTLEMENT', 'vendor', 13);
        await addTx(riderUser1._id, orderC._id, 1000, 'CREDIT', 'DELIVERY', 'rider', 13);

        // Order D – Carol at Drinks World, 7 days ago
        const orderD = await createOrder({ user: custUser3._id, vendor: vendor3._id, rider: riderUser2._id, code: `ORD-${uid()}`, orderType: 'products', paymentType: 'cash', paymentCompleted: true, amount: 5500, totalAmount: 7000, deliveryFee: 1000, serviceFee: 500, vat: 0, status: 'delivered', completed: true, pickupLocation: [3.41, 6.44], deliveryLocation: [3.358, 6.505], pickup: { street: 'Island Close', city: 'Lagos', state: 'Lagos', coordinates: [3.41, 6.44] }, destination: destCarol, products: [{ product: p_drink1._id, name: p_drink1.name, quantity: 1, price: 2500, category: 'Drinks' }, { product: p_dessert1._id, name: p_dessert1.name, quantity: 1, price: 3000, category: 'Desserts' }], createdAt: isoBack(7), updatedAt: isoBack(7) });
        await addDelivery(orderD, rider2, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800', 'Left with neighbor. Called customer to confirm.', 7);
        await addTx(custUser3._id, orderD._id, 7000, 'DEBIT', 'ORDER', 'user', 7);
        await addTx(vendorUser3._id, orderD._id, 4675, 'CREDIT', 'SETTLEMENT', 'vendor', 6);
        await addTx(riderUser2._id, orderD._id, 1000, 'CREDIT', 'DELIVERY', 'rider', 6);

        // Order E – Package delivery (Alice to Carol), 10 days ago
        const orderE = await createOrder({ user: custUser1._id, rider: riderUser1._id, code: `PKG-${uid()}`, orderType: 'package', package: { description: 'Legal Documents', weight: 1.2, size: 'small', isFragile: false }, paymentType: 'wallet', paymentCompleted: true, amount: 3000, totalAmount: 3500, deliveryFee: 3000, serviceFee: 500, vat: 0, status: 'delivered', completed: true, pickupLocation: [3.4215, 6.4281], deliveryLocation: [3.358, 6.505], pickup: destAlice, destination: destCarol, createdAt: isoBack(10), updatedAt: isoBack(10) });
        await addDelivery(orderE, rider1, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800', 'Recipient signed. Documents intact.', 10);
        await addTx(custUser1._id, orderE._id, 3500, 'DEBIT', 'PACKAGE', 'user', 10);
        await addTx(riderUser1._id, orderE._id, 3000, 'CREDIT', 'DELIVERY', 'rider', 9);

        // ── ACTIVE / IN-PROGRESS ORDERS ─────────────────────────────────────

        // Order F – Bob at Burger Palace, preparing now
        const orderF = await createOrder({ user: custUser2._id, vendor: vendor1._id, code: `ORD-${uid()}`, orderType: 'products', paymentType: 'wallet', paymentCompleted: true, amount: 9000, totalAmount: 10500, deliveryFee: 1000, serviceFee: 500, vat: 0, status: 'preparing', pickupLocation: [3.4245, 6.4311], deliveryLocation: [3.3958, 6.4531], pickup: pickupV1, destination: destBob, products: [{ product: p_burger2._id, name: p_burger2.name, quantity: 1, price: 6500, category: 'Burgers' }, { product: p_burger4._id, name: p_burger4.name, quantity: 1, price: 3500, category: 'Chicken' }] });
        await DeliveryModel.create({ order: orderF._id, status: 'pending', deliveryCode: orderF.code, deliveryFee: 1000, pickup: pickupV1, destination: destBob, receiverDetails: { name: 'Bob Williams', contactNumber: '08044444442' }, senderDetails: { name: 'Burger Palace', contactNumber: '08022222221' } });

        // Order G – Alice at Pizza Hub, prepared (waiting for rider)
        const orderG = await createOrder({ user: custUser1._id, vendor: vendor2._id, code: `ORD-${uid()}`, orderType: 'products', paymentType: 'card', paymentCompleted: true, amount: 7500, totalAmount: 9000, deliveryFee: 1000, serviceFee: 500, vat: 0, status: 'prepared', pickupLocation: [3.398, 6.455], deliveryLocation: [3.4215, 6.4281], pickup: pickupV2, destination: destAlice, products: [{ product: p_pizza1._id, name: p_pizza1.name, quantity: 1, price: 7500, category: 'Pizza' }] });
        await DeliveryModel.create({ order: orderG._id, status: 'pending', deliveryCode: orderG.code, deliveryFee: 1000, pickup: pickupV2, destination: destAlice, receiverDetails: { name: 'Alice Johnson', contactNumber: '08044444441' }, senderDetails: { name: 'Pizza Hub', contactNumber: '08022222222' } });

        // Order H – Carol, package dispatched (in transit with rider)
        const orderH = await createOrder({ user: custUser3._id, rider: riderUser2._id, code: `PKG-${uid()}`, orderType: 'package', package: { description: 'Gift Box – Fragile!', weight: 2.0, size: 'medium', isFragile: true }, paymentType: 'cash', paymentCompleted: false, amount: 4500, totalAmount: 5000, deliveryFee: 4500, serviceFee: 500, vat: 0, status: 'dispatched', pickupLocation: [3.41, 6.44], deliveryLocation: [3.358, 6.505], pickup: { street: 'Island Close', city: 'Lagos', state: 'Lagos', coordinates: [3.41, 6.44] }, destination: destCarol });
        await DeliveryModel.create({ order: orderH._id, rider: rider2._id, status: 'in-transit', deliveryCode: orderH.code, deliveryFee: 4500, pickup: { street: 'Island Close', city: 'Lagos', state: 'Lagos', coordinates: [3.41, 6.44] }, destination: destCarol, receiverDetails: { name: 'Carol Davis', contactNumber: '08044444443' }, senderDetails: { name: 'Sender', contactNumber: '08099999999' } });

        // Order I – pending, not yet accepted
        await createOrder({ user: custUser2._id, vendor: vendor1._id, code: `ORD-${uid()}`, orderType: 'products', paymentType: 'wallet', paymentCompleted: true, amount: 4500, totalAmount: 6000, deliveryFee: 1000, serviceFee: 500, vat: 0, status: 'pending', pickupLocation: [3.4245, 6.4311], deliveryLocation: [3.3958, 6.4531], pickup: pickupV1, destination: destBob, products: [{ product: p_burger1._id, name: p_burger1.name, quantity: 1, price: 4500, category: 'Burgers' }] });

        // Order J – canceled order (Alice)
        const orderJ = await createOrder({ user: custUser1._id, vendor: vendor2._id, code: `ORD-${uid()}`, orderType: 'products', paymentType: 'card', paymentCompleted: false, amount: 9000, totalAmount: 10500, deliveryFee: 1000, serviceFee: 500, vat: 0, status: 'canceled', canceledReason: 'Customer changed mind', pickupLocation: [3.398, 6.455], deliveryLocation: [3.4215, 6.4281], pickup: pickupV2, destination: destAlice, products: [{ product: p_pizza2._id, name: p_pizza2.name, quantity: 1, price: 9000, category: 'Pizza' }], createdAt: isoBack(5), updatedAt: isoBack(5) });

        console.log('✅ Orders, deliveries & transactions OK\n');

        // ── 7. REVIEWS ────────────────────────────────────────────────────────
        console.log('⭐ Seeding reviews...');

        // Use insertMany with ordered:false so duplicate-key errors are skipped gracefully
        // (The schema has a unique index on {orderId, user} — rider reviews with no orderId would collide)
        await ReviewModel.collection.insertMany([
            { user: custUser1._id, vendor: vendor1._id, order: orderA._id, rating: 5, comment: 'Absolutely amazing burgers! Will order again.', createdAt: isoBack(27), updatedAt: isoBack(27) },
            { user: custUser2._id, vendor: vendor2._id, order: orderB._id, rating: 4, comment: 'Great pizza, but delivery was a bit slow.', createdAt: isoBack(20), updatedAt: isoBack(20) },
            { user: custUser1._id, vendor: vendor1._id, order: orderC._id, rating: 5, comment: 'Best chicken burger in Lagos, no contest.', createdAt: isoBack(13), updatedAt: isoBack(13) },
            { user: custUser1._id, rider: rider1._id, order: orderE._id, rating: 5, comment: 'Jason was super fast and friendly!', createdAt: isoBack(9), updatedAt: isoBack(9) },
            { user: custUser2._id, rider: rider2._id, order: orderB._id, rating: 4, comment: 'Mark was polite and careful with the food.', createdAt: isoBack(20), updatedAt: isoBack(20) }
        ], { ordered: false }).catch((e: any) => {
            if (e.code !== 11000) throw e;
            console.log('   ⚠️  Some duplicate reviews skipped (expected on re-seed)');
        });

        console.log('✅ Reviews OK\n');

        // ── 8. BANNER, PLATFORM REVENUE, PAYOUTS, REFUNDS, KYC, COMPLAINTS ───
        console.log('📊 Seeding operational & dashboard models...');

        // KYC
        await KycModel.create({
            user: vendorUser1._id, role: 'vendor', status: 'verified',
            address: { address: '45 Burger Ave', status: 'verified', message: '' } as any,
            identity: { identityType: 'nin', status: 'verified', message: '' } as any,
            nextOfKin: { status: 'verified', message: '', phone: '', address: '', name: '' } as any,
            guarantor: { status: 'verified', message: '', phone: '', address: '', name: '', identityDocument: '' } as any
        });

        // Banners
        let b1 = await BannerModel.findOne({ name: 'Welcome Banner' });
        if (!b1) await BannerModel.create({ name: 'Welcome Banner', image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800', type: 'home_top', status: 'active' });

        // Platform Revenue (for the completed orders)
        await PlatformRevenueModel.create({
            reference: ref(), sourceType: 'ORDER', sourceId: orderA._id,
            grossAmount: 12500, commissionRate: 10, commissionAmount: 1250, netAmount: 11250,
            payer: custUser1._id, payee: vendorUser1._id, status: 'SETTLED'
        });

        // Payouts
        const vendor1Wallet = await WalletModel.findOne({ owner: vendorUser1._id });
        if(vendor1Wallet) {
            await PayoutModel.create({
                amount: 50000, status: 'completed', userId: vendorUser1._id, walletId: vendor1Wallet._id,
                bankName: 'GTBank', accountNumber: '0123456789', accountName: 'Burger Palace'
            });
        }

        // Refunds
        await RefundModel.create({
            orderId: orderJ._id, userId: custUser1._id, vendorId: vendor2._id, amount: 10500, 
            refundType: 'full', reason: 'order_canceled', status: 'completed', initiatedBy: 'admin', 
            paymentReference: ref(), refundReference: ref(), requestedAt: Date.now()
        });

        // Complaints
        await ComplaintModel.create({
            user: custUser2._id, order: orderB._id, category: 'late_delivery', subject: 'Food was cold',
            description: 'The delivery took too long and the pizza was mostly cold.', status: 'open', priority: 'medium'
        });

        // Performance Metrics
        await PerformanceMetricsModel.create({ riderId: rider1._id, deliveryTime: 18, acceptanceRate: 95 });

        // Coupons
        await CouponModel.create({
            vendor: vendor1._id, user: custUser1._id, title: 'Welcome 10%', code: 'WELCOME10', 
            discountType: 'percentage', discountPercentage: 10, expiresOn: new Date(Date.now() + 86400000 * 30), isActive: true
        });

        console.log('✅ Operational models OK\n');


        // ── SUMMARY ──────────────────────────────────────────────────────────
        console.log('\n✨ ═══════════ SEEDING COMPLETE ═══════════ ✨');
        console.log('  Login credentials (all use password: password123)\n');
        console.log('  ADMIN     → admin@nilab.com');
        console.log('  VENDORS   → vendor_burger@nilab.com');
        console.log('            → vendor_pizza@nilab.com');
        console.log('            → vendor_drinks@nilab.com');
        console.log('  RIDERS    → rider_jason@nilab.com');
        console.log('            → rider_mark@nilab.com');
        console.log('  CUSTOMERS → customer_alice@nilab.com');
        console.log('            → customer_bob@nilab.com');
        console.log('            → customer_carol@nilab.com');
        console.log('\n  DATA SEEDED:');
        console.log('  • 3 Market Categories, 5 Product Categories, 2 Vehicle Types');
        console.log('  • 3 Vendors with 8 products total');
        console.log('  • 2 Riders with wallets');
        console.log('  • 10 Orders (5 delivered, 3 in-progress, 1 pending, 1 canceled)');
        console.log('  • Deliveries with POD photos & signatures for all completed orders');
        console.log('  • Transactions (DEBIT/CREDIT/SETTLEMENT/DELIVERY) for all orders');
        console.log('  • 5 Reviews (vendor & rider)');
        console.log('  • Wallets with realistic balances for all users');
        console.log('  • Banners, Platform Revenue, Payouts, Refunds, KYC, Complaints, PerformanceMetrics, Coupons');
        console.log('══════════════════════════════════════════════\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ SEEDING FAILED:', err);
        process.exit(1);
    }
};

seed();
