/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/handlers/async';
import PayoutService from '../../services/PayoutService';
import RiderService from '../../services/RiderService';

class RiderPayoutController {
    getPayout = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<any> => {
            try {
                const payout = await PayoutService.getPayoutById(
                    req.params.payoutId
                );

                if (payout?.userId !== req.userdata.id)
                    // throw new Error('Payout not found');
                    return res.status(404).send({
                        message: 'Payout not found',
                        success: false
                    });
                return res.status(200).send({
                    message: 'Payout fetched successfully',
                    data: payout
                });
            } catch (error) {
                next(error);
            }
        }
    );

    getAllPayouts = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                const payout = await PayoutService.getAllPayouts({
                    ...req.query,
                    userId: req.userdata.id
                });
                res.status(200).send({
                    message: 'Payouts fetched successfully',
                    ...payout
                });
            } catch (error) {
                next(error);
            }
        }
    );
    requestPayout = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                const { id } = req.userdata;
                // eslint-disable-next-line prefer-const
                let { amount, bankName, accountNumber, accountName, bankCode } =
                    req.body;

                if (!accountNumber || !bankCode) {
                    const rider = await RiderService.getRiderByUserId(id);
                    if (rider?.bankAccount?.accountNumber) {
                        accountNumber = rider.bankAccount.accountNumber;
                        bankCode = rider.bankAccount.bankCode;
                        bankName = rider.bankAccount.bankName;
                        accountName = rider.bankAccount.accountName;
                    }
                }

                if (!accountNumber || !bankCode) {
                    throw new Error(
                        'Bank details are required. Please update your profile or provide them in the request.'
                    );
                }
                const payout = await PayoutService.requestPayout({
                    userId: id,
                    amount,
                    bankName,
                    accountNumber,
                    accountName,
                    bankCode
                });
                res.status(200).send({
                    message: 'Payout fetched successfully',
                    data: payout
                });
            } catch (error) {
                next(error);
            }
        }
    );
}

export default new RiderPayoutController();
