import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import VendorService from '../../services/VendorService';
import WalletRepository from '../../repositories/WalletRepository';
import { uploadFileToS3 } from '../../../utils/s3';

class VendorInfoController {
    get = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor } = req;
            // const vendorInfo = await VendorService.getById(vendor.id);

            //TODO Populate Categories
            res.status(STATUS.OK).send({
                message: 'Vendor Fetchd successfully',
                data: vendor
            });
        }
    );
    // getWallet = asyncHandler(
    //     async (
    //         req: Request | any,
    //         res: Response,
    //         next: NextFunction
    //     ): Promise<void> => {
    //         const { vendor } = req;
    //         const wallet = await WalletRepository.getWalletByKey(
    //             'vendorId',
    //             vendor.id
    //         );

    //         if (!wallet) {
    //             throw new Error('Wallet not available');
    //         }
    //         res.status(STATUS.OK).send({
    //             message: 'Vendor wallet Fetchd successfully',
    //             data: wallet
    //         });
    //     }
    // );
    update = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;
            const { id } = params;

            const update = await VendorService.update(vendor.id, body);
            res.status(STATUS.OK).json({
                success: true,
                message: 'Vendor Updated',
                data: update
            });
        }
    );
    updateBank = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;

            const update = await VendorService.updateBank(vendor.id, body);
            res.status(STATUS.OK).json({
                success: true,
                message: 'Vendor Updated',
                data: update
            });
        }
    );
    updateLocation = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;

            // TODO if vendor.status==iinactive, set to active
            const update = await VendorService.updateLocation(vendor.id, {
                coordinates: body.coordinates,
                status:
                    vendor.status == 'in-active' || vendor.status == 'pending'
                        ? 'active'
                        : vendor.status
            });
            res.status(STATUS.OK).json({
                success: true,
                message: 'Vendor Location Updated',
                data: update
            });
        }
    );

    uploadBanner = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body } = req;

            let file = req?.files?.file;
            if (!req?.files?.file) throw Error('File Not selected');
            file.name = `${Date.now()}_${file.name.replace(/ /g, '_')}`;

            const upload = await uploadFileToS3(file, 'banners/');
            const updated = await VendorService.update(vendor.id, {
                banner: upload?.url
            });
            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Banner Updated Successfully.',
                data: updated
            });
        }
    );
}

export default new VendorInfoController();
