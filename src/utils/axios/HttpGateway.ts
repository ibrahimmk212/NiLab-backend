import axios, { AxiosResponse, AxiosHeaders } from 'axios';
type RequestData = {
    baseUrl: string;
    headers?: AxiosHeaders;
    body?: any;
};
class HttpGateway {
    async get(data: RequestData) {
        try {
            const resp = await axios.get(data.baseUrl, {
                headers: data.headers ?? { 'Content-Type': 'application/json' }
            });
            return resp;
        } catch (error) {
            return handleError(error);
        }
    }
    async post(data: RequestData) {
        try {
            const resp = await axios.post(data.baseUrl, data.body, {
                headers: data.headers ?? { 'Content-Type': 'application/json' }
            });
            return resp;
        } catch (error) {
            return handleError(error);
        }
    }

    async delete(data: RequestData) {
        try {
            const resp = await axios.delete(data.baseUrl, {
                headers: data.headers ?? { 'Content-Type': 'application/json' }
            });
            return resp;
        } catch (error) {
            return handleError(error);
        }
    }
    async put(data: RequestData) {
        try {
            const resp = await axios.put(`${data.baseUrl}`, data.body, {
                headers: data.headers ?? { 'Content-Type': 'application/json' }
            });
            return resp;
        } catch (error) {
            return handleError(error);
        }
    }
}

// Generic error handler for axios requests
function handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
        return new Error(error.message);
    }
    return new Error('An unknown error occurred');
}

export default new HttpGateway();
