"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WaitListRepository_1 = __importDefault(require("../repositories/WaitListRepository"));
class WaitListService {
    async find(waitListId) {
        return await WaitListRepository_1.default.findWaitListById(waitListId);
    }
    async findByEmailOrPhone(email, phone) {
        return await WaitListRepository_1.default.findWaitlistByEmailOrPhone(email, phone);
    }
    async create(data) {
        const waitList = await WaitListRepository_1.default.createWaitList(data);
        return waitList;
    }
    async update(waitListId, updateData) {
        return await WaitListRepository_1.default.updateWaitList(waitListId, updateData);
    }
    async getAll() {
        return await WaitListRepository_1.default.getAllWaitLists();
    }
}
exports.default = new WaitListService();
