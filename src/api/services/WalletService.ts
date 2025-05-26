import WalletRepository from '../repositories/WalletRepository';
type InitDebitType = {
    userId: string;
    amount: number;
    reference: string;
    remark?: string;
    transactionType: string;
    transactionId: string;
};
interface IWalletService {
    initDebitAccount(payload: InitDebitType): Promise<any>;
    confirmDebitAccount(payload: InitDebitType): Promise<any>;
    initCreditAccount(payload: InitDebitType): Promise<any>;
    confirmCreditAccount(payload: InitDebitType): Promise<any>;
    fundWallet(payload: InitDebitType): Promise<any>;
    directDebitWallet(payload: InitDebitType): Promise<any>;
}

class WalletService implements IWalletService {
    async initDebitAccount(payload: InitDebitType): Promise<any> {
        const { amount, userId } = payload;
        const userWallet: any = await WalletRepository.getWalletByUser(userId);
        if (!userWallet) {
            return {
                success: false,
                message: `Wallet not found`
            };
        }

        const currentBalance = userWallet.balance;
        // Check if funds is sufficient
        if (currentBalance < amount)
            return {
                success: false,
                message: `Insufficient Funds, Could not debit, available is ${currentBalance}`,
                currentBalance: currentBalance
            };

        const updateWallet = await WalletRepository.debitBalance(
            userWallet?.id,
            amount
        );

        if (!updateWallet)
            return { success: false, message: 'Failed to Debit wallet' };

        return {
            success: true,
            message: 'Wallet Debited',
            data: updateWallet
        };
    }
    async confirmDebitAccount(payload: InitDebitType): Promise<any> {
        const { amount, userId } = payload;

        const userWallet = await WalletRepository.getWalletByUser(userId);
        if (!userWallet) return null;

        const updateWallet = await WalletRepository.debitLedger(
            userWallet?.id,
            amount
        );

        if (!updateWallet)
            return {
                success: false,
                message: 'Failed to confirm wallet debit'
            };

        return {
            success: true,
            message: 'Wallet Debit confirmed'
        };
    }
    async initCreditAccount(payload: InitDebitType): Promise<any> {
        const { amount, userId } = payload;

        const userWallet = await WalletRepository.getWalletByUser(userId);
        if (!userWallet)
            return { success: false, message: 'Failed to fetch wallet' };

        const updateWallet = await WalletRepository.creditLedger(
            userWallet?.id,
            amount
        );

        if (!updateWallet)
            return {
                success: false,
                message: 'Failed to initiate wallet credit'
            };

        return {
            success: true,
            message: 'Wallet credit initiated'
        };
    }
    async confirmCreditAccount(payload: InitDebitType): Promise<any> {
        const { amount, userId } = payload;

        const userWallet = await WalletRepository.getWalletByUser(userId);
        if (!userWallet)
            return { success: false, message: 'Failed to fetch user wallet' };

        const updateWallet = await WalletRepository.creditBalance(
            userWallet?.id,
            amount
        );

        if (!updateWallet)
            return {
                success: false,
                message: 'Failed to confirm wallet credit'
            };

        return {
            success: true,
            message: 'Wallet credit confirmed'
        };
    }
    async fundWallet(payload: InitDebitType): Promise<any> {
        const { amount, userId } = payload;

        const wallet = await WalletRepository.getWalletByUser(userId);

        if (!wallet) return { success: false, message: 'Wallet not found' };

        const updateWallet = await WalletRepository.creditFullBalance(
            wallet?.id,
            amount
        );
        if (!updateWallet)
            return { success: false, message: 'Failed to fund wallet' };

        return {
            success: true,
            message: 'Wallet funded'
        };
    }
    async directDebitWallet(payload: InitDebitType): Promise<any> {
        const { amount, userId } = payload;

        try {
            const wallet = await WalletRepository.getWalletByUser(userId);
            if (!wallet) return {
                success: false,
                message: 'Wallet not found'
            }

            if (wallet.balance < amount) {
                return {
                    success: false,
                    message: 'Insufficient balance'
                }
            }



            const updateWallet = await WalletRepository.debitFullBalance(
                wallet?.id,
                amount
            );
            if (!updateWallet)
                return { success: false, message: 'Failed wallet debit' };

            return {
                success: true,
                message: 'Wallet debited'
            };
        } catch (error: any) {

            return {
                success: false,
                message: error.message || "Could not debit wallet"
            }

        }
    }
}

export default new WalletService();
