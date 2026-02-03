import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import WalletRepository from '../../repositories/WalletRepository';
import WalletService from '../../services/WalletService';
import TransactionService from '../../services/TransactionService';
import monnify from '../../libraries/monnify';
import { currentTimestamp } from '../../../utils/helpers';
import appConfig from '../../../config/appConfig';

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
                await TransactionService.getTransactionsByVendor(vendor.id);
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
            const { vendor }: any = req;

            const transactions =
                // await TransactionService.getTransactionsByVendor(vendor.id);
                await TransactionService.getAll({}); //{ vendorId: vendor.id });
            // console.log(transactions);
            res.status(STATUS.OK).send({
                message: 'Transactions Fetchd successfully',
                ...transactions
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

            const transfer = await monnify.singleOutboundTransfer({
                amount,
                currency: 'NGN',
                destinationAccountNumber: accountNumber,
                destinationBankCode: bankCode,
                narration: transaction.remark || '',
                reference: transaction.reference,
                sourceAccountNumber: appConfig.monnify.walletAccountNumber
            });

            console.log(transfer);

            if (transfer.requestSuccessful) {
                transaction.status = 'successful';
                await transaction.save();
            }
            res.status(STATUS.OK).send({
                message: 'Transactions completed',
                success: true,
                data: transaction
            });
        }
    );
}

export default new VendorWalletController();
