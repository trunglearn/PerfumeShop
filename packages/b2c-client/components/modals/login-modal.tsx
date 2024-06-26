import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Form, Input } from 'antd';
import { AxiosError, AxiosResponse } from 'axios';
import Modal from 'common/components/modal';
import request from 'common/utils/http-request';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import useLoginModal from '~/hooks/useLoginModal';
import useRegisterModal from '~/hooks/useRegisterModal';
import ForgotPasswordModal from './forgot-password-modal';

const LoginModal = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const { isOpen, onClose } = useLoginModal();
    const { onOpen } = useRegisterModal();
    const [loading, setLoading] = useState(false);
    const [emailUser, setEmailUser] = useState('');
    const [isVerified, setIsVerified] = useState<boolean>(true);
    const toggle = useCallback(() => {
        onClose();
        onOpen();
    }, [onClose, onOpen]);

    const { mutate: loginUser, isPending: loginUserIsPending } = useMutation({
        mutationFn: async (data: { email: string; password: string }) => {
            return request
                .post('/auth/user/login', data)
                .then((res) => res.data);
        },
        onError: (
            error: AxiosError<
                AxiosResponse<{
                    message: string;
                    id: string;
                    email: string;
                    isVerified: boolean;
                }>
            >
        ) => {
            toast.error(
                (error.response?.data as unknown as { message: string }).message
            );

            if (error.response?.data?.data.isVerified === false) {
                setEmailUser(error.response?.data?.data.email);
                setIsVerified(false);
            }
        },
        onSuccess: (res) => {
            toast.success(res.data.message);
            Cookies.set('accessTokenClient', JSON.stringify(res.data));
            setTimeout(() => {
                onClose();
                router.reload();
            }, 500);
        },
    });

    const { mutate: verifyEmail } = useMutation({
        mutationFn: async (email: string) => {
            return request.post(`/auth/verify-email/${email}`);
        },
        onSuccess: (res) => {
            toast.success(res.data.message);
        },
        onError: (error: AxiosError<AxiosResponse<{ message: string }>>) => {
            toast.error(
                (error.response?.data as unknown as { message: string }).message
            );
        },
    });

    const sendMail = () => {
        verifyEmail(emailUser);
    };

    const onFinish = (values: { email: string; password: string }) => {
        setIsVerified(true);
        setLoading(true);
        loginUser(values);
        setLoading(false);
    };

    const onSubmit = () => {
        form.submit();
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <div className="text-center">
                <div className="text-2xl font-bold">
                    Đăng nhập với tài khoản của bạn!
                </div>
                <div className="mt-2 font-light text-neutral-500">
                    Chào mừng quay trở lại
                </div>
            </div>
            <Form
                className="no-scrollbar overflow-auto"
                disabled={loading}
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
                            message: 'Please input your username!',
                        },
                    ]}
                >
                    <Input size="large" />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your password!',
                        },
                    ]}
                >
                    <Input.Password size="large" />
                </Form.Item>

                <Form.Item hidden>
                    <Button htmlType="submit" />
                </Form.Item>
            </Form>
            {isVerified === false && (
                <Alert
                    description={
                        <>
                            <span>
                                <button
                                    className="focus:shadow-outline rounded font-bold text-blue-500 hover:text-blue-700 focus:outline-none"
                                    onClick={sendMail}
                                    type="button"
                                >
                                    Click here
                                </button>
                            </span>
                            <span className="mx-2">
                                to verify your account. If you have not received
                                the verification email, we will send a new one
                                to {emailUser}. Please check your email and
                                follow the instructions to activate your
                                account.
                            </span>
                        </>
                    }
                    message="Your account has not been verified."
                    type="info"
                />
            )}
        </div>
    );

    const footerContent = (
        <div className="mt-3 flex flex-col gap-4">
            <hr />
            <div className="mt-4 text-center font-light text-neutral-500">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div>
                        <ForgotPasswordModal />
                    </div>
                    <div>Lần đầu bạn mua hàng với chúng tôi?</div>
                    <div
                        className="cursor-pointer text-neutral-800 hover:underline"
                        onClick={toggle}
                        role="presentation"
                    >
                        <Button type="link">Tạo tài khoản</Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <Modal
            actionLabel="Đăng nhập"
            body={bodyContent}
            disabled={loading || loginUserIsPending}
            footer={footerContent}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title="Đăng nhâp"
        />
    );
};

export default LoginModal;
