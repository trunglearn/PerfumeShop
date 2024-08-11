import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import * as request from 'common/utils/http-request';
import { useRouter } from 'next/router';
import { Spin, Switch } from 'antd';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import Header from '~/components/header';
import FeedbackDetailAll from './feeback-detail-all';
import { Feedback } from '~/types/feedback';

const FeedbackDetail = () => {
    const { query } = useRouter();

    const { data, isLoading, error, refetch } = useQuery<
        Feedback,
        AxiosError<{
            isOk?: boolean | null;
            message?: string | null;
        }>
    >({
        queryKey: ['feedback-detail'],
        queryFn: () =>
            request
                .get(`feedback/${query?.id}`)
                .then((res) => res.data)
                .then((res) => res.data),
        enabled: !!query?.id,
    });

    if (error) {
        return (
            <div>
                <Header isBack title="Post detail" />
                <div className="mt-16 text-center text-2xl font-semibold">
                    {error?.response?.data?.message}
                </div>
            </div>
        );
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { mutate: updateFeedbackStatusTrigger } = useMutation({
        mutationFn: ({
            feedbackId,
            isShow,
        }: {
            feedbackId: string;
            isShow: boolean;
        }) => {
            return request
                .put(`feedback/updateStatus/${feedbackId}`, { isShow })
                .then((res) => res.data);
        },
        onSuccess: (res) => {
            toast.success(res.message);
            refetch();
        },
    });
    return (
        <Spin spinning={isLoading}>
            <div>
                <Header isBack title="Feedback detail" />
                <div>
                    <div className="flex justify-end px-5 py-2">
                        <div className="flex justify-end px-5 py-2">
                            <div className="mx-2">Change feedback status</div>
                            <div>
                                <Switch
                                    checkedChildren="Show"
                                    onChange={(checked: boolean) => {
                                        updateFeedbackStatusTrigger({
                                            feedbackId: data?.id || '',
                                            isShow: checked,
                                        });
                                    }}
                                    unCheckedChildren="Hide"
                                    value={data?.isShow ?? undefined}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <FeedbackDetailAll data={data} />
                    </div>
                </div>
            </div>
        </Spin>
    );
};

export default FeedbackDetail;
