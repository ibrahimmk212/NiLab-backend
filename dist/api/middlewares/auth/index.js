"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = __importDefault(require("../../../utils/jwt"));
const UserRepository_1 = __importDefault(require("../../repositories/UserRepository"));
const constants_1 = require("../../../constants");
const VendorRepository_1 = __importDefault(require("../../repositories/VendorRepository"));
class Auth {
    async authenticate(req, res, next) {
        const authorization = String(req.headers.authorization);
        if (!authorization || !authorization.includes('Bearer')) {
            res.status(constants_1.STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Provide a token'
            });
            return;
        }
        const token = authorization === null || authorization === void 0 ? void 0 : authorization.slice(7);
        try {
            const payload = await jwt_1.default.verifyToken(token);
            if (!payload) {
                res.status(constants_1.STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'invalid Token'
                });
                return;
            }
            const userId = payload.id;
            const userdata = await UserRepository_1.default.findUserById(userId);
            if (!userdata) {
                res.status(constants_1.STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Account not found'
                });
                return;
            }
            // TODO check if account is active
            req.userdata = userdata;
            next();
        }
        catch (err) {
            console.log(err);
            throw Error(`Invalid Token`);
        }
    }
    async isAdmin(req, res, next) {
        const authorization = String(req.headers.authorization);
        if (!authorization || !authorization.includes('Bearer')) {
            res.status(constants_1.STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Provide a token'
            });
            return;
        }
        const token = authorization === null || authorization === void 0 ? void 0 : authorization.slice(7);
        try {
            const payload = await jwt_1.default.verifyToken(token);
            if (!payload) {
                res.status(constants_1.STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'invalid Token'
                });
                return;
            }
            const userId = payload.id;
            const userdata = await UserRepository_1.default.findUserById(userId);
            if (!userdata) {
                res.status(constants_1.STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Account not found'
                });
                return;
            }
            if (userdata.role != constants_1.ROLE.ADMIN) {
                res.status(constants_1.STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'This is not an Admin Account'
                });
                return;
            }
            // TODO check if account is active
            req.userdata = userdata;
            next();
        }
        catch (e) {
            res.status(constants_1.STATUS.UNAUTHORIZED).json({
                success: false,
                message: e === null || e === void 0 ? void 0 : e.message
            });
            return;
        }
    }
    async isVendor(req, res, next) {
        const authorization = String(req.headers.authorization);
        if (!authorization || !authorization.includes('Bearer')) {
            res.status(constants_1.STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Provide a token'
            });
            return;
        }
        try {
            const token = authorization === null || authorization === void 0 ? void 0 : authorization.slice(7);
            const payload = await jwt_1.default.verifyToken(token);
            if (!payload) {
                res.status(constants_1.STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'invalid Token'
                });
                return;
            }
            const userId = payload.id;
            const userdata = await UserRepository_1.default.findUserById(userId);
            if (!userdata) {
                res.status(constants_1.STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Account not found'
                });
                return;
            }
            if (userdata.role != constants_1.ROLE.VENDOR) {
                res.status(constants_1.STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'This is not a Vendor Account'
                });
                return;
            }
            //Get vendor by user
            const vendor = await VendorRepository_1.default.findByKey('userId', userdata.id);
            if (!vendor) {
                res.status(constants_1.STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid Vendor'
                });
                return;
            }
            if (vendor.status != 'active') {
                res.status(constants_1.STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Vendor Not Active'
                });
                return;
            }
            req.userdata = userdata;
            req.vendor = vendor;
            next();
        }
        catch (e) {
            res.status(constants_1.STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Error validating vendor'
            });
            return;
        }
    }
    checkRoles(...roles) {
        return async (req, res, next) => {
            const userdata = req.userdata;
            const roleUser = userdata.role;
            if (!roleUser) {
                res.sendStatus(403);
                return;
            }
            const isRoleValid = roles.includes(roleUser);
            if (!isRoleValid) {
                res.sendStatus(403);
                return;
            }
            next();
        };
    }
}
exports.default = new Auth();
