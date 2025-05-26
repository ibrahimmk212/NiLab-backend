import { Request, Response } from 'express';
import DispatchService from '../../services/DispatchService';

class DispatchController {
    async createDispatch(req: Request, res: Response) {
        try {
            const dispatch = await DispatchService.createDispatch(req.body);
            res.status(201).json(dispatch);
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    }

    async updateDispatch(req: Request, res: Response) {
        try {
            const { dispatchId } = req.params;
            const updateData = req.body;
            const updatedDispatch = await DispatchService.updateDispatch(
                dispatchId,
                updateData
            );
            res.json(updatedDispatch);
        } catch (error: any) {
            res.status(500).send(error.message);
        }
    }

    // Implement additional methods for dispatch operations...
}

export default new DispatchController();
