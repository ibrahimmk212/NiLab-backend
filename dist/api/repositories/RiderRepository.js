"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Rider_1 = __importDefault(require("../models/Rider"));
class RiderRepository {
    async createRider(data) {
        const rider = new Rider_1.default(data);
        return await rider.save();
    }
    async findRiderById(riderId) {
        return await Rider_1.default.findById(riderId);
    }
    async updateRider(riderId, updateData) {
        return await Rider_1.default.findByIdAndUpdate(riderId, updateData, {
            new: true
        });
    }
    async deleteRider(riderId) {
        return await Rider_1.default.findByIdAndDelete(riderId, { new: true });
    }
}
exports.default = new RiderRepository();
