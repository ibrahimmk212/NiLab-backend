import OrderModel, { Order } from '../models/Order';

class OrderRepository {
    public populatedData = {
        path: 'vendor user rider dispatch order products.product',
        select: '-role -addresses -location -categories -userId -bankAccount'
        // populate: { path: 'products', populate: { path: 'product' } }
    };
    async createOrder(data: Partial<Order>): Promise<Order> {
        const order = new OrderModel(data);
        return await order.save();
    }

    async findOrderById(orderId: string): Promise<Order | null> {
        return await OrderModel.findById(orderId).populate(this.populatedData);
    }
    async findOrderByReference(
        paymentReference: string
    ): Promise<Order | null> {
        return await OrderModel.findOne({ paymentReference });
    }
    async findOrderByVendor(
        vendorId: string,
        data: any
    ): Promise<Order[] | null> {
        // const page = data?.page ?? 1;
        // const limit = data?.limit ?? 10;

        const total = await OrderModel.countDocuments();
        const page = parseInt(data.page?.toString() || '1', 10);
        const limit = parseInt(data.limit?.toString() || `${total}`, 10);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        return await OrderModel.find({ vendor: vendorId })
            .skip(startIndex)
            .limit(limit)
            .populate(this.populatedData).sort({ createdAt: -1 });
    }
    async findAll(): Promise<Order[] | null> {
        // const total = await OrderModel.countDocuments();
        // const page = parseInt(data.page?.toString() || '1', 10);
        // const limit = parseInt(data.limit?.toString() || `${total}`, 10);
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;
        // .skip(startIndex)
        // .limit(limit)

        return await OrderModel.find().populate(this.populatedData).sort({ createdAt: -1 });
    }
    async findOrderByCustomer(customerId: string): Promise<Order[] | null> {
        return await OrderModel.find({ user: customerId }).populate(
            this.populatedData
        ).sort({ createdAt: -1 })
    }
    async updateOrder(
        orderId: string,
        updateData: Partial<Order>
    ): Promise<Order | null> {
        return await OrderModel.findByIdAndUpdate(orderId, updateData, {
            new: true
        }).populate({
            path: 'vendor user rider dispatch',
            select: '-role -addresses -location -categories -userId'
        });
    }

    async deleteOrder(order: string): Promise<Order | null> {
        return await OrderModel.findByIdAndDelete(order, { new: true });
    }

    // Additional order-specific methods...
}

export default new OrderRepository();
