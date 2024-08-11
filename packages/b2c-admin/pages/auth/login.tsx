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
            <Spin
                fullscreen
                spinning={(mutation as { isPending: boolean }).isPending}
            />
            <div className="flex h-dvh w-dvw flex-col items-center justify-center">
                <div className="w-[450px] items-center justify-center space-y-10 rounded-lg border p-10 shadow-2xl">
                    <div className="text-center text-2xl font-semibold uppercase">
                        Welcome cms
                    </div>
                    <Form
                        className="no-scrollbar w-full overflow-auto"
                        disabled={mutation.isPending}
                        initialValues={{ remember: true }}
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

                        <Form.Item>
                            <Button
                                className="w-full"
                                htmlType="submit"
                                size="large"
                                type="primary"
                            >
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Login;
