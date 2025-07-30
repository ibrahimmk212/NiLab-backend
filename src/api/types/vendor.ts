import mongoose from 'mongoose';

export type CreateVendorType = {
    name: string;
    address?: string;
    description?: string;
    userId: mongoose.Types.ObjectId;
    email: string;
    phoneNumber: string;
    logo?: string;
    banner?: string;
    lat?: number;
    lng?: number;
};

export type UpdateVendorType = {
    name: string;
    address?: string;
    description?: string;
    email?: string;
    phoneNumber?: string;
    ratings?: number;
    logo?: string;
    banner?: string;
    lat?: number;
    lng?: number;
};
