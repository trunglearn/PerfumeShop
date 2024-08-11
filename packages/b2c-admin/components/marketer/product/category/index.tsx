import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import * as request from 'common/utils/http-request';
import {
    Button,
    Form,
    FormProps,
    Input,
    Space,
    Spin,
    Table,
    TableColumnsType,
    TableProps,
} from 'antd';
import moment from 'moment';
import { getSortOrder } from 'common/utils/getSortOrder';
import { SearchOutlined } from '@ant-design/icons';
import { Category } from '~/types/product';
import { Pagination, QueryResponseType, Sorts } from '~/types';
import CategoryFormModal from './category-form-modal';
import DeleteCategoryAlert from './delete-category-alert';

type FormType = {
    search?: string;
};

const ListCategory = () => {
    const [searchParams, setSearchParams] = useState<FormType>();

    const [paginationQuery, setPaginationQuery] = useState<Partial<Pagination>>(
        {
            current: 1,
            pageSize: 5,
        }
    );
    const [sortedInfo, setSortedInfo] = useState<Sorts<FormType>>({});

    const { data, isLoading, refetch } = useQuery<QueryResponseType<Category>>({
        queryKey: [
            'list-category-manage',
            paginationQuery,
            sortedInfo,
            searchParams,
        ],
        queryFn: () =>
            request
                .get('manage/category', {
                    params: {
                        pageSize: paginationQuery.pageSize,
                        currentPage: paginationQuery.current,
                        sortBy: sortedInfo.field,
                        sortOrder: getSortOrder(sortedInfo.order),
                        ...searchParams,
                    },
                })
                .then((res) => res.data),
    });

    const columns: TableColumnsType<Category> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
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
            title: 'Create At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
            render: (value: Date) => (
                <p>{value ? moment(value).format('YYYY-MM-DD') : ''}</p>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <CategoryFormModal
                        categoryId={record.id ?? undefined}
                        reloadList={() => {
                            refetch();
                        }}
                        type="UPDATE"
                    />
                    <DeleteCategoryAlert
                        categoryId={record?.id ?? ''}
                        name={record?.name ?? ''}
                        reloadList={() => {
                            refetch();
                        }}
                    />
                </Space>
            ),
        },
    ];

    const handleTableChange: TableProps<Category>['onChange'] = (
        pagination,
        _,
        sorter
    ) => {
        setPaginationQuery({
            current: pagination.current,
            pageSize: pagination.pageSize,
        });
        setSortedInfo(sorter as Sorts<FormType>);
    };

    const onFinish: FormProps<FormType>['onFinish'] = (values) => {
        setSearchParams(values);
    };

    return (
        <Spin spinning={isLoading}>
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Form layout="inline" onFinish={onFinish}>
                        <Form.Item<FormType> label="Search" name="search">
                            <Input
                                className="w-[400px]"
                                placeholder="Enter category name..."
                                prefix={
                                    <SearchOutlined className="text-slate-400" />
                                }
                            />
                        </Form.Item>
                        <Button
                            htmlType="submit"
                            icon={<SearchOutlined />}
                            type="primary"
                        >
                            Search
                        </Button>
                    </Form>
                </div>
                <div className="flex justify-end">
                    <CategoryFormModal
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
                        current: paginationQuery.current,
                        pageSize: paginationQuery.pageSize,
                        defaultPageSize: paginationQuery.pageSize,
                        pageSizeOptions: [5, 10, 20, 50],
                        showSizeChanger: true,
                    }}
                />
            </div>
        </Spin>
    );
};

export default ListCategory;
