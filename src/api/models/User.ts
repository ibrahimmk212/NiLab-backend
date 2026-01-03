import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import appConfig from '../../config/appConfig';

interface Location {
    type: string;
    coordinates: number[];
}
export interface Address {
    address: string;
    street: string;
    city: string;
    state: string;
    postcode: string;
    buildingNumber: string;
    coordinates: number[];
    label: string;
    isDefault: boolean;
    // location: Location;
}
export interface User extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: string;
    role: string;
    pin: string;
    phoneNumber: string;
    addresses: Address[];
    kycStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
    resetPasswordToken: string;
    resetPasswordExpire: string;
    status: 'active' | 'inactive' | 'suspended';
    isBanned: boolean;

    deviceToken: string;

    getSignedJwtToken(): string;
    matchPassword(password: string): Promise<boolean>;
    getResetPasswordToken(): Promise<string>;
}

const userSchema = new Schema<User>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: false },
        gender: { type: String, required: false, default: 'male' },
        email: {
            type: String,
            required: [true, 'email is required'],
            unique: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Enter a valid email address'
            ]
        },
        role: {
            type: String,
            enum: ['admin', 'user', 'vendor', 'rider', 'staff'],
            required: [true, 'Role is required'],
            default: 'user'
        },
        password: {
            type: String,
            select: false,
            required: [true, 'Password is required'],
            minlength: [6, 'password must be at least 8 character']
        },
        phoneNumber: { type: String, required: true },
        pin: { type: String, required: false },
        deviceToken: { type: String, required: false },
        addresses: [
            {
                type: { type: String, default: 'Point' },
                address: String,
                buildingNumber: String,
                street: String,
                city: String,
                state: String,
                label: String,
                postcode: String,
                coordinates: { type: [Number], index: '2dsphere' },
                default: { type: Boolean, default: false }
            }
        ],
        kycStatus: {
            type: String,
            enum: ['not_submitted', 'pending', 'approved', 'rejected'],
            required: true,
            default: 'not_submitted'
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended', 'banned'],
            required: true,
            default: 'active'
        },
        isBanned: { type: Boolean, required: true, default: false },
        resetPasswordToken: String,
        resetPasswordExpire: Date
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

// reverse populate kyc
userSchema.virtual('kyc', {
    ref: 'Kyc',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});
userSchema.virtual('wallet', {
    ref: 'Wallet',
    localField: '_id',
    foreignField: 'owner',
    justOne: true
});

// encrypt password
userSchema.pre('save', async function (next) {
    this.email = this.email.toLowerCase();
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(appConfig.app.hashSalt);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign in JWT and return
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, appConfig.app.secret, {
        expiresIn: appConfig.app.jwtExpire
    });
};

userSchema.methods.matchPassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

// Generate and hash password
userSchema.methods.getResetPasswordToken = async function (): Promise<string> {
    // generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
