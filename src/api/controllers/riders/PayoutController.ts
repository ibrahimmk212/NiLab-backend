/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/handlers/async';
import PayoutService from '../../services/PayoutService';
import RiderService from '../../services/RiderService';
import BankAccountModel from '../../models/BankAccount';

class RiderPayoutController {
    getPayout = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<any> => {
            try {
                const payout = await PayoutService.getPayoutById(
                    req.params.payoutId
                );

                if (payout?.userId !== req.userdata.id)
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

                // If bank details not provided in the request body, resolve them automatically
                if (!accountNumber || !bankCode) {
                    // 1. Prefer the default account from the BankAccount collection (new system)
                    const defaultBankAccount = await BankAccountModel.findOne({
                        userId: id,
                        isDefault: true
                    });

                    if (defaultBankAccount) {
                        accountNumber = defaultBankAccount.accountNumber;
                        bankCode = defaultBankAccount.bankCode;
                        bankName = defaultBankAccount.bankName;
                        accountName = defaultBankAccount.accountName;
                    } else {
                        // 2. Fall back to legacy embedded rider.bankAccount field
                        const rider = await RiderService.getRiderByUserId(id);
                        if (rider?.bankAccount?.accountNumber) {
                            accountNumber = rider.bankAccount.accountNumber;
                            bankCode = rider.bankAccount.bankCode;
                            bankName = rider.bankAccount.bankName;
                            accountName = rider.bankAccount.accountName;
                        }
                    }
                }

                if (!accountNumber || !bankCode) {
                    throw new Error(
                        'No payout account found. Please add a bank account in your profile settings.'
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
                    message: 'Payout requested successfully',
                    data: payout
                });
            } catch (error) {
                next(error);
            }
        }
    );
}

export default new RiderPayoutController();
