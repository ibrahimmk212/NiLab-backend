import mongoose from 'mongoose'; 

export type CreateAdminType = { 
    firstname: number;
    address: string;
    phone: string;
    code: number;
};

export type UpdateAdminStatusType = {
    status?: 'accepted' | 'preparing' | 'dispatched' | 'delivered' | 'canceled';
};
