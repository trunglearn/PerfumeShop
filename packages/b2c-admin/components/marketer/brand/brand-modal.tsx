import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Form, FormProps, Input, Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import * as request from 'common/utils/http-request';
import { toast } from 'react-toastify';

type Props = {
    button: JSX.Element;
    title: string;
    brandId?: string;
    reloadList: () => void;
};

type FormType = { name?: string };

const BrandModal: React.FC<Props> = ({
    button,
    title,
    brandId,
    reloadList,
}) => {
    const [form] = Form.useForm();

    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const { isLoading, data, error } = useQuery({
        queryKey: ['brand-detail'],
        queryFn: () => request.get(`brand/${brandId}`).then((res) => res.data),
        enabled: Boolean(brandId) && isOpenModal,
    });

    const { mutate: updateBrandTrigger, isPending: updateBrandPending } =
        useMutation({
            mutationFn: (brand: { id: string; name: string }) => {
                return request.put(`brand/update/${brand.id}`, {
                    name: brand.name,
                });
            },
            onSuccess: async (res) => {
                toast.success(res.data.message);
                setTimeout(() => {
                    setIsOpenModal(false);
                    reloadList();
                }, 500);
            },
            onError: async () => {
                toast.error('Update brand failed!');
            },
        });

    const { mutate: createBrandTrigger, isPending: createBrandPending } =
        useMutation({
            mutationFn: (name: string) => {
                return request.post('brand/create', { name });
            },
            onSuccess: async (res) => {
                toast.success(res.data.message);
                setTimeout(() => {
                    setIsOpenModal(false);
                    reloadList();
                }, 500);
            },
            onError: async () => {
                toast.error('Create brand failed!');
            },
        });

    useEffect(() => {
        if (brandId) {
            form.setFieldsValue({ name: data?.data?.name });
        } else {
            form.resetFields();
        }
    }, [data, brandId]);

    const onFinish: FormProps<FormType>['onFinish'] = (values) => {
        if (brandId) {
            return updateBrandTrigger({ id: brandId, name: values.name || '' });
        }

        return createBrandTrigger(values.name || '');
    };

    return (
        <>
            <div onClick={() => setIsOpenModal(true)} role="presentation">
                {button}
            </div>
            <Modal
                closable={!updateBrandPending || !createBrandPending}
                footer={false}
                maskClosable={false}
                onCancel={() => setIsOpenModal(false)}
                open={isOpenModal}
                title={title}
            >
                <Spin spinning={isLoading}>
                    {error ? (
                        <div>Something went wrong!</div>
                    ) : (
                        <Form
                            className="flex flex-col gap-2"
                            disabled={updateBrandPending || createBrandPending}
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item<FormType>
                                label="Name"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Brand name must be required!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    htmlType="submit"
                                    loading={
                                        updateBrandPending || createBrandPending
                                    }
                                    type="primary"
                                >
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    )}
                </Spin>
            </Modal>
        </>
    );
};

BrandModal.defaultProps = {
    brandId: undefined,
};

export default BrandModal;
