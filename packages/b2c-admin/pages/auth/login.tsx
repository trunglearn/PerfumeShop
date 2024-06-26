import { useMutation } from '@tanstack/react-query';
import { Button, Form, FormProps, Input, Spin } from 'antd';
import { AxiosError, AxiosResponse } from 'axios';
import { post } from 'common/utils/http-request';
import Cookie from 'js-cookie';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const Login = () => {
    const router = useRouter();
    type FieldType = {
        email?: string;
        password?: string;
        remember?: string;
    };

    const mutation = useMutation({
        mutationFn: async (data: { email: string; password: string }) => {
            return post('/auth/admin/login', data).then((res) => res.data);
        },
        onError: (
            error: AxiosError<{
                message: string;
                errors?: { message: string };
            }>
        ) => {
            toast.error(error?.response?.data.message);
        },
        onSuccess: (res: AxiosResponse) => {
            // Handle the response data
            Cookie.set('cmsUser', JSON.stringify(res.data));
            router.reload();
        },
    });

    const onFinish: FormProps<FieldType>['onFinish'] = (values: FieldType) => {
        mutation.mutate({
            email: values.email ?? '',
            password: values.password ?? '',
        });
    };

    return (
        <div>
            {mutation.isPending && mutation.isSuccess ? (
                <Spin
                    fullscreen
                    spinning={(mutation as { isPending: boolean }).isPending}
                />
            ) : (
                <div className="flex h-dvh w-dvw flex-col items-center justify-center">
                    <div className="flex h-[600px] min-w-[400px] items-center justify-center rounded-lg border-2 border-solid border-sky-500 p-4 ">
                        <Form
                            className="no-scrollbar w-full overflow-auto"
                            initialValues={{ remember: true }}
                            labelCol={{ span: 8 }}
                            layout="vertical"
                            onFinish={onFinish}
                            style={{ maxWidth: 600 }}
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

                            <Form.Item>
                                <Button
                                    className="bg-[#4096ff]"
                                    htmlType="submit"
                                    type="primary"
                                >
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
