import 'express';
import { User } from '../api/models/User';
import 'mongoose';
// import { Mongoose } from 'mongoose';
// Define the structure of your advancedResults property
interface AdvancedResults<T = any> {
    success: boolean;
    count: number;
    pagination?: any; // Define a more specific type if needed
    data: T[];
}
declare global {
    // declare module 'mongoose' {
    //     interface Query<
    //         T,
    //         DocType,
    //         THelpers = Record<string, unknown>,
    //         RawDocType = DocType
    //     > {
    //         cache(
    //             options?: CacheOptions
    //         ): Query<T, DocType, THelpers, RawDocType>;
    //     }
    // }
    namespace Mongoose {
        interface Query<
            T,
            DocType,
            THelpers = Record<string, unknown>,
            RawDocType = DocType
        > {
            cache(
                options?: CacheOptions
            ): Query<T, DocType, THelpers, RawDocType>;
        }
    }
    namespace Express {
        interface Request {
            userdata: User;
        }
        interface Response {
            advancedResults?: AdvancedResults;
        }
    }

    interface FindVendorsQuery {
        page?: number;
        limit?: number;
        category?: string;
        status?: string;
    }
}
