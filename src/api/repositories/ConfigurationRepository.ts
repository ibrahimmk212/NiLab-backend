// import ConfigurationModel, {
//     Configuration,
//     ICity,
//     IState
// } from '../models/Configuration';

// class ConfigurationRepository {
//     async createConfiguration(
//         data: Partial<Configuration>
//     ): Promise<Configuration> {
//         const configExists = await ConfigurationModel.find();
//         if (configExists[0]) {
//             throw Error('Configurationn already exists');
//         }
//         const configuration = new ConfigurationModel(data);
//         return await configuration.save();
//     }

//     async getConfiguration(): Promise<Configuration | null> {
//         return await ConfigurationModel.findOne();
//     }

//     async updateConfiguration(
//         configurationId: string,
//         updateData: Partial<Configuration>
//     ): Promise<Configuration | null> {
//         return await ConfigurationModel.findByIdAndUpdate(
//             configurationId,
//             updateData,
//             {
//                 new: true
//             }
//         );
//     }

//     async addNewState(
//         configurationId: string,
//         state: IState
//     ): Promise<Configuration | null> {
//         return await ConfigurationModel.findByIdAndUpdate(
//             configurationId,
//             { $push: { serviceStates: state } },
//             { new: true, safe: true, upsert: true }
//         );
//     }

//     async deleteState(
//         configurationId: string,
//         id: string
//     ): Promise<Configuration | null> {
//         return await ConfigurationModel.findByIdAndUpdate(
//             configurationId,
//             { $pull: { serviceStates: { _id: id } } },
//             { new: true }
//         );
//     }

//     async addNewCity(
//         configurationId: string,
//         state: ICity
//     ): Promise<Configuration | null> {
//         return await ConfigurationModel.findByIdAndUpdate(
//             configurationId,
//             { $push: { serviceCities: state } },
//             { new: true, safe: true, upsert: true }
//         );
//     }

//     async deleteCity(
//         configurationId: string,
//         id: string
//     ): Promise<Configuration | null> {
//         return await ConfigurationModel.findByIdAndUpdate(
//             configurationId,
//             { $pull: { serviceCities: { _id: id } } },
//             { new: true }
//         );
//     }
// }

// export default new ConfigurationRepository();

import { slugify } from '../../utils/helpers';
import ConfigurationModel, {
    Configuration,
    ICity,
    IState
} from '../models/Configuration';

class ConfigurationRepository {
    /**
     * Ensures we only ever have ONE configuration document.
     * If one exists, it returns it; otherwise, creates a new one with defaults.
     */
    async getOrCreateConfiguration(): Promise<Configuration> {
        let config = await ConfigurationModel.findOne();
        if (!config) {
            config = await ConfigurationModel.create({}); // Mongoose will fill defaults
        }
        return config;
    }

    /**
     * Standard update for numeric fees and percentages
     */
    async updateConfiguration(
        updateData: Partial<Configuration>
    ): Promise<Configuration | null> {
        // We ignore the ID from the frontend and always update the singleton
        return await ConfigurationModel.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true }
        );
    }

    // --- State Management ---

    async addNewState(state: IState): Promise<Configuration | null> {
        // Validation: Prevent duplicate state slugs
        return await ConfigurationModel.findOneAndUpdate(
            { 'serviceStates.slug': { $ne: state.slug } },
            { $push: { serviceStates: state } },
            { new: true }
        );
    }

    async deleteState(stateId: string): Promise<Configuration | null> {
        return await ConfigurationModel.findOneAndUpdate(
            {},
            { $pull: { serviceStates: { _id: stateId } } },
            { new: true }
        );
    }

    // --- City Management ---

    async addNewCity(city: ICity): Promise<any> {
        const slug = slugify(city.name);

        const exists = await ConfigurationModel.findOne({
            'serviceCities.slug': slug
        });

        if (exists) {
            throw new Error('City already exists');
        }

        return await ConfigurationModel.findOneAndUpdate(
            {},
            {
                $push: {
                    serviceCities: {
                        ...city,
                        slug
                    }
                }
            },
            { new: true }
        );
    }

    async deleteCity(cityId: string): Promise<Configuration | null> {
        return await ConfigurationModel.findOneAndUpdate(
            {},
            { $pull: { serviceCities: { _id: cityId } } },
            { new: true }
        );
    }
}

export default new ConfigurationRepository();
