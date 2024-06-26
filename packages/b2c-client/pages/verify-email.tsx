import { useMutation } from '@tanstack/react-query';
import { Button, Result, Spin } from 'antd';
import * as request from 'common/utils/http-request';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const { id, token } = router.query;

    const {
        mutate: checkVerify,
        isPending: checkVerifyIsPending,
        isError,
        isSuccess,
    } = useMutation({
        mutationFn: async (data: { id: string; token: string }) => {
            return request
                .post('/auth/check-verify', data)
                .then((res) => res.data);
        },
    });

    useEffect(() => {
        if (typeof id === 'string' && typeof token === 'string') {
            checkVerify({
                id,
                token,
            });
        }
    }, [id, token, checkVerify]);

    const handleClick = () => {
        router.push('/');
    };

    return (
        <div className="flex h-dvh w-full items-center justify-center bg-gray-100">
            <div className="max-w-md rounded-lg bg-white p-4 text-center shadow-md">
                {checkVerifyIsPending && (
                    <div>
                        <Spin size="large" />
                        <p className="mt-4">
                            We are verifying your email, please wait a moment...
                        </p>
                    </div>
                )}
                {!checkVerifyIsPending && isError && (
                    <Result
                        extra={[
                            <Button
                                className="bg-[#1677ff]"
                                onClick={handleClick}
                                type="primary"
                            >
                                Back to Home
                            </Button>,
                        ]}
                        status="error"
                        subTitle="We could not verify your email. Please try again later or contact support."
                        title="Verification Failed"
                    />
                )}
                {!checkVerifyIsPending && isSuccess && (
                    <Result
                        extra={[
                            <Button
                                className="bg-[#1677ff]"
                                onClick={handleClick}
                                type="primary"
                            >
                                Back to Home
                            </Button>,
                        ]}
                        status="success"
                        subTitle="Your email has been successfully verified. Thank you for shopping with us!"
                        title="Email Verified Successfully"
                    />
                )}
            </div>
        </div>
    );
}
