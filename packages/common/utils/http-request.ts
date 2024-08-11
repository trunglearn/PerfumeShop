import axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

let token = null;

if (process.env.NEXT_PUBLIC_SITE === 'CLIENT') {
    const userString = Cookies.get('accessTokenClient');
    const user = userString ? JSON.parse(userString) : null;
    token = user?.access_token;
}

if (process.env.NEXT_PUBLIC_SITE === 'CMS') {
    const userString = Cookies.get('cmsUser');
    const user = userString ? JSON.parse(userString) : null;
    token = user?.access_token;
}

const request = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        common: { Authorization: `Bearer ${token}` },
    },
});

export const get = async <T>(path: string, req?: AxiosRequestConfig<T>) => {
    const response = await request.get(path, req);
    return response;
};

export const post = async <T>(
    path: string,
    req?: T,
    headers?: AxiosRequestConfig<T>
) => {
    const response = await request.post(path, req, headers);
    return response;
};

export const put = async <T>(
    path: string,
    req: T,
    headers?: AxiosRequestConfig<T>
) => {
    const response = await request.put(path, req, headers);
    return response;
};

export const del = async (path: string) => {
    const response = await request.delete(path);
    return response;
};

export default request;
