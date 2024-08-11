import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import * as request from 'common/utils/http-request';
import {
    Button,
    Form,
    FormProps,
    Input,
    Select,
    Spin,
    Table,
    TableColumnsType,
    TableProps,
} from 'antd';
import { QueryResponseType } from 'common/types';
import { Customer } from 'common/types/customer';
import { CUSTOMER_STATUS, PAGE_SIZE } from 'common/constant';
import { getSortOrder } from 'common/utils/getSortOrder';
import { SearchOutlined } from '@ant-design/icons';
import { Sorts } from '~/types';
import CustomerForm from './customer-form';

type FormType = {
    search?: string;
    status?: string;
};

type SearchParams = FormType & {
    pageSize?: number;
    currentPage?: number;
};

const CustomerList = () => {
    const [form] = Form.useForm();

    const [searchParams, setSearchParams] = useState<SearchParams>({
        pageSize: PAGE_SIZE,
        currentPage: 1,
    });

    const [sortedInfo, setSortedInfo] = useState<Sorts<FormType>>({});

    const { data, isFetching, refetch } = useQuery<QueryResponseType<Customer>>(
        {
            queryKey: ['customer-list', searchParams, sortedInfo],
            queryFn: () =>
                request
                    .get('customer', {
                        params: {
                            ...searchParams,
                            orderName: sortedInfo?.field,
                            order: getSortOrder(sortedInfo?.order),
                        },
                    })
                    .then((res) => res.data),
        }
    );

    const columns: TableColumnsType<Partial<Customer>> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            ellipsis: true,
            width: 180,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'email' ? sortedInfo.order : null,
        },
        {
            title: 'Mobile',
            dataIndex: 'phone',
            key: 'phone',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'phone' ? sortedInfo.order : null,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'status' ? sortedInfo.order : null,
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                return (
                    <div>
                        <CustomerForm
                            customerId={record?.id}
                            reloadList={() => {
                                refetch();
                            }}
                            type="UPDATE"
                        />
                    </div>
                );
            },
        },
    ];

    const filterOption = (
        input: string,
        option?: { value: string; label: string }
    ) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const onFinish: FormProps<FormType>['onFinish'] = (values) => {
        setSearchParams((prev) => ({ ...prev, ...values, currentPage: 1 }));
    };

    const handleTableChange: TableProps<Partial<Customer>>['onChange'] = (
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

    return (
        <Spin spinning={isFetching}>
            <div>
                <div>
                    <Form
                        form={form}
                        labelCol={{ span: 6 }}
                        onFinish={onFinish}
                        wrapperCol={{ span: 18 }}
                    >
                        <div className="grid grid-cols-12 gap-4">
                            <Form.Item<FormType>
                                className="col-span-5"
                                label="Status"
                                name="status"
                            >
                                <Select
                                    allowClear
                                    filterOption={filterOption}
                                    options={CUSTOMER_STATUS.map((item) => ({
                                        value: item.value,
                                        label: item.value,
                                    }))}
                                    placeholder="Select a status..."
                                    showSearch
                                />
                            </Form.Item>
                            <Form.Item<FormType>
                                className="col-span-5"
                                label="Search"
                                name="search"
                            >
                                <Input placeholder="Enter customer name, email or phone number..." />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    htmlType="submit"
                                    icon={<SearchOutlined />}
                                    type="primary"
                                >
                                    Search
                                </Button>
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        form.resetFields();
                                        form.submit();
                                    }}
                                    type="default"
                                >
                                    Clear
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                </div>
                <div className="flex justify-end py-4">
                    <CustomerForm
                        reloadList={() => {
                            refetch();
                        }}
                        type="CREATE"
                    />
                </div>
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

export default CustomerList;
