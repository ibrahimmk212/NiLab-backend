import { Request, Response } from 'express';
import KycService from '../../services/KycService';
import { Types } from 'mongoose';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import NotificationService from '../../services/NotificationService';
import EmailTemplate from '../../libraries/emails';
import UserService from '../../services/UserService';
import AuditService from '../../services/AuditService';
import LogService from '../../services/LogService';

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

        // ✅ Also Record in System Log (for AuditLogList UI)
        await LogService.recordAction(
            (req as any).userdata.id,
            `${status === 'approved' ? 'Approved' : 'Rejected'} KYC for user: ${
                (kyc.user as any)?.firstName || kyc.user
            }`
        );

        return res.status(STATUS.OK).json({
            success: true,
            message: `KYC status updated to ${status}`,
            data: kyc
        });
    });

    updateNinStatus = asyncHandler(async (req: Request, res: Response) => {
        const kycId = new Types.ObjectId(req.params.id);
        const { ninStatus, message } = req.body;
        const kyc = await KycService.updateNinStatus(kycId, ninStatus, message);
        if (!kyc) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'KYC not found'
            });
        }

        // Notify User
        if (kyc && kyc.user) {
            const notificationTitle =
                ninStatus === 'verified'
                    ? 'NIN Verified'
                    : 'NIN Verification Update';
            const notificationMessage =
                ninStatus === 'verified'
                    ? 'Your NIN has been successfully verified.'
                    : `Your NIN verification status has been updated to ${ninStatus}. ${
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
            action: ninStatus === 'verified' ? 'VERIFY_NIN' : 'REJECT_NIN',
            resource: 'Kyc',
            resourceId: String(kyc._id),
            details: { ninStatus, reason: message || '' },
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        // ✅ Also Record in System Log (for AuditLogList UI)
        await LogService.recordAction(
            (req as any).userdata.id,
            `${ninStatus === 'verified' ? 'Verified' : 'Rejected'} NIN for user: ${
                (kyc.user as any)?.firstName || kyc.user
            }`
        );

        return res.status(STATUS.OK).json({
            success: true,
            message: `NIN status updated to ${ninStatus}`,
            data: kyc
        });
    });
}

export default new AdminKycController();
