// import mongoose, { Document, Schema } from 'mongoose';

// export interface IState {
//     name: string;
//     slug: string;
//     coordinates: number[];
// }
// export interface ICity {
//     name: string;
//     slug: string;
//     coordinates: number[];
//     state: string;
// }
// export interface Configuration extends Document {
//     nearbyDistance: number;
//     serviceFee: number;
//     maxServiceFee: number;
//     packageDeliveryCommision: number;
//     maxPackageDeliveryCommision: number;
//     payOnDeliveryDiscount: number;
//     vatRate: number;
//     deliveryFee: number;
//     maxDeliveryFee: number;
//     serviceStates: IState[];
//     serviceCities: ICity[];
// }

// const configurationSchema = new Schema<Configuration>(
//     {
//         nearbyDistance: { type: Number, required: false, default: 2000 },
//         serviceFee: { type: Number, required: false, default: 100 },
//         maxServiceFee: { type: Number, required: false, default: 100 },
//         vatRate: { type: Number, required: false, default: 1.5 },
//         packageDeliveryCommision: {
//             type: Number,
//             required: false,
//             default: 40
//         },
//         maxPackageDeliveryCommision: {
//             type: Number,
//             required: false,
//             default: 500
//         },
//         deliveryFee: { type: Number, required: false, default: 40 },
//         maxDeliveryFee: { type: Number, required: false, default: 500 },
//         payOnDeliveryDiscount: { type: Number, required: false, default: 2 },
//         serviceStates: [
//             {
//                 name: String,
//                 slug: String,
//                 coordinates: [Number]
//             }
//         ],
//         serviceCities: [
//             {
//                 name: String,
//                 slug: String,
//                 coordinates: [Number],
//                 state: String
//             }
//         ]
//     },
//     {
//         timestamps: true,
//         toJSON: {
//             virtuals: true
//         },
//         toObject: {
//             virtuals: true
//         }
//     }
// );

// const ConfigurationModel = mongoose.model<Configuration>(
//     'Configuration',
//     configurationSchema
// );

// export default ConfigurationModel;

import mongoose, { Document, Schema } from 'mongoose';

export interface IState {
    name: string;
    slug: string;
    active: boolean;
}

export interface ICity {
    name: string;
    slug: string;
    state: string;
    location: {
        type: string;
        coordinates: number[];
    };
}

// Sub-schemas for cleaner nesting
const StateSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    active: { type: Boolean, default: true }
});

const CitySchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    state: { type: String, required: true }, // Links to State name or slug
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    }
});

export interface Configuration extends Document {
    // Delivery & Logistics
    nearbyDistance: number; // In meters (e.g., 5000 for 5km)
    baseDeliveryFee: number; // Flat starting fee
    feePerKm: number; // NEW: Variable fee for distance

    // Commissions
    vendorCommission: number; // Platform cut from vendor sales (%)
    riderCommission: number; // Platform cut from rider delivery fee (%)
    packageCommission: number; // Flat or % for parcel services

    // Tax & Discounts
    vatRate: number;
    payOnDeliveryDiscount: number;

    // Geographic Scope
    serviceStates: any[];
    serviceCities: any[];
}

const configurationSchema = new Schema<Configuration>(
    {
        nearbyDistance: { type: Number, default: 5000 },
        baseDeliveryFee: { type: Number, default: 200 },
        feePerKm: { type: Number, default: 50 },

        vendorCommission: { type: Number, default: 15 },
        riderCommission: { type: Number, default: 20 },
        packageCommission: { type: Number, default: 10 },

        vatRate: { type: Number, default: 0 },
        payOnDeliveryDiscount: { type: Number, default: 0 },

        serviceStates: [StateSchema],
        serviceCities: [CitySchema]
    },
    { timestamps: true, toJSON: { virtuals: true } }
);

// Index for geo-spatial queries if you search cities by distance
configurationSchema.index({ 'serviceCities.location': '2dsphere' });

const ConfigurationModel = mongoose.model<Configuration>(
    'Configuration',
    configurationSchema
);
export default ConfigurationModel;
