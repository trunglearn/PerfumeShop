import { useQuery } from '@tanstack/react-query';
import { Cart } from 'common/types/cart';
import { create } from 'zustand';
import * as request from 'common/utils/http-request';
import { QueryResponseType } from 'common/types';
import { useEffect } from 'react';
import { useAuth } from './useAuth';

type CartQueryState = {
    data: QueryResponseType<Cart> | null | undefined;
    setData: (payload: QueryResponseType<Cart> | null | undefined) => void;
};

const useCartQueryStore = create<CartQueryState>((set) => {
    return {
        data: null,
        setData: (payload: QueryResponseType<Cart> | null | undefined) =>
            set({ data: payload }),
    };
});

export const useCartQuery = () => {
    const auth = useAuth();
    const { data, setData } = useCartQueryStore();

    const { data: cartLatestData, refetch } = useQuery<QueryResponseType<Cart>>(
        {
            queryKey: ['cart-latest-global'],
            queryFn: () => request.get('cart-latest').then((res) => res.data),
            enabled: !!auth,
        }
    );

    useEffect(() => {
        setData(cartLatestData);
    }, [cartLatestData]);

    return {
        data,
        reload: refetch,
    };
};
