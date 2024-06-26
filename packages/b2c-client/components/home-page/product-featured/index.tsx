import React from 'react';
import * as request from 'common/utils/http-request';
import { useQuery } from '@tanstack/react-query';
import type { ProductFeatured } from 'common/types/product';
import type { QueryResponseType } from 'common/types';

import Link from 'next/link';
import { Button } from 'antd';
import ProductCardItem from './product-card-item';

const ListProductFeatured = () => {
    const { data } = useQuery<QueryResponseType<Partial<ProductFeatured>>>({
        queryKey: ['product-featured'],
        queryFn: () => request.get('product-featured').then((res) => res.data),
    });

    return (
        <div>
            <div className="space-y-10">
                <div className="flex justify-between">
                    <div className="text-2xl font-bold uppercase">
                        Sản phẩm nổi bật
                    </div>
                    <Link href="/product">
                        <Button>Tất cả sản phẩm</Button>
                    </Link>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {data?.data?.map((item) => (
                        <div
                            className="!h-[480px] w-full rounded-2xl border shadow-md"
                            key={item.id}
                        >
                            <ProductCardItem data={item} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center">
                    <Link href="/product">
                        <Button size="large">Tất cả sản phẩm</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ListProductFeatured;
