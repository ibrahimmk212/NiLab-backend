// import { NextFunction, Request, Response } from 'express';
// import { STATUS } from '../../../constants';
// import { asyncHandler } from '../../middlewares/handlers/async';
// import ConfigurationService from '../../services/ConfigurationService';
// import { slugify } from '../../../utils/helpers';

// class AdminConfigurationController {
//     create = asyncHandler(
//         async (req: Request | any, res: Response): Promise<void> => {
//             const newConfiguration = await ConfigurationService.create(
//                 req.body
//             );

//             res.status(STATUS.CREATED).send({
//                 success: true,
//                 message: 'Configuration Created Successfully',
//                 data: newConfiguration
//             });
//         }
//     );
//     getSingle = asyncHandler(
//         async (req: Request, res: Response): Promise<void> => {
//             const configuration = await ConfigurationService.getConfiguration();
//             res.status(STATUS.OK).send({
//                 success: true,
//                 message: 'Configuration fetched successfully',
//                 data: configuration
//             });
//         }
//     );

//     update = asyncHandler(
//         async (req: Request, res: Response): Promise<void> => {
//             const { id } = req.params;
//             const { a } = req.body;

//             const configuration = await ConfigurationService.getConfiguration();

//             res.status(STATUS.OK).send({
//                 success: true,
//                 message: 'Configuration updated successfully',
//                 data: configuration
//             });
//         }
//     );

//     addState = asyncHandler(
//         async (req: Request, res: Response): Promise<void> => {
//             const { name, coordinates } = req.body;

//             const configuration = await ConfigurationService.getConfiguration();
//             if (!configuration) throw Error('Configuration not found');

//             const update = await ConfigurationService.addState(
//                 configuration.id,
//                 {
//                     name,
//                     coordinates,
//                     slug: slugify(name).toLowerCase()
//                 }
//             );
//             res.status(STATUS.OK).send({
//                 success: true,
//                 message: 'Configuration updated successfully',
//                 data: update
//             });
//         }
//     );
//     removeState = asyncHandler(
//         async (req: Request, res: Response): Promise<void> => {
//             const { id } = req.params;

//             const configuration = await ConfigurationService.getConfiguration();

//             if (!configuration) throw Error('Configuration not found');

//             const update = await ConfigurationService.removeState(
//                 configuration.id,
//                 id
//             );
//             res.status(STATUS.OK).send({
//                 success: true,
//                 message: 'Configuration updated successfully',
//                 data: update
//             });
//         }
//     );

//     addCity = asyncHandler(
//         async (req: Request, res: Response): Promise<void> => {
//             const { name, coordinates, state } = req.body;

//             const configuration = await ConfigurationService.getConfiguration();
//             if (!configuration) throw Error('Configuration not found');

//             const update = await ConfigurationService.addCity(
//                 configuration.id,
//                 {
//                     name,
//                     coordinates,
//                     slug: slugify(name).toLowerCase(),
//                     state
//                 }
//             );
//             res.status(STATUS.OK).send({
//                 success: true,
//                 message: 'Configuration updated successfully',
//                 data: update
//             });
//         }
//     );
//     removeCity = asyncHandler(
//         async (req: Request, res: Response): Promise<void> => {
//             const { id } = req.params;

//             const configuration = await ConfigurationService.getConfiguration();

//             if (!configuration) throw Error('Configuration not found');

//             const update = await ConfigurationService.removeCity(
//                 configuration.id,
//                 id
//             );
//             res.status(STATUS.OK).send({
//                 success: true,
//                 message: 'Configuration updated successfully',
//                 data: update
//             });
//         }
//     );
//     updateFees = asyncHandler(
//         async (req: Request, res: Response): Promise<void> => {
//             const { serviceFee, deliveryFee, vatRate } = req.body;

//             const configuration = await ConfigurationService.getConfiguration();

//             if (!configuration) throw Error('Configuration not found');

//             const update = await ConfigurationService.update(configuration.id, {
//                 serviceFee,
//                 deliveryFee,
//                 vatRate
//             });
//             res.status(STATUS.OK).send({
//                 success: true,
//                 message: 'Configuration updated successfully',
//                 data: update
//             });
//         }
//     );
//     updateWorkingHour = asyncHandler(
//         async (req: Request, res: Response): Promise<void> => {
//             const { openingHour, closingHour } = req.body;

//             const configuration = await ConfigurationService.getConfiguration();

//             if (!configuration) throw Error('Configuration not found');

//             const update = await ConfigurationService.update(configuration.id, {
//                 openingHour,
//                 closingHour
//             });
//             res.status(STATUS.OK).send({
//                 success: true,
//                 message: 'Configuration updated successfully',
//                 data: update
//             });
//         }
//     );
//     updateNearbyDistance = asyncHandler(
//         async (req: Request, res: Response): Promise<void> => {
//             const { nearbyDistance } = req.body;

//             const configuration = await ConfigurationService.getConfiguration();

//             if (!configuration) throw Error('Configuration not found');

//             const update = await ConfigurationService.update(configuration.id, {
//                 nearbyDistance
//             });
//             res.status(STATUS.OK).send({
//                 success: true,
//                 message: 'Configuration updated successfully',
//                 data: update
//             });
//         }
//     );
// }

// export default new AdminConfigurationController();

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
