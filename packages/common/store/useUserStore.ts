import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import * as request from 'common/utils/http-request';
import { QueryResponseGetOneType } from 'common/types';
import { useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from 'b2c-client/hooks/useAuth';

type User = {
    id: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
    address: string | null;
    gender: string | null;
    dob: string | null;
    phone: string | null;
};

type UserState = {
    data: QueryResponseGetOneType<User> | null | undefined;
    setData: (
        payload: QueryResponseGetOneType<User> | null | undefined
    ) => void;
};

const useUserStore = create<UserState>((set) => {
    return {
        data: null,
        setData: (payload) => set({ data: payload }),
    };
});

export const useUserQueryStore = () => {
    const auth = useAuth();
    const { data, setData } = useUserStore();

    const isAuth = useMemo(() => {
        if (process.env.NEXT_PUBLIC_SITE === 'CLIENT') {
            return !!auth;
        }
        if (process.env.NEXT_PUBLIC_SITE === 'CMS') {
            const userString = Cookies.get('cmsUser');
            const user = userString ? JSON.parse(userString) : null;
            return !!user;
        }
        return false;
    }, [auth]);

    const {
        data: userResponse,
        refetch,
        isFetching,
    } = useQuery<QueryResponseGetOneType<User>>({
        queryKey: ['user-info'],
        queryFn: () => request.get('user').then((res) => res.data),
        enabled: isAuth,
    });

    useEffect(() => {
        setData(userResponse);
    }, [userResponse]);

    return {
        user: data,
        reload: refetch,
        isFetching,
    };
};
