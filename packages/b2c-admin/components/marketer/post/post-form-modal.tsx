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
import { Category, ResponsePostById } from '~/types/post';

type Props = {
    type: 'CREATE' | 'UPDATE' | 'UPDATE_BUTTON';
    title: string;
    reload: () => void;
    postId?: string;
};

type FormType = {
    title: string | null;
    description?: string | null;
    briefInfo?: string | null;
    categoryId: string | null;
    isShow: boolean | null;
    isFeatured: boolean | null;
    thumbnail: string | null;
    thumbnailList?: UploadFile[];
};

type PostRequestType = {
    title: string | null;
    description?: string | null;
    categoryId: string | null;
    isShow: boolean | null;
    isFeatured: boolean | null;
    thumbnail: string | null;
    briefInfo?: string | null;
};

const PostFormModal: React.FC<Props> = ({ type, title, reload, postId }) => {
    const [form] = Form.useForm();

    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const { data: listCategory, isLoading: getListCategoryLoading } = useQuery({
        queryKey: ['category'],
        queryFn: () => request.get('category').then((res) => res.data),
        enabled: isOpenModal,
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

    const { data: postInfo, isLoading: getPostInfoLoading } =
        useQuery<ResponsePostById>({
            queryKey: ['post-info'],
            queryFn: () =>
                request.get(`post/${postId}`).then((res) => res.data),
            enabled: !!postId && isOpenModal,
        });

    const { mutate: createPostTrigger, isPending: createPostIsPending } =
        useMutation({
            mutationFn: (data: PostRequestType) => {
                return request
                    .post('post/create', data)
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

    const { mutate: updatePostTrigger, isPending: updatePostPending } =
        useMutation({
            mutationFn: (data: PostRequestType) => {
                return request
                    .put(`post/update/${postId}`, data)
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
        if (isOpenModal && !postId) {
            form.resetFields();
        }
        if (isOpenModal && postId && postInfo) {
            form.setFieldsValue({
                title: postInfo?.data?.title,
                isShow: postInfo?.data?.isShow,
                isFeatured: postInfo?.data?.isFeatured,
                description: postInfo?.data?.description,
                briefInfo: postInfo?.data?.briefInfo,
                categoryId: postInfo?.data?.categoryId,
                thumbnailList: postInfo?.data?.thumbnail
                    ? [
                          {
                              uid: '-1',
                              name: postInfo?.data?.thumbnail ?? '',
                              status: 'done',
                              url: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${postInfo?.data?.thumbnail}`,
                          },
                      ]
                    : undefined,
            });
        }
    }, [isOpenModal, postId, postInfo]);

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
                    <Tooltip arrow={false} color="#108ee9" title="Edit post">
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
            // eslint-disable-next-line @typescript-eslint/no-shadow
            title,
            description,
            categoryId,
            isShow,
            isFeatured,
            briefInfo,
        } = values;
        if (type === 'CREATE') {
            const thumbnailList = values?.thumbnailList?.map(
                (file) => file.originFileObj
            );

            const thumbnailListResponse = await uploadFileTrigger(
                (thumbnailList as RcFile[]) ?? []
            )?.then((res) => res.imageUrls);

            createPostTrigger({
                title,
                isShow,
                isFeatured,
                description,
                briefInfo,
                categoryId,
                thumbnail: thumbnailListResponse?.[0] ?? '',
            });
        }

        if (type === 'UPDATE' && postId) {
            const newThumbnail =
                values?.thumbnailList?.[0]?.status === 'done'
                    ? [values?.thumbnailList?.[0]?.name]
                    : await uploadFileTrigger(
                          values?.thumbnailList?.map(
                              (item) => item.originFileObj as RcFile
                          ) ?? []
                      ).then((res) => res?.imageUrls);

            const submitObj = {
                title,
                isShow,
                isFeatured,
                description,
                briefInfo,
                categoryId,
                thumbnail: newThumbnail?.[0] ?? '',
            };

            updatePostTrigger(submitObj);
        }

        if (type === 'UPDATE_BUTTON' && postId) {
            const newThumbnail =
                values?.thumbnailList?.[0]?.status === 'done'
                    ? [values?.thumbnailList?.[0]?.name]
                    : await uploadFileTrigger(
                          values?.thumbnailList?.map(
                              (item) => item.originFileObj as RcFile
                          ) ?? []
                      ).then((res) => res?.imageUrls);

            const submitObj = {
                title,
                isShow,
                isFeatured,
                description,
                briefInfo,
                categoryId,
                thumbnail: newThumbnail?.[0] ?? '',
            };

            updatePostTrigger(submitObj);
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
                    !createPostIsPending ||
                    !updatePostPending
                }
                footer={false}
                maskClosable={false}
                onCancel={() => setIsOpenModal(false)}
                open={isOpenModal}
                title={title}
                width={800}
            >
                <Spin spinning={getListCategoryLoading || getPostInfoLoading}>
                    <div className="max-h-[75vh] overflow-auto px-5">
                        <Form
                            disabled={
                                uploadFileIsPending ||
                                createPostIsPending ||
                                updatePostPending
                            }
                            form={form}
                            initialValues={{
                                isShow: true,
                                discount_price: null,
                                description: null,
                            }}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item<FormType>
                                label="Title"
                                name="title"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Title must be required!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item name="isShow" valuePropName="checked">
                                <Checkbox>Show post on client page</Checkbox>
                            </Form.Item>
                            <Form.Item
                                name="isFeatured"
                                valuePropName="checked"
                            >
                                <Checkbox>Featured Post</Checkbox>
                            </Form.Item>
                            <div className="grid grid-cols-2 gap-x-10">
                                <Form.Item<FormType>
                                    label="Category"
                                    name="categoryId"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Product must be required!',
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
                                        showSearch
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item<FormType>
                                label="Brief Infomation"
                                name="briefInfo"
                                rules={[
                                    {
                                        max: 1000,
                                        message:
                                            'Brief Infomation must be less than 100 characters!',
                                    },
                                ]}
                            >
                                <Input.TextArea rows={5} />
                            </Form.Item>
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

PostFormModal.defaultProps = {
    postId: undefined,
};

export default PostFormModal;
