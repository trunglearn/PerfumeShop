import React, { useMemo } from 'react';
import { Image } from 'antd';
import { Post } from '~/types/post';

type Props = {
    data?: Post;
};

type InfoItemProps = {
    title?: string;
    value?: string | number | boolean | null;
    render?: 'IMAGE';
};

const InfoItem: React.FC<InfoItemProps> = ({ title, value, render }) => {
    const renderValue = useMemo(() => {
        switch (render) {
            case 'IMAGE':
                return (
                    <Image
                        alt=""
                        className="rounded-md border"
                        height={120}
                        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${value}`}
                        width={120}
                    />
                );

            default:
                return value;
        }
    }, [value, render]);

    return (
        <div className="grid grid-cols-8 space-x-10 border-b py-4">
            <div className="col-span-2 text-end text-lg font-bold">{title}</div>
            <div className="col-span-6">{renderValue}</div>
        </div>
    );
};

const PostDetailAll: React.FC<Props> = ({ data }) => {
    return (
        <div>
            <InfoItem title="Post ID" value={data?.id} />
            <InfoItem title="User" value={data?.user?.name} />
            <InfoItem title="Title" value={data?.title} />
            <InfoItem title="Category" value={data?.category?.name} />
            <InfoItem title="Brief Infomation" value={data?.briefInfo} />
            <InfoItem title="Description" value={data?.description} />
            <InfoItem
                title="Show on Client"
                value={data?.isShow ? 'SHOW' : 'HIDE'}
            />
            <InfoItem
                title="Featured Post"
                value={data?.isShow ? 'TRUE' : 'FALSE'}
            />
            <InfoItem
                render="IMAGE"
                title="Thumbnail"
                value={data?.thumbnail}
            />
        </div>
    );
};

InfoItem.defaultProps = {
    title: undefined,
    value: undefined,
    render: undefined,
};

PostDetailAll.defaultProps = {
    data: undefined,
};

export default PostDetailAll;
