import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import {
    LoginType,
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

class AuthController {
    login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const payload: LoginType = req.body;
        const { token, user, vendor } = await AuthService.login(payload);

        res.status(STATUS.OK).send({
            message: 'Logged in successfully',
            success: true,
            data: user,
            vendor: vendor,
            token: token
        });
    });

    emailVerify = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const email = req.body.email;

            const token = await AuthService.verifyEmail(email);
            res.status(STATUS.OK).send({
                success: true,
                message:
                    'an OTP has been sent to your email address, use it to proceed.',
                token
            });
        }
    );
    phoneVerify = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            let phone = req.body.phone;
            const countryCode = req.body.countryCode;

            if (countryCode === '234' || countryCode === '+234') {
                if (phone.length < 11 && !phone.startsWith('0')) {
                    phone = `0${phone}`;
                }
            }

            const token = await AuthService.verifyPhone(countryCode, phone);
            res.status(STATUS.OK).send({
                success: true,
                message:
                    'an OTP has been sent to your phone, use it to proceed.',
                token
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

    customerSignUp = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const payload= req.body;

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
            const payload= req.body;

            payload.role = 'user';

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
                email: 'admin@nilab.com',
                phoneNumber: '08011111111',
                role: 'admin',
                password: '4dm1n01'
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

            const token = await JWT.signToken(user._id.toString());

            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Signed up successfully',
                data: user,
                token
            });
        }
    );
}

export default new AuthController();
