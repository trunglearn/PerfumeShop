import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

type Auth = {
    access_token: string;
    email: string;
    name: string;
    refresh_token: string;
    role: 'ADMIN' | 'USER' | 'SELLER' | 'MARKETER' | 'SELLERMANAGER';
    token_type: string;
};

export const useAuthCms = (): Auth | undefined => {
    const [auth, setAuth] = useState();

    const authCookies = Cookies.get('cmsUser');
    useEffect(() => {
        if (authCookies) {
            setAuth(JSON.parse(authCookies));
        }
    }, [authCookies]);

    return auth;
};
