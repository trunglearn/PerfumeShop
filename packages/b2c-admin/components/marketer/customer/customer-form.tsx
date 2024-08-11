import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Button,
    Form,
    FormProps,
    Input,
    Modal,
    Select,
    Spin,
    Tooltip,
} from 'antd';
import { CUSTOMER_STATUS, USER_GENDER } from 'common/constant';
import { Customer, CustomerStatus } from 'common/types/customer';
import React, { useEffect, useMemo, useState } from 'react';
import * as request from 'common/utils/http-request';
import { QueryResponseGetOneType } from 'common/types';
import { toast } from 'react-toastify';

type Props = {
    type: 'CREATE' | 'UPDATE';
    customerId?: string;
    reloadList: () => void;
};

type FieldType = {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    gender?: string;
    address?: string;
    status?: CustomerStatus;
};

const CustomerForm: React.FC<Props> = ({ type, customerId, reloadList }) => {
    const [form] = Form.useForm();

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { data, isFetching } = useQuery<QueryResponseGetOneType<Customer>>({
        queryKey: ['customer-detail', customerId],
        queryFn: () =>
            request.get(`customer/${customerId}`).then((res) => res.data),
        enabled: !!customerId && isOpen,
    });

    const { mutate: createCustomerTrigger, isPending: createCustomerPending } =
        useMutation({
            mutationFn: (payload: FieldType) =>
                request
                    .post('customer/create', payload)
                    .then((res) => res.data),
            onSuccess: (res: QueryResponseGetOneType<Customer>) => {
                setTimeout(() => {
                    setIsOpen(false);
                    reloadList();
                }, 500);
                toast.success(res.message);
            },
            onError: () => {
                toast.error('Something went wrong!');
            },
        });

    const { mutate: updateCustomerTrigger, isPending: updateCustomerPending } =
        useMutation({
            mutationFn: (payload: FieldType) =>
                request
                    .put(`customer/update/${customerId}`, payload)
                    .then((res) => res.data),
            onSuccess: (res: QueryResponseGetOneType<Customer>) => {
                setTimeout(() => {
                    setIsOpen(false);
                    reloadList();
                }, 500);
                toast.success(res.message);
            },
            onError: () => {
                toast.error('Something went wrong!');
            },
        });

    useEffect(() => {
        if (type === 'CREATE') {
            form.resetFields();
        }
        if (type === 'UPDATE' && customerId && data) {
            form.setFieldsValue({ ...data?.data });
        }
    }, [isOpen, type, customerId, data]);

    const title = useMemo(() => {
        switch (type) {
            case 'CREATE':
                return 'Create customer';
            case 'UPDATE':
                return 'Edit customer';
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
        switch (type) {
            case 'CREATE':
                return createCustomerTrigger(values);
            case 'UPDATE':
                return updateCustomerTrigger(values);
            default:
                return null;
        }
    };

    return (
        <div>
            <div>{button}</div>
            <Modal
                cancelText="Close"
                closable={!createCustomerPending || !updateCustomerPending}
                confirmLoading={createCustomerPending || updateCustomerPending}
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
                            createCustomerPending || updateCustomerPending
                        }
                        form={form}
                        initialValues={{
                            status: CUSTOMER_STATUS?.[0].value,
                        }}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Form.Item<FieldType>
                            label="Customer Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input customer email!',
                                },
                                {
                                    type: 'email',
                                    message: 'Please enter a valid email!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        {type === 'CREATE' && (
                            <Form.Item<FieldType>
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please input customer password!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        )}

                        <Form.Item<FieldType>
                            label="Customer name"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input customer name!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item<FieldType>
                            label="Customer phone"
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input customer phone!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item<FieldType>
                            label="Customer status"
                            name="status"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input customer status!',
                                },
                            ]}
                        >
                            <Select
                                options={CUSTOMER_STATUS.map((item) => ({
                                    value: item.value,
                                    label: item.value,
                                }))}
                                placeholder="Select a status..."
                                showSearch
                            />
                        </Form.Item>
                        <Form.Item<FieldType>
                            label="Customer Gender"
                            name="gender"
                        >
                            <Select
                                options={USER_GENDER.map((item) => ({
                                    value: item.value,
                                    label: item.value,
                                }))}
                                placeholder="Select a status..."
                                showSearch
                            />
                        </Form.Item>
                        <Form.Item<FieldType>
                            label="Customer Address"
                            name="address"
                        >
                            <Input />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </div>
    );
};

CustomerForm.defaultProps = {
    customerId: undefined,
};

export default CustomerForm;
