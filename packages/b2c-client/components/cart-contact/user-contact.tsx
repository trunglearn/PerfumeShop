import React, { useEffect } from 'react';
import { Card, Form, Input, Select } from 'antd';
import { User } from 'common/types/cart';
import { useQuery } from '@tanstack/react-query';
import request from 'common/utils/http-request';
import { useAuth } from '~/hooks/useAuth';

type Props = {
    data?: User;
};

const UserDetailAll: React.FC<Props> = () => {
    const auth = useAuth();
    const genderOptions = {
        MALE: 'Male',
        FEMALE: 'Female',
    };

    const { data } = useQuery({
        queryKey: ['userContact'],
        queryFn: () => request.get('userContact').then((res) => res.data),
        enabled: !!auth, // Only fetch data when auth is true
    });

    const [form] = Form.useForm();

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                name: data?.data?.name ?? '',
                email: data?.data?.email ?? '',
                gender: data?.data?.gender ?? '',
                phone: data?.data?.phone ?? '',
                address: data?.data?.address ?? '',
            });
        }
    }, [data, form]);

    return (
        <div>
            <Card
                bordered={false}
                title={<div className="font-bold">Thông tin mua hàng</div>}
            >
                <div className="max-h-[75vh] overflow-auto px-5">
                    <Form form={form}>
                        <Form.Item
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Họ và tên không được để trống!',
                                },
                            ]}
                        >
                            <Input placeholder="Họ và tên" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Email không được để trống!',
                                },
                            ]}
                        >
                            <Input placeholder="Email" />
                        </Form.Item>

                        <Form.Item name="gender">
                            <Select placeholder="Giới tính" size="large">
                                {Object.values(genderOptions).map(
                                    (item: string) => (
                                        <Select.Option key={item} value={item}>
                                            {item}
                                        </Select.Option>
                                    )
                                )}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your phone number!',
                                },
                                {
                                    pattern:
                                        /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
                                    message:
                                        'Please enter a valid phone number!',
                                },
                            ]}
                        >
                            <Input placeholder="Số điện thoại" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            rules={[
                                {
                                    required: true,
                                    message: 'Địa chỉ không được để trống!',
                                },
                            ]}
                        >
                            <Input placeholder="Địa chỉ" />
                        </Form.Item>

                        <Form.Item
                            name="note"
                            rules={[
                                {
                                    max: 1000,
                                    message: 'Ghi chú phải ít hơn 1000 ký tự!',
                                },
                            ]}
                        >
                            <Input.TextArea placeholder="Ghi chú" rows={5} />
                        </Form.Item>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

UserDetailAll.defaultProps = {
    data: undefined,
};

export default UserDetailAll;
