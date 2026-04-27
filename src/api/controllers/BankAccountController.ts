import { Response, NextFunction } from 'express';
import { asyncHandler } from '../middlewares/handlers/async';
import BankAccountModel from '../models/BankAccount';
import Monnify from '../libraries/monnify';

class BankAccountController {
    // Get all bank accounts for the logged-in user or specified user (if admin)
    public getAllAccounts = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                let userId = req.userdata.id;
                
                // If admin, allow fetching for another user
                if ((req.userdata.role === 'admin' || req.userdata.role === 'finance') && req.query.userId) {
                    userId = req.query.userId;
                }

                const accounts = await BankAccountModel.find({ userId }).sort({ createdAt: -1 });

                res.status(200).json({
                    success: true,
                    data: accounts,
                    message: 'Bank accounts retrieved successfully'
                });
            } catch (error) {
                next(error);
            }
        }
    );

    // Add a new bank account
    public addAccount = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                let userId = req.userdata.id;
                const { accountName, accountNumber, bankName, bankCode, isDefault, userId: targetUserId } = req.body;

                // If admin, allow adding for another user
                if ((req.userdata.role === 'admin' || req.userdata.role === 'finance') && targetUserId) {
                    userId = targetUserId;
                }

                if (!accountName || !accountNumber || !bankName || !bankCode) {
                    res.status(400).json({ success: false, message: 'All bank details are required' });
                    return;
                }

                // If this is the first account, or isDefault is true, set others to false
                const count = await BankAccountModel.countDocuments({ userId });
                let shouldBeDefault = isDefault;
                
                if (count === 0) {
                    shouldBeDefault = true;
                }

                if (shouldBeDefault) {
                    await BankAccountModel.updateMany({ userId }, { isDefault: false });
                }

                const newAccount = await BankAccountModel.create({
                    userId,
                    accountName,
                    accountNumber,
                    bankName,
                    bankCode,
                    isDefault: shouldBeDefault
                });

                res.status(201).json({
                    success: true,
                    data: newAccount,
                    message: 'Bank account added successfully'
                });
            } catch (error) {
                next(error);
            }
        }
    );

    // Update an existing bank account
    public updateAccount = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                const userId = req.userdata.id;
                const { id } = req.params;
                const { accountName, accountNumber, bankName, bankCode } = req.body;

                const account = await BankAccountModel.findOneAndUpdate(
                    { _id: id, userId },
                    { accountName, accountNumber, bankName, bankCode },
                    { new: true, runValidators: true }
                );

                if (!account) {
                    res.status(404).json({ success: false, message: 'Bank account not found' });
                    return;
                }

                res.status(200).json({
                    success: true,
                    data: account,
                    message: 'Bank account updated successfully'
                });
            } catch (error) {
                next(error);
            }
        }
    );

    // Delete a bank account
    public deleteAccount = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                let userId = req.userdata.id;
                const { id } = req.params;
                const { userId: targetUserId } = req.query;

                // If admin, allow deleting for another user
                if ((req.userdata.role === 'admin' || req.userdata.role === 'finance') && targetUserId) {
                    userId = targetUserId;
                }

                const account = await BankAccountModel.findOneAndDelete({ _id: id, userId });

                if (!account) {
                    res.status(404).json({ success: false, message: 'Bank account not found' });
                    return;
                }

                // If the deleted account was the default, set another one as default
                if (account.isDefault) {
                    const latestAccount = await BankAccountModel.findOne({ userId }).sort({ createdAt: -1 });
                    if (latestAccount) {
                        latestAccount.isDefault = true;
                        await latestAccount.save();
                    }
                }

                res.status(200).json({
                    success: true,
                    message: 'Bank account deleted successfully'
                });
            } catch (error) {
                next(error);
            }
        }
    );

    // Set as default account
    public setDefault = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                let userId = req.userdata.id;
                const { id } = req.params;
                const { userId: targetUserId } = req.body;

                // If admin, allow setting default for another user
                if ((req.userdata.role === 'admin' || req.userdata.role === 'finance') && targetUserId) {
                    userId = targetUserId;
                }

                const account = await BankAccountModel.findOne({ _id: id, userId });
                if (!account) {
                    res.status(404).json({ success: false, message: 'Bank account not found' });
                    return;
                }

                await BankAccountModel.updateMany({ userId }, { isDefault: false });
                account.isDefault = true;
                await account.save();

                res.status(200).json({
                    success: true,
                    data: account,
                    message: 'Bank account set as default'
                });
            } catch (error) {
                next(error);
            }
        }
    );

    // Get list of banks from Monnify
    public getBanks = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                const result = await Monnify.getBanks();
                const banks = (result.responseBody || []).map((b: any) => ({
                    name: b.name,
                    code: b.code
                }));
                res.status(200).json({
                    success: true,
                    data: banks,
                    message: 'Banks fetched successfully'
                });
            } catch (error) {
                next(error);
            }
        }
    );

    // Verify NUBAN account number with Monnify
    public verifyAccount = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                const { accountNumber, bankCode } = req.body;

                if (!accountNumber || !bankCode) {
                    res.status(400).json({
                        success: false,
                        message: 'Account number and bank code are required'
                    });
                    return;
                }

                const result = await Monnify.validateBankAccount(accountNumber, bankCode);

                if (!result?.requestSuccessful || !result?.responseBody?.accountName) {
                    res.status(422).json({
                        success: false,
                        message: 'Could not verify account. Please check the details and try again.'
                    });
                    return;
                }

                res.status(200).json({
                    success: true,
                    data: {
                        accountName: result.responseBody.accountName,
                        accountNumber: result.responseBody.accountNumber,
                        bankCode: result.responseBody.bankCode
                    },
                    message: 'Account verified successfully'
                });
            } catch (error) {
                next(error);
            }
        }
    );
}

export default new BankAccountController();
