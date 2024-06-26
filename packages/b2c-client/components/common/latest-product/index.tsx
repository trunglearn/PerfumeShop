import { useQuery } from '@tanstack/react-query';
import React from 'react';
import * as request from 'common/utils/http-request';
import type { QueryResponseType } from 'common/types';
import type { Product } from '~/types/product';
import LatestProductItem from './latest-product-item';

const LatestProductList = () => {
    const { data } = useQuery<QueryResponseType<Product>>({
        queryKey: ['latest-product'],
        queryFn: () => request.get('/product/latest').then((res) => res.data),
    });
    return (
        <div className="customScroll h-full w-full space-y-5 px-5">
            <div className="sticky top-0 z-20 bg-white py-2 text-xl font-bold">
                Sản phẩm mới
            </div>
            <div className="flex flex-col gap-5 px-1 py-2">
                {data?.data?.map((item) => (
                    <LatestProductItem data={item} key={item?.id} />
                ))}
            </div>
        </div>
    );
};

export default LatestProductList;
