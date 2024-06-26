import React from 'react';
import { useQuery } from '@tanstack/react-query';
import * as request from 'common/utils/http-request';
import { QueryResponseType } from 'common/types';
import { Category } from 'common/types/product';
import BrandPopover from './brand-popover';
import { SiderItem } from './sider-item';

const MainSider = () => {
    const { data } = useQuery<QueryResponseType<Category>>({
        queryKey: ['category-list'],
        queryFn: () => request.get('category').then((res) => res.data),
    });
    return (
        <div>
            <div className="container py-3">
                <div className="flex space-x-4">
                    <SiderItem href="/" title="Trang chủ" />
                    <SiderItem href="/product" title="Tất cả sản phẩm" />
                    {data?.data?.map((item) => (
                        <SiderItem
                            href="/product"
                            query={{ category: item.id ?? '' }}
                            title={item.name ?? ''}
                        />
                    ))}
                    <BrandPopover />
                    <SiderItem href="/blog" title="Blog" />
                    <SiderItem href="/contact" title="Liên hệ" />
                </div>
            </div>
        </div>
    );
};

export default MainSider;
