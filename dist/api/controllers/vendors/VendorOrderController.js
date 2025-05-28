"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const OrderService_1 = __importDefault(require("../../services/OrderService"));
class VendorOrderController {
    constructor() {
        this.getAll = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor } = req;
            const orders = await OrderService_1.default.getOrdersByVendor(vendor.id, {});
            res.status(constants_1.STATUS.OK).send({
                message: 'Orders fetched successfully',
                data: orders
            });
        });
        this.getSingle = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { vendor } = req;
            const order = await OrderService_1.default.getOrderById(id);
            if (!order) {
                throw Error('Order not found');
            }
            res.status(constants_1.STATUS.OK).json({
                success: true,
                message: 'Order Info',
                data: order
            });
        });
        this.update = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor, body, params } = req;
            const { id } = params;
            const order = await OrderService_1.default.getOrderById(id);
            if (!order) {
                throw Error('Order not found');
            }
            if (order.vendor != vendor.id) {
                throw Error('You dont have access to this order');
            }
            const update = await OrderService_1.default.updateOrder(id, body);
            if (!update) {
                throw Error('Failed to update order');
            }
            res.status(constants_1.STATUS.OK).json({
                success: true,
                message: 'Order Updated',
                data: update
            });
        });
        this.updateStatus = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor, body, params } = req;
            const { id } = params;
            const status = req.body.status;
            const order = await OrderService_1.default.getOrderById(id);
            if (!order) {
                throw Error('Order not found');
            }
            if (!['preparing', 'prepared', 'canceled'].includes(status)) {
                throw Error('Invalid status');
            }
            if (order.status == 'canceled') {
                throw Error('Order already canceled, you cannot update this order');
            }
            const update = await OrderService_1.default.updateOrder(id, body);
            if (!update) {
                throw Error('Failed to update order');
            }
            //TODO If accepted status==preparing. and mode is not offline add to vendor ledger, do not accept if not paid
            // TODO add cancel details (Reson for cancellation) here, and refund money to wallet
            if (status == 'canceled') {
                // TODO refund to customer's wallet if payment is not on delivery/offline and record transaction
            }
            // TODO send notifcation to customer on status change
            res.status(constants_1.STATUS.OK).json({
                success: true,
                message: 'Order Updated',
                data: order
            });
        });
    }
}
exports.default = new VendorOrderController();
