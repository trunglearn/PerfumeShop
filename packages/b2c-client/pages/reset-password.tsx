import React, { useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import Button from 'common/components/button';
import { useRouter } from 'next/router';
import { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import * as request from 'common/utils/http-request';
import { useMutation } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';

const ResetPasswordForm: React.FC = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { token } = router.query;
    const [isTokenValid, setIsTokenValid] = useState<boolean>();
    const [userId, setUserId] = useState<string>();

    const handleToken = (accessToken: string) => {
        const decoded: { id: string; exp: number } = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.exp < currentTime) {
            setIsTokenValid(false);
            return;
        }
        setIsTokenValid(true);
        setUserId(decoded.id);
    };

    useEffect(() => {
        if (token) {
            handleToken(token as string);
        }
    }, [token]);

    const { mutate: resetPassword, isPending: resetPasswordIsPending } =
        useMutation({
            mutationFn: async (data: { id: string; password: string }) => {
                return request
                    .post('/auth/reset-password', data)
                    .then((res) => res.data);
            },
            onSuccess: (res) => {
                toast.success(res.message);
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            },
            onError: (
                error: AxiosError<AxiosResponse<{ message: string }>>
            ) => {
                toast.error(
                    (error.response?.data as unknown as { message: string })
                        .message
                );
            },
        });

    const onFinish = (values: {
        password: string;
        confirmPassword: string;
    }) => {
        if (userId) {
            setLoading(true);
            resetPassword({ id: userId, password: values.password });
            setLoading(false);
        }
    };

    const onSubmit = () => {
        form.submit();
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100">
            {isTokenValid ? (
                <div className="max-w-lg rounded-lg bg-white p-8 shadow-md">
                    <h2 className="mb-8 text-center text-3xl font-bold">
                        Đặt lại mật khẩu
                    </h2>
                    <Form
                        className="no-scrollbar min-w-[400px] overflow-auto"
                        disabled={loading || resetPasswordIsPending}
                        form={form}
                        layout="vertical"
                        name="reset_password"
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label="Mật khẩu mới"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Hãy nhập mật khẩu mới!',
                                },
                                {
                                    min: 6,
                                    message:
                                        'Mật khẩu có độ dài tối thiểu 6 kí tự',
                                },
                            ]}
                        >
                            <Input.Password size="large" />
                        </Form.Item>
                        <Form.Item
                            dependencies={['password']}
                            hasFeedback
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            rules={[
                                {
                                    required: true,
                                    message: 'Hãy nhập mật khẩu xác nhận!',
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (
                                            !value ||
                                            getFieldValue('password') === value
                                        ) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error(
                                                'Mật khẩu không trùng khớp!'
                                            )
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password size="large" />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                label="Đặt lại mật khẩu"
                                onClick={onSubmit}
                            />
                        </Form.Item>
                    </Form>
                </div>
            ) : (
                <div className="mb-8 text-lg text-neutral-500">
                    Xác nhận đặt lại mật khẩu không hợp lệ. Vui lòng thử lại!
                </div>
            )}
        </div>
    );
};

export default ResetPasswordForm;
