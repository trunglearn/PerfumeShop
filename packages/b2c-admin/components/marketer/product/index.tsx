/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import React, { useState } from 'react';
import {
    Button,
    Form,
    FormProps,
    Image,
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
import { currencyFormatter } from 'common/utils/formatter';
import Link from 'next/link';
import { getImageUrl } from 'common/utils/getImageUrl';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { getSortOrder } from 'common/utils/getSortOrder';
import ProductFormModal from './product-form-modal';
import { Brand, Category, Product } from '~/types/product';
import Header from '~/components/header';
import DeleteProductAlert from './delete-product-alert';
import { Sorts } from '~/types';

type FormType = {
    brandId?: string;
    categoryId?: string;
    search?: string;
    rating?: string;
    isShow?: boolean;
};

type SearchParams = FormType & {
    pageSize?: number;
    currentPage?: number;
};

const ProductList = () => {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        pageSize: PAGE_SIZE,
        currentPage: 1,
    });
    const [sortedInfo, setSortedInfo] = useState<Sorts<FormType>>({});

    const { data: categories, isLoading: categoryLoading } = useQuery({
        queryKey: ['category'],
        queryFn: () => request.get('category').then((res) => res.data),
    });
    const { data: brands, isLoading: brandLoading } = useQuery({
        queryKey: ['brand'],
        queryFn: () => request.get('brand').then((res) => res.data),
    });
    const {
        data: listProduct,
        isLoading: productLoading,
        refetch,
    } = useQuery({
        queryKey: ['product'],
        queryFn: () =>
            request
                .get('manage/product', {
                    params: {
                        ...searchParams,
                        orderName: sortedInfo?.field,
                        order: getSortOrder(sortedInfo?.order),
                    },
                })
                .then((res) => res.data),
    });
    const { mutate: updateProductStatusTrigger } = useMutation({
        mutationFn: ({
            productId,
            isShow,
        }: {
            productId: string;
            isShow: boolean;
        }) => {
            return request
                .put(`product/updateStatus/${productId}`, { isShow })
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

    const { mutate: updateProductFeaturedTrigger } = useMutation({
        mutationFn: ({
            productId,
            isFeatured,
        }: {
            productId: string;
            isFeatured: boolean;
        }) => {
            return request
                .put(`product-updateFeatured/${productId}`, { isFeatured })
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

    const columns: TableColumnsType<Product> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            ellipsis: true,
            width: 180,
            fixed: 'left',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            fixed: 'left',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            ellipsis: true,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'brand' ? sortedInfo.order : null,
            render: (value: Brand) => <p>{value?.name}</p>,
            width: 150,
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
            width: 100,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'quantity' ? sortedInfo.order : null,
        },
        {
            title: 'Sold Quantity',
            dataIndex: 'sold_quantity',
            key: 'sold_quantity',
            width: 100,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'sold_quantity'
                    ? sortedInfo.order
                    : null,
        },
        {
            title: 'Original Price',
            dataIndex: 'original_price',
            key: 'original_price',
            width: 150,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'original_price'
                    ? sortedInfo.order
                    : null,
            render: (value: number) =>
                value && <p>{currencyFormatter(value)}</p>,
        },
        {
            title: 'Discount Price',
            dataIndex: 'discount_price',
            key: 'discount_price',
            ellipsis: true,
            width: 150,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'discount_price'
                    ? sortedInfo.order
                    : null,
            render: (value: number) =>
                value && <p>{currencyFormatter(value)}</p>,
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            width: 180,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'rating' ? sortedInfo.order : null,
            render: (value: number) => (
                <Rate className="text-md" disabled value={value ?? 0} />
            ),
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
            title: 'Brief Info',
            dataIndex: 'description',
            key: 'description',
            width: 200,
            render: (value: string) => (
                <div className="line-clamp-3">{value}</div>
            ),
        },
        {
            title: 'Featured',
            dataIndex: 'isFeatured',
            key: 'isFeatured',
            fixed: 'right',
            render: (value: boolean, record: Product) => {
                return (
                    <Switch
                        checkedChildren="True"
                        onChange={(checked: boolean) => {
                            updateProductFeaturedTrigger({
                                productId: record?.id ?? '',
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
            title: 'Status',
            dataIndex: 'isShow',
            key: 'isShow',
            fixed: 'right',
            render: (value: boolean, record: Product) => {
                return (
                    <Switch
                        checkedChildren="Show"
                        onChange={(checked: boolean) => {
                            updateProductStatusTrigger({
                                productId: record?.id || '',
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
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_: undefined, record: Product) => (
                <Space>
                    <ProductFormModal
                        productId={record?.id ?? undefined}
                        reload={() => refetch()}
                        title="Update product"
                        type="UPDATE"
                    />
                    <Tooltip arrow={false} color="#108ee9" title="Detail">
                        <Link href={`/marketer/product/${record?.id}`}>
                            <Button
                                icon={<EyeOutlined />}
                                shape="circle"
                                type="link"
                            />
                        </Link>
                    </Tooltip>
                    <DeleteProductAlert
                        productId={record?.id ?? ''}
                        productName={record?.name ?? ''}
                        reload={() => {
                            refetch();
                        }}
                    />
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

    const handleTableChange: TableProps<Product>['onChange'] = (
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
        <Spin spinning={categoryLoading || brandLoading || productLoading}>
            <Header title="Manage Product" />
            <div>
                <Form
                    className="flex gap-x-10"
                    labelCol={{ span: 6 }}
                    onFinish={onFinish}
                    wrapperCol={{ span: 18 }}
                >
                    <div className="grid flex-1 grid-cols-2 justify-end gap-x-5 xl:grid-cols-3">
                        <Form.Item<FormType> label="Brand" name="brandId">
                            <Select
                                allowClear
                                filterOption={filterOption}
                                options={brands?.data?.map((item: Brand) => ({
                                    value: item.id,
                                    label: item.name,
                                }))}
                                placeholder="Select a brand..."
                                showSearch
                            />
                        </Form.Item>
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
                        <Form.Item<FormType> label="Search" name="search">
                            <Input.Search placeholder="Enter product name..." />
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
                <ProductFormModal
                    reload={() => {
                        refetch();
                    }}
                    title="Create product"
                    type="CREATE"
                />
            </div>
            <div>
                <Table
                    bordered
                    columns={columns}
                    dataSource={listProduct?.data}
                    onChange={handleTableChange}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: 2000 }}
                    size="small"
                    tableLayout="fixed"
                />
                <div className="mt-5 flex justify-end">
                    {listProduct?.pagination?.total ? (
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
                            total={listProduct?.pagination?.total}
                        />
                    ) : null}
                </div>
            </div>
        </Spin>
    );
};

export default ProductList;
