/* eslint-disable max-lines */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-unstable-nested-components */
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import * as request from 'common/utils/http-request';
import {
    Button,
    DatePicker,
    Form,
    FormProps,
    Input,
    Select,
    Spin,
    Switch,
    Table,
    TableColumnsType,
    TableProps,
    Tooltip,
} from 'antd';
import type { QueryResponseType, Sorts } from 'common/types';
import type { OrderCms } from 'common/types/order';

import moment from 'moment';
import { currencyFormatter } from 'common/utils/formatter';

import { ORDER_STATUS, PAGE_SIZE } from 'common/constant';
import { toast } from 'react-toastify';
import { getSortOrder } from 'common/utils/getSortOrder';
import dayjs from 'dayjs';
import Image from 'next/image';
import { getImageUrl } from 'common/utils/getImageUrl';
import { User } from 'common/types/customer';
import Avatar from 'common/components/avatar';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useDebounceValue } from 'usehooks-ts';
import { cn } from 'common/utils';
import Link from 'next/link';
import { useUserQueryStore } from 'common/store/useUserStore';
import AssignSeller from './assign-seller';
import { useAuthCms } from '~/hooks/useAuthCms';

type FormType = {
    orderId?: string;
    customer?: string;
    status?: string;
    date?: Date[];
    assignee?: string;
};

type SearchParams = FormType & {
    pageSize?: number;
    currentPage?: number;
};

const { RangePicker } = DatePicker;

const OrderList = () => {
    const auth = useAuthCms();
    const { user } = useUserQueryStore();

    const [searchParams, setSearchParams] = useState<SearchParams>({
        pageSize: PAGE_SIZE,
        currentPage: 1,
    });
    const [sortedInfo, setSortedInfo] = useState<Sorts<FormType>>({});
    const [searchAssignee, setSearchAssign] = useState<string>();
    const [meMode, setMeMode] = useState<boolean>(false);

    const [searchAssigneeDebouncedValue] = useDebounceValue(
        searchAssignee,
        500
    );

    const { data, isFetching, refetch } = useQuery<QueryResponseType<OrderCms>>(
        {
            queryKey: ['order-list-cms', sortedInfo, searchParams, meMode],
            queryFn: () =>
                request
                    .get('order/list-order-cms', {
                        params: {
                            orderName: sortedInfo?.field,
                            order: getSortOrder(sortedInfo?.order),
                            ...searchParams,
                            meMode,
                        },
                    })
                    .then((res) => res.data),
        }
    );

    const { data: sellerData } = useQuery<QueryResponseType<User>>({
        queryKey: ['seller-select', searchAssigneeDebouncedValue],
        queryFn: () =>
            request
                .get('/seller-select', {
                    params: {
                        search: searchAssigneeDebouncedValue,
                    },
                })
                .then((res) => res.data),
    });

    const { mutate } = useMutation({
        mutationFn: ({
            orderId,
            status,
        }: {
            orderId: string;
            status: string;
        }) =>
            request
                .put(`order/update-status/${orderId}`, { status })
                .then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res.message);
            refetch();
        },
        onError: () => {
            toast.error('Something went wrong!');
        },
    });

    const columns: TableColumnsType<Partial<OrderCms>> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Ordered Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
            render(value) {
                return <div>{moment(value).format('YYYY-MM-DD HH:mm')}</div>;
            },
        },
        {
            title: 'Customer name',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
        },
        {
            title: 'Product',
            dataIndex: 'orderDetail',
            key: 'orderDetail',
            width: 450,
            render(_, record) {
                return (
                    <div>
                        <div className="flex gap-4 text-base font-medium">
                            <Image
                                alt={record?.orderDetail?.[0]?.thumbnail ?? ''}
                                className="rounded-md object-cover"
                                height={60}
                                src={getImageUrl(
                                    record?.orderDetail?.[0]?.thumbnail ?? ''
                                )}
                                style={{
                                    width: 60,
                                    height: 60,
                                }}
                                width={60}
                            />

                            <div>
                                <p>{record?.orderDetail?.[0]?.productName}</p>
                                <p>x{record?.orderDetail?.[0]?.quantity}</p>
                                <p>
                                    {record?.orderDetail?.[0]?.totalPrice &&
                                        currencyFormatter(
                                            record?.orderDetail?.[0]?.totalPrice
                                        )}
                                </p>
                            </div>
                        </div>
                        {record?._count?.orderDetail &&
                            Number(record?._count?.orderDetail) - 1 > 0 && (
                                <div className="text-slate-500">
                                    {record?._count?.orderDetail} more product
                                </div>
                            )}
                    </div>
                );
            },
        },
        {
            title: 'Total cost',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'totalAmount'
                    ? sortedInfo.order
                    : null,
            render(value) {
                return (
                    <div className="text-base font-semibold">
                        {currencyFormatter(value)}
                    </div>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'status' ? sortedInfo.order : null,
            render(value, record) {
                return (user && user.data?.id === record.seller?.id) ||
                    auth?.role === 'SELLERMANAGER' ? (
                    <Select
                        className="w-[160px]"
                        onChange={(selected) => {
                            if (!record.id) {
                                return;
                            }
                            mutate({
                                orderId: record.id,
                                status: selected,
                            });
                        }}
                        optionFilterProp="label"
                        options={ORDER_STATUS}
                        placeholder="Select a status"
                        value={value}
                    />
                ) : (
                    <div>{value}</div>
                );
            },
        },
        {
            title: 'Assignee',
            dataIndex: 'seller',
            key: 'Assignee',
            width: 255,
            render(_, record) {
                return (
                    <AssignSeller
                        orderId={record.id ?? ''}
                        reload={() => {
                            refetch();
                        }}
                        seller={record?.seller}
                    />
                );
            },
        },
        {
            title: 'Action',
            key: 'actions',
            render(_, record) {
                return (
                    <Tooltip title="Detail">
                        <Link href={`/seller/order/${record.id}`}>
                            <Button type="link">
                                <EyeOutlined className="text-base" />
                            </Button>
                        </Link>
                    </Tooltip>
                );
            },
        },
    ];

    const handleTableChange: TableProps<Partial<OrderCms>>['onChange'] = (
        pagination,
        _,
        sorter
    ) => {
        setSearchParams((prev) => ({
            ...prev,
            pageSize: pagination.pageSize,
            currentPage: pagination.current,
        }));
        setSortedInfo(sorter as Sorts<FormType>);
    };

    const onFinish: FormProps<FormType>['onFinish'] = (values) => {
        const submitObj = {
            orderId: values.orderId,
            customer: values.customer,
            startDate: values?.date?.[0]
                ? dayjs(values?.date?.[0]).format('YYYY-MM-DD')
                : undefined,
            endDate: values?.date?.[1]
                ? dayjs(values?.date?.[1]).format('YYYY-MM-DD')
                : undefined,
            assignee: values.assignee,
            status: values.status,
        };

        setSearchParams((prev) => ({ ...prev, ...submitObj }));
    };

    return (
        <Spin spinning={isFetching}>
            <div>
                <Form
                    labelCol={{ span: 5 }}
                    onFinish={onFinish}
                    wrapperCol={{ span: 18 }}
                >
                    <div className={cn('grid grid-cols-3 gap-10')}>
                        <Form.Item<FormType> label="Order ID" name="orderId">
                            <Input placeholder="Enter orderId..." />
                        </Form.Item>
                        <Form.Item<FormType> label="Customer" name="customer">
                            <Input placeholder="Enter customer name..." />
                        </Form.Item>
                        <Form.Item<FormType> label="Status" name="status">
                            <Select
                                allowClear
                                optionFilterProp="label"
                                options={ORDER_STATUS}
                                placeholder="Select a status..."
                            />
                        </Form.Item>
                        <Form.Item<FormType> label="Ordered date" name="date">
                            <RangePicker
                                className="w-full"
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                        {auth?.role === 'SELLERMANAGER' && (
                            <Form.Item<FormType>
                                label="Sale name"
                                name="assignee"
                            >
                                <Select
                                    allowClear
                                    dropdownRender={(menu) => (
                                        <>
                                            <div className="p-2">
                                                <Input
                                                    onChange={(e) => {
                                                        setSearchAssign(
                                                            e.target.value
                                                        );
                                                    }}
                                                    placeholder="Enter seller name, email or phone..."
                                                    prefix={
                                                        <SearchOutlined className="text-slate-500" />
                                                    }
                                                    value={searchAssignee}
                                                />
                                            </div>
                                            {menu}
                                        </>
                                    )}
                                    labelRender={({ label }) => {
                                        return <div>{label}</div>;
                                    }}
                                    placeholder="Select a seller..."
                                    size="large"
                                >
                                    {sellerData?.data?.map((item) => (
                                        <Select.Option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            <div className="flex items-center gap-x-4">
                                                <div>
                                                    <Avatar
                                                        height={30}
                                                        src={getImageUrl(
                                                            item?.image
                                                        )}
                                                        width={30}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="font-medium leading-none">
                                                        {item?.name}
                                                    </p>
                                                    <p className="leading-none text-slate-500">
                                                        {item?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}

                        <Form.Item>
                            <Button htmlType="submit" type="primary">
                                Search
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </div>
            {auth?.role === 'SELLER' && (
                <div className="my-5">
                    <Switch
                        checkedChildren="Me mode on"
                        onChange={(checked) => setMeMode(checked)}
                        unCheckedChildren="Me mode off"
                        value={meMode}
                    />
                </div>
            )}

            <div>
                <Table
                    columns={columns}
                    dataSource={data?.data}
                    onChange={handleTableChange}
                    pagination={{
                        total: data?.pagination?.total,
                        defaultCurrent: 1,
                        current: searchParams?.currentPage,
                        pageSizeOptions: [5, 10, 20, 50],
                        showSizeChanger: true,
                        pageSize: searchParams?.pageSize,
                    }}
                    rowKey="id"
                />
            </div>
        </Spin>
    );
};

export default OrderList;
