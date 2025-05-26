export type TransactionEvent = {
    eventData: {
        product: {
            reference: string;
            type: string;
        };
        transactionReference: string;
        paymentReference: string;
        paidOn: string;
        paymentDescription: string;
        metaData: Record<string, unknown>; // Adjust if there's a more specific structure
        destinationAccountInformation: Record<string, unknown>; // Adjust if there's a more specific structure
        paymentSourceInformation: Record<string, unknown>; // Adjust if there's a more specific structure
        amountPaid: number;
        totalPayable: number;
        offlineProductInformation: {
            code: string;
            type: string;
        };
        cardDetails: Record<string, unknown>; // Adjust if there's a more specific structure
        paymentMethod: string;
        currency: string;
        settlementAmount: number;
        paymentStatus: string;
        customer: {
            name: string;
            email: string;
        };
    };
    eventType: string;
};
