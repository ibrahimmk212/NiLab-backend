import WalletRepository from '../repositories/WalletRepository';
import KycRepository from '../repositories/KycRepository';
import paystack from '../libraries/paystack';
import { Types } from 'mongoose';

class VirtualAccountService {
    async getOrCreateVirtualAccount(
        userId: string,
        forceRefresh = false,
        role: 'user' | 'vendor' = 'user'
    ) {
        const userObjId = new Types.ObjectId(userId);

        // 1. Look up the correct wallet for the given role
        const wallet = await WalletRepository.getWalletByOwner(role, userObjId);
        if (!wallet) {
            throw new Error(`Wallet not found for this ${role}`);
        }

        // Return cached virtual account if it exists and refresh is not forced
        if (wallet.virtualAccount && wallet.virtualAccount.accountNumber && !forceRefresh) {
            return wallet.virtualAccount;
        }

        // 2. Fetch User & KYC details
        const kyc = await KycRepository.getKycByUser(userObjId);

        let user: any = null;
        if (kyc && kyc.user) {
            user = kyc.user;
        } else {
            const UserRepository = (await import('../repositories/UserRepository')).default;
            user = await UserRepository.findUserById(userId);
        }

        if (!user) {
            throw new Error('User details not found to generate virtual account');
        }

        // 3. Register or get Paystack Customer
        let customerCode = '';
        try {
            const customerRes = await paystack.createCustomer(
                user.email,
                user.firstName || 'Terminus',
                user.lastName || 'User',
                user.phoneNumber
            );
            if (customerRes?.status && customerRes.data?.customer_code) {
                customerCode = customerRes.data.customer_code;
            }
        } catch (err: any) {
            // If customer already exists, fetch existing customer detail
            const errMessage = err.response?.data?.message || err.message || '';
            if (errMessage.toLowerCase().includes('exists') || errMessage.toLowerCase().includes('duplicate') || err.response?.status === 400) {
                try {
                    const existingCustomer = await paystack.getCustomer(user.email);
                    if (existingCustomer?.status && existingCustomer.data?.customer_code) {
                        customerCode = existingCustomer.data.customer_code;
                    }
                } catch (fetchErr) {
                    console.error('Error fetching existing Paystack customer:', fetchErr);
                }
            }
            if (!customerCode) {
                console.error('Paystack Customer Registration Failed:', err.response?.data || err.message);
                throw new Error(errMessage || 'Failed to create Paystack customer');
            }
        }

        // 4. Create Dedicated Virtual Account
        const dvaResponse = await paystack.createDedicatedAccount(customerCode, 'wema-bank');
        if (!dvaResponse?.status || !dvaResponse.data) {
            console.error('Paystack DVA Creation Failed:', dvaResponse);
            throw new Error(dvaResponse?.message || 'Failed to create dedicated virtual account');
        }

        const data = dvaResponse.data;
        let bankName = '';
        let accountNumber = '';
        let accountName = '';
        let bankCode = '';

        if (data.bank) {
            bankName = data.bank.name;
            accountNumber = data.account_number;
            accountName = data.account_name;
            bankCode = data.bank.slug;
        } else if (data.bank_accounts && data.bank_accounts.length > 0) {
            const acc = data.bank_accounts[0];
            bankName = acc.bank.name;
            accountNumber = acc.account_number;
            accountName = acc.account_name;
            bankCode = acc.bank.slug;
        } else {
            throw new Error('No dedicated virtual accounts assigned by Paystack');
        }

        const virtualAccountData = {
            bankName,
            accountNumber,
            accountName,
            accountReference: customerCode,
            bankCode
        };

        // 5. Update Wallet
        await WalletRepository.updateWallet(wallet._id, {
            virtualAccount: virtualAccountData
        });

        return virtualAccountData;
    }
}

export default new VirtualAccountService();
