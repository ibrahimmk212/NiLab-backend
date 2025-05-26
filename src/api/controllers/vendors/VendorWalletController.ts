import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import WalletRepository from '../../repositories/WalletRepository';

class VendorWalletController {
    get = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor } = req;
            const wallet = await WalletRepository.getWalletByKey(
                'vendorId',
                vendor.id
            );

            if (!wallet) {
                throw new Error('Wallet not available');
            }
            res.status(STATUS.OK).send({
                message: 'Vendor wallet Fetchd successfully',
                data: wallet
            });
        }
    );
    getTransactions = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor } = req;
            res.status(STATUS.OK).send({
                message: 'Transactions Fetchd successfully',
                data: []
            });
        }
    );
}

export default new VendorWalletController();
