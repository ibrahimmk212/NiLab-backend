/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Response } from 'express';
import { asyncHandler } from '../../middlewares/handlers/async';
import PayoutService from '../../services/PayoutService';

class AdminPayoutController {
    getPayout = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                const payout = await PayoutService.getPayoutById(
                    req.params.payoutId
                );
                res.status(200).send({
                    message: 'Payout fetched successfully',
                    data: payout
                });
            } catch (error) {
                next(error);
            }
        }
    );

    getAllPayouts = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                const payout = await PayoutService.getAllPayouts(req.query);
                res.status(200).send({
                    message: 'Payouts fetched successfully',
                    ...payout
                });
            } catch (error) {
                next(error);
            }
        }
    );
    // requestPayout = asyncHandler(
    //     async (req: any, res: Response, next: NextFunction): Promise<void> => {
    //         try {
    //             const { id } = req.userdata;
    //             const { amount, bankName, accountNumber, accountName } =
    //                 req.body;
    //             const payout = await PayoutService.requestPayout({
    //                 userId: id,
    //                 amount,
    //                 bankName,
    //                 accountNumber,
    //                 accountName
    //             });
    //             res.status(200).send({
    //                 message: 'Payout fetched successfully',
    //                 data: payout
    //             });
    //         } catch (error) {
    //             next(error);
    //         }
    //     }
    // );

    completePayout = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                const payout = await PayoutService.completePayout(
                    req.params.payoutId
                );
                res.status(200).send({
                    message: 'Payout completed successfully',
                    data: payout
                });
            } catch (error) {
                next(error);
            }
        }
    );

    rejectPayout = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                const payout = await PayoutService.rejectPayout(
                    req.params.payoutId,
                    req.body.reason
                );
                res.status(200).send({
                    message: 'Payout completed successfully',
                    data: payout
                });
            } catch (error) {
                next(error);
            }
        }
    );
}

export default new AdminPayoutController();
