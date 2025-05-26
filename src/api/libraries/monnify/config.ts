// import https from 'https';
// import appConfig from '../../../config/appConfig';
// import { promisify } from 'util';
// import { hostname } from 'os';

// const sleep = promisify(setTimeout);

// interface RequestOptions {
//     hostname: string;
//     port: number;
//     path: string;
//     method: string;
//     headers: Record<string, string>;
// }

// interface MakeRequestOptions {
//     method: string;
//     path: string;
//     headers: Record<string, string>;
//     requestBody?: unknown;
// }

// export default class MonnifyApi {
//     private secretKey: string;
//     private apiKey: string;
//     private baseUrl: string;

//     constructor(secretKey: string, apiKey: string, baseUrl: string) {
//         this.secretKey = secretKey;
//         this.apiKey = apiKey;
//         this.baseUrl = baseUrl;
//     }

//     protected async makeRequest({
//         method,
//         path,
//         headers,
//         requestBody
//     }: MakeRequestOptions): Promise<any> {
//         try {
//             const url = `${this.baseUrl}${path}`;
//             const options: any = {
//                 method: method,
//                 headers: headers,
//                 body: JSON.stringify(requestBody) // Include body conditionally below
//             };

//             // Conditionally adding the body if the method is not GET or HEAD
//             if (method !== 'GET' && method !== 'HEAD' && requestBody) {
//                 options.body = JSON.stringify(requestBody);
//             } else {
//                 delete options.body; // Fetch does not allow body in GET/HEAD requests
//             }
//             console.log(options);
//             const response = await fetch(url, options);
//             const data = await response.json();

//             console.log(data); // Logging the response data
//             return data;
//         } catch (error) {
//             console.error(error); // Logging the error
//             return error;
//         }
//     }

//     // to generate token
//     async genToken(): Promise<any> {
//         const key = Buffer.from(this.apiKey + ':' + this.secretKey).toString(
//             'base64'
//         );
//         const path = '/api/v1/auth/login';
//         const headers = {
//             Authorization: `Basic ${key}`
//         };
//         const data = await this.makeRequest({
//             method: 'POST',
//             path,
//             headers
//         });

//         console.log(data);
//         // appConfig.monnify.accessToken =
//         return data.responseBody?.accessToken;

//         // setTimeout(() => {
//         //     appConfig.monnify.accessToken = '';
//         //     console.log('deleting expired token');
//         // }, (1000 * data.responseBody?.expiresIn ?? 0) as number);
//         // return data;
//     }
// }
