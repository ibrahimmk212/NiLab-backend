export type LoginType = {
    email?: string;
    phone?: string;
    password: string;
};

export type VerifyOTP = {
    otp: string;
    purpose: string;
    token: string;
};

export type SignUpType = {
    email: string;
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    token?: string;
};

export type VendorType = {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    description?: string;
    logo?: string;
    banner?: string;

}
export type VendorSignUpType = {
    email: string;
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    token?: string;
    vendor?: VendorType
};

export type ResetPasswordType = {
    password: string;
    otp: string;
    token?: string;
};
