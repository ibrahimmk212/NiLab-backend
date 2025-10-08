import mongoose, { Document, Schema } from 'mongoose';
import WalletService from '../services/WalletService';

interface Location {
    type: string;
    coordinates: number[];
    formattedAddress: string;
    street: string;
    city: string;
    state: string;
    zipcode: string;
}

export interface BankAccount {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
}
export interface Vendor extends Document {
    name: string;
    address: string;
    state: string;
    lga: string;
    description: string;
    userId: mongoose.Types.ObjectId;
    marketCategoryId: mongoose.Types.ObjectId;
    email: string;
    phoneNumber: string;
    ratings: number;
    categories: [];
    logo: string;
    banner: string;
    location: Location;
    bankAccount?: BankAccount;
    acceptDelivery: boolean;
    openingHour: string;
    closingHour: string;
    isAvailable: boolean;
    averageReadyTime: number | string;
    status: string;
}

const vendorSchema = new Schema<Vendor>(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        state: { type: String, required: true },
        lga: { type: String, required: true },
        description: { type: String, required: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        marketCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'MarketCategory',
            required: true
        },
        email: {
            type: String,
            required: [true, 'email is required'],
            unique: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Enter a valid email address'
            ]
        },
        categories: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Category',
                required: true
            }
        ],
        phoneNumber: { type: String, required: true },
        ratings: { type: Number, default: 0 },
        logo: { type: String },
        banner: { type: String },
        location: {
            // GeoJSON Point
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], index: '2dsphere' }, // [longitude, latitude]
            formattedAddress: String,
            street: String,
            city: String,
            state: String,
            zipcode: String
        },
        openingHour: { type: String, required: true, default: '09:30' },
        closingHour: { type: String, required: true, default: '18:00' },
        isAvailable: { type: Boolean, required: true, default: false },
        averageReadyTime: { type: Number, required: true, default: 54000000 }, // 15 minutes default
        acceptDelivery: { type: Boolean, required: true, default: false },
        bankAccount: {
            accountName: String,
            accountNumber: String,
            bankName: String,
            bankCode: String
        },
        // lat: { type: Number },
        // lng: { type: Number },
        status: { type: String, required: false, default: 'inactive' }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

// reverse populate orders
vendorSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: false
});

// reverse populate products
vendorSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'vendor',
    justOne: false
});

// reverse populate reviews
vendorSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: false
});

// reverse populate transactions
vendorSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: false
});

// reverse populate staffs
vendorSchema.virtual('staffs', {
    ref: 'Staff',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: false
});

// reverse populate Market Category
vendorSchema.virtual('marketCategory', {
    ref: 'MarketCategory',
    localField: 'marketCategoryId',
    foreignField: '_id',
    justOne: true
});

vendorSchema.post('save', async function (vendor) {
    try {
        if (vendor.isNew) {
            await WalletService.createWallet({
                role: 'vendor',
                owner: vendor.id
            });
        }
    } catch (error: any) {
        console.log(`Wallet not created: ${error.message}`);
    }
});

vendorSchema.index({ name: 'text', description: 'text' });

const VendorModel = mongoose.model<Vendor>('Vendor', vendorSchema);

// VendorModel.ensureIndexes();

export default VendorModel;
