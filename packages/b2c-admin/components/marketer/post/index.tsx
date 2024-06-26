/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
    Button,
    Form,
    FormProps,
    Image,
    Input,
    Pagination,
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
import { PAGE_SIZE } from 'common/constant';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import Link from 'next/link';
import { getImageUrl } from 'common/utils/getImageUrl';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { getSortOrder } from 'common/utils/getSortOrder';
import PostFormModal from './post-form-modal';
import DeletePostFormModal from './delete-post-form-modal';
import { Category, Post, User } from '~/types/post';
import Header from '~/components/header';

type FormType = {
    search?: string;
    sortBy?: string;
    productId?: string;
    isShow?: boolean;
    categoryId?: string;
    userId?: string;
    isFeatured?: boolean;
};

type SearchParams = FormType & {
    pageSize?: number;
    currentPage?: number;
};

type OnChange = NonNullable<TableProps<FormType>['onChange']>;

type GetSingle<T> = T extends (infer U)[] ? U : never;

type Sorts = GetSingle<Parameters<OnChange>[2]>;

const PostList = () => {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        pageSize: PAGE_SIZE,
        currentPage: 1,
    });

    const [sortedInfo, setSortedInfo] = useState<Sorts>({});

    const { data: categories, isLoading: categoryLoading } = useQuery({
        queryKey: ['category'],
        queryFn: () => request.get('category').then((res) => res.data),
    });

    const { data: users, isLoading: userLoading } = useQuery({
        queryKey: ['listUser'],
        queryFn: () =>
            request
                .get('marketers', {
                    params: { ...searchParams },
                })
                .then((res) => res.data),
    });

    const {
        data: listPost,
        isLoading: postLoading,
        refetch,
    } = useQuery({
        queryKey: ['post'],
        queryFn: () =>
            request
                .get('manage/post', {
                    params: {
                        ...searchParams,
                        orderName: sortedInfo?.field,
                        order: getSortOrder(sortedInfo?.order),
                    },
                })
                .then((res) => res.data),
    });

    const { mutate: updatePostStatusTrigger } = useMutation({
        mutationFn: ({
            postId,
            isShow,
        }: {
            postId: string;
            isShow: boolean;
        }) => {
            return request
                .put(`post/updateStatus/${postId}`, { isShow })
                .then((res) => res.data);
        },
        onSuccess: (res) => toast.success(res.message),
        onError: (
            error: AxiosError<{
                isOk?: boolean | null;
                message?: string | null;
            }>
        ) => toast.error(error.response?.data.message),
    });

    const { mutate: updatePostFeaturedTrigger } = useMutation({
        mutationFn: ({
            postId,
            isFeatured,
        }: {
            postId: string;
            isFeatured: boolean;
        }) => {
            return request
                .put(`post/updateFeatured/${postId}`, { isFeatured })
                .then((res) => res.data);
        },
        onSuccess: (res) => toast.success(res.message),
        onError: (
            error: AxiosError<{
                isOk?: boolean | null;
                message?: string | null;
            }>
        ) => toast.error(error.response?.data.message),
    });

    const columns: TableColumnsType<Post> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            ellipsis: true,
            width: 100,
            fixed: 'left',
        },

        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            fixed: 'left',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'title' ? sortedInfo.order : null,
            width: 100,
        },
        {
            title: 'Thumbnail',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 150,
            align: 'center',
            render: (value: string) => (
                <Image height={80} src={getImageUrl(value)} width={80} />
            ),
        },

        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            ellipsis: true,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'category' ? sortedInfo.order : null,
            render: (value: Category) => <p>{value?.name}</p>,
            width: 150,
        },
        {
            title: 'Status',
            dataIndex: 'isShow',
            key: 'isShow',
            fixed: 'right',
            render: (value: boolean, record: Post) => {
                return (
                    <Switch
                        checkedChildren="Show"
                        onChange={(checked: boolean) => {
                            updatePostStatusTrigger({
                                postId: record?.id || '',
                                isShow: checked,
                            });
                        }}
                        unCheckedChildren="Hide"
                        value={value}
                    />
                );
            },
            width: 120,
        },
        {
            title: 'Featured',
            dataIndex: 'isFeatured',
            key: 'isFeatured',
            fixed: 'right',
            render: (value: boolean, record: Post) => {
                return (
                    <Switch
                        checkedChildren="True"
                        onChange={(checked: boolean) => {
                            updatePostFeaturedTrigger({
                                postId: record?.id || '',
                                isFeatured: checked,
                            });
                        }}
                        unCheckedChildren="False"
                        value={value}
                    />
                );
            },
            width: 120,
        },
        {
            title: 'Author',
            dataIndex: 'user',
            key: 'user',
            ellipsis: true,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'user' ? sortedInfo.order : null,
            render: (value: User) => <p>{value?.name}</p>,
            width: 150,
        },
        {
            title: 'Create At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_: any, record: Post) => (
                <p>
                    {record?.createdAt &&
                        moment(record.createdAt).format('YYYY-MM-DD')}
                </p>
            ),
            width: 110,
        },
        {
            title: 'Update At',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (_: any, record: Post) => (
                <p>
                    {record?.updatedAt &&
                        moment(record.updatedAt).format('YYYY-MM-DD')}
                </p>
            ),
            width: 110,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_: any, record: Post) => (
                <Space size="middle">
                    <PostFormModal
                        postId={record?.id ?? undefined}
                        reload={() => refetch()}
                        title="Update post"
                        type="UPDATE"
                    />
                    <DeletePostFormModal
                        postId={record?.id ?? ''}
                        reload={() => refetch()}
                        title={record?.title ?? ''}
                    />
                    <Tooltip arrow={false} color="#108ee9" title="Detail">
                        <Link href={`/marketer/post/${record?.id}`}>
                            <EyeOutlined className="text-lg text-blue-500 hover:text-blue-400" />
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

    const handleTableChange: TableProps<Post>['onChange'] = (
        pagination,
        filters,
        sorter
    ) => {
        setSortedInfo(sorter as Sorts);
        setTimeout(() => {
            refetch();
        }, 500);
    };

    return (
        <Spin spinning={postLoading || categoryLoading || userLoading}>
            <Header title="Manage Post" />
            <div>
                <Form
                    className="flex gap-x-10"
                    labelCol={{ span: 6 }}
                    onFinish={onFinish}
                    wrapperCol={{ span: 18 }}
                >
                    <div className="grid flex-1 grid-cols-2 justify-end gap-x-5 xl:grid-cols-3">
                        <Form.Item<FormType> label="Category" name="categoryId">
                            <Select
                                allowClear
                                filterOption={filterOption}
                                options={categories?.data?.map(
                                    (item: Category) => ({
                                        value: item.id,
                                        label: item.name,
                                    })
                                )}
                                placeholder="Select a category..."
                                showSearch
                            />
                        </Form.Item>

                        <Form.Item<FormType> label="Author" name="userId">
                            <Select
                                allowClear
                                filterOption={filterOption}
                                options={users?.data?.map((item: User) => ({
                                    value: item.id,
                                    label: item.name,
                                }))}
                                placeholder="Select a author..."
                                showSearch
                            />
                        </Form.Item>

                        <Form.Item<FormType> label="Search" name="search">
                            <Input placeholder="Enter post title..." />
                        </Form.Item>
                        <Form.Item<FormType> label="Status" name="isShow">
                            <Select allowClear>
                                <Select.Option value="true">
                                    <Tag color="blue">SHOW</Tag>
                                </Select.Option>
                                <Select.Option value="false">
                                    <Tag color="red">HIDE</Tag>
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item<FormType> label="Feature" name="isFeatured">
                            <Select allowClear>
                                <Select.Option value="true">
                                    <Tag color="blue">TRUE</Tag>
                                </Select.Option>
                                <Select.Option value="false">
                                    <Tag color="red">FALSE</Tag>
                                </Select.Option>
                            </Select>
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
            <div className="mb-10 flex justify-end">
                <PostFormModal
                    reload={() => {
                        refetch();
                    }}
                    title="Create post"
                    type="CREATE"
                />
            </div>
            <div>
                <Table
                    columns={columns}
                    dataSource={listPost?.data}
                    onChange={handleTableChange}
                    pagination={false}
                    rowKey="id"
                    tableLayout="fixed"
                />
                <div className="mt-5 flex justify-end">
                    {listPost?.pagination?.total ? (
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
                            total={listPost?.pagination?.total}
                            // eslint-disable-next-line max-lines
                        />
                    ) : null}
                </div>
            </div>
        </Spin>
    );
};

export default PostList;
