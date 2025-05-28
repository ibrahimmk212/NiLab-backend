"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OrderService_1 = __importDefault(require("../../services/OrderService"));
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
class AdminOrderController {
    constructor() {
        this.getAll = (0, async_1.asyncHandler)(async (req, res, next) => {
            const orders = await OrderService_1.default.getAll();
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Orders fetched successfully',
                data: orders
            });
        });
        this.getByVendor = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const orders = await OrderService_1.default.getOrdersByVendor(id, {});
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Orders fetched successfully',
                data: orders
            });
        });
        this.getSingle = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const order = await OrderService_1.default.getOrderById(id);
            if (!order)
                throw new Error('Order not available');
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Order fetched successfully',
                data: order
            });
        });
        this.update = (0, async_1.asyncHandler)(async (req, res, next) => {
            // const { id } = req.params;
            // const { body } = req;
            // const update = await OrderService.updateOrder(id, body);
            // if (!update) {
            //     throw Error(' Could not update order');
            // }
        });
        this.updateStatus = (0, async_1.asyncHandler)(async (req, res, next) => {
            // const { id } = req.params;
            // const { body } = req;
            // const update = await OrderService.updateOrder(id, body);
            // if (!update) {
            //     throw Error(' Could not update order');
            // }
        });
    }
}
exports.default = new AdminOrderController();
