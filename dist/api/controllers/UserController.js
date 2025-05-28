"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserService_1 = __importDefault(require("../services/UserService"));
const constants_1 = require("../../constants");
const async_1 = require("../middlewares/handlers/async");
class UserController {
    constructor() {
        this.getUsers = (0, async_1.asyncHandler)(async (req, res, next) => {
            try {
                const user = await UserService_1.default.getUsers();
                res.status(200).send({
                    message: 'Users fetched successfully',
                    data: user
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    async createUser(req, res, next) {
        try {
            const payload = req.body;
            const user = await UserService_1.default.createUser(payload);
            res.status(200).send({
                message: 'User created successfully',
                data: user
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserDetail(req, res, next) {
        try {
            const userId = req.params.id;
            const user = await UserService_1.default.getUserDetail(userId);
            res.status(200).send({
                message: 'User details fetched successfully',
                data: user
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const userId = req.params.id;
            const payload = req.body;
            await UserService_1.default.updateUser(userId, payload);
            res.status(200).send({
                message: 'User updated successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const userId = req.params.id;
            await UserService_1.default.deleteUser(userId);
            res.status(200).send({
                message: 'User deleted successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async currentUser(req, res, next) {
        var _a;
        try {
            const user = await UserService_1.default.findUserById((_a = req.userdata) === null || _a === void 0 ? void 0 : _a.id);
            res.status(constants_1.STATUS.OK).send({
                data: user
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new UserController();
