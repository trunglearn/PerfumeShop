import { useMutation } from '@tanstack/react-query';
import { Button, Form, FormProps, Input, Modal, Select } from 'antd';
import { genderType } from 'common/types/order';
import * as request from 'common/utils/http-request';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
    orderId: string;
    address: string;
    name: string;
    gender: string;
    email: string;
    phoneNumber: string;
    reload: () => void;
};

type FormType = {
    address: string;
    name: string;
    gender: string;
    email: string;
    phoneNumber: string;
};

const EditOrderModal: React.FC<Props> = ({
    orderId,
    address,
    name,
    gender,
    email,
    phoneNumber,
    reload,
}) => {
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            address,
            name,
            gender: genderType[gender as keyof typeof genderType],
            email,
            phoneNumber,
        });
    }, [isOpenModal, orderId]);

    const { mutate, isPending } = useMutation({
        mutationFn: (data: {
            address: string;
            name: string;
            gender: string;
            email: string;
            phoneNumber: string;
        }) =>
            request
                .put(`my-order/edit/${orderId}`, data)
                .then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res?.message);
            setTimeout(() => {
                setIsOpenModal(false);
                reload();
            }, 500);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const onFinish: FormProps<FormType>['onFinish'] = async (values) => {
        mutate({
            address: values.address,
            name: values.name,
            gender: Object.keys(genderType)[
                Object.values(genderType).indexOf(values.gender)
            ],
            email: values.email,
            phoneNumber: values.phoneNumber,
        });
    };

    return (
        <div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpenModal(true);
                }}
                role="presentation"
                style={{ width: '200px', zIndex: '20' }}
            >
                <Button type="link">Sửa</Button>
            </div>

            <Modal
                cancelText="Trở lại"
                centered
                closable={!isPending}
                maskClosable={false}
                okText="Chỉnh sửa"
                onCancel={() => setIsOpenModal(false)}
                onOk={() => form.submit()}
                open={isOpenModal}
                title="Chỉnh sửa thông tin nhận hàng"
                width={600}
            >
                <div className="max-h-[75vh] overflow-auto px-5">
                    <Form
                        disabled={isPending}
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <div className="grid grid-cols-2 gap-x-10">
                            <Form.Item<FormType> label="Người nhận" name="name">
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item<FormType>
                                label="Giới tính"
                                name="gender"
                            >
                                <Select>
                                    {Object.values(genderType).map(
                                        (item: string) => (
                                            <Select.Option key={item}>
                                                {item}
                                            </Select.Option>
                                        )
                                    )}
                                </Select>
                            </Form.Item>
                            <Form.Item<FormType> label="Email" name="email">
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item<FormType>
                                label="Số điện thoại"
                                name="phoneNumber"
                            >
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item<FormType> label="Địa chỉ" name="address">
                                <Input size="large" />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default EditOrderModal;
