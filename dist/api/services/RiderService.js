"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RiderRepository_1 = __importDefault(require("../repositories/RiderRepository"));
class RiderService {
    async createRider(payload) {
        return RiderRepository_1.default.createRider(Object.assign({}, payload));
    }
    async findById(id) {
        const rider = await RiderRepository_1.default.findRiderById(id);
        if (!rider) {
            throw new Error('Rider not found');
        }
        return rider;
    }
    getRiders() {
        throw new Error('Method not implemented.');
    }
    async getRiderDetail(riderId) {
        const rider = await RiderRepository_1.default.findRiderById(riderId);
        if (!rider) {
            throw new Error('Rider not found');
        }
        return rider;
    }
    async updateRider(riderId, payload) {
        const rider = await RiderRepository_1.default.findRiderById(riderId);
        if (!rider) {
            throw new Error('Rider not found');
        }
        return RiderRepository_1.default.updateRider(riderId, payload);
    }
    async updateRiderBank(riderId, payload) {
        const rider = await RiderRepository_1.default.findRiderById(riderId);
        if (!rider) {
            throw new Error('Rider not found');
        }
        return RiderRepository_1.default.updateRider(riderId, {
            bankAccount: {
                accountNumber: payload.accountNumber,
                bankCode: payload.bankCode,
                accountName: payload.accountName,
                bankName: payload.bankName
            }
        });
    }
    async deleteRider(riderId) {
        const rider = await RiderRepository_1.default.findRiderById(riderId);
        if (!rider) {
            throw new Error('Rider not found');
        }
        return RiderRepository_1.default.deleteRider(riderId);
    }
}
exports.default = new RiderService();
