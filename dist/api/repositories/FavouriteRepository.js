"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Favourite_1 = __importDefault(require("../models/Favourite"));
class FavouriteRepository {
    async createFavourite(data) {
        const favourite = new Favourite_1.default(data);
        return await favourite.save();
    }
    async findFavouriteById(favouriteId) {
        return await Favourite_1.default.findById(favouriteId);
    }
    async updateFavourite(favouriteId, updateData) {
        return await Favourite_1.default.findByIdAndUpdate(favouriteId, updateData, {
            new: true
        });
    }
    async deleteFavourite(favouriteId) {
        return await Favourite_1.default.findByIdAndDelete(favouriteId, {
            new: true
        });
    }
}
exports.default = new FavouriteRepository();
