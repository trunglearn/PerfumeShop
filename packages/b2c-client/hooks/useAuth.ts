import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

export const useAuth = () => {
    const [auth, setAuth] = useState();

    const authCookies = Cookies.get('accessTokenClient');
    useEffect(() => {
        if (authCookies) {
            setAuth(JSON.parse(authCookies));
        }
    }, [authCookies]);

    return auth;
};
