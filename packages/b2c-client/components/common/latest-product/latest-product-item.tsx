import Image from 'next/image';
import React from 'react';
import { getImageUrl } from 'common/utils/getImageUrl';
import { currencyFormatter } from 'common/utils/formatter';
import { cn } from 'common/utils';
import Link from 'next/link';
import type { Product } from '~/types/product';

type Props = {
    data?: Partial<Product>;
};

const LatestProductItem: React.FC<Props> = ({ data }) => {
    return (
        <Link href={`/product/${data?.id}`}>
            <div className="relative cursor-pointer rounded-lg border shadow-md">
                <div className="bg-primary absolute right-2 top-2 rounded-full px-4 py-1 text-white">
                    New
                </div>
                <div>
                    <Image
                        alt={data?.thumbnail ?? ''}
                        className="rounded-t-lg object-cover"
                        height={300}
                        src={getImageUrl(data?.thumbnail)}
                        width={300}
                    />
                </div>
                <div className="space-y-2 p-4">
                    <div className="text-xl font-bold">{data?.name}</div>
                    <div className="line-clamp-3 text-slate-500">
                        {data?.description}
                    </div>
                    <div className="space-x-2 text-end text-lg font-bold">
                        {data?.original_price && (
                            <span
                                className={cn(
                                    'text-primary',
                                    data?.discount_price &&
                                        'text-base text-slate-400 line-through'
                                )}
                            >
                                {currencyFormatter(data?.original_price)}
                            </span>
                        )}
                        {data?.discount_price && (
                            <span className="text-primary">
                                {currencyFormatter(data?.discount_price)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

LatestProductItem.defaultProps = {
    data: undefined,
};

export default LatestProductItem;
