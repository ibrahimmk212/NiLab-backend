import { Request, Response } from 'express';
import KycService from '../../services/KycService';
import { Types } from 'mongoose';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';

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

        return res.status(STATUS.OK).json({
            success: true,
            message: `KYC status updated to ${status}`,
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

        return res.status(STATUS.OK).json({
            success: true,
            message: `KYC status updated to ${status}`,
            data: updatedKyc
        });
    });
}

export default new AdminKycController();
