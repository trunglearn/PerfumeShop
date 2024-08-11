import React, { useMemo } from 'react';
import { Image, Rate } from 'antd';
import { Feedback, FeedbackImage } from '~/types/feedback';

type Props = {
    data?: Feedback;
};

type InfoItemProps = {
    title?: string;
    value?: string | number | boolean | null;
    render?: 'RATE' | 'LIST_IMAGE';
    listImage?: FeedbackImage[] | null;
};

const InfoItem: React.FC<InfoItemProps> = ({
    title,
    value,
    render,
    listImage,
}) => {
    const renderValue = useMemo(() => {
        switch (render) {
            case 'LIST_IMAGE':
                return (
                    <div className="flex space-x-3">
                        {listImage?.map((item) => (
                            <Image
                                alt=""
                                className="rounded-md border object-cover"
                                height={120}
                                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item?.url}`}
                                width={120}
                            />
                        ))}
                    </div>
                );
            case 'RATE':
                return (
                    <Rate
                        disabled
                        value={typeof value === 'number' ? value : 0}
                    />
                );

            default:
                return value;
        }
    }, [value, render, listImage]);

    return (
        <div className="grid grid-cols-8 space-x-10 border-b py-4">
            <div className="col-span-2 text-end text-lg font-bold">{title}</div>
            <div className="col-span-6">{renderValue}</div>
        </div>
    );
};

const FeedbackDetailAll: React.FC<Props> = ({ data }) => {
    return (
        <div>
            <InfoItem title="Full name" value={data?.user?.name} />
            <InfoItem title="Email" value={data?.user?.email} />
            <InfoItem title="Phone number" value={data?.user?.phone} />
            <InfoItem title="Product name" value={data?.product?.name} />
            <InfoItem render="RATE" title="Rating" value={data?.rating} />
            <InfoItem title="Feedback" value={data?.description} />
            <InfoItem
                title="Show on Client"
                value={data?.isShow ? 'SHOW' : 'HIDE'}
            />
            <InfoItem
                listImage={data?.image}
                render="LIST_IMAGE"
                title="Feedback image"
            />
        </div>
    );
};

InfoItem.defaultProps = {
    title: undefined,
    value: undefined,
    render: undefined,
    listImage: undefined,
};

FeedbackDetailAll.defaultProps = {
    data: undefined,
};

export default FeedbackDetailAll;
