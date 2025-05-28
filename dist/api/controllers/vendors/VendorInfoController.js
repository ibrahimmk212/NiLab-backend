"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const VendorService_1 = __importDefault(require("../../services/VendorService"));
const s3_1 = require("../../../utils/s3");
class VendorInfoController {
    constructor() {
        this.get = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor } = req;
            // const vendorInfo = await VendorService.getById(vendor.id);
            //TODO Populate Categories
            res.status(constants_1.STATUS.OK).send({
                message: 'Vendor Fetchd successfully',
                data: vendor
            });
        });
        // getWallet = asyncHandler(
        //     async (
        //         req: Request | any,
        //         res: Response,
        //         next: NextFunction
        //     ): Promise<void> => {
        //         const { vendor } = req;
        //         const wallet = await WalletRepository.getWalletByKey(
        //             'vendorId',
        //             vendor.id
        //         );
        //         if (!wallet) {
        //             throw new Error('Wallet not available');
        //         }
        //         res.status(STATUS.OK).send({
        //             message: 'Vendor wallet Fetchd successfully',
        //             data: wallet
        //         });
        //     }
        // );
        this.update = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor, body, params } = req;
            const { id } = params;
            const update = await VendorService_1.default.update(vendor.id, body);
            res.status(constants_1.STATUS.OK).json({
                success: true,
                message: 'Vendor Updated',
                data: update
            });
        });
        this.updateBank = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor, body, params } = req;
            const update = await VendorService_1.default.updateBank(vendor.id, body);
            res.status(constants_1.STATUS.OK).json({
                success: true,
                message: 'Vendor Updated',
                data: update
            });
        });
        this.updateLocation = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor, body, params } = req;
            // TODO if vendor.status==iinactive, set to active
            const update = await VendorService_1.default.updateLocation(vendor.id, {
                coordinates: body.coordinates,
                status: vendor.status == 'in-active' || vendor.status == 'pending'
                    ? 'active'
                    : vendor.status
            });
            res.status(constants_1.STATUS.OK).json({
                success: true,
                message: 'Vendor Location Updated',
                data: update
            });
        });
        this.uploadBanner = (0, async_1.asyncHandler)(async (req, res, next) => {
            var _a, _b;
            const { vendor, body } = req;
            let file = (_a = req === null || req === void 0 ? void 0 : req.files) === null || _a === void 0 ? void 0 : _a.file;
            if (!((_b = req === null || req === void 0 ? void 0 : req.files) === null || _b === void 0 ? void 0 : _b.file))
                throw Error('File Not selected');
            file.name = `${Date.now()}_${file.name.replace(/ /g, '_')}`;
            const upload = await (0, s3_1.uploadFileToS3)(file, 'banners/');
            const updated = await VendorService_1.default.update(vendor.id, {
                banner: upload === null || upload === void 0 ? void 0 : upload.url
            });
            res.status(constants_1.STATUS.CREATED).send({
                success: true,
                message: 'Banner Updated Successfully.',
                data: updated
            });
        });
    }
}
exports.default = new VendorInfoController();
