import { DeliverySubscriptionPlan } from '../models/DeliverySubscriptionPlan';
import DeliverySubscriptionPlanModel from '../models/DeliverySubscriptionPlan';

class DeliverySubscriptionService {
    public async createPlan(
        data: Partial<DeliverySubscriptionPlan>
    ): Promise<DeliverySubscriptionPlan> {
        const plan = new DeliverySubscriptionPlanModel(data);
        return await plan.save();
    }

    public async getAllPlans(
        options: Record<string, unknown> = {}
    ): Promise<DeliverySubscriptionPlan[]> {
        const filter: any = {};
        if (options.status) {
            filter.status = options.status;
        }
        return await DeliverySubscriptionPlanModel.find(filter).sort({
            createdAt: -1
        });
    }

    public async getPlanById(
        id: string
    ): Promise<DeliverySubscriptionPlan | null> {
        return await DeliverySubscriptionPlanModel.findById(id);
    }

    public async updatePlan(
        id: string,
        data: Partial<DeliverySubscriptionPlan>
    ): Promise<DeliverySubscriptionPlan | null> {
        return await DeliverySubscriptionPlanModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        }).exec() as unknown as DeliverySubscriptionPlan | null;
    }

    public async deletePlan(
        id: string
    ): Promise<DeliverySubscriptionPlan | null> {
        return await DeliverySubscriptionPlanModel.findByIdAndDelete(id).exec() as unknown as DeliverySubscriptionPlan | null;
    }
}

export default new DeliverySubscriptionService();
