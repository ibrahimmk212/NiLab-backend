import { Request, Response } from 'express';
import KycService from '../../services/KycService';
import { Types } from 'mongoose';
import { asyncHandler } from '../../middlewares/handlers/async';
import { STATUS } from '../../../constants';
import emails from '../../libraries/emails';
import VendorService from '../../services/VendorService';
import { v2 as cloudinaryV2 } from 'cloudinary';
import { Readable } from 'stream';

class VendorKycController {
    upload = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            const { userdata }: any = req;
            const file = req?.file;
            if (!file) throw Error('File Not selected');

            const stream = cloudinaryV2.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    public_id: `vendor_kyc_${userdata.id}_${Date.now()}`
                },
                (error, result) => {
                    if (error) {
                        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: 'File upload failed',
                            error: error.message
                        });
                    }

                    if (result) {
                        return res.status(STATUS.CREATED).send({
                            success: true,
                            message: 'File Uploaded Successfully.',
                            data: { 
                                url: result.secure_url,
                                publicId: result.public_id
                            }
                        });
                    }
                }
            );

            const bufferStream = new Readable();
            bufferStream.push(file.buffer);
            bufferStream.push(null);
            bufferStream.pipe(stream);
        }
    );

    createKyc = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const { passportUrl, address, identity, businessDocs } = req.body;

        const kyc = await KycService.getKyc(userdata.id);
        const kycData: any = {
            role: 'vendor',
            user: userdata._id,
            status: 'pending'
        };

        if (passportUrl) kycData.passportUrl = passportUrl;
        
        if (address) {
            address.status = 'pending';
            address.address = `${address.buildingNumber || ''} ${address.street || ''}, ${address.city || ''}, ${address.state || ''}.`;
            kycData.address = address;
        }

        if (identity) {
            identity.status = 'pending';
            // Mapping frontend names to database names
            kycData.identity = {
                identityType: identity.identityType || identity.documentType,
                identityNumber: identity.identityNumber || identity.documentNumber,
                identityDocument: identity.identityDocument || identity.documentUrl,
                status: 'pending'
            };
        }

        // Business documents are specific to vendors
        if (businessDocs) {
            businessDocs.status = 'pending';
            // Mapping frontend names to guarantor field (used for business docs in schema)
            kycData.guarantor = {
                name: businessDocs.name,
                phone: businessDocs.phone,
                address: businessDocs.address,
                identityDocument: businessDocs.documentUrl || businessDocs.identityDocument,
                status: 'pending'
            };
        }

        if (!kyc) {
            const newKyc = await KycService.createKyc(userdata.id, kycData);
            
            // Update vendor kycStatus
            const vendor = await VendorService.getByUserId(userdata.id);
            if (vendor) {
                vendor.kycStatus = 'pending';
                await vendor.save();
                
                // Send confirmation email
                if (vendor.email) {
                    await emails.vendorKycSubmitted(vendor.email, {
                        vendorName: vendor.name || 'Vendor'
                    });
                }
            }

            return res.status(STATUS.OK).json({
                success: true,
                message: 'KYC submitted successfully',
                data: newKyc
            });
        }

        const updatedKyc = await KycService.updateKyc(userdata._id, kycData);
        
        // Ensure kycStatus is updated if it was failed/not_submitted before
        const vendor = await VendorService.getByUserId(userdata.id);
        if (vendor && vendor.kycStatus !== 'verified') {
            vendor.kycStatus = 'pending';
            await vendor.save();

            // Send confirmation email for updates too
            if (vendor.email) {
                await emails.vendorKycSubmitted(vendor.email, {
                    vendorName: vendor.name || 'Vendor'
                });
            }
        }

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
}

export default new VendorKycController();
