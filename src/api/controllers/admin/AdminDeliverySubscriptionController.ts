import { Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import DeliverySubscriptionService from '../../services/DeliverySubscriptionService';

class AdminDeliverySubscriptionController {
    createPlan = asyncHandler(async (req: Request, res: Response) => {
        const plan = await DeliverySubscriptionService.createPlan(req.body);
        res.status(STATUS.CREATED).send({
            success: true,
            message: 'Delivery subscription plan created successfully',
            data: plan
        });
    });

    getAllPlans = asyncHandler(async (req: Request, res: Response) => {
        const plans = await DeliverySubscriptionService.getAllPlans(req.query);
        res.status(STATUS.OK).send({
            success: true,
            message: 'Delivery subscription plans retrieved successfully',
            data: plans
        });
    });

    getPlanById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const plan = await DeliverySubscriptionService.getPlanById(id);
        
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        res.status(STATUS.OK).send({
            success: true,
            message: 'Delivery subscription plan retrieved successfully',
            data: plan
        });
    });

    updatePlan = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const plan = await DeliverySubscriptionService.updatePlan(id, req.body);
        
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        res.status(STATUS.OK).send({
            success: true,
            message: 'Delivery subscription plan updated successfully',
            data: plan
        });
    });

    deletePlan = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const plan = await DeliverySubscriptionService.deletePlan(id);
        
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        res.status(STATUS.OK).send({
            success: true,
            message: 'Delivery subscription plan deleted successfully'
        });
    });
}

export default new AdminDeliverySubscriptionController();
