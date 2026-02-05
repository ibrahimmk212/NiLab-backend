import ComplaintModel, { IComplaint } from '../models/Complaint';

class ComplaintRepository {
    async create(data: Partial<IComplaint>): Promise<IComplaint> {
        return await ComplaintModel.create(data);
    }

    async findById(id: string): Promise<IComplaint | null> {
        return await ComplaintModel.findById(id)
            .populate('user', 'firstName lastName email phoneNumber')
            .populate('order', 'code totalAmount status')
            .populate('resolvedBy', 'firstName lastName');
    }

    async findAll(params: any = {}): Promise<any> {
        const { limit = 10, page = 1, sort = '-createdAt', startDate, endDate, ...filter } = params;
        const skip = (Number(page) - 1) * Number(limit);

        // Date Filtering
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [data, total] = await Promise.all([
            ComplaintModel.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate('user', 'firstName lastName email phoneNumber')
                .populate('order', 'code'),
            ComplaintModel.countDocuments(filter)
        ]);

        return {
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        };
    }

    async update(id: string, data: Partial<IComplaint>): Promise<IComplaint | null> {
        return await ComplaintModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await ComplaintModel.findByIdAndDelete(id);
        return !!result;
    }
}

export default new ComplaintRepository();
