import React from 'react';
import type { ProductFeatured } from 'common/types/product';
import { getImageUrl } from 'common/utils/getImageUrl';
import Image from 'next/image';
import Link from 'next/link';
import { currencyFormatter } from 'common/utils/formatter';

type Props = {
    data: Partial<ProductFeatured>;
};

const ProductCardItem: React.FC<Props> = ({ data }) => {
    return (
        <Link className="cursor-pointer" href={`/product/${data?.id}`}>
            <div>
                <Image
                    alt={data?.name ?? ''}
                    className="rounded-t-2xl"
                    height={270}
                    objectFit="cover"
                    src={getImageUrl(data?.thumbnail ?? '')}
                    style={{
                        height: 270,
                        objectFit: 'cover',
                    }}
                    width={430}
                />
            </div>
            <div className="flex w-full flex-col space-y-5 p-8">
                <div className="line-clamp-2 text-2xl font-bold">
                    {data?.name}
                </div>
                <div className="line-clamp-2 flex-1 text-lg text-slate-500">
                    {data?.description}
                </div>
                <div className="text-primary space-x-4 text-end text-xl">
                    {data?.original_price && (
                        <span
                            className={
                                data?.discount_price
                                    ? 'text-base text-slate-400 line-through'
                                    : ''
                            }
                        >
                            {currencyFormatter(data?.original_price)}
                        </span>
                    )}
                    {data?.discount_price && (
                        <span>{currencyFormatter(data?.discount_price)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCardItem;
