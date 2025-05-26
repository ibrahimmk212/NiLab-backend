import mongoose from 'mongoose';

export type CreateProductType = {
    name: string;
    price: number;
    available?: boolean;
    description?: string;
    vendor: mongoose.Types.ObjectId;
    category: mongoose.Types.ObjectId;
    ratings?: number;
    images?: [];
    thumbnail?: string;
    status?: string;
};

export type UpdateProductType = {
    name?: string;
    price?: number;
    available?: boolean;
    description?: string;
    vendor?: mongoose.Types.ObjectId;
    category?: mongoose.Types.ObjectId;
    ratings?: number;
    image?: string;
    thumbnail?: string;
    status?: string;
};
