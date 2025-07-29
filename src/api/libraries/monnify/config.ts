import https from 'https';
import appConfig from '../../../config/appConfig';
import { promisify } from 'util';
import { hostname } from 'os';
import axios, { AxiosRequestConfig, Method } from 'axios';

const sleep = promisify(setTimeout);

// interface RequestOptions {
//     hostname: string;
//     port: number;
//     path: string;
//     method: string;
//     headers: Record<string, string>;
// }

interface MakeRequestOptions {
    method: Method; // Axios uses its own Method type
    path: string;
    headers: Record<string, string>;
    requestBody?: Record<string, any>; // or unknown, depending on your use case
}

export default class MonnifyApi {
    private secretKey: string;
    private apiKey: string;
    private baseUrl: string;

    constructor(secretKey: string, apiKey: string, baseUrl: string) {
        this.secretKey = secretKey;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;

        console.log(secretKey, apiKey, baseUrl);
    }

    protected async makeRequest({
        method,
        path,
        headers,
        requestBody
    }: MakeRequestOptions): Promise<any> {
        try {
            const url = `${this.baseUrl}${path}`;
            const options: AxiosRequestConfig = {
                method: method,
                url: url,
                headers: headers,
                data: requestBody ?? {} // In Axios, the request payload is passed as 'data'
            };

            // With Axios, there's no need to conditionally add the body based on the request method.
            // Axios will ignore it for methods where a body is not supported.
            // console.log(options);
            const response = await axios(options);
            const data = response.data;

            // console.log(data); // Logging the response data
            return data;
        } catch (error: any) {
            console.error(error); // Logging the error
            // Ensure consistent error handling, axios wraps the original error
            return error.response
                ? error.response.data
                : new Error('An unknown error occurred');
        }
    }
    // protected async makeRequest({
    //     method,
    //     path,
    //     headers,
    //     requestBody
    // }: MakeRequestOptions): Promise<any> {
    //     try {
    //         const url = `${this.baseUrl}${path}`;
    //         const options: any = {
    //             method: method,
    //             headers: headers,
    //             body: JSON.stringify(requestBody) // Include body conditionally below
    //         };

    //         // Conditionally adding the body if the method is not GET or HEAD
    //         if (method !== 'GET' && method !== 'HEAD' && requestBody) {
    //             options.body = JSON.stringify(requestBody);
    //         } else {
    //             delete options.body; // Fetch does not allow body in GET/HEAD requests
    //         }
    //         console.log(options);
    //         const response = await fetch(url, options);
    //         const data = await response.json();

    //         console.log(data); // Logging the response data
    //         return data;
    //     } catch (error) {
    //         console.error(error); // Logging the error
    //         return error;
    //     }
    // }

    // to generate token
    // async genToken(): Promise<any> {
    //     const key = Buffer.from(this.apiKey + ':' + this.secretKey).toString(
    //         'base64'
    //     );
    //     const path = '/api/v1/auth/login';
    //     const headers = {
    //         Authorization: `Basic ${key}`
    //     };
    //     const data = await this.makeRequest({
    //         method: 'POST',
    //         path,
    //         headers
    //     });

    //     console.log(data);
    //     // appConfig.monnify.accessToken =
    //     return data.responseBody?.accessToken;

    //     // setTimeout(() => {
    //     //     appConfig.monnify.accessToken = '';
    //     //     console.log('deleting expired token');
    //     // }, (1000 * data.responseBody?.expiresIn ?? 0) as number);
    //     // return data;
    // }
}
