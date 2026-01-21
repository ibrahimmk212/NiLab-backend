/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/handlers/async';
import PayoutService from '../../services/PayoutService';
import { STATUS } from '../../../constants';

class VendorPayoutController {
    getPayout = asyncHandler(async (req: any, res: Response) => {
        const payout = await PayoutService.getPayoutById(req.params.payoutId);

        // SAFE COMPARISON: Convert ObjectIDs to Strings
        if (
            !payout ||
            payout.userId.toString() !== req.userdata.id.toString()
        ) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                message: 'Payout record not found or unauthorized'
            });
        }

        res.status(STATUS.OK).json({
            success: true,
            message: 'Payout fetched successfully',
            data: payout
        });
    });

    requestPayout = asyncHandler(async (req: any, res: Response) => {
        const { id } = req.userdata;
        const { amount, bankName, accountNumber, accountName } = req.body;

        if (amount < 1000) {
            return res.status(STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Minimum withdrawal amount is 1,000 NGN'
            });
        }

        const payout = await PayoutService.requestPayout({
            userId: id,
            amount,
            bankName,
            accountNumber,
            accountName
        });

        res.status(STATUS.CREATED).json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            data: payout
        });
    });

    getAllPayouts = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            try {
                const payout = await PayoutService.getAllPayouts({
                    ...req.query,
                    userId: req.userdata.id
                });
                res.status(STATUS.OK).send({
                    message: 'Payouts fetched successfully',
                    ...payout
                });
            } catch (error) {
                next(error);
            }
        }
    );
}

export default new VendorPayoutController();
