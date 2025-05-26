import WaitListModel, { WaitList } from "../models/WaitList";


class WaitListRepository {
    async createWaitList(data: Partial<WaitList>) {
        const waitList = new WaitListModel(data);
        return await waitList.save();
    }

    async findWaitListById(waitListId: string) {
        return await WaitListModel.findById(waitListId);
    }

    async findWaitlistByEmailOrPhone(email: string, phone: string) {
        return await WaitListModel.findOne({
            $or: [{ email }, { phone }]
        })
    }

    async updateWaitList(waitListId: string, updateData: Partial<WaitList>) {
        return await WaitListModel.findByIdAndUpdate(waitListId, updateData, { new: true });
    }

    async getAllWaitLists() {
        return await WaitListModel.find();
    }

}

export default new WaitListRepository();
