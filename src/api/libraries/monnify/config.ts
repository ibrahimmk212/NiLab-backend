// src/api/libraries/monnify/config.ts
import axios, { AxiosRequestConfig, Method } from 'axios';

// Force IPv4 to resolve the connection timeouts we saw earlier
axios.defaults.family = 4;

export interface MakeRequestOptions {
    method: Method;
    path: string;
    headers: Record<string, string>;
    requestBody?: Record<string, any>;
}

// Ensure the class is exported correctly
export default class MonnifyApi {
    protected secretKey: string; // Changed from private to protected
    protected apiKey: string; // Changed from private to protected
    private baseUrl: string;

    constructor(secretKey: string, apiKey: string, baseUrl: string) {
        this.secretKey = secretKey;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    // This MUST be protected so the Monnify class can call it via 'this'
    protected async makeRequest({
        method,
        path,
        headers,
        requestBody
    }: MakeRequestOptions): Promise<any> {
        try {
            const url = `${this.baseUrl}${path}`;
            const options: AxiosRequestConfig = {
                method,
                url,
                headers,
                data: requestBody ?? {},
                timeout: 15000
            };

            const response = await axios(options);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error(
                    '[Monnify API Details]:',
                    JSON.stringify(error.response.data)
                );
            }
            // Throw so that genToken doesn't return undefined
            throw error;
        }
    }
}
