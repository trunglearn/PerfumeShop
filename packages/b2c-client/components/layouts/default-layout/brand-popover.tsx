import React, { useMemo } from 'react';
import { Popover } from 'antd';
import Link from 'next/link';
import * as request from 'common/utils/http-request';
import { useQuery } from '@tanstack/react-query';
import type { QueryResponseType } from 'common/types';
import type { Brand } from 'common/types/product';
import { DoubleRightOutlined } from '@ant-design/icons';

const BrandPopover = () => {
    const { data } = useQuery<QueryResponseType<Brand>>({
        queryKey: ['brand'],
        queryFn: () => request.get('brand').then((res) => res.data),
    });

    const content = useMemo(() => {
        if (data?.data && data?.data?.length === 0) {
            return (
                <div className="text-primary p-5 text-center">
                    Chưa có thương hiệu!
                </div>
            );
        }

        return (
            <div className="customScroll grid max-h-[500px] max-w-[1000px] grid-cols-4 gap-5 p-2">
                {data?.data?.map((item) => (
                    <Link
                        className="hover:text-primary text-base text-slate-600"
                        href={{
                            pathname: '/product',
                            query: {
                                brand: item?.id,
                            },
                        }}
                    >
                        <div className="flex items-center gap-1">
                            <DoubleRightOutlined className="text-xs" />
                            <p className="line-clamp-1">{item?.name}</p>
                        </div>
                    </Link>
                ))}
            </div>
        );
    }, [data]);

    return (
        <Popover content={content} placement="bottom" title="" zIndex={50}>
            <Link className="font-semibold uppercase" href="/product">
                Thương hiệu
            </Link>
        </Popover>
    );
};

export default BrandPopover;
