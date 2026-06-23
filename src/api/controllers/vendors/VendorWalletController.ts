import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import WalletRepository from '../../repositories/WalletRepository';
import WalletService from '../../services/WalletService';
import TransactionService from '../../services/TransactionService';
import paystack from '../../libraries/paystack';
import { currentTimestamp } from '../../../utils/helpers';
import appConfig from '../../../config/appConfig';
import VirtualAccountService from '../../services/VirtualAccountService';

class VendorWalletController {
    get = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, userdata }: any = req;

            const wallet = await WalletService.getOrCreateWallet({
                role: 'vendor',
                owner: userdata.id
            });

            if (!wallet) {
                throw new Error('Wallet not available');
            }

            const transactions =
                await TransactionService.getTransactionsByVendor(userdata.id);
            res.status(STATUS.OK).send({
                message: 'Vendor wallet Fetchd successfully',
                data: {
                    wallet,
                    transactions: transactions?.slice(0, 10),
                    bankAccount: vendor?.bankAccount
                }
            });
        }
    );

    getTransactions = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;

            const transactions =
                await TransactionService.getTransactionsByVendor(userdata.id);

            res.status(STATUS.OK).send({
                message: 'Transactions Fetched successfully',
                success: true,
                count: transactions?.length || 0,
                data: transactions
            });
        }
    );

    getBanks = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendor }: any = req;

            const banks = await WalletService.getBanks();

            res.status(STATUS.OK).send(banks);
        }
    );

    accountEnquiry = asyncHandler(
        async (req: Request, res: Response): Promise<any> => {
            const { accountNumber, bankCode } = req.body;

            if (!accountNumber || !bankCode) {
                return res.status(STATUS.OK).json({
                    success: false,
                    message: 'Invalid account details'
                });
            }
            const result = await WalletService.bankEnquiry({
                accountNumber,
                bankCode
            });

            res.status(STATUS.OK).send(result);
        }
    );

    withdraw = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<any> => {
            const { vendor }: any = req;
            const { amount } = req.body;

            if (!vendor.bankAccount) {
                throw Error('You need to update your bank details');
            }

            const { accountNumber, bankCode } = vendor.bankAccount;

            if (!accountNumber || !bankCode) {
                return res.status(STATUS.OK).json({
                    success: false,
                    message: 'Invalid account details'
                });
            }
            const result = await WalletService.bankEnquiry({
                accountNumber,
                bankCode
            });

            if (!result.success) {
                return res.status(STATUS.OK).json({
                    success: false,
                    message:
                        'Account validation failed, try again or update your bank details'
                });
            }

            const reference = currentTimestamp().toString();
            const transaction = await TransactionService.createTransaction({
                amount: amount,
                userId: vendor.userId,
                type: 'CREDIT',
                remark: 'Withdrawal to bank',
                status: 'pending',
                reference: reference
            });

            if (!transaction) {
                return res.status(STATUS.OK).json({
                    success: false,
                    message: 'Transaction failed'
                });
            }

            const debited = await WalletService.initDebitAccount({
                amount: transaction.amount,
                owner: vendor.id.toString(),
                reference: transaction.reference,
                remark: transaction.remark,
                role: 'vendor',
                transactionId: transaction.id,
                transactionType: 'credit'
            });

            console.log('debited', debited);
            if (!debited.success) {
                transaction.status = 'failed';
                await transaction.save();
                return res.status(STATUS.OK).json(debited);
            }

            try {
                // 1. Create Paystack Transfer Recipient
                const recipientRes = await paystack.createTransferRecipient(
                    accountNumber,
                    bankCode,
                    result.data?.accountName || 'Vendor'
                );

                if (!recipientRes.status || !recipientRes.data?.recipient_code) {
                    console.error('Paystack Transfer Recipient Creation Failed:', recipientRes);
                    transaction.status = 'failed';
                    await transaction.save();
                    return res.status(STATUS.OK).json({
                        success: false,
                        message: recipientRes.message || 'Failed to create transfer recipient'
                    });
                }

                const recipientCode = recipientRes.data.recipient_code;

                // 2. Initiate Transfer
                const transfer = await paystack.initiateTransfer(
                    amount,
                    recipientCode,
                    transaction.reference,
                    transaction.remark || 'Withdrawal to bank'
                );

                console.log(transfer);

                if (transfer.status) {
                    transaction.status = 'successful';
                    await transaction.save();
                } else {
                    transaction.status = 'failed';
                    await transaction.save();
                }
            } catch (err: any) {
                console.error('Vendor Transfer Error:', err);
                transaction.status = 'failed';
                await transaction.save();
                return res.status(STATUS.OK).json({
                    success: false,
                    message: err.message || 'Transfer failed'
                });
            }
            res.status(STATUS.OK).send({
                message: 'Transactions completed',
                success: true,
                data: transaction
            });
        }
    );

    getVirtualAccount = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { userdata }: any = req;
            // Vendors have a 'vendor'-role wallet, not a 'user' wallet
            const virtualAccount = await VirtualAccountService.getOrCreateVirtualAccount(
                userdata.id,
                false,
                'vendor'
            );
            res.status(STATUS.OK).send({
                success: true,
                message: 'Virtual account fetched successfully',
                data: virtualAccount
            });
        }
    );
}

export default new VendorWalletController();
