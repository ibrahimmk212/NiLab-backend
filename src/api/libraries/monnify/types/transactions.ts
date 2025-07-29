export interface InitializeTransactionRequest {
    amount: number;
    customerName: string;
    customerEmail: string;
    paymentReference: string;
    paymentDescription: string;
    currencyCode: string;
    contractCode: string;
    redirectUrl: string;
    paymentMethods: string[];
}

export interface InitializeTransactionResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
        transactionReference: string;
        paymentReference: string;
        merchantName: string;
        apiKey: string;
        enabledPaymentMethod: string[];
        checkoutUrl: string;
    };
}

export interface PayWithBankTransferRequest {
    transactionReference: string;
    bankCode?: string;
}

export interface PayWithBankTransferResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
        accountNumber: string;
        accountName: string;
        bankName: string;
        bankCode: string;
        accountDurationSeconds: number;
        ussdPayment: string;
        requestTime: string;
        expiresOn: string;
        transactionReference: string;
        paymentReference: string;
        amount: number;
        fee: number;
        totalPayable: number;
        collectionChannel: string;
        productInformation: null | string; // Assuming it can be null or string, adjust based on actual API behavior
    };
}

export interface SingleTransferRequest {
    amount: number;
    reference: string;
    narration: string;
    destinationBankCode: string;
    destinationAccountNumber: string;
    currency: 'NGN';
    sourceAccountNumber: string;
}
