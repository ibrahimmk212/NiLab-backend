import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import UserService from '../../services/UserService';
import AuthService from '../../services/AuthService';
import RiderService from '../../../api/services/RiderService';

class ProfileController {
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
            const { userdata }: any = req;

            // const { accountNumber, bankCode, accountName, bankName } = req.body;

            const rider = await RiderService.updateRiderBank(
                userdata.id,
                req.body
            );

            res.status(STATUS.OK).send({
                success: true,
                data: rider,
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
