export type LoginType = {
    email: string;
    password: string;
    deviceToken?: string;
};

export type VerifyOTP = {
    otp: string;
    purpose: string;
    token: string;
};

export type CreateAdminType = {
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    role: string;
};

export type SignUpType = {
    token?: string;
    email: string;
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    gender?: string;
    promotionCode?: string;
    role: string;
};

export type RiderSignUpType = {
    email: string;
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    gender?: string;
    city?: string;
    vehicle?: string;
    token?: string;
};
export type ResetPasswordType = {
    password: string;
    otp: string;
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
};
export type VendorSignUpType = {
    email: string;
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    token?: string;
    vendor?: VendorType;
};

// export type RiderSignUpType = {
//     // name: string;
//     firstName?: string;
//     lastName?: string;
//     email: string;
//     phoneNumber: string;
//     password: string;
//     role: string;
//     token?: string;
//     documents?: [];
// };
