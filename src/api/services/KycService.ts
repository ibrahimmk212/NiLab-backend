/* eslint-disable @typescript-eslint/no-explicit-any */
import KycRepository from '../repositories/KycRepository';
import { Types } from 'mongoose';
import { Kyc } from '../models/Kyc';
import UserRepository from '../repositories/UserRepository';

class KycService {
    async createKyc(
        userId: Types.ObjectId,
        kycData: Partial<Kyc>
    ): Promise<Kyc> {
        const kyc = await KycRepository.createKyc({
            ...kycData,
            user: userId
        });
        await UserRepository.updateUser(`${userId}`, {
            kycStatus: 'pending'
        });

        // Sync Vendor record
        try {
            const { default: VendorRepository } = await import('../repositories/VendorRepository');
            const vendor = await VendorRepository.findByKey('userId', userId.toString());
            if (vendor) {
                await VendorRepository.update(vendor._id.toString(), {
                    kycStatus: 'pending',
                    identityVerificationStatus: 'pending'
                });
            }
        } catch (err) {
            console.error('Failed to sync KYC status to vendor', err);
        }

        return kyc;
    }

    async getKyc(userId: Types.ObjectId): Promise<Kyc | null> {
        return await KycRepository.getKycByUser(userId);
    }

    async updateKyc(
        userId: Types.ObjectId,
        kycData: Partial<Kyc>
    ): Promise<Kyc | null> {
        return await KycRepository.updateKyc(userId, kycData);
    }

    async getKycById(kycId: Types.ObjectId): Promise<Kyc | null> {
        return await KycRepository.getKycById(kycId);
    }

    async updateKycStatus(
        kycId: Types.ObjectId,
        status: 'pending' | 'not_submitted' | 'verified' | 'rejected' | 'approved',
        message?: string
    ): Promise<Kyc | null> {
        const kyc: any = await KycRepository.getKycById(kycId);
        if (!kyc) throw new Error('KYC not found!');
        
        const updatedKyc = await KycRepository.updateKycStatus(kycId, status, message);
        if (updatedKyc && updatedKyc.user) {
            const userUpdate: any = { kycStatus: status };
            
            // For MVP: Approving KYC status also means approving ninStatus
            if (status === 'approved') {
                userUpdate.ninStatus = 'verified';
                // Sync the NIN status in the Kyc document as well
                await KycRepository.updateNinStatus(kycId, 'verified', 'Automatically verified via KYC approval');
            } else if (status === 'rejected') {
                userUpdate.ninStatus = 'failed';
                await KycRepository.updateNinStatus(kycId, 'failed', 'Automatically rejected via KYC rejection');
            }

            const userIdStr = String(updatedKyc.user._id || updatedKyc.user);
            await UserRepository.updateUser(userIdStr, userUpdate);

            // Sync Vendor record
            try {
                const { default: VendorRepository } = await import('../repositories/VendorRepository');
                const vendor = await VendorRepository.findByKey('userId', userIdStr);
                if (vendor) {
                    const vendorKycStatus = status === 'approved' ? 'verified' : status === 'rejected' ? 'failed' : status;
                    await VendorRepository.update(vendor._id.toString(), {
                        kycStatus: vendorKycStatus as any,
                        identityVerificationStatus: vendorKycStatus as any,
                        // If approved, we might want to auto-activate if they have a location
                        status: status === 'approved' && vendor.location?.coordinates?.length === 2 ? 'active' : vendor.status
                    });
                }
            } catch (err) {
                console.error('Failed to sync KYC status to vendor', err);
            }

            // Sync Rider record
            try {
                const { default: RiderRepository } = await import('../repositories/RiderRepository');
                const rider = await RiderRepository.findByKey('userId', userIdStr);
                if (rider) {
                    const riderStatus = status === 'approved' ? 'verified' : status === 'rejected' ? 'unverified' : rider.status;
                    await RiderRepository.updateRider(rider._id.toString(), {
                        status: riderStatus as any
                    });
                }
            } catch (err) {
                console.error('Failed to sync KYC status to rider', err);
            }
        }
        return updatedKyc;
    }

    async updateNinStatus(
        kycId: Types.ObjectId,
        ninStatus: 'pending' | 'not_submitted' | 'verified' | 'failed',
        message?: string
    ): Promise<Kyc | null> {
        const kyc: any = await KycRepository.getKycById(kycId);
        if (!kyc) throw new Error('KYC not found!');

        const updatedKyc = await KycRepository.updateNinStatus(kycId, ninStatus, message);
        if (updatedKyc && updatedKyc.user) {
            await UserRepository.updateUser(String(updatedKyc.user._id || updatedKyc.user), {
                ninStatus: ninStatus
            });
        }
        return updatedKyc;
    }

    async getKycByStatus(status: string): Promise<Kyc[]> {
        return await KycRepository.getKycByStatus(status);
    }
}

export default new KycService();
