import { SearchOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Input, Pagination, Spin, Tabs, TabsProps } from 'antd';
import { PAGE_SIZE_CLIENT } from 'common/constant';
import { QueryResponseType } from 'common/types';
import { Order, orderStatus } from 'common/types/order';
import * as request from 'common/utils/http-request';
import { NextPage } from 'next';
import { useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { OrderCard } from '~/components/order/order-card';

const items: TabsProps['items'] = Object.entries(orderStatus).map(
    ([key, value]) => ({
        key,
        label: value,
    })
);

items.unshift({ key: '', label: 'Tất cả' });

type SearchParams = {
    pageSize?: number;
    currentPage?: number;
    status?: string;
};

const MyOrder: NextPage = () => {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        pageSize: PAGE_SIZE_CLIENT,
        currentPage: 1,
    });

    const [searchValue, setSearchValue] = useState<string>();

    const [searchDebounce, setSearchDebounce] = useDebounceValue(
        searchValue,
        500
    );

    const {
        data: listOrder,
        isLoading,
        refetch,
    } = useQuery<QueryResponseType<Order>>({
        queryKey: ['my-order', searchParams, searchDebounce],
        queryFn: () =>
            request
                .get('/my-order', {
                    params: {
                        ...searchParams,
                        search: searchDebounce,
                    },
                })
                .then((res) => res.data),
    });

    return (
        <div className="container">
            <div>
                <Spin spinning={isLoading}>
                    <Tabs
                        centered
                        defaultActiveKey="1"
                        items={items}
                        onChange={(key: string) => {
                            setSearchParams({
                                ...searchParams,
                                status: key,
                            });
                        }}
                        size="large"
                    />
                    <div className="flex w-full justify-center">
                        <Input
                            allowClear
                            className=" rounded-full"
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                                setSearchDebounce(e.target.value);
                            }}
                            placeholder="Nhập mã đơn hàng hoặc tên sản phẩm..."
                            prefix={
                                <SearchOutlined className="text-slate-400" />
                            }
                            size="large"
                            style={{ width: 800 }}
                        />
                    </div>
                    {listOrder?.data && listOrder?.data?.length > 0 ? (
                        <div className="flex w-full justify-center">
                            <div className="w-full">
                                {listOrder?.data?.map((order) => (
                                    <OrderCard
                                        order={order as Order}
                                        reload={() => refetch()}
                                    />
                                ))}

                                <div className="mb-8 flex w-full justify-end">
                                    {listOrder?.pagination?.total ? (
                                        <Pagination
                                            current={searchParams?.currentPage}
                                            defaultCurrent={1}
                                            onChange={(page, pageSize) => {
                                                setSearchParams((prev) => ({
                                                    ...prev,
                                                    currentPage: page,
                                                    pageSize,
                                                }));
                                                setTimeout(() => {
                                                    refetch();
                                                });
                                            }}
                                            pageSize={searchParams?.pageSize}
                                            total={listOrder?.pagination?.total}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-[400px] w-full flex-col items-center justify-center space-y-4">
                            <div>
                                <ShoppingOutlined className="text-8xl text-slate-400" />
                            </div>
                            <div className="text-lg">Chưa có đơn hàng nào.</div>
                        </div>
                    )}
                </Spin>
            </div>
        </div>
    );
};

export default MyOrder;
