// Interfaces for request parameters

export interface CreateReservedAccountParams {
    accountReference: string;
    accountName: string;
    currencyCode: string;
    contractCode: string;
    customerEmail: string;
    bvn: string;
    getAllAvailableBanks: boolean;
    preferredBanks: string[]; // assuming this is an array of strings, but adjust if it's an array of objects or another type
    incomeSplitConfig: any; // replace 'any' with a more specific type based on the structure of incomeSplitConfig
    restrictPaymentSource: boolean;
    allowedPaymentSource: any; // replace 'any' with a more specific type
    nin: string;
}

export interface CreateInvoiceReservedAccountParams {
    contractCode: string;
    accountName: string;
    currencyCode: string;
    accountReference: string;
    customerName: string;
    customerEmail: string;
    reservedAccountType: string;
    bvn: string;
    nin: string;
}

export interface AddLinkedAccountsParams {
    getAllAvailableBanks: boolean;
    preferredBanks: string[]; // assuming this is an array of strings, adjust if necessary
    accountReference: string;
}

export interface UpdateBVNParams {
    bvn: string;
}

export interface AllowedPaymentSourceParams {
    restrictPaymentSource: boolean;
    allowedPaymentSource: {
        bvns: string[];
        bankAccounts: {
            accountNumbers: string; // assuming single account number per bank account
            bankCode: string;
        }[];
        accountNames: string[];
    };
    accountReference: string;
}

export interface UpdateSplitConfigParams {
    subAccountCode: string;
    feeBearer: boolean;
    feePercentage: number;
    splitPercentage: number;
    accountReference: string;
}

export interface GetReservedAccountTransactionsParams {
    accountReference: string;
    page: number;
    size: number;
}

export interface UpdateKYCInfoParams {
    bvn: string;
    nin: string;
    accountReference: string;
}

// Interfaces for API responses
interface AccountDetail {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
}

interface IncomeSplitConfigDetail {
    subAccountCode: string;
    feePercentage: number;
    feeBearer: boolean;
    splitPercentage: number;
    reservedAccountConfigCode: string;
}

interface ReservedAccountTransaction {
    customerDTO: {
        email: string;
        name: string;
        merchantCode: string;
    };
    providerAmount: number;
    paymentMethod: string;
    createdOn: string;
    amount: number;
    flagged: boolean;
    providerCode: string;
    fee: number;
    currencyCode: string;
    completedOn: string;
    paymentDescription: string;
    paymentStatus: string;
    transactionReference: string;
    paymentReference: string;
    merchantCode: string;
    merchantName: string;
    payableAmount: number;
    amountPaid: number;
    completed: boolean;
}

export interface GetReservedAccountTransactionsResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
        content: ReservedAccountTransaction[];
        pageable: {
            sort: {
                sorted: boolean;
                unsorted: boolean;
                empty: boolean;
            };
            pageSize: number;
            pageNumber: number;
            offset: number;
            unpaged: boolean;
            paged: boolean;
        };
        totalElements: number;
        totalPages: number;
        last: boolean;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        first: boolean;
        numberOfElements: number;
        size: number;
        number: number;
        empty: boolean;
    };
}

export interface UpdateKYCInfoResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
        accountReference: string;
        accountName: string;
        customerEmail: string;
        customerName: string;
        bvn: string;
    };
}

// Interface for Update BVN for a Reserve Account
export interface UpdateBVNResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
        contractCode: string;
        accountReference: string;
        currencyCode: string;
        customerEmail: string;
        customerName: string;
        accountNumber: string;
        bankName: string;
        bankCode: string;
        collectionChannel: string;
        reservationReference: string;
        reservedAccountType: string;
        status: string;
        createdOn: string;
        bvn: string;
        restrictPaymentSource: boolean;
    };
}

// Interface for Allowed Payment Source(s)
export interface AllowedPaymentSourceResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
        restrictPaymentSource: boolean;
        allowedPaymentSources: {
            bvns: string[];
            bankAccounts: {
                accountNumber: string;
                bankCode: string;
            }[];
            accountNames: string[];
        };
    };
}

// Interface for Updating Split Config for Reserved Account
export interface UpdateSplitConfigResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
        code: string;
        reservedAccountCode: string;
        feeBearer: string;
        configDetails: IncomeSplitConfigDetail[];
    };
}

// Interfaces for Create Reserved Account (General) and (Invoice)
export interface ReservedAccountGeneralResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseCode: string;
    responseBody: {
        contractCode: string;
        accountReference: string;
        accountName: string;
        currencyCode: string;
        customerEmail: string;
        customerName: string;
        accounts: AccountDetail[];
        collectionChannel: string;
        reservationReference: string;
        reservedAccountType: string;
        status: string;
        createdOn: string;
        incomeSplitConfig: IncomeSplitConfigDetail[];
        bvn: string;
        restrictPaymentSource: boolean;
    };
}
