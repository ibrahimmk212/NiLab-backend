import mongoose, { Document, Schema } from 'mongoose';
import appConfig from '../../config/appConfig';
import UserService from '../services/UserService';

export interface Address {
    address: string;
    street: string;
    city: string;
    state: string;
    postcode: string;
    buildingNumber: string;
    addressDocument: string;
    status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
    message: string;
}

export interface NextOfKin {
    name: string;
    phone: string;
    address: string;
    status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
    message: string;
}

export interface Guarantor {
    name: string;
    address: string;
    phone: string;
    identityDocument: string;
    status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
    message: string;
}

export interface Identity {
    identityType:
        | 'nin'
        | 'voters-card'
        | 'driver-licence'
        | 'e-passport'
        | 'other';
    identityNumber: string;
    identityDocument: string;
    status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
    message: string;
}

export interface Kyc extends Document {
    address: Address;
    identity: Identity;
    passportUrl: string;
    nextOfKin: NextOfKin;
    guarantor: Guarantor;
    user: mongoose.Types.ObjectId;
    role: 'user' | 'vendor' | 'rider';
    status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
    message: string;
}

const kycSchema = new Schema<Kyc>(
    {
        passportUrl: { type: String, required: false },
        address: {
            address: { type: String, required: false },
            buildingNumber: { type: String, required: false },
            street: { type: String, required: false },
            city: { type: String, required: false },
            state: { type: String, required: false },
            postcode: { type: String, required: false },
            addressDocument: { type: String, required: false },
            status: {
                type: String,
                enum: ['not_submitted', 'pending', 'verified', 'rejected'],
                default: 'not_submitted'
            },
            message: { type: String, required: false }
        },
        identity: {
            identityType: {
                type: String,
                enum: ['nin', 'voters-card', 'e-passport', 'other'],
                required: false
            },
            identityNumber: { type: String, required: false },
            identityDocument: { type: String, required: false },
            status: {
                type: String,
                enum: ['not_submitted', 'pending', 'verified', 'rejected'],
                default: 'not_submitted'
            },
            message: { type: String, required: false }
        },
        nextOfKin: {
            name: { type: String, required: false },
            phone: { type: String, required: false },
            address: { type: String, required: false },
            status: {
                type: String,
                enum: ['not_submitted', 'pending', 'verified', 'rejected'],
                default: 'not_submitted'
            },
            message: { type: String, required: false }
        },
        guarantor: {
            name: { type: String, required: false },
            phone: { type: String, required: false },
            address: { type: String, required: false },
            identityDocument: { type: String, required: false },
            status: {
                type: String,
                enum: ['not_submitted', 'pending', 'verified', 'rejected'],
                default: 'not_submitted'
            },
            message: { type: String, required: false }
        },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
            type: String,
            enum: ['user', 'vendor', 'rider'],
            required: true
        },
        message: { type: String, required: false },
        status: {
            type: String,
            enum: ['not_submitted', 'pending', 'verified', 'rejected'],
            required: true,
            default: 'not_submitted'
        }
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

// Update KYC status and user's KYC status
kycSchema.pre('save', async function (next) {
    if (!this.isModified()) return next();

    if (
        this.address.status === 'verified' &&
        this.identity.status === 'verified' &&
        this.nextOfKin.status === 'verified' &&
        this.guarantor.status === 'verified'
    ) {
        this.status = 'verified';
    } else {
        this.status = 'pending';
    }

    if (this.isModified('address')) {
        this.address.address = `${this.address.buildingNumber} ${this.address.street}, ${this.address.city}, ${this.address.state}.`;
    }

    const user = await UserService.getUserDetail(this.user.toString());
    if (user && user.kycStatus !== this.status) {
        user.kycStatus = this.status;
        await user.save();
    }

    next();
});

const KycModel = mongoose.model<Kyc>('Kyc', kycSchema);

export default KycModel;
