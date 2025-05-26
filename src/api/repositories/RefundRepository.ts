import RefundModel, { Refund } from '../models/Refund';

class RefundRepository {
    async createRefund(data: Refund): Promise<Refund> {
        const refund = new RefundModel(data);
        return await refund.save();
    }

    async findRefundById(refundId: string): Promise<Refund | null> {
        return await RefundModel.findById(refundId);
    }

    async updateRefund(
        refundId: string,
        updateData: Partial<Refund>
    ): Promise<Refund | null> {
        return await RefundModel.findByIdAndUpdate(refundId, updateData, {
            new: true
        });
    }

    async deleteRefund(refundId: string): Promise<Refund | null> {
        return await RefundModel.findByIdAndDelete(refundId, {new:true});
    }

    // Additional refund-specific methods...
}

export default new RefundRepository();
