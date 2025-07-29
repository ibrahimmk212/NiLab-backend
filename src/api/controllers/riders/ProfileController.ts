import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import UserService from '../../services/UserService';
import AuthService from '../../services/AuthService';
import RiderService from '../../../api/services/RiderService';
import { LoginType, RiderSignUpType, VerifyOTP } from '../../types/auth';
import jwt from '../../../utils/jwt';
import WalletService from '../../services/WalletService';
import emails from '../../libraries/emails';

class ProfileController {
    currentUser = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            // const user = await UserService.findUserById(req.userdata.id);
            const { userdata, rider }: any = req;

            const wallet = await WalletService.getMyWallet({
                role: 'rider',
                owner: rider.id
            });

            res.status(STATUS.OK).send({
                success: true,
                message: 'User fetched successfully',
                data: { user: userdata, rider, wallet }
            });
        }
    );
    login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const payload: LoginType = req.body;
        const { token, user } = await AuthService.login(payload);

        const rider = await RiderService.getRiderByUserId(user.id);

        const wallet = await WalletService.getMyWallet({
            role: 'rider',
            owner: rider.id
        });

        if (payload.deviceToken) user.deviceToken = payload.deviceToken;
        await user.save();
        res.status(STATUS.OK).send({
            message: 'Logged in successfully',
            success: true,
            data: user,
            rider,
            wallet,
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

    signUp = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const payload: RiderSignUpType = req.body;

            payload.role = 'rider';

            const user = await AuthService.signUp(payload);

            if (!user) {
                throw Error('User not created');
            }

            const rider = await RiderService.createRider({
                userId: user.id,
                name: `${user.firstName} ${user.lastName}`,
                phone: user.phoneNumber,
                email: user.email,
                city: payload.city,
                vehicle: payload.vehicle
            });

            if (!rider) {
                await user.deleteOne();
                throw Error('Rider not created');
            }

            emails.riderWelcome(user.email, { riderName: rider.name });

            const token = await jwt.signToken(user.id);

            res.status(STATUS.OK).send({
                success: true,
                message: 'Signed up successfully',
                data: { user, rider },
                token
            });
        }
    );

    updateAvailability = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { userdata }: any = req;

            const rider = await RiderService.getRiderByUserId(userdata.id);
            if (rider.status !== 'verified') {
                throw Error('You are not yet verified, contact MDS management');
            }

            rider.available = !rider.available;
            await rider.save();

            res.status(STATUS.OK).send({
                success: true,
                data: rider,
                message: 'Availability status updated'
            });
        }
    );

    // setPin = asyncHandler(
    //     async (req: Request | any, res: Response): Promise<void> => {
    //         const pin: string = req.body.pin;
    //         const user = req.userdata;

    //         await AuthService.setPin(user, pin);
    //         res.status(STATUS.OK).send({
    //             success: true,
    //             message: 'Pin created successfully'
    //         });
    //     }
    // );

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

    updateBankDetails = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { userdata, rider }: any = req;

            // const { accountNumber, bankCode, accountName, bankName } = req.body;

            const bankUpdate = await RiderService.updateRiderBank(
                rider.id,
                req.body
            );

            res.status(STATUS.OK).send({
                success: true,
                data: bankUpdate,
                message: 'Bank details updated successfully'
            });
        }
    );

    withdraw = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { userdata }: any = req;
            const rider = await RiderService.getRiderDetail(userdata.id);
            const { amount } = req.body;

            if (!rider) throw Error('Rider not found!');

            if (!rider.bankAccount) {
                throw Error('Please add your bank details and try again.');
            }
            const { accountNumber, bankCode, accountName, bankName } =
                rider.bankAccount;

            // TODO create pending withdrawal

            // TODO debit ledger balance

            // TODO submit transfer request

            // TODO debit available balance

            // TODO update withdrawal record status

            res.status(STATUS.OK).send({
                success: true,
                data: rider,
                message: `Withdrawal of ${amount} has been processed succeefully.`
            });
        }
    );
}

export default new ProfileController();
