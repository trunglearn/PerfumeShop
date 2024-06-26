import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Form, Input, Select } from 'antd';
import { AxiosError, AxiosResponse } from 'axios';
import Modal from 'common/components/modal';
import * as request from 'common/utils/http-request';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import useLoginModal from '~/hooks/useLoginModal';
import useRegisterModal from '~/hooks/useRegisterModal';

const genderOptions = {
    MALE: 'Male',
    FEMALE: 'Female',
};

const RegisterModal = () => {
    const [emailUser, setEmailUser] = useState('');
    const [form] = Form.useForm();

    const { isOpen, onClose } = useRegisterModal();
    const { onOpen } = useLoginModal();

    const [loading, setLoading] = useState(false);

    const toggle = useCallback(() => {
        onClose();
        onOpen();
    }, [onClose, onOpen]);

    const { mutate: verifyEmail, isPending: verifyEmailIsPending } =
        useMutation({
            mutationFn: async (email: string) => {
                return request.post(`/auth/verify-email/${email}`);
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

    const {
        mutate: registerUser,
        isPending: registerUserIsPending,
        isSuccess: registerUserIsSuccess,
    } = useMutation({
        mutationFn: async (data: {
            email: string;
            password: string;
            name: string;
            phone: string;
            address: string;
            gender: string;
        }) => {
            return request
                .post('/auth/user/register', data)
                .then((res) => res.data);
        },
        onError: (
            error: AxiosError<{
                message: string;
                errors?: { message: string };
            }>
        ) => {
            const errorMessage =
                error.response?.data.errors?.message ||
                error.response?.data.message ||
                'An unknown error occurred';

            toast.error(errorMessage);
        },
        onSuccess: (res: AxiosResponse) => {
            toast.success(res.data.message);
            setEmailUser(res.data.data.email);
            verifyEmail(res.data.data.email);
        },
    });

    const onFinish = (values: {
        email: string;
        password: string;
        name: string;
        gender: string;
        phone: string;
        address: string;
    }) => {
        setLoading(true);
        registerUser(values);
        setLoading(false);
    };

    const onSubmit = () => {
        form.submit();
    };

    const handleResendEmail = () => {
        verifyEmail(emailUser);
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <div className="text-center">
                <div className="text-2xl font-bold">Create an account!</div>
                <div className="mt-2 font-light text-neutral-500">
                    Welcome to Perfume Shop
                </div>
            </div>
            <Form
                className="customScroll max-h-[40vh] overflow-auto px-8"
                disabled={
                    loading || registerUserIsPending || verifyEmailIsPending
                }
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
                    hasFeedback
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
                <Form.Item
                    dependencies={['password']}
                    hasFeedback
                    label="Confirm Password"
                    name="confirmPassword"
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your password!',
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
                                        'The new password that you entered do not match!'
                                    )
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password size="large" />
                </Form.Item>
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your name!',
                        },
                    ]}
                >
                    <Input size="large" />
                </Form.Item>
                <Form.Item
                    label="Phone number"
                    name="phone"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your phone number!',
                        },
                        {
                            pattern:
                                /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
                            message: 'Please enter a valid phone number!',
                        },
                    ]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item label="Gender" name="gender">
                    <Select size="large">
                        {Object.values(genderOptions).map((item: string) => (
                            <Select.Option
                                key={Object.values(genderOptions).indexOf(item)}
                                value={
                                    Object.keys(genderOptions)[
                                        Object.values(genderOptions).indexOf(
                                            item
                                        )
                                    ]
                                }
                            >
                                {item}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Address" name="address">
                    <Input size="large" />
                </Form.Item>

                <Form.Item hidden>
                    <Button htmlType="submit" />
                </Form.Item>
            </Form>
            {registerUserIsSuccess && (
                <Alert
                    description={
                        <>
                            <span>
                                <button
                                    className="focus:shadow-outline rounded font-bold text-blue-500 hover:text-blue-700 focus:outline-none"
                                    onClick={handleResendEmail}
                                    type="button"
                                >
                                    Click here
                                </button>
                            </span>
                            <span className="mx-2">
                                if you have not received the email.
                            </span>
                        </>
                    }
                    message={`We've been sent email to ${emailUser} to verify your email address and active your account.`}
                    type="info"
                />
            )}
        </div>
    );

    const footerContent = (
        <div className="mt-3 flex flex-col gap-4">
            <hr />
            <div className="mt-4 text-center font-light text-neutral-500">
                <div className="flex items-center justify-center gap-2">
                    <div>Already have an account?</div>
                    <div
                        className="cursor-pointer text-neutral-800 hover:underline"
                        onClick={toggle}
                        role="presentation"
                    >
                        Login
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <Modal
            actionLabel="Register"
            body={bodyContent}
            disabled={loading || verifyEmailIsPending || registerUserIsPending}
            footer={footerContent}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title="Register"
        />
    );
};

export default RegisterModal;
