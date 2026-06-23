import axios, { AxiosInstance } from 'axios';
import appConfig from '../../../config/appConfig';

class Paystack {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.paystack.co',
            headers: {
                Authorization: `Bearer ${appConfig.paystack.secretKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 20000
        });
        // Force IPv4 to prevent connection timeout issues in Docker environments
        this.client.defaults.family = 4;
    }

    /**
     * Get a customer by email or code
     */
    async getCustomer(emailOrCode: string): Promise<any> {
        try {
            const response = await this.client.get(`/customer/${emailOrCode}`);
            return response.data;
        } catch (error: any) {
            console.error('[Paystack getCustomer Error]:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get a list of all supported banks in Nigeria
     */
    async getBanks(): Promise<any> {
        try {
            const response = await this.client.get('/bank?currency=NGN');
            return response.data;
        } catch (error: any) {
            console.error('[Paystack getBanks Error]:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Resolve a NUBAN account number
     */
    async resolveAccountNumber(accountNumber: string, bankCode: string): Promise<any> {
        try {
            const response = await this.client.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
            return response.data;
        } catch (error: any) {
            console.error('[Paystack resolveAccountNumber Error]:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create a customer on Paystack
     */
    async createCustomer(email: string, firstName: string, lastName: string, phone?: string): Promise<any> {
        try {
            const response = await this.client.post('/customer', {
                email,
                first_name: firstName,
                last_name: lastName,
                phone
            });
            return response.data;
        } catch (error: any) {
            console.error('[Paystack createCustomer Error]:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create a Dedicated Virtual Account (DVA) for a customer
     */
    async createDedicatedAccount(customerCodeOrId: string, preferredBank = 'wema-bank'): Promise<any> {
        try {
            const response = await this.client.post('/dedicated_account', {
                customer: customerCodeOrId,
                preferred_bank: preferredBank
            });
            return response.data;
        } catch (error: any) {
            console.error('[Paystack createDedicatedAccount Error]:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Initiate a web payment/checkout link
     * Amount is in NGN (converts to kobo automatically)
     */
    async initiatePayment(
        amount: number,
        email: string,
        reference: string,
        callbackUrl?: string,
        metadata?: any
    ): Promise<any> {
        try {
            const response = await this.client.post('/transaction/initialize', {
                email,
                amount: Math.round(amount * 100), // convert to kobo
                reference,
                callback_url: callbackUrl || appConfig.paystack.redirectUrl,
                metadata
            });
            return response.data;
        } catch (error: any) {
            console.error('[Paystack initiatePayment Error]:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create a transfer recipient for outbound payouts
     */
    async createTransferRecipient(accountNumber: string, bankCode: string, accountName: string): Promise<any> {
        try {
            const response = await this.client.post('/transferrecipient', {
                type: 'nuban',
                name: accountName,
                account_number: accountNumber,
                bank_code: bankCode,
                currency: 'NGN'
            });
            return response.data;
        } catch (error: any) {
            console.error('[Paystack createTransferRecipient Error]:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Initiate an outbound bank transfer payout
     * Amount is in NGN (converts to kobo automatically)
     */
    async initiateTransfer(
        amount: number,
        recipientCode: string,
        reference: string,
        reason?: string
    ): Promise<any> {
        try {
            const response = await this.client.post('/transfer', {
                source: 'balance',
                amount: Math.round(amount * 100), // convert to kobo
                recipient: recipientCode,
                reference,
                reason: reason || 'Terminus Payout'
            });
            return response.data;
        } catch (error: any) {
            console.error('[Paystack initiateTransfer Error]:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get details / verification of a transaction reference
     */
    async getTransactionStatus(reference: string): Promise<any> {
        try {
            const response = await this.client.get(`/transaction/verify/${encodeURIComponent(reference)}`);
            return response.data;
        } catch (error: any) {
            console.error('[Paystack getTransactionStatus Error]:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get details of a transfer
     */
    async getTransferStatus(transferCode: string): Promise<any> {
        try {
            const response = await this.client.get(`/transfer/${transferCode}`);
            return response.data;
        } catch (error: any) {
            console.error('[Paystack getTransferStatus Error]:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get Paystack account balance (payout/disbursement ledger balance)
     */
    async getWalletBalance(): Promise<any> {
        try {
            const response = await this.client.get('/balance');
            return response.data;
        } catch (error: any) {
            console.error('[Paystack getWalletBalance Error]:', error.response?.data || error.message);
            throw error;
        }
    }
}

export default new Paystack();
