"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appConfig_1 = __importDefault(require("../../config/appConfig"));
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
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
    countryCode: { type: String, required: false },
    pin: { type: String, required: false },
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
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
// encrypt password
userSchema.pre('save', async function (next) {
    this.email = this.email.toLowerCase();
    if (!this.isModified('password'))
        return next();
    const salt = await bcrypt_1.default.genSalt(appConfig_1.default.app.hashSalt);
    this.password = await bcrypt_1.default.hash(this.password, salt);
});
// Sign in JWT and return
userSchema.methods.getSignedJwtToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, appConfig_1.default.app.secret, {
        expiresIn: appConfig_1.default.app.jwtExpire
    });
};
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt_1.default.compare(password, this.password);
};
// Generate and hash password
userSchema.methods.getResetPasswordToken = async function () {
    // generate token
    const resetToken = crypto_1.default.randomBytes(20).toString('hex');
    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
const UserModel = mongoose_1.default.model('User', userSchema);
exports.default = UserModel;
