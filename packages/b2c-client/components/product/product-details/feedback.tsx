import React, { useState } from 'react';
import * as request from 'common/utils/http-request';
import { useQuery } from '@tanstack/react-query';
import { QueryResponseType } from 'common/types';
import type { FeedbackType } from 'common/types/feedback';
import {
    Image as AntImage,
    Pagination,
    Radio,
    RadioChangeEvent,
    Rate,
    Spin,
} from 'antd';
import Image from 'next/image';
import { getImageUrl } from 'common/utils/getImageUrl';
import moment from 'moment';
import { PAGE_SIZE, RATING_LIST_CLIENT } from 'common/constant';
import Avatar from 'common/components/avatar';

type Props = {
    productId: string;
    productRate: number;
};

const Feedback: React.FC<Props> = ({ productId, productRate }) => {
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [rateValue, setRateValue] = useState<number | undefined>(undefined);

    const { data, isFetching } = useQuery<QueryResponseType<FeedbackType>>({
        queryKey: [productId, rateValue, currentPage],
        queryFn: () =>
            request
                .get('feedback', {
                    params: {
                        productId,
                        rate: rateValue,
                        currentPage,
                    },
                })
                .then((res) => res.data),
        enabled: !!productId,
    });

    const onChange = (e: RadioChangeEvent) => {
        setRateValue(e.target.value);
    };

    return (
        <Spin spinning={isFetching}>
            <div className="rounded-lg border p-5">
                <div className="text-xl uppercase underline underline-offset-4">
                    Đánh giá
                </div>
                <div className="mt-5 grid grid-cols-5 rounded-md border border-rose-50 bg-rose-50 py-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-primary">
                            <span className="mr-1.5 text-xl">
                                {productRate}
                            </span>
                            <span className="text-lg">trên 5</span>
                        </div>
                        <div>
                            <Rate
                                allowHalf
                                className="text-primary"
                                defaultValue={productRate}
                                disabled
                            />
                        </div>
                    </div>
                    <div className="col-span-4">
                        <Radio.Group
                            buttonStyle="solid"
                            onChange={onChange}
                            value={rateValue}
                        >
                            <Radio.Button value={undefined}>
                                Tất Cả
                            </Radio.Button>
                            {RATING_LIST_CLIENT.map((item) => (
                                <Radio.Button value={item.value}>
                                    {item.value} Sao
                                </Radio.Button>
                            ))}
                        </Radio.Group>
                    </div>
                </div>

                <div className="mt-5">
                    {data?.data && data?.data?.length > 0 ? (
                        <div className="space-y-5">
                            {data?.data?.map((item) => (
                                <div className="border-b pb-5" key={item.id}>
                                    <div className="grid grid-cols-12 gap-5">
                                        <div className="flex justify-end">
                                            <Avatar
                                                height={40}
                                                src={getImageUrl(
                                                    item?.user?.image ?? ''
                                                )}
                                                width={40}
                                            />
                                        </div>
                                        <div className="col-span-11">
                                            <p className="text-lg">
                                                {item?.user?.name}
                                            </p>
                                            {item?.rating && (
                                                <div>
                                                    <Rate
                                                        className="text-primary text-sm"
                                                        defaultValue={
                                                            item?.rating
                                                        }
                                                        disabled
                                                    />
                                                </div>
                                            )}
                                            {item?.createdAt && (
                                                <p className="text-slate-500">
                                                    {moment(
                                                        String(item?.createdAt)
                                                    ).format(
                                                        'YYYY-MM-DD HH:mm'
                                                    )}
                                                </p>
                                            )}
                                            <div className="mt-4 space-y-4">
                                                <div>{item.description}</div>
                                                <div className="space-x-4">
                                                    {item?.image?.map(
                                                        (image) => (
                                                            <AntImage
                                                                className="rounded-lg border object-cover"
                                                                height={100}
                                                                key={image.id}
                                                                src={getImageUrl(
                                                                    image?.url ??
                                                                        ''
                                                                )}
                                                                width={100}
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-[400px] flex-col items-center justify-center gap-5 text-xl text-slate-500">
                            <Image
                                alt=""
                                height={120}
                                src="/images/star-feedback.png"
                                width={120}
                            />
                            Chưa có đánh giá
                        </div>
                    )}
                </div>
                {data?.pagination?.total ? (
                    <div className="mt-5 flex justify-center">
                        <Pagination
                            defaultCurrent={currentPage}
                            defaultPageSize={PAGE_SIZE}
                            onChange={(page) => {
                                setCurrentPage(page);
                            }}
                            total={data?.pagination?.total}
                        />
                    </div>
                ) : null}
            </div>
        </Spin>
    );
};

export default Feedback;
