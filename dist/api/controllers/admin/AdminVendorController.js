"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserService_1 = __importDefault(require("../../services/UserService"));
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const VendorService_1 = __importDefault(require("./../../services/VendorService"));
class AdminVendorController {
    constructor() {
        this.create = (0, async_1.asyncHandler)(async (req, res, next) => {
            var _a, _b, _c;
            const payload = req.body;
            const findUser = await UserService_1.default.findByEmailOrPhone(payload.managerEmail, payload.managerPhone);
            if (findUser) {
                throw Error('Manager account already exist');
            }
            const tempPassword = '123456'; //generateRandomNumbers(6).toString(); // '123456';
            console.log(tempPassword);
            const user = await UserService_1.default.createUser({
                role: constants_1.ROLE.VENDOR,
                firstName: payload.managerFirstName,
                lastName: payload.managerLastName,
                phoneNumber: payload.managerPhone,
                email: payload.managerEmail,
                password: tempPassword
            });
            if (!user) {
                throw Error('Manager Could not create account');
            }
            // TODO send temp password to email
            const newVendor = await VendorService_1.default.create({
                name: payload.name,
                address: payload.address,
                description: (_a = payload === null || payload === void 0 ? void 0 : payload.description) !== null && _a !== void 0 ? _a : '',
                userId: user._id,
                marketCategoryId: payload.vendorCategoryId,
                email: payload.email,
                phoneNumber: payload.phoneNumber,
                logo: (_b = payload.logo) !== null && _b !== void 0 ? _b : '',
                banner: (_c = payload.banner) !== null && _c !== void 0 ? _c : '',
                lat: payload.lat,
                lng: payload.lng
            });
            if (!newVendor) {
                throw Error('Could not create vendor account');
            }
            res.status(constants_1.STATUS.CREATED).send({
                message: 'Vendor created successfully',
                data: newVendor
            });
        });
        this.getAll = (0, async_1.asyncHandler)(async (req, res) => {
            const vendors = await VendorService_1.default.getAll();
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Venors fetched successfully',
                data: vendors
            });
        });
        this.getSingle = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const vendor = await VendorService_1.default.get(id);
            if (!vendor)
                throw new Error('Vendor not available');
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Vendor fetched successfully',
                data: vendor
            });
        });
        this.update = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { body } = req;
            const update = await VendorService_1.default.update(id, body);
            if (!update) {
                throw Error(' Could not update vendor');
            }
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Vendor updated successfully',
                data: update
            });
        });
    }
}
exports.default = new AdminVendorController();
