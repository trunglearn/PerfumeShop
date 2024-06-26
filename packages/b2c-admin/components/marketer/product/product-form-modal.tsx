/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/naming-convention */
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Button,
    Checkbox,
    Form,
    FormProps,
    Input,
    InputNumber,
    Modal,
    Select,
    Spin,
    Tooltip,
    Upload,
    UploadFile,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import * as request from 'common/utils/http-request';
import { toast } from 'react-toastify';
import { RcFile } from 'antd/es/upload';
import { dropListFiles } from 'common/utils/dropListFiles';
import { Brand, Category, ResponseProductById } from '~/types/product';

type Props = {
    type: 'CREATE' | 'UPDATE' | 'UPDATE_BUTTON';
    title: string;
    reload: () => void;
    productId?: string;
};

type FormType = {
    name: string | null;
    brandId: string | null;
    categoryId: string | null;
    size: number | null;
    original_price: number | null;
    discount_price?: number | null;
    quantity: number | null;
    description?: string | null;
    isShow: boolean | null;
    thumbnailList?: UploadFile[];
    productImageList?: UploadFile[];
    isFeatured?: boolean | null;
};

type ProductRequestType = {
    name: string | null;
    brandId: string | null;
    categoryId: string | null;
    size: number | null;
    original_price: number | null;
    discount_price?: number | null;
    quantity: number | null;
    description?: string | null;
    isShow: boolean | null;
    thumbnail: string | null;
    product_image: string[];
    isFeatured?: boolean | null;
};

const ProductFormModal: React.FC<Props> = ({
    type,
    title,
    reload,
    productId,
}) => {
    const [form] = Form.useForm<FormType>();

    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const { data: listBrand, isLoading: getListBrandLoading } = useQuery({
        queryKey: ['brand'],
        queryFn: () => request.get('brand').then((res) => res.data),
        enabled: isOpenModal,
    });
    const { data: listCategory, isLoading: getListCategoryLoading } = useQuery({
        queryKey: ['category'],
        queryFn: () => request.get('category').then((res) => res.data),
        enabled: isOpenModal,
    });

    const { data: productInfo, isLoading: getProductInfoLoading } =
        useQuery<ResponseProductById>({
            queryKey: ['product-info'],
            queryFn: () =>
                request
                    .get(`manage/product/${productId}`)
                    .then((res) => res.data),
            enabled: !!productId && isOpenModal,
        });

    const { mutateAsync: uploadFileTrigger, isPending: uploadFileIsPending } =
        useMutation({
            mutationFn: (fileList: RcFile[]) => {
                const formData = new FormData();
                fileList.forEach((file) => formData.append('files', file));
                return request.post('upload', formData).then((res) => res.data);
            },
            onError: () => {
                toast.error('Upload file failed!');
            },
        });

    const { mutate: createProductTrigger, isPending: createProductIsPending } =
        useMutation({
            mutationFn: (data: ProductRequestType) => {
                return request
                    .post('product/create', data)
                    .then((res) => res.data);
            },
            onSuccess: (res) => {
                toast.success(res?.message);
                setTimeout(() => {
                    setIsOpenModal(false);
                    reload();
                }, 500);
            },
            onError: (error) => {
                toast.error(error?.message);
            },
        });
    const { mutate: updateProductTrigger, isPending: updateProductPending } =
        useMutation({
            mutationFn: (data: ProductRequestType) => {
                return request
                    .put(`product/update/${productId}`, data)
                    .then((res) => res.data);
            },
            onSuccess: (res) => {
                toast.success(res?.message);
                setTimeout(() => {
                    setIsOpenModal(false);
                    reload();
                }, 500);
            },
            onError: (error) => {
                toast.error(error?.message);
            },
        });

    useEffect(() => {
        if (isOpenModal && !productId) {
            form.resetFields();
        }
        if (isOpenModal && productId && productInfo) {
            form.setFieldsValue({
                name: productInfo?.data?.name,
                isShow: productInfo?.data?.isShow,
                brandId: productInfo?.data?.brandId,
                categoryId: productInfo?.data?.categoryId,
                size: productInfo?.data?.size,
                quantity: productInfo?.data?.quantity,
                original_price: productInfo?.data?.original_price,
                discount_price: productInfo?.data?.discount_price,
                description: productInfo?.data?.description,
                thumbnailList: productInfo?.data?.thumbnail
                    ? [
                          {
                              uid: '-1',
                              name: productInfo?.data?.thumbnail ?? '',
                              status: 'done',
                              url: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${productInfo?.data?.thumbnail}`,
                          },
                      ]
                    : undefined,
                productImageList: productInfo?.data?.product_image
                    ? productInfo?.data?.product_image?.map((item) => ({
                          uid: item.id ?? '-1',
                          name: item.url ?? '',
                          status: 'done',
                          url: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item.url}`,
                      }))
                    : undefined,
            });
        }
    }, [isOpenModal, productId, productInfo]);

    const button = useMemo(() => {
        switch (type) {
            case 'CREATE':
                return (
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => setIsOpenModal(true)}
                        type="primary"
                    >
                        Create
                    </Button>
                );
            case 'UPDATE':
                return (
                    <Tooltip arrow={false} color="#108ee9" title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => setIsOpenModal(true)}
                            shape="circle"
                            type="link"
                        />
                    </Tooltip>
                );
            case 'UPDATE_BUTTON':
                return (
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => setIsOpenModal(true)}
                        type="primary"
                    >
                        Edit
                    </Button>
                );
            default:
                return null;
        }
    }, [type]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const onFinish: FormProps<FormType>['onFinish'] = async (values) => {
        const {
            name,
            isShow,
            brandId,
            categoryId,
            size,
            quantity,
            original_price,
            discount_price,
            description,
            isFeatured,
        } = values;

        if (type === 'CREATE') {
            const thumbnailList = values?.thumbnailList?.map(
                (file) => file.originFileObj
            );

            const productImageList = values?.productImageList?.map(
                (file) => file.originFileObj
            );

            const thumbnailListResponse = await uploadFileTrigger(
                (thumbnailList as RcFile[]) ?? []
            )?.then((res) => res.imageUrls);

            const productImageListResponse = await uploadFileTrigger(
                (productImageList as RcFile[]) ?? []
            )?.then((res) => res.imageUrls);

            const productImageListRequest = productImageListResponse?.map(
                (image: string) => ({ url: image })
            );

            createProductTrigger({
                name,
                isShow,
                brandId,
                categoryId,
                size,
                quantity,
                original_price,
                discount_price,
                description,
                isFeatured,
                thumbnail: thumbnailListResponse?.[0] ?? '',
                product_image: productImageListRequest ?? [],
            });
        }

        if ((type === 'UPDATE' || type === 'UPDATE_BUTTON') && productId) {
            const { filesUploaded, fileNotUpload } = dropListFiles(
                values.productImageList ?? []
            );

            const newThumbnail =
                values?.thumbnailList?.[0]?.status === 'done'
                    ? [values?.thumbnailList?.[0]?.name]
                    : await uploadFileTrigger(
                          values?.thumbnailList?.map(
                              (item) => item.originFileObj as RcFile
                          ) ?? []
                      ).then((res) => res?.imageUrls);

            const newProductImage =
                fileNotUpload?.length > 0
                    ? await uploadFileTrigger(fileNotUpload).then(
                          (res) => res.imageUrls
                      )
                    : [];

            const newProductImageRequest = newProductImage?.map(
                (image: string) => ({
                    url: image,
                })
            );

            const submitObj = {
                name,
                isShow,
                brandId,
                categoryId,
                size,
                quantity,
                original_price,
                discount_price,
                description,
                isFeatured,
                thumbnail: newThumbnail?.[0] ?? '',
                product_image:
                    [...filesUploaded, ...newProductImageRequest] ?? [],
            };

            updateProductTrigger(submitObj);
        }
    };

    const filterOption = (
        input: string,
        option?: { value: string; label: string }
    ) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    return (
        <div>
            {button}
            <Modal
                closable={
                    !uploadFileIsPending ||
                    !createProductIsPending ||
                    !updateProductPending
                }
                footer={false}
                maskClosable={false}
                onCancel={() => setIsOpenModal(false)}
                open={isOpenModal}
                title={title}
                width={800}
            >
                <Spin
                    spinning={
                        getListBrandLoading ||
                        getListCategoryLoading ||
                        getProductInfoLoading
                    }
                >
                    <div className="max-h-[75vh] overflow-auto px-5">
                        <Form
                            disabled={
                                uploadFileIsPending ||
                                createProductIsPending ||
                                updateProductPending
                            }
                            form={form}
                            initialValues={{
                                isShow: false,
                                discount_price: null,
                                description: null,
                            }}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item<FormType>
                                label="Name"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Product name must be required!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <div className="grid grid-cols-2">
                                <Form.Item<FormType>
                                    name="isShow"
                                    valuePropName="checked"
                                >
                                    <Checkbox>
                                        Show product on client page
                                    </Checkbox>
                                </Form.Item>
                                <Form.Item<FormType>
                                    name="isFeatured"
                                    valuePropName="checked"
                                >
                                    <Checkbox>Featured product</Checkbox>
                                </Form.Item>
                            </div>
                            <div className="grid grid-cols-2 gap-x-10">
                                <Form.Item<FormType>
                                    label="Brand"
                                    name="brandId"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Brand must be required!',
                                        },
                                    ]}
                                >
                                    <Select
                                        allowClear
                                        filterOption={filterOption}
                                        options={listBrand?.data?.map(
                                            (item: Brand) => ({
                                                value: item.id,
                                                label: item.name,
                                            })
                                        )}
                                        placeholder="Choose a brand..."
                                        showSearch
                                    />
                                </Form.Item>
                                <Form.Item<FormType>
                                    label="Category"
                                    name="categoryId"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Category must be required!',
                                        },
                                    ]}
                                >
                                    <Select
                                        allowClear
                                        filterOption={filterOption}
                                        options={listCategory?.data?.map(
                                            (item: Category) => ({
                                                value: item.id,
                                                label: item.name,
                                            })
                                        )}
                                        placeholder="Choose a category..."
                                        showSearch
                                    />
                                </Form.Item>
                                <Form.Item<FormType>
                                    label="Size"
                                    name="size"
                                    rules={[
                                        {
                                            required: true,
                                            message: `Product${"'"}s size must be required!`,
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        addonAfter="ML"
                                        min={0}
                                        style={{
                                            width: '100%',
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item<FormType>
                                    label="Quantity"
                                    name="quantity"
                                    rules={[
                                        {
                                            required: true,
                                            message: `Product${"'"}s quantity must be required!`,
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        min={0}
                                        style={{
                                            width: '100%',
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item<FormType>
                                    label="Original Price"
                                    name="original_price"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Original price must be required!',
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        addonAfter="VND"
                                        min={0}
                                        style={{
                                            width: '100%',
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item<FormType>
                                    dependencies={['original_price']}
                                    label="Discount Price"
                                    name="discount_price"
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator(_, value: number) {
                                                if (
                                                    !value ||
                                                    Number(
                                                        getFieldValue(
                                                            'original_price'
                                                        )
                                                    ) > value
                                                ) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(
                                                    new Error(
                                                        'Discount price cannot be greater than Original price'
                                                    )
                                                );
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber
                                        addonAfter="VND"
                                        min={0}
                                        style={{
                                            width: '100%',
                                        }}
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item<FormType>
                                label="Description"
                                name="description"
                                rules={[
                                    {
                                        max: 1000,
                                        message:
                                            'Description must be less than 100 characters!',
                                    },
                                ]}
                            >
                                <Input.TextArea rows={5} />
                            </Form.Item>
                            <Form.Item<FormType>
                                getValueFromEvent={normFile}
                                label="Thumbnail"
                                name="thumbnailList"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Thumbnail must be required!',
                                    },
                                ]}
                                valuePropName="fileList"
                            >
                                <Upload
                                    accept=".png, .jpg, .jpeg"
                                    beforeUpload={() => false}
                                    listType="picture-card"
                                    maxCount={1}
                                >
                                    <button
                                        style={{
                                            border: 0,
                                            background: 'none',
                                        }}
                                        type="button"
                                    >
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>
                                            Upload
                                        </div>
                                    </button>
                                </Upload>
                            </Form.Item>
                            <Form.Item<FormType>
                                getValueFromEvent={normFile}
                                label="Product image"
                                name="productImageList"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Product image must be required!',
                                    },
                                ]}
                                valuePropName="fileList"
                            >
                                <Upload
                                    accept=".png, .jpg, .jpeg"
                                    beforeUpload={() => false}
                                    listType="picture-card"
                                    maxCount={8}
                                    multiple
                                >
                                    <button
                                        style={{
                                            border: 0,
                                            background: 'none',
                                        }}
                                        type="button"
                                    >
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>
                                            Upload
                                        </div>
                                    </button>
                                </Upload>
                            </Form.Item>
                            <Form.Item>
                                <Button htmlType="submit" type="primary">
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Spin>
            </Modal>
        </div>
    );
};

ProductFormModal.defaultProps = {
    productId: undefined,
};

export default ProductFormModal;
