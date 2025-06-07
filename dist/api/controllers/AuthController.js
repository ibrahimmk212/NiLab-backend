"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = __importDefault(require("../services/AuthService"));
const constants_1 = require("../../constants");
const async_1 = require("../middlewares/handlers/async");
const jwt_1 = __importDefault(require("../../utils/jwt"));
const UserService_1 = __importDefault(require("../services/UserService"));
const UserRepository_1 = __importDefault(require("../repositories/UserRepository"));
const AdminService_1 = __importDefault(require("../services/AdminService"));
class AuthController {
    constructor() {
        this.login = (0, async_1.asyncHandler)(async (req, res) => {
            const payload = req.body;
            console.log(payload);
            const { token, user } = await AuthService_1.default.login(payload);
            res.status(constants_1.STATUS.OK).send({
                message: 'Logged in successfully',
                success: true,
                data: user,
                token: token
            });
        });
        this.emailVerify = (0, async_1.asyncHandler)(async (req, res) => {
            const email = req.body.email;
            const token = await AuthService_1.default.verifyEmail(email);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'an OTP has been sent to your email address, use it to proceed.',
                token
            });
        });
        this.phoneVerify = (0, async_1.asyncHandler)(async (req, res) => {
            let phone = req.body.phone;
            const countryCode = req.body.countryCode;
            if (countryCode === '234' || countryCode === '+234') {
                if (phone.length < 11 && !phone.startsWith('0')) {
                    phone = `0${phone}`;
                }
            }
            const token = await AuthService_1.default.verifyPhone(countryCode, phone);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'an OTP has been sent to your phone, use it to proceed.',
                token
            });
        });
        this.otpVerify = (0, async_1.asyncHandler)(async (req, res) => {
            const payload = req.body;
            const token = await AuthService_1.default.verifyOTP(payload);
            if (!token) {
                throw Error('Invalid OTP, please try again.');
            }
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'OTP verified successfully.',
                token
            });
        });
        this.customerSignUp = (0, async_1.asyncHandler)(async (req, res) => {
            const payload = req.body;
            payload.role = 'user';
            const user = await AuthService_1.default.customerSignUp(payload);
            if (!user) {
                throw Error('User not created');
            }
            const token = await jwt_1.default.signToken(user.id);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Signed up successfully',
                data: user,
                token
            });
        });
        this.vendorSignUp = (0, async_1.asyncHandler)(async (req, res) => {
            const payload = req.body;
            payload.role = 'vendor';
            const user = await AuthService_1.default.vendorSignUp(payload);
            if (!user) {
                throw Error('Vendor not created');
            }
            const token = await jwt_1.default.signToken(user.id);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Signed up successfully',
                data: user,
                token
            });
        });
        this.setPin = (0, async_1.asyncHandler)(async (req, res) => {
            const pin = req.body.pin;
            const user = req.userdata;
            await AuthService_1.default.setPin(user, pin);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Pin created successfully'
            });
        });
        this.currentUser = (0, async_1.asyncHandler)(async (req, res) => {
            const user = await UserService_1.default.findUserById(req.userdata.id);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'User fetched successfully',
                data: user
            });
        });
        this.forgotPassword = (0, async_1.asyncHandler)(async (req, res) => {
            const email = req.body.email;
            const token = await AuthService_1.default.forgotPassword(email);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'an OTP has been sent to your email address, use it to proceed.',
                token
            });
        });
        this.resetPassword = (0, async_1.asyncHandler)(async (req, res) => {
            const { password, token } = req.body;
            await AuthService_1.default.resetPassword(password, token);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'password reset successfully'
            });
        });
        this.updatePassword = (0, async_1.asyncHandler)(async (req, res) => {
            const pin = req.body.pin;
            const { userdata } = req;
            const { currentPassword, newPassword } = req.body;
            const user = await AuthService_1.default.updatePassword(userdata.id, currentPassword, newPassword);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                data: user,
                message: 'Password updated successfully'
            });
        });
        this.createAdmin = (0, async_1.asyncHandler)(async (req, res) => {
            const payload = {
                firstName: 'Admin',
                lastName: 'Account',
                email: 'admin@nilab.com',
                phoneNumber: '08011111111',
                role: 'admin',
                password: '4dm1n01'
            };
            const checkAdmin = await UserRepository_1.default.findUserByEmail(payload.email);
            if (checkAdmin) {
                throw Error('Admin already created');
            }
            const user = await UserRepository_1.default.createUser(payload);
            if (!user) {
                throw Error('Admin not created');
            }
            await AdminService_1.default.create({
                name: `${payload.firstName} ${payload.lastName}`,
                role: 'admin',
                userId: user._id
            });
            const token = await jwt_1.default.signToken(user._id.toString());
            res.status(constants_1.STATUS.CREATED).send({
                success: true,
                message: 'Signed up successfully',
                data: user,
                token
            });
        });
    }
}
exports.default = new AuthController();
