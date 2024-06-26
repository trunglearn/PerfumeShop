import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import Modal from 'common/components/modal';
import { useMutation } from '@tanstack/react-query';
import request from 'common/utils/http-request';
import { toast } from 'react-toastify';
import { AxiosError, AxiosResponse } from 'axios';

const ForgotPasswordModal: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const { mutate: resetPassword, isPending: verifyEmailIsPending } =
        useMutation({
            mutationFn: async (email: string) => {
                return request.post(`/auth/reset-password/${email}`);
            },
            onSuccess: (res) => {
                toast.success(res.data.message);
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

    const onFinish = (values: { email: string }) => {
        setLoading(true);
        resetPassword(values.email);
        setLoading(false);
    };

    const onSubmit = () => {
        form.submit();
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <div className="text-center">
                {/* <div className="text-2xl font-bold">Login to your account!</div> */}
                <div className="mt-2 font-light text-neutral-500">
                    Nhập email của bạn và chúng tôi sẽ gửi cho bạn email xác
                    nhận thay đổi mật khẩu.
                </div>
            </div>
            <Form
                className="no-scrollbar overflow-auto"
                disabled={loading || verifyEmailIsPending}
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your email!',
                        },
                    ]}
                >
                    <Input size="large" />
                </Form.Item>
                <Form.Item hidden>
                    <Button htmlType="submit" />
                </Form.Item>
            </Form>
        </div>
    );

    const footerContent = (
        <div className="mt-3 flex flex-col gap-4">
            <hr />
            <div className="mt-4 text-center font-light text-neutral-500">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex-row">
                        {/* <div>First time shopping with us?</div> */}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Button onClick={showModal} type="link">
                Quên mật khẩu?
            </Button>
            <Modal
                actionLabel="Gửi thư xác nhận"
                body={bodyContent}
                disabled={loading || verifyEmailIsPending}
                footer={footerContent}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={onSubmit}
                title="Quên mật khẩu?"
            />
        </>
    );
};

export default ForgotPasswordModal;
