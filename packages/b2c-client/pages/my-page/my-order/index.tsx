import { useQuery } from '@tanstack/react-query';
import { Input, Layout, Pagination, Spin, Tabs, TabsProps } from 'antd';
import { PAGE_SIZE } from 'common/constant';
import { QueryResponseType } from 'common/types';
import { Order, orderStatus } from 'common/types/order';
import * as request from 'common/utils/http-request';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { OrderCard } from '~/components/order/order-card';
import styles from '~/styles/Products.module.css';

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
    search?: string;
};

const MyOrder: NextPage = () => {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        pageSize: PAGE_SIZE,
        currentPage: 1,
    });

    const {
        data: listOrder,
        isLoading,
        refetch,
    } = useQuery<QueryResponseType<Order>>({
        queryKey: ['my-order'],
        queryFn: () =>
            request
                .get('/my-order', {
                    params: {
                        ...searchParams,
                    },
                })
                .then((res) => res.data),
    });

    useEffect(() => {
        refetch();
    }, [searchParams]);
    return (
        <div className="">
            <Layout className={styles.container}>
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
                        <Input.Search
                            allowClear
                            onSearch={(value) => {
                                setSearchParams({
                                    ...searchParams,
                                    search: value.trim(),
                                });
                            }}
                            placeholder="Bạn có thể tìm kiếu theo mã đơn hàng hoặc tên sản phẩm"
                            size="large"
                            style={{ width: 800 }}
                        />
                    </div>
                    <div className="flex w-full justify-center">
                        <div className=" w-[1000px]">
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
                                        pageSizeOptions={[5, 10, 20, 50]}
                                        showSizeChanger
                                        total={listOrder?.pagination?.total}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </Spin>
            </Layout>
        </div>
    );
};

export default MyOrder;
