/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import React, { useState } from 'react';
import {
    Button,
    Form,
    FormProps,
    Input,
    Pagination,
    Rate,
    Select,
    Space,
    Spin,
    Switch,
    Table,
    TableColumnsType,
    TableProps,
    Tag,
    Tooltip,
} from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as request from 'common/utils/http-request';
import { PAGE_SIZE, RATING_LIST } from 'common/constant';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { getSortOrder } from 'common/utils/getSortOrder';
import moment from 'moment';
import Header from '~/components/header';
import { Sorts } from '~/types';
import { Feedback, Product, User } from '~/types/feedback';

type FormType = {
    search?: string;
    rating?: string;
    isShow?: boolean;
    feedbackId?: string;
    userId?: string;
    productId?: string;
    userName?: string;
};

type SearchParams = FormType & {
    pageSize?: number;
    currentPage?: number;
};

const FeedbackList = () => {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        pageSize: PAGE_SIZE,
        currentPage: 1,
    });
    const [sortedInfo, setSortedInfo] = useState<Sorts<FormType>>({});

    const { data: listProduct, isLoading: productLoading } = useQuery({
        queryKey: ['product'],
        queryFn: () => request.get('product/select').then((res) => res.data),
    });

    const {
        data: listFeedback,
        isLoading: feedbackLoading,
        refetch,
    } = useQuery({
        queryKey: ['feedback'],
        queryFn: () =>
            request
                .get('manage/feedback', {
                    params: {
                        ...searchParams,
                        orderName: sortedInfo?.field,
                        order: getSortOrder(sortedInfo?.order),
                    },
                })
                .then((res) => res.data),
    });

    const { mutate: updateFeedbackStatusTrigger } = useMutation({
        mutationFn: ({
            feedbackId,
            isShow,
        }: {
            feedbackId: string;
            isShow: boolean;
        }) => {
            return request
                .put(`feedback/updateStatus/${feedbackId}`, { isShow })
                .then((res) => res.data);
        },
        onSuccess: (res) => {
            toast.success(res.message);
            refetch();
        },
        onError: (
            error: AxiosError<{
                isOk?: boolean | null;
                message?: string | null;
            }>
        ) => toast.error(error.response?.data.message),
    });

    const columns: TableColumnsType<Feedback> = [
        {
            title: 'User full name',
            dataIndex: 'user',
            key: 'user',
            ellipsis: true,
            sorter: true,
            width: 100,
            sortOrder:
                sortedInfo.columnKey === 'user' ? sortedInfo.order : null,
            render: (value: User) => <p>{value?.name}</p>,
        },
        {
            title: 'Product name',
            dataIndex: 'product',
            key: 'product',
            ellipsis: true,
            sorter: true,
            width: 150,
            sortOrder:
                sortedInfo.columnKey === 'product' ? sortedInfo.order : null,

            render: (value: Product) => <p>{value?.name}</p>,
        },
        {
            title: 'Feedback content',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            width: 150,
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            width: 100,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'rating' ? sortedInfo.order : null,
            render: (value: number) => (
                <Rate className="text-md" disabled value={value ?? 0} />
            ),
        },
        {
            title: 'Status',
            dataIndex: 'isShow',
            key: 'isShow',
            render: (value: boolean, record: Feedback) => {
                return (
                    <Switch
                        checkedChildren="Show"
                        onChange={(checked: boolean) => {
                            updateFeedbackStatusTrigger({
                                feedbackId: record?.id || '',
                                isShow: checked,
                            });
                        }}
                        unCheckedChildren="Hide"
                        value={value}
                    />
                );
            },
            width: 80,
        },
        {
            title: 'Create At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_: any, record: Feedback) => (
                <p>
                    {record?.createdAt &&
                        moment(record.createdAt).format('YYYY-MM-DD')}
                </p>
            ),
            width: 80,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 40,
            render: (_: undefined, record: Feedback) => (
                <Space>
                    <Tooltip arrow={false} color="#108ee9" title="Detail">
                        <Link href={`/marketer/feedback/${record?.id}`}>
                            <Button
                                icon={<EyeOutlined />}
                                shape="circle"
                                type="link"
                            />
                        </Link>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const filterOption = (
        input: string,
        option?: { value: string; label: string }
    ) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const onFinish: FormProps<FormType>['onFinish'] = (values) => {
        setSearchParams((prev) => ({ ...prev, ...values, currentPage: 1 }));
        setTimeout(() => {
            refetch();
        });
    };

    const handleTableChange: TableProps<Feedback>['onChange'] = (
        pagination,
        filters,
        sorter
    ) => {
        setSortedInfo(sorter as Sorts<FormType>);
        setTimeout(() => {
            refetch();
        }, 500);
    };

    return (
        <Spin spinning={feedbackLoading || productLoading}>
            <Header title="Manage Feedback" />
            <div>
                <Form
                    className="flex gap-x-10"
                    labelCol={{ span: 6 }}
                    onFinish={onFinish}
                    wrapperCol={{ span: 18 }}
                >
                    <div className="grid flex-1 grid-cols-2 justify-end gap-x-5 xl:grid-cols-3">
                        <Form.Item<FormType> label="Product" name="productId">
                            <Select
                                allowClear
                                filterOption={filterOption}
                                options={listProduct?.data?.map(
                                    (item: Product) => ({
                                        value: item.id,
                                        label: item.name,
                                    })
                                )}
                                placeholder="Select a product..."
                                showSearch
                            />
                        </Form.Item>
                        {/* <Form.Item<FormType>
                            label="Search by user name"
                            name="userId"
                        >
                            <Select
                                allowClear
                                filterOption={filterOption}
                                options={listFeedback?.data?.map(
                                    (item: Feedback) => ({
                                        value: item.userId,
                                        label: item.user?.name,
                                    })
                                )}
                                placeholder="Select user name..."
                                showSearch
                            />
                        </Form.Item> */}
                        <Form.Item<FormType>
                            label="Search by user name"
                            name="userName"
                        >
                            <Input placeholder="Enter feedback content..." />
                        </Form.Item>

                        <Form.Item<FormType> label="Rate" name="rating">
                            <Select allowClear placeholder="Select rating...">
                                {RATING_LIST.map((item) => (
                                    <Select.Option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        <Rate disabled value={item.value} />
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item<FormType>
                            label="Show on client"
                            name="isShow"
                        >
                            <Select
                                allowClear
                                placeholder="Choose show on client..."
                            >
                                <Select.Option value="true">
                                    <Tag color="blue">SHOW</Tag>
                                </Select.Option>
                                <Select.Option value="false">
                                    <Tag color="red">HIDE</Tag>
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item<FormType>
                            label="Search by content"
                            name="search"
                        >
                            <Input placeholder="Enter feedback content..." />
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <Button
                            htmlType="submit"
                            icon={<SearchOutlined />}
                            type="primary"
                        >
                            Search
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <div>
                <Table
                    bordered
                    columns={columns}
                    dataSource={listFeedback?.data}
                    onChange={handleTableChange}
                    pagination={false}
                    rowKey="id"
                />
                <div className="mt-5 flex justify-end">
                    {listFeedback?.pagination?.total ? (
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
                            total={listFeedback?.pagination?.total}
                        />
                    ) : null}
                </div>
            </div>
        </Spin>
    );
};

export default FeedbackList;
