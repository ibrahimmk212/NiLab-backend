import { WaitList } from "../models/WaitList";
import WaitListRepository from "../repositories/WaitListRepository";

interface IWaitListService {
    find(waitListId: string): Promise<WaitList | null>;
    findByEmailOrPhone(email: string, phone: string): Promise<any>
    create(data: Partial<WaitList>): Promise<any>;
    update(waitListId: string, updateData: Partial<WaitList>): Promise<any>;
    getAll(): Promise<WaitList[]>;

}

class WaitListService implements IWaitListService {

    async find(waitListId: string): Promise<WaitList | null> {
        return await WaitListRepository.findWaitListById(waitListId);
    }

    async findByEmailOrPhone(email: string, phone: string): Promise<WaitList | null> {
        return await WaitListRepository.findWaitlistByEmailOrPhone(email, phone);
    }

    async create(data: Partial<WaitList>) {
        const waitList = await WaitListRepository.createWaitList(data);
        return waitList
    }

    async update(waitListId: string, updateData: Partial<any>) {
        return await WaitListRepository.updateWaitList(waitListId, updateData);
    }

    async getAll() {
        return await WaitListRepository.getAllWaitLists();
    }


}

export default new WaitListService();
