"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WaitList_1 = __importDefault(require("../models/WaitList"));
class WaitListRepository {
    async createWaitList(data) {
        const waitList = new WaitList_1.default(data);
        return await waitList.save();
    }
    async findWaitListById(waitListId) {
        return await WaitList_1.default.findById(waitListId);
    }
    async findWaitlistByEmailOrPhone(email, phone) {
        return await WaitList_1.default.findOne({
            $or: [{ email }, { phone }]
        });
    }
    async updateWaitList(waitListId, updateData) {
        return await WaitList_1.default.findByIdAndUpdate(waitListId, updateData, { new: true });
    }
    async getAllWaitLists() {
        return await WaitList_1.default.find();
    }
}
exports.default = new WaitListRepository();
