import { Request, Response } from 'express';
import KycService from '../../services/KycService';
import { Types } from 'mongoose';
import { asyncHandler } from '../../middlewares/handlers/async';
import { STATUS } from '../../../constants';
import { currentTimestamp } from '../../../utils/helpers';
// import { uploadFileToS3 } from '../../../utils/s3';

class KycController {
    upload = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            const file = req?.files?.file;
            if (!req?.files?.file) throw Error('File Not selected');

            file.name = `${currentTimestamp()}_${file.name.replace(/ /g, '_')}`;

            // const upload = await uploadFileToS3(file, 'kyc/');

            res.status(STATUS.CREATED).send({
                success: true,
                message: 'File Updated Successfully.'
                // data: upload
            });
        }
    );

    createKyc = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const { passportUrl, address, identity, nextOfKin, guarantor } =
            req.body;

        const kyc = await KycService.getKyc(userdata.id);
        const kycData: any = {};
        if (!kyc) {
            kycData.user = userdata._id;
            kycData.status = 'pending';
            kycData.role = 'rider';

            if (passportUrl) kycData.passportUrl = passportUrl;
            if (address) {
                address.status = 'pending';
                address.address = `${address.buildingNumber} ${address.street}, ${address.city}, ${address.state}.`;
                kycData.address = address;
                kycData.status = 'pending';
            }
            if (identity) {
                identity.status = 'pending';
                kycData.identity = identity;
                kycData.status = 'pending';
            }
            if (nextOfKin) {
                nextOfKin.status = 'pending';
                kycData.nextOfKin = nextOfKin;
                kycData.status = 'pending';
            }
            if (guarantor) {
                guarantor.status = 'pending';
                kycData.guarantor = guarantor;
                kycData.status = 'pending';
            }

            const newKyc = await KycService.createKyc(userdata.id, kycData);

            return res.status(STATUS.OK).json({
                success: true,
                message: 'KYC submitted successfully',
                data: newKyc
            });
        }
        // Updating kyc data
        if (passportUrl) kycData.passportUrl = passportUrl;
        if (address && kyc.address.status != 'verified') {
            address.status = 'pending';
            kycData.address = address;
            address.address = `${address.buildingNumber} ${address.street}, ${address.city}, ${address.state}.`;
            kycData.status = 'pending';
        }
        if (identity && kyc.identity.status != 'verified') {
            identity.status = 'pending';
            kycData.identity = identity;
            kycData.status = 'pending';
        }
        if (nextOfKin && kyc.nextOfKin.status != 'verified') {
            nextOfKin.status = 'pending';
            kycData.nextOfKin = nextOfKin;
            kycData.status = 'pending';
        }
        if (guarantor && kyc.guarantor.status != 'verified') {
            guarantor.status = 'pending';
            kycData.guarantor = guarantor;
            kycData.status = 'pending';
        }

        // kyc.depopulate();
        // await kyc.save();
        const updatedKyc = await KycService.updateKyc(userdata._id, kycData);

        return res.status(STATUS.OK).json({
            success: true,
            message: 'KYC updated successfully',
            data: updatedKyc
        });
    });

    getKyc = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const userId = new Types.ObjectId(userdata._id);
        const kyc = await KycService.getKyc(userId);
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

    updateKyc = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const userId = new Types.ObjectId(userdata._id);
        const kycData = req.body;
        const kyc = await KycService.updateKyc(userId, kycData);
        if (!kyc) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'KYC not found'
            });
        }
        return res.status(STATUS.OK).json({
            success: true,
            message: 'KYC updated successfully',
            data: kyc
        });
    });
}

export default new KycController();
