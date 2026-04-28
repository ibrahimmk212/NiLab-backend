import { Request, Response } from 'express';
import KycService from '../../services/KycService';
import { Types } from 'mongoose';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import NotificationService from '../../services/NotificationService';
import EmailTemplate from '../../libraries/emails';
import UserService from '../../services/UserService';

class AdminKycController {
    getKycs = asyncHandler(async (req: Request, res: Response) => {
        const { status } = req.query;
        const pendingKycs = await KycService.getKycByStatus(status as string);
        return res.status(STATUS.OK).json({
            success: true,
            data: pendingKycs
        });
    });

    getKycDetails = asyncHandler(async (req: Request, res: Response) => {
        const kycId = new Types.ObjectId(req.params.id);
        const kyc = await KycService.getKyc(kycId);
        if (!kyc) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'KYC not found'
            });
        }
        return res.status(STATUS.OK).json({
            success: true,
            data: kyc
        });
    });

    updateKycStatus = asyncHandler(async (req: Request, res: Response) => {
        const kycId = new Types.ObjectId(req.params.id);
        const { status, message } = req.body;
        const kyc = await KycService.updateKycStatus(kycId, status, message);
        if (!kyc) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'KYC not found'
            });
        }
        // Notify User
        if (kyc && kyc.user) {
            const notificationTitle =
                status === 'approved'
                    ? 'KYC Approved'
                    : 'KYC Application Update';
            const notificationMessage =
                status === 'approved'
                    ? 'Congratulations! Your full KYC application has been approved.'
                    : `Your KYC application status has been updated to ${status}. ${
                          message || ''
                      }`;

            await NotificationService.create({
                userId: kyc.user._id || kyc.user,
                title: notificationTitle,
                message: notificationMessage,
                status: 'unread'
            });

            if (status === 'rejected') {
                try {
                    const userAccount = await UserService.getUserDetail(
                        String(kyc.user._id || kyc.user)
                    );
                    if (userAccount) {
                        await EmailTemplate.kycRejected(userAccount.email, {
                            name: userAccount.firstName || 'User',
                            reason: message || 'Please update your documents.'
                        });
                    }
                } catch (error) {
                    console.error('Failed to send KYC rejection email', error);
                }
            }
        }

        return res.status(STATUS.OK).json({
            success: true,
            message: `KYC status updated to ${status}`,
            data: kyc
        });
    });

    updateKycAddress = asyncHandler(async (req: Request, res: Response) => {
        const kycId = new Types.ObjectId(req.params.id);
        const { status, message } = req.body;

        const kyc = await KycService.getKyc(kycId);
        if (!kyc) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'KYC not found'
            });
        }

        const updatedKyc = await KycService.updateKyc(kyc.user._id, {
            address: { ...kyc.address, status, message }
        });

        // Notify User if rejected
        if (updatedKyc && status === 'rejected') {
            await NotificationService.create({
                userId: kyc.user._id || kyc.user,
                title: 'KYC Document Rejected',
                message: `Your Proof of Address was rejected. Reason: ${message}`,
                status: 'unread'
            });

            try {
                const userAccount = await UserService.getUserDetail(String(kyc.user._id || kyc.user));
                if (userAccount) {
                    await EmailTemplate.kycRejected(userAccount.email, {
                        name: userAccount.firstName || 'User',
                        reason: message || 'Address verification failed.'
                    });
                }
            } catch (error) {
                console.error('Failed to send KYC rejection email', error);
            }
        }

        return res.status(STATUS.OK).json({
            success: true,
            message: `KYC status updated to ${status}`,
            data: updatedKyc
        });
    });

    updateKycIdentity = asyncHandler(async (req: Request, res: Response) => {
        const kycId = new Types.ObjectId(req.params.id);
        const { status, message } = req.body;

        const kyc = await KycService.getKyc(kycId);
        if (!kyc) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'KYC not found'
            });
        }

        const updatedKyc = await KycService.updateKyc(kyc.user._id, {
            identity: { ...kyc.identity, status, message }
        });

        // Notify User if rejected
        if (updatedKyc && status === 'rejected') {
            await NotificationService.create({
                userId: kyc.user._id || kyc.user,
                title: 'KYC Document Rejected',
                message: `Your Identity Verification was rejected. Reason: ${message}`,
                status: 'unread'
            });

            try {
                const userAccount = await UserService.getUserDetail(String(kyc.user._id || kyc.user));
                if (userAccount) {
                    await EmailTemplate.kycRejected(userAccount.email, {
                        name: userAccount.firstName || 'User',
                        reason: message || 'Identity verification failed.'
                    });
                }
            } catch (error) {
                console.error('Failed to send KYC rejection email', error);
            }
        }

        return res.status(STATUS.OK).json({
            success: true,
            message: `KYC status updated to ${status}`,
            data: updatedKyc
        });
    });

    updateKycBvn = asyncHandler(async (req: Request, res: Response) => {
        const kycId = new Types.ObjectId(req.params.id);
        const { status, message } = req.body;

        const kyc = await KycService.getKyc(kycId);
        if (!kyc) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'KYC not found'
            });
        }

        const updatedKyc = await KycService.updateKyc(kyc.user._id, {
            bvn: { ...kyc.bvn, status, message }
        });

        // Notify User if rejected
        if (updatedKyc && status === 'rejected') {
            await NotificationService.create({
                userId: kyc.user._id || kyc.user,
                title: 'KYC BVN Verification Failed',
                message: `Your BVN verification failed. Reason: ${message}`,
                status: 'unread'
            });
            
            try {
                const userAccount = await UserService.getUserDetail(String(kyc.user._id || kyc.user));
                if (userAccount) {
                    await EmailTemplate.kycRejected(userAccount.email, {
                        name: userAccount.firstName || 'User',
                        reason: message || 'BVN verification failed.'
                    });
                }
            } catch (error) {
                console.error('Failed to send KYC rejection email', error);
            }
        }

        return res.status(STATUS.OK).json({
            success: true,
            message: `BVN status updated to ${status}`,
            data: updatedKyc
        });
    });

    updateKycNextOfKin = asyncHandler(async (req: Request, res: Response) => {
        const kycId = new Types.ObjectId(req.params.id);
        const { status, message } = req.body;

        const kyc = await KycService.getKyc(kycId);
        if (!kyc) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'KYC not found'
            });
        }

        const updatedKyc = await KycService.updateKyc(kyc.user._id, {
            nextOfKin: { ...kyc.nextOfKin, status, message }
        });

        // Notify User if rejected
        if (updatedKyc && status === 'rejected') {
            await NotificationService.create({
                userId: kyc.user._id || kyc.user,
                title: 'KYC Document Rejected',
                message: `Your Next of Kin details were rejected. Reason: ${message}`,
                status: 'unread'
            });

            try {
                const userAccount = await UserService.getUserDetail(String(kyc.user._id || kyc.user));
                if (userAccount) {
                    await EmailTemplate.kycRejected(userAccount.email, {
                        name: userAccount.firstName || 'User',
                        reason: message || 'Next of Kin details verification failed.'
                    });
                }
            } catch (error) {
                console.error('Failed to send KYC rejection email', error);
            }
        }

        return res.status(STATUS.OK).json({
            success: true,
            message: `KYC status updated to ${status}`,
            data: updatedKyc
        });
    });

    updateKycGuarantor = asyncHandler(async (req: Request, res: Response) => {
        const kycId = new Types.ObjectId(req.params.id);
        const { status, message } = req.body;

        const kyc = await KycService.getKyc(kycId);
        if (!kyc) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'KYC not found'
            });
        }

        const updatedKyc = await KycService.updateKyc(kyc.user._id, {
            guarantor: { ...kyc.guarantor, status, message }
        });

        // Notify User if rejected
        if (updatedKyc && status === 'rejected') {
            await NotificationService.create({
                userId: kyc.user._id || kyc.user,
                title: 'KYC Document Rejected',
                message: `Your Guarantor details were rejected. Reason: ${message}`,
                status: 'unread'
            });

            try {
                const userAccount = await UserService.getUserDetail(String(kyc.user._id || kyc.user));
                if (userAccount) {
                    await EmailTemplate.kycRejected(userAccount.email, {
                        name: userAccount.firstName || 'User',
                        reason: message || 'Guarantor verification failed.'
                    });
                }
            } catch (error) {
                console.error('Failed to send KYC rejection email', error);
            }
        }

        return res.status(STATUS.OK).json({
            success: true,
            message: `KYC status updated to ${status}`,
            data: updatedKyc
        });
    });
}

export default new AdminKycController();
