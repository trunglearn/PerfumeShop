import React, { useMemo } from 'react';
import { currencyFormatter } from 'common/utils/formatter';
import moment from 'moment';
import { Image, Rate } from 'antd';
import { Product, ProductImage } from '~/types/product';

type Props = {
    data?: Product;
};

type InfoItemProps = {
    title?: string;
    value?: string | number | boolean | null;
    listImage?: ProductImage[] | null;
    render?: 'RATE' | 'IMAGE' | 'LIST_IMAGE';
};

const InfoItem: React.FC<InfoItemProps> = ({
    title,
    value,
    render,
    listImage,
}) => {
    const renderValue = useMemo(() => {
        switch (render) {
            case 'RATE':
                return (
                    <Rate
                        disabled
                        value={typeof value === 'number' ? value : 0}
                    />
                );
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

const ProductDetailAll: React.FC<Props> = ({ data }) => {
    return (
        <div>
            <InfoItem title="Product ID" value={data?.id} />
            <InfoItem title="Name" value={data?.name} />
            <InfoItem title="Brand" value={data?.brand?.name} />
            <InfoItem title="Category" value={data?.category?.name} />
            <InfoItem title="Size" value={data?.size && `${data?.size} ML`} />
            <InfoItem
                title="Price"
                value={
                    data?.original_price &&
                    currencyFormatter(data?.original_price)
                }
            />
            <InfoItem
                title="Discount Price"
                value={
                    data?.discount_price &&
                    currencyFormatter(data?.discount_price)
                }
            />
            <InfoItem
                title="Show on Client"
                value={data?.isShow ? 'SHOW' : 'HIDE'}
            />
            <InfoItem title="Quantity" value={data?.quantity} />
            <InfoItem title="Sold Quantity" value={data?.sold_quantity} />
            <InfoItem render="RATE" title="Rating" value={data?.rating} />
            <InfoItem
                title="Create At"
                value={
                    data?.createdAt &&
                    moment(data?.createdAt).format('YYYY-MMM-DD')
                }
            />

            <InfoItem title="Description" value={data?.description} />
            <InfoItem
                render="IMAGE"
                title="Thumbnail"
                value={data?.thumbnail}
            />
            <InfoItem
                listImage={data?.product_image}
                render="LIST_IMAGE"
                title="Product image"
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

ProductDetailAll.defaultProps = {
    data: undefined,
};

export default ProductDetailAll;
