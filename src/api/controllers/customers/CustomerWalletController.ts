import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import WalletRepository from '../../repositories/WalletRepository';

class CustomerWalletController {
    get = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const user = req.userdata;
            console.log(user)
            let wallet;
            wallet = await WalletRepository.getWalletByKey(
                'userId',
                user.id
            );

            if (!wallet) {
                wallet = await WalletRepository.createWallet({
                    userId: user.id
                })
            }
            res.status(STATUS.OK).send({
                message: 'Customer wallet Fetched successfully',
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
            const { user } = req;
            res.status(STATUS.OK).send({
                message: 'Transactions Fetchd successfully',
                data: []
            });
        }
    );
}

export default new CustomerWalletController();
