import React, { useMemo, useState } from 'react';
import {
    Button,
    Form,
    FormProps,
    Input,
    Pagination,
    Select,
    Space,
    Spin,
    Table,
    TableColumnsType,
    Tooltip,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import * as request from 'common/utils/http-request';
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Brand } from '~/types/product';
import BrandModal from './brand-modal';
import Header from '~/components/header';
import { QueryResponseType } from '~/types';
import DeleteBrand from './delete-brand';

type FormType = {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | '';
};

const SORT_LIST = [
    {
        key: 'name',
        value: 'name',
        label: 'Name',
    },
    {
        key: 'createAt',
        value: 'createAt',
        label: 'Create At',
    },
    {
        key: 'updateAt',
        value: 'updateAt',
        label: 'Update At',
    },
];

const ListBrand = () => {
    const [form] = Form.useForm();

    const [paginationValue, setPaginationValue] = useState({
        pageSize: 5,
        currentPage: 1,
    });

    const [searchValue, setSearchValue] = useState<FormType>({
        search: '',
        sortBy: '',
        sortOrder: '',
    });

    const { data, error, isLoading, refetch } = useQuery<
        QueryResponseType<Brand>
    >({
        queryKey: ['list-brand'],
        queryFn: () =>
            request
                .get('manage/brand', {
                    params: {
                        ...searchValue,
                        pageSize: paginationValue.pageSize,
                        currentPage: paginationValue.currentPage,
                    },
                })
                .then((res) => res.data),
    });

    const columns: TableColumnsType<Brand> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Create At',
            dataIndex: 'createdAt',
            key: 'createdAt',

            render: (value) => (
                <p>{value && moment(value).format('YYYY-MM-DD')}</p>
            ),
        },
        {
            title: 'Update At',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (value) => (
                <p>{value && moment(value).format('YYYY-MM-DD')}</p>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <BrandModal
                        brandId={record.id ?? ''}
                        button={
                            <Tooltip title="Edit">
                                <Button
                                    icon={<EditOutlined />}
                                    shape="circle"
                                    type="link"
                                />
                            </Tooltip>
                        }
                        reloadList={() => refetch()}
                        title="Edit brand"
                    />

                    <DeleteBrand
                        brandId={record.id ?? ''}
                        brandName={record.name ?? ''}
                        reloadList={() => refetch()}
                    />
                </Space>
            ),
        },
    ];

    const dataSource = useMemo<Brand[]>(() => {
        return data?.data || [];
    }, [data]);

    if (error) {
        return <div>Something went wrong!</div>;
    }

    const onFinish: FormProps<FormType>['onFinish'] = (values) => {
        setSearchValue(values);
        setPaginationValue((prev) => ({ ...prev, currentPage: 1 }));
        setTimeout(() => {
            refetch();
        });
    };

    return (
        <Spin spinning={isLoading}>
            <Header title="Manage brand" />
            <div className="mb-5 flex justify-end">
                <Form
                    className="flex gap-5"
                    form={form}
                    initialValues={{ search: '', sortBy: '', sortOrder: '' }}
                    onFinish={onFinish}
                >
                    <div className="grid grid-cols-3 gap-5">
                        <Form.Item label="Sort by" name="sortBy">
                            <Select defaultValue="">
                                <Select.Option default value="">
                                    Select a order...
                                </Select.Option>
                                {SORT_LIST?.map((item) => (
                                    <Select.Option
                                        key={item.key}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Sort order" name="sortOrder">
                            <Select defaultValue="">
                                <Select.Option default value="">
                                    Select a order...
                                </Select.Option>
                                <Select.Option default value="asc">
                                    Ascending
                                </Select.Option>
                                <Select.Option default value="desc">
                                    Descending
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Name" name="search">
                            <Input />
                        </Form.Item>
                    </div>
                    <div className="flex justify-end">
                        <Form.Item>
                            <Button
                                htmlType="submit"
                                icon={<SearchOutlined />}
                                type="primary"
                            >
                                Search
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </div>
            <div className="mb-5 flex justify-end">
                <BrandModal
                    button={
                        <Button icon={<PlusOutlined />} type="primary">
                            Create
                        </Button>
                    }
                    reloadList={() => refetch()}
                    title="Create brand"
                />
            </div>
            <div>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                />
                <div className="mt-5 flex justify-end">
                    {data?.pagination?.total ? (
                        <Pagination
                            current={paginationValue?.currentPage}
                            defaultCurrent={1}
                            onChange={(page, pageSize) => {
                                setPaginationValue({
                                    currentPage: page,
                                    pageSize,
                                });
                                setTimeout(() => {
                                    refetch();
                                });
                            }}
                            pageSize={paginationValue.pageSize}
                            pageSizeOptions={[5, 10, 20, 50]}
                            showSizeChanger
                            total={data?.pagination?.total}
                        />
                    ) : null}
                </div>
            </div>
        </Spin>
    );
};

export default ListBrand;
