import { Request, Response } from 'express';
import KycService from '../../services/KycService';
import { Types } from 'mongoose';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import NotificationService from '../../services/NotificationService';
import EmailTemplate from '../../libraries/emails';
import UserService from '../../services/UserService';
import AuditService from '../../services/AuditService';

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

        // Log Action
        AuditService.log({
            adminId: (req as any).userdata.id,
            action: status === 'approved' ? 'APPROVE_KYC' : 'REJECT_KYC',
            resource: 'Kyc',
            resourceId: String(kyc._id),
            details: { status, reason: message || '' },
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        return res.status(STATUS.OK).json({
            success: true,
            message: `KYC status updated to ${status}`,
            data: kyc
        });
    });

    updateBvnStatus = asyncHandler(async (req: Request, res: Response) => {
        const kycId = new Types.ObjectId(req.params.id);
        const { bvnStatus, message } = req.body;
        const kyc = await KycService.updateBvnStatus(kycId, bvnStatus, message);
        if (!kyc) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'KYC not found'
            });
        }

        // Notify User
        if (kyc && kyc.user) {
            const notificationTitle =
                bvnStatus === 'verified'
                    ? 'BVN Verified'
                    : 'BVN Verification Update';
            const notificationMessage =
                bvnStatus === 'verified'
                    ? 'Your BVN has been successfully verified.'
                    : `Your BVN verification status has been updated to ${bvnStatus}. ${
                          message || ''
                      }`;

            await NotificationService.create({
                userId: kyc.user._id || kyc.user,
                title: notificationTitle,
                message: notificationMessage,
                status: 'unread'
            });
        }

        // Log Action
        AuditService.log({
            adminId: (req as any).userdata.id,
            action: bvnStatus === 'verified' ? 'VERIFY_BVN' : 'REJECT_BVN',
            resource: 'Kyc',
            resourceId: String(kyc._id),
            details: { bvnStatus, reason: message || '' },
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        return res.status(STATUS.OK).json({
            success: true,
            message: `BVN status updated to ${bvnStatus}`,
            data: kyc
        });
    });
}

export default new AdminKycController();
