/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import WalletService from '../../services/WalletService';
import { asyncHandler } from '../../middlewares/handlers/async';

class CustomerWalletController {
    getMyWallet = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                const { id } = req.userdata;
                const user = await WalletService.getMyWallet({
                    role: 'user',
                    owner: id
                });
                res.status(200).send({
                    message: 'Users fetched successfully',
                    data: user
                });
            } catch (error) {
                next(error);
            }
        }
    );
}

export default new CustomerWalletController();
