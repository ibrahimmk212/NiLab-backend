// import mongoose from 'mongoose';
// import { createClient, RedisClientType } from 'redis';

// const redisUrl = 'redis://127.0.0.1:6379';
// const client: RedisClientType = createClient({ url: redisUrl });

// client.on('error', (err) => console.log('Redis Client Error', err));

// client.connect().then(() => console.log('Redis connected'));

// const exec = mongoose.Query.prototype.exec;

// interface CacheOptions {
//     key?: string;
// }

// // Extend mongoose's query type with custom properties
// interface CacheQuery extends mongoose.Query<any, any> {
//     useCache?: boolean;
//     hashKey?: string;
//     cache(options?: CacheOptions): this;
// }

// // Create cache toggler function
// mongoose.Query.prototype.cache = function (
//     this: CacheQuery,
//     options: CacheOptions = {}
// ): mongoose.Query<any, any> {
//     this.useCache = true;
//     this.hashKey = JSON.stringify(options.key || '');

//     return this;
// };

// mongoose.Query.prototype.exec = async function () {
//     const query = this as CacheQuery;

//     // if not cacheable, run exec function.
//     if (!query.useCache) {
//         return exec.apply(this, arguments);
//     }

//     // Create a unique cache key for each distinct query
//     const key = JSON.stringify(
//         Object.assign({}, query.getQuery(), {
//             collection: query.mongooseCollection.name
//         })
//     );

//     // Check Redis for a cache of this query
//     const cacheValue = await client.hGet(query.hashKey!, key);

//     // If there is a cache of this query, return it.
//     if (cacheValue) {
//         const doc = JSON.parse(cacheValue);
//         return Array.isArray(doc)
//             ? doc.map((d) => new query.model(d))
//             : new query.model(doc);
//     }

//     // Otherwise, issue the query and store the result in Redis
//     const result = await exec.apply(this, arguments);
//     await client.hSet(query.hashKey!, key, JSON.stringify(result));

//     return result;
// };

// export const clearHash = (hashKey: string) => {
//     client.del(JSON.stringify(hashKey));
// };
