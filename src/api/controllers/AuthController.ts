import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import {
    LoginType,
    RiderSignUpType,
    SignUpType,
    VendorSignUpType,
    VerifyOTP
} from '../types/auth';
import { STATUS } from '../../constants';
import { asyncHandler } from '../middlewares/handlers/async';
import JWT from '../../utils/jwt';
import UserService from '../services/UserService';
import UserRepository from '../repositories/UserRepository';
import AdminService from '../services/AdminService';
import emails from '../libraries/emails';
import VendorService from '../services/VendorService';
import ConfigurationService from '../services/ConfigurationService';
import CouponService from '../services/CouponService';
import PromotionService from '../services/PromotionService';
import dayjs from 'dayjs';
import NotificationService from '../services/NotificationService';

class AuthController {
    login = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const payload: LoginType = req.body;
        const { token, user } = await AuthService.login(payload);

        // Login notification for test
        const notificationDetail: any = {
            message: 'Welcome to Terminus!',
            title: 'Successfully logged in'
        };
        if (user.role === 'admin') {
            const admin = await AdminService.getByUserId(user.id);

            if (!admin) {
                return res.status(STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            if (payload.deviceToken) user.deviceToken = payload.deviceToken;
            await user.save();
            return res.status(STATUS.OK).send({
                message: 'Logged in successfully',
                success: true,
                data: user,
                user: user,
                admin: admin,
                active: admin.status === 'active',
                token: token
            });
        } else if (user.role === 'vendor') {
            const vendor = await VendorService.getByUserId(user.id);

            if (payload.deviceToken) user.deviceToken = payload.deviceToken;
            await user.save();

            notificationDetail.vendorId = vendor.id;
            NotificationService.create(notificationDetail);

            return res.status(STATUS.OK).send({
                message: 'Logged in successfully',
                success: true,
                data: user,
                user: user,
                vendor: vendor,
                active: vendor.status === 'active',
                token: token
            });
        } else if (user.role == 'user') {
            if (payload.deviceToken) user.deviceToken = payload.deviceToken;
            await user.save();
            notificationDetail.userId = user.id;

            NotificationService.create(notificationDetail);
            res.status(STATUS.OK).send({
                message: 'Logged in successfully',
                success: true,
                data: user,
                token: token
            });
        } else {
            res.status(STATUS.OK).send({
                message: 'Invalid login route',
                success: false
            });
        }
    });

    emailVerify = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const email: string = req.body.email;

            const { token, otp } = await AuthService.verifyEmail(
                email.toLowerCase()
            );
            res.status(STATUS.OK).send({
                success: true,
                message:
                    'an OTP has been sent to your email address, use it to proceed.',
                token,
                otp
            });
        }
    );

    otpVerify = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const payload: VerifyOTP = req.body;

            const token = await AuthService.verifyOTP(payload);

            if (!token) {
                throw Error('Invalid OTP, please try again.');
            }

            res.status(STATUS.OK).send({
                success: true,
                message: 'OTP verified successfully.',
                token
            });
        }
    );

    signUp = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const payload: SignUpType = req.body;

        payload.role = 'user';
        console.log(payload);
        const user = await AuthService.signUp(payload);

        if (!user) {
            throw Error('User not created');
        }
        let promotion;
        if (payload.promotionCode) {
            promotion = await PromotionService.getPromotionByKey(
                'code',
                payload.promotionCode
            );
            if (promotion && promotion.isActive) {
                const expiresOn = dayjs(new Date()).add(
                    promotion.daysToExpire,
                    'days'
                );

                const coupon = await CouponService.createCoupon({
                    user: user.id,
                    vendor: promotion.vendor,
                    discountPercentage: promotion.discountPercentage,
                    discountAmount: promotion.discountAmount,
                    maxAmount: promotion.maxAmount,
                    eligibleAmount: promotion.maxAmount,
                    code: promotion.code,
                    title: promotion.title,
                    expiresOn: expiresOn.toDate(),
                    promotion: promotion.id,
                    daysToExpire: promotion.daysToExpire,
                    discountType: promotion.discountType,
                    isActive: promotion.isActive
                });
            }
        }

        emails.customerWelcome(user.email, { name: user.firstName });

        const token = await JWT.signToken(user.id);

        res.status(STATUS.OK).send({
            success: true,
            message: `You have got a coupon from ${promotion?.title}. use it to get discount during checkout.`,
            data: user,
            token
        });
    });

    setPin = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            const pin: string = req.body.pin;
            const user = req.userdata;

            await AuthService.setPin(user, pin);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Pin created successfully'
            });
        }
    );

    currentUser = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            const user = await UserService.findUserById(req.userdata.id);
            res.status(STATUS.OK).send({
                success: true,
                message: 'User fetched successfully',
                data: user
            });
        }
    );

    forgotPassword = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const email: string = req.body.email;

            const token = await AuthService.forgotPassword(email);
            res.status(STATUS.OK).send({
                success: true,
                message:
                    'an OTP has been sent to your email address, use it to proceed.',
                token
            });
        }
    );
    resetPassword = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            const { password, token } = req.body;

            await AuthService.resetPassword(password, token);
            res.status(STATUS.OK).send({
                success: true,
                message: 'password reset successfully'
            });
        }
    );

    updatePassword = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const pin: string = req.body.pin;
            const { userdata }: any = req;

            const { currentPassword, newPassword } = req.body;

            const user = await AuthService.updatePassword(
                userdata.id,
                currentPassword,
                newPassword
            );

            res.status(STATUS.OK).send({
                success: true,
                data: user,
                message: 'Password updated successfully'
            });
        }
    );

    createAdmin = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const payload: SignUpType = {
                firstName: 'Admin',
                lastName: 'Account',
                email: 'admin@terminus.com',
                phoneNumber: '09012345678',
                gender: 'male',
                role: 'admin',
                password: '4dm1n01',
                token: 'admin-creation-token'
            };

            const checkAdmin = await UserRepository.findUserByEmail(
                payload.email
            );
            if (checkAdmin) {
                throw Error('Admin already created');
            }

            const user = await UserRepository.createUser(payload);

            if (!user) {
                throw Error('Admin not created');
            }

            await AdminService.create({
                name: `${payload.firstName} ${payload.lastName}`,
                role: 'admin',
                userId: user._id
            });
            const token = await JWT.signToken(user.id);

            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Signed up successfully',
                data: user,
                token
            });
        }
    );

    getConfiguration = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const configuration = await ConfigurationService.getConfiguration();
            res.status(STATUS.OK).send({
                success: true,
                message: 'Configuration fetched successfully',
                data: configuration
            });
        }
    );

    customerSignUp = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const payload = req.body;

            payload.role = 'user';

            const user = await AuthService.customerSignUp(payload);

            if (!user) {
                throw Error('User not created');
            }

            const token = await JWT.signToken(user.id);

            res.status(STATUS.OK).send({
                success: true,
                message: 'Signed up successfully',
                data: user,
                token
            });
        }
    );

    riderSignUp = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const payload = req.body;

            payload.role = 'rider';
            console.log(payload);

            const user = await AuthService.riderSignUp(payload);

            if (!user) {
                throw Error('User not created');
            }

            const token = await JWT.signToken(user.id);

            res.status(STATUS.OK).send({
                success: true,
                message: 'Signed up successfully',
                data: user,
                token
            });
        }
    );

    vendorSignUp = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const payload: VendorSignUpType = req.body;
            // const payload: VendorSignUpType = req.body;
            payload.role = 'vendor';

            const user = await AuthService.vendorSignUp(payload);

            if (!user) {
                throw Error('Vendor not created');
            }

            const token = await JWT.signToken(user.id);

            res.status(STATUS.OK).send({
                success: true,
                message: 'Signed up successfully',
                data: user,
                token
            });
        }
    );
}

export default new AuthController();
