import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, FormProps, Input, Modal, Spin, Tooltip } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import * as request from 'common/utils/http-request';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { QueryResponseGetOneType } from 'common/types';
import { Category } from '~/types/product';

type Props = {
    type: 'CREATE' | 'UPDATE';
    categoryId?: string;
    reloadList: () => void;
};

type FieldType = {
    name?: string;
};

const CategoryFormModal: React.FC<Props> = ({
    type,
    categoryId,
    reloadList,
}) => {
    const [form] = Form.useForm();

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { data, isFetching } = useQuery<QueryResponseGetOneType<Category>>({
        queryKey: ['category-info', categoryId],
        queryFn: () =>
            request.get(`category/${categoryId}`).then((res) => res.data),
        enabled: isOpen && !!categoryId,
    });

    const { mutate: createCategoryTrigger, isPending: createCategoryPending } =
        useMutation({
            mutationFn: (payload: FieldType) =>
                request
                    .post('category/create', payload)
                    .then((res) => res.data),
            onSuccess: (res) => {
                toast.success(res.message);
                setTimeout(() => {
                    setIsOpen(false);
                    reloadList();
                }, 500);
            },
            onError: () => {
                toast.error('Something went wrong!');
            },
        });

    const { mutate: updateCategoryTrigger, isPending: updateCategoryPending } =
        useMutation({
            mutationFn: (payload: FieldType) =>
                request
                    .put(`category/update/${categoryId}`, payload)
                    .then((res) => res.data),
            onSuccess: (res) => {
                toast.success(res.message);
                setTimeout(() => {
                    setIsOpen(false);
                    reloadList();
                }, 500);
            },
            onError: () => {
                toast.error('Something went wrong!');
            },
        });

    useEffect(() => {
        if (isOpen) {
            if (categoryId && type === 'UPDATE') {
                form.setFieldsValue({ ...data?.data });
            } else {
                form.resetFields();
            }
        }
    }, [isOpen, type, categoryId, data]);

    const title = useMemo(() => {
        switch (type) {
            case 'CREATE':
                return 'Create category';
            case 'UPDATE':
                return 'Edit category';
            default:
                return undefined;
        }
    }, [type]);

    const button = useMemo(() => {
        switch (type) {
            case 'CREATE':
                return (
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => setIsOpen(true)}
                        type="primary"
                    >
                        Create
                    </Button>
                );
            case 'UPDATE':
                return (
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => setIsOpen(true)}
                            type="text"
                        />
                    </Tooltip>
                );
            default:
                return undefined;
        }
    }, [type]);

    const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
        if (type === 'CREATE') {
            createCategoryTrigger(values);
        }
        if (type === 'UPDATE') {
            updateCategoryTrigger(values);
        }
    };

    return (
        <div>
            {button}
            <Modal
                closable={!createCategoryPending || !updateCategoryPending}
                confirmLoading={createCategoryPending || updateCategoryPending}
                maskClosable={false}
                okText="Submit"
                onCancel={() => setIsOpen(false)}
                onOk={() => form.submit()}
                open={isOpen}
                title={title}
            >
                <Spin spinning={isFetching}>
                    <Form
                        disabled={
                            createCategoryPending || updateCategoryPending
                        }
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        {type === 'UPDATE' && categoryId && (
                            <div className="mb-4 text-slate-500">
                                <span>ID: </span>
                                <span className="font-semibold">
                                    {categoryId}
                                </span>
                            </div>
                        )}

                        <Form.Item<FieldType>
                            label="Category name"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter category name.',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </div>
    );
};

CategoryFormModal.defaultProps = {
    categoryId: undefined,
};

export default CategoryFormModal;
