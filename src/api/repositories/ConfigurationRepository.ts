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
