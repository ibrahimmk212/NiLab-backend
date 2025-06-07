"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserRepository_1 = __importDefault(require("../repositories/UserRepository"));
const jwt_1 = __importDefault(require("../../utils/jwt"));
const appConfig_1 = __importDefault(require("../../config/appConfig"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    async login(payload) {
        // if (payload.phone.length < 11 && !payload.phone.startsWith('0')) {
        //     payload.phone = `0${payload.phone}`;
        // }
        // console.log(payload.phone)
        const user = await UserRepository_1.default.findUserByEmail(payload.email || '');
        if (!user) {
            throw new Error('Invalid credentials, check your phone number again.');
        }
        const isValid = await user.matchPassword(payload.password);
        if (!isValid) {
            throw new Error('Invalid credentials, check your password again.');
        }
        const token = user.getSignedJwtToken();
        if (!token) {
            throw new Error('Invalid token');
        }
        return { token, user };
    }
    async verifyEmail(email) {
        const user = await UserRepository_1.default.findUserByKey('email', email);
        if (user) {
            throw new Error('Email has already been used');
        }
        // TODO send email OTP
        const otp = '1234';
        // generate temporary token
        const token = await jwt_1.default.signTempToken({
            email,
            otp,
            purpose: 'email-verify'
        });
        return token;
    }
    async verifyPhone(countryCode, phone) {
        if (countryCode === "234" || countryCode === "+234") {
            if (phone.length === 11 && phone.startsWith('0')) {
                phone = phone.slice(1);
            }
        }
        const user = await UserRepository_1.default.findUserByKey('phoneNumber', phone);
        if (user) {
            throw new Error('Phone has already been used');
        }
        // TODO send email OTP
        const otp = '1234';
        // generate temporary token
        const token = await jwt_1.default.signTempToken({
            phoneNumber: phone,
            countryCode: countryCode,
            otp,
            purpose: 'phone-verify'
        });
        return token;
    }
    async verifyOTP(payload) {
        const data = await jwt_1.default.verifyTempToken(payload.token, payload.purpose);
        if ((data === null || data === void 0 ? void 0 : data.otp) !== payload.otp) {
            return;
        }
        const purpose = payload.purpose === 'email-verify' || payload.purpose === "phone-verify"
            ? 'signup'
            : payload.purpose === 'forgot-password'
                ? 'reset-password'
                : 'none';
        console.log(purpose);
        const token = await jwt_1.default.signTempToken({
            email: data === null || data === void 0 ? void 0 : data.email,
            phoneNumber: data === null || data === void 0 ? void 0 : data.phoneNumber,
            purpose
        });
        return token;
    }
    async forgotPassword(email) {
        const user = await UserRepository_1.default.findUserByKey('email', email);
        if (!user) {
            throw new Error('User does not exists');
        }
        // TODO send email OTP
        const otp = '1234';
        // generate temporary token
        const token = await jwt_1.default.signTempToken({
            email,
            otp,
            purpose: 'forgot-password'
        });
        return token;
    }
    async vendorSignUp(payload) {
        const savedData = await jwt_1.default.verifyTempToken(payload === null || payload === void 0 ? void 0 : payload.token, 'signup');
        if (!savedData) {
            throw Error('Invalid token');
        }
        console.log("payload", payload);
        // payload.email = savedData?.email;
        // payload.phoneNumber = savedData?.phoneNumber;
        payload === null || payload === void 0 ? true : delete payload.token;
        // const hashedPassword = bcrypt.hashSync(
        //     payload.password,
        //     appConfig.app.hashSalt
        // );
        const user = savedData.purpose === "email-verify" ?
            await UserRepository_1.default.findUserByKey('phoneNumber', payload.phoneNumber) :
            await UserRepository_1.default.findUserByKey('email', payload.email);
        if (user)
            throw Error(savedData.purpose === "email-verify" ? "Phone already exists" : "Email already exists");
        // TODO check Vendors email address, if exists.
        // TODO check Vendors phone address, if exists.
        return await UserRepository_1.default.createVendorUser(Object.assign(Object.assign({}, payload), { email: payload.email, phoneNumber: savedData.phoneNumber, password: payload.password }));
    }
    async RiderSignUp(payload) {
        const savedData = await jwt_1.default.verifyTempToken(payload === null || payload === void 0 ? void 0 : payload.token, 'signup');
        if (!savedData) {
            throw Error('Invalid token');
        }
        // payload.email = savedData?.email;
        // payload.phoneNumber = savedData?.phoneNumber;
        payload === null || payload === void 0 ? true : delete payload.token;
        // const hashedPassword = bcrypt.hashSync(
        //     payload.password,
        //     appConfig.app.hashSalt
        // );
        const user = savedData.purpose === "email-verify" ?
            await UserRepository_1.default.findUserByKey('phoneNumber', savedData.phoneNumber) :
            await UserRepository_1.default.findUserByKey('email', savedData.email);
        if (user)
            throw Error(savedData.purpose === "email-verify" ? "Phone already exists" : "Email already exists");
        return await UserRepository_1.default.createVendorUser(Object.assign(Object.assign({}, payload), { email: payload.email, phoneNumber: savedData.phoneNumber, password: payload.password }));
    }
    async customerSignUp(payload) {
        const savedData = await jwt_1.default.verifyTempToken(payload === null || payload === void 0 ? void 0 : payload.token, 'signup');
        if (!savedData) {
            throw Error('Invalid token');
        }
        payload.email = savedData === null || savedData === void 0 ? void 0 : savedData.email;
        // payload.phoneNumber = savedData?.phoneNumber;
        payload === null || payload === void 0 ? true : delete payload.token;
        // const hashedPassword = bcrypt.hashSync(
        //     payload.password,
        //     appConfig.app.hashSalt
        // );
        const user = savedData.purpose === "email-verify" ?
            await UserRepository_1.default.findUserByKey('phoneNumber', payload.phoneNumber) :
            await UserRepository_1.default.findUserByKey('email', payload.email);
        if (user)
            throw Error(savedData.purpose === "email-verify" ? "Phone already exists" : "Email already exists");
        console.log("payloAS", Object.assign(Object.assign({}, payload), { email: payload.email, password: payload.password }));
        return await UserRepository_1.default.createCustomerUser(Object.assign(Object.assign({}, payload), { email: payload.email, password: payload.password }));
    }
    async setPin(payload, pin) {
        const hashedPin = bcrypt_1.default.hashSync(pin, appConfig_1.default.app.hashSalt);
        payload.pin = hashedPin;
        return await UserRepository_1.default.updateUser(payload.id, payload);
    }
    async resetPassword(password, token) {
        const savedData = await jwt_1.default.verifyTempToken(token, 'reset-password');
        if (!savedData) {
            throw Error('Invalid token');
        }
        const user = await UserRepository_1.default.findUserByKey('email', savedData.email);
        if (!user) {
            throw new Error('User not found');
        }
        // const hashedPassword = bcrypt.hashSync(
        //     password,
        //     appConfig.app.hashSalt
        // );
        user.password = password;
        await UserRepository_1.default.updateUser(user.id, user);
        return user;
    }
    async updatePassword(userId, currentPassword, newPassword) {
        const user = await UserRepository_1.default.findUserById(userId, '+password');
        if (!user) {
            throw new Error('Invalid request, try loggin in again.');
        }
        console.log(user);
        const isValid = await user.matchPassword(currentPassword);
        if (!isValid) {
            throw new Error('check your current password again.');
        }
        user.password = newPassword;
        await user.save({ validateBeforeSave: true });
        return user;
    }
}
exports.default = new AuthService();
