export type CreateUserType = {
    role?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber: string;
    email: string;
    password: string;
};

export type UpdateUserType = {
    role?: string;
    firstName: string;
    lastName: string;
    bvnStatus?: string;
    profilePicture: string;
};

export type UpdateProfilePictureType = {
    profilePicture: string;
};

export type BanUserType = {
    reasonForBan: string;
};
