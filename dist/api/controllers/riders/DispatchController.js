"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DispatchService_1 = __importDefault(require("../../services/DispatchService"));
class DispatchController {
    async createDispatch(req, res) {
        try {
            const dispatch = await DispatchService_1.default.createDispatch(req.body);
            res.status(201).json(dispatch);
        }
        catch (error) {
            res.status(500).send(error.message);
        }
    }
    async updateDispatch(req, res) {
        try {
            const { dispatchId } = req.params;
            const updateData = req.body;
            const updatedDispatch = await DispatchService_1.default.updateDispatch(dispatchId, updateData);
            res.json(updatedDispatch);
        }
        catch (error) {
            res.status(500).send(error.message);
        }
    }
}
exports.default = new DispatchController();
