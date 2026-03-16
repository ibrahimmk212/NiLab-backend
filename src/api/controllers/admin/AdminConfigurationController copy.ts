import { Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import ConfigurationService from '../../services/ConfigurationService';

class AdminConfigurationController {
    /**
     * Fetches the global configuration.
     * The service handles auto-creation if it doesn't exist.
     */
    getSingle = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const configuration = await ConfigurationService.getConfiguration();
            res.status(STATUS.OK).send({
                success: true,
                message: 'Configuration fetched successfully',
                data: configuration
            });
        }
    );

    /**
     * Unified Update: Can be used for any top-level fields
     * (fees, distance, working hours, etc.)
     */
    update = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const updatedConfig = await ConfigurationService.update(req.body);

            res.status(STATUS.OK).send({
                success: true,
                message: 'Configuration updated successfully',
                data: updatedConfig
            });
        }
    );

    // --- Geographic Management ---

    addState = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { name, active } = req.body;

            const update = await ConfigurationService.addState({
                name,
                active,
                slug: '' // Service generates this if empty
            });

            res.status(STATUS.OK).send({
                success: true,
                message: 'State added successfully',
                data: update
            });
        }
    );

    removeState = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id } = req.params; // The ID of the state object
            const update = await ConfigurationService.removeState(id);

            res.status(STATUS.OK).send({
                success: true,
                message: 'State removed successfully',
                data: update
            });
        }
    );

    addCity = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { name, coordinates, state } = req.body;

            const update = await ConfigurationService.addCity({
                name,
                state,
                location: {
                    type: 'Point',
                    coordinates // Expected: [lng, lat]
                },
                slug: '' // Service generates this
            });

            res.status(STATUS.OK).send({
                success: true,
                message: 'City added successfully',
                data: update
            });
        }
    );

    removeCity = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id } = req.params; // The ID of the city object
            const update = await ConfigurationService.removeCity(id);

            res.status(STATUS.OK).send({
                success: true,
                message: 'City removed successfully',
                data: update
            });
        }
    );
}

export default new AdminConfigurationController();
