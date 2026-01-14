import appConfig from '../../../config/appConfig';
import MonnifyApi from './config';
import {
    InitializeTransactionRequest,
    InitializeTransactionResponse,
    PayWithBankTransferRequest,
    PayWithBankTransferResponse,
    SingleTransferRequest
} from './types/transactions';

interface Bank {
    name: string;
    code: string;
    ussdTemplate: string;
    baseUssdCode: string;
    transferUssdTemplate: string;
}

interface BanksResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: Bank[];
}

interface TransferResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
        amount: number;
        reference: string;
        status: string;
        dateCreated: string;
        totalFee: number;
        destinationAccountName: string;
        destinationBankName: string;
        destinationAccountNumber: string;
        destinationBankCode: string;
    };
    // Define the structure of the transfer response
}

interface OtpResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
        message: string;
    };
    // Define the structure of the OTP response
}

class Monnify extends MonnifyApi {
    // private monnifyApi;
    private accessToken = null;

    constructor() {
        super(
            appConfig.monnify.monnifySecretKey,
            appConfig.monnify.monnifyApiKey,
            appConfig.monnify.baseUrl
        );
        console.log('creating monify');
        // if (!appConfig.monnify.accessToken) {
        //     this.genToken();
        // }
    }

    // to generate token
    async genToken(): Promise<any> {
        const key = Buffer.from(
            appConfig.monnify.monnifyApiKey +
                ':' +
                appConfig.monnify.monnifySecretKey
        ).toString('base64');
        const path = '/api/v1/auth/login';
        const headers = {
            Authorization: `Basic ${key}`
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers
        });

        console.log(data);
        // appConfig.monnify.accessToken =
        return data.responseBody?.accessToken;

        // setTimeout(() => {
        //     appConfig.monnify.accessToken = '';
        //     console.log('deleting expired token');
        // }, (1000 * data.responseBody?.expiresIn ?? 0) as number);
        // return data;
    }

    // to reserve an account
    async reserveAccount(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<any> {
        const path = '/api/v2/bank-transfer/reserved-accounts';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    // To get list of all banks
    async getBanks(): Promise<BanksResponse> {
        const accessToken = await this.genToken();

        const path = '/api/v1/banks';
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        const data = await this.makeRequest({ method: 'GET', path, headers });
        return data;
    }

    // To make a single outbound transfer
    async singleOutboundTransfer(
        requestBody: SingleTransferRequest
    ): Promise<TransferResponse | any> {
        const accessToken = await this.genToken();
        if (!accessToken) {
            return { success: false, message: 'Invalid token' };
        }

        const path = '/api/v2/disbursements/single';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    // To make a bulk outbound transfer
    async bulkOutboundTransfer(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<TransferResponse | Error> {
        const path = '/api/v2/disbursements/batch';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    // To authorize a single outbound transfer
    async authorizeSingleTransfer(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<OtpResponse | Error> {
        const path = '/api/v2/disbursements/single/validate-otp';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    // To authorize a bulk outbound transfer
    async authorizeBulkTransfer(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<OtpResponse | Error> {
        const path = '/api/v2/disbursements/batch/validate-otp';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    // To resend OTP for a single transfer
    async resendOtpSingle(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<OtpResponse | Error> {
        const path = '/api/v2/disbursements/single/resend-otp';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    // To resend OTP for a bulk transfer
    async resendOtpBulk(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<OtpResponse | Error> {
        const path = '/api/v2/disbursements/batch/resend-otp';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    // To get single outbound transfer status
    async getSingleTransferStatus(
        reference: string,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = `/api/v2/disbursements/single/summary?reference=${reference}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        const data = await this.makeRequest({ method: 'GET', path, headers });
        return data;
    }

    // To get bulk outbound transfer status
    async getBulkTransferStatus(
        reference: string,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = `/api/v2/disbursements/batch/summary?reference=${reference}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        const data = await this.makeRequest({ method: 'GET', path, headers });
        return data;
    }

    // To get merchant account wallet balance
    async getWalletBalance(
        accountNumber: string,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = `/api/v2/disbursements/wallet-balance?accountNumber=${accountNumber}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        const data = await this.makeRequest({ method: 'GET', path, headers });
        return data;
    }

    // For merchant to receive payments
    async initiatePayment(
        requestBody: InitializeTransactionRequest,
        accessToken: string
    ): Promise<InitializeTransactionResponse> {
        // if (!appConfig.monnify.accessToken) {
        //     await this.genToken();
        // }
        // Define a specific interface for the response
        const path = '/api/v1/merchant/transactions/init-transaction';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }
    async payWithBankTransfer(
        requestBody: PayWithBankTransferRequest,
        accessToken: string
    ): Promise<PayWithBankTransferResponse> {
        // if (appConfig.monnify.accessToken === '') {
        //     await this.genToken();
        // }
        // Define a specific interface for the response
        const path = '/api/v1/merchant/bank-transfer/init-payment';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    async payWithCard(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = '/api/v1/merchant/cards/charge';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    async authorizeOtpForCard(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = '/api/v1/merchant/cards/otp/authorize';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    async chargeCardToken(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = '/api/v1/merchant/cards/charge-card-token';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    async deleteReservedAccount(
        accountReference: string,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = `/api/v1/bank-transfer/reserved-accounts/reference/${accountReference}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        const data = await this.makeRequest({
            method: 'DELETE',
            path,
            headers
        });
        return data;
    }

    async createLimitProfile(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = '/api/v1/limit-profile/';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    async updateLimitProfile(
        limitProfileCode: string,
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = `/api/v1/limit-profile/${limitProfileCode}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'PUT',
            path,
            headers,
            requestBody
        });
        return data;
    }

    async getLimitProfiles(accessToken: string): Promise<any> {
        // Define a specific interface for the response
        const path = '/api/v1/limit-profile/';
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        const data = await this.makeRequest({ method: 'GET', path, headers });
        return data;
    }

    async reserveAccountWithLimit(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = '/api/v1/bank-transfer/reserved-accounts/limit';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }
    async updateReserveAccountLimit(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = '/api/v1/bank-transfer/reserved-accounts/limit';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'PUT',
            path,
            headers,
            requestBody
        });
        return data;
    }

    async initiateRefund(
        requestBody: Record<string, unknown>,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = '/api/v1/refunds/initiate-refund';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        const data = await this.makeRequest({
            method: 'POST',
            path,
            headers,
            requestBody
        });
        return data;
    }

    async getAllRefunds(
        page: number,
        size: number,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = `/api/v1/refunds?page=${page}&size=${size}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        const data = await this.makeRequest({ method: 'GET', path, headers });
        return data;
    }

    async getRefundStatus(
        refundReference: string,
        accessToken: string
    ): Promise<any> {
        // Define a specific interface for the response
        const path = `/api/v1/refunds/${refundReference}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        const data = await this.makeRequest({ method: 'GET', path, headers });
        return data;
    }

    async validateBankAccount(
        accountNumber: string,
        bankCode: string
    ): Promise<any> {
        const accessToken = await this.genToken();
        if (!accessToken) {
            return { success: false, message: 'Invalid token' };
        }
        // Define a specific interface for the response
        const path = `/api/v1/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        const data = await this.makeRequest({ method: 'GET', path, headers });
        console.log('enquiry data', data);
        return data;
    }
    async getTransactionStatus(
        transactionReference: string,
        accessToken: string
    ): Promise<any> {
        // Encoded reference is safer for URL paths
        const encodedRef = encodeURIComponent(transactionReference);
        const path = `/api/v2/transactions/${encodedRef}`;

        const headers = {
            Authorization: `Bearer ${accessToken}`
        };

        const data = await this.makeRequest({
            method: 'GET',
            path,
            headers
        });

        // Monnify v2 returns responseBody with paymentStatus (PAID, OVERPAID, PARTIALLY_PAID, etc.)
        return data.responseBody;
    }
}

export default new Monnify();
