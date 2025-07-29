export interface IWelcomeEmail {
    name: string;
}

interface IOrderItem {
    name: string;
    quantity: number;
    price?: number; // Include if showing price per item
}

export interface IOrderConfirmation {
    name: string;
    orderId: string;
    orderItems: IOrderItem[];
    total: string;
    deliveryTime: string;
}

export interface IDeliveryStatusUpdate {
    name: string;
    orderId: string;
    riderName: string;
    riderStatus: string; // e.g., "10 minutes away"
    arrivalTime: string;
}

export interface IOrderDelivered {
    name: string;
    orderId: string;
    reviewLink: string;
}

export interface IPasswordReset {
    name: string;
    resetLink: string;
}

// VENDOR
export interface IVendorOnboarding {
    vendorName: string;
    email: string;
    temporaryPassword: string;
}

export interface IVendorOrderItem {
    name: string;
    quantity: number;
}

export interface IVendorNewOrder {
    vendorName: string;
    orderId: number | string;
    orderItems: IVendorOrderItem[];
    orderDetailsUrl: string;
}

export interface IVendorOrderPaymentReceipt {
    vendorName: string;
    orderId: number | string;
    orderItems: IVendorOrderItem[]; // Assuming the same structure as IVendorOrderItem above
    totalAmount: number;
}

export interface IVendorAccountSuspension {
    vendorName: string;
    reasonForSuspension: string;
}
export interface IVendorBankDetailsUpdate {
    vendorName: string;
    bankName: string;
    accountNumber: string;
}
export interface IVendorNewStaff {
    staffName: string;
    email: string;
    temporaryPassword: string;
    loginUrl: string;
}

// RIDER

export interface IRiderWelcome {
    riderName: string;
}

export interface IVerifyEmail {
    name: string;
    otpCode: string; // One Time Password
    expiryTime: string;
}

export interface IForgotPassword {
    name: string;
    otp: string; // One Time Password
    expiryTime: string;
}

export interface IRiderDeliveryRequestAvailable {
    // riderName: string;
    // orderId: number | string;
    pickupLocation: string;
    deliveryLocation: string;
    orderType: string;
}

export interface IRiderDeliveryPaymentReceipt {
    riderName: string;
    orderId: number | string;
    date: string; // Consider using a more specific type, e.g., Date or string formatted as a date
    amount: string; // The amount paid for the delivery
}

export interface IRiderAccountVerified {
    riderName: string;
}

export interface IRiderAccountSuspended {
    riderName: string;
    reason: string; // Reason for the account suspension
}
