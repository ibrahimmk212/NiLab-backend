import mongoose, { Document, Schema } from 'mongoose';

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
}
export interface Vendor extends Document {
    name: string;
    address: string;
    description: string;
    userId: mongoose.Types.ObjectId;
    email: string;
    phone: string;
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
        description: { type: String, required: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
        phone: { type: String, required: true },
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
        bankAccount: { type: Map, required: false, default: null },
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

const VendorModel = mongoose.model<Vendor>('Vendor', vendorSchema);

// VendorModel.ensureIndexes();

export default VendorModel;
