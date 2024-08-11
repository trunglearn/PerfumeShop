import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { cn } from 'common/utils';
import React, { ElementRef, useEffect, useRef, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import * as request from 'common/utils/http-request';
import type { QueryResponseType } from 'common/types';
import { ProductFeatured } from 'common/types/product';
import Image from 'next/image';
import { getImageUrl } from 'common/utils/getImageUrl';
import { currencyFormatter } from 'common/utils/formatter';
import Link from 'next/link';
import { useRouter } from 'next/router';

type ProductHotSearch = Omit<ProductFeatured, 'description'>;

const Search = () => {
    const router = useRouter();

    const searchWrapperRef = useRef<ElementRef<'div'>>(null);
    const searchInputRef = useRef<ElementRef<'input'>>(null);

    const [inputFocus, setInputFocus] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string | undefined>(
        undefined
    );
    const [debouncedValue, setDebouncedValue] = useDebounceValue(
        searchValue,
        500
    );

    const { data, refetch, isFetching } = useQuery<
        QueryResponseType<ProductHotSearch>
    >({
        queryKey: ['hot-search-product'],
        queryFn: () =>
            request
                .get('product-hot-search', {
                    params: {
                        search: debouncedValue,
                    },
                })
                .then((res) => res.data),
        enabled: inputFocus,
    });

    useEffect(() => {
        refetch();
    }, [debouncedValue]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClickOutSide = (e: any) => {
        if (!searchWrapperRef.current?.contains(e.target)) {
            setInputFocus(false);
        }
        if (searchWrapperRef.current?.contains(e.target)) {
            setInputFocus(true);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutSide);

        return () => {
            document.removeEventListener('click', handleClickOutSide);
        };
    }, [searchWrapperRef]);

    useEffect(() => {
        setInputFocus(false);
    }, [router.asPath]);

    return (
        <div className="relative" ref={searchWrapperRef}>
            <div
                className={cn(
                    'hover:border-primary flex rounded-full bg-slate-100 px-4 py-1.5 text-slate-500 transition-all',
                    inputFocus && 'border-primary border'
                )}
                onClick={() => {
                    searchInputRef.current?.focus();
                }}
                role="presentation"
            >
                <input
                    className="caret-primary z-10 h-[30px] w-[350px] border-none bg-transparent outline-none"
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                        setDebouncedValue(e.target.value);
                    }}
                    placeholder="Nhập tên sản phẩm cần tìm..."
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                />
                <div className="flex w-[20px] items-center justify-center text-xl">
                    {isFetching ? <LoadingOutlined /> : <SearchOutlined />}
                </div>
            </div>
            {inputFocus && (
                <div className="customScroll absolute top-16 z-30 w-full rounded-lg border bg-white p-2 shadow-lg">
                    {data?.data && data?.data?.length > 0 ? (
                        <div className="grid max-h-[600px] w-full grid-cols-1 gap-2">
                            {data?.data?.map((item) => (
                                <Link
                                    className="cursor-pointer select-none"
                                    href={`/product/${item?.id}`}
                                >
                                    <div className="grid grid-cols-5 gap-2">
                                        <Image
                                            alt={item.name ?? ''}
                                            className="rounded-md border object-cover"
                                            height={100}
                                            src={getImageUrl(
                                                item.thumbnail ?? ''
                                            )}
                                            width={100}
                                        />
                                        <div className="col-span-4 space-y-2 py-1">
                                            <div className="line-clamp-1 text-lg">
                                                {item?.name}
                                            </div>
                                            <div className="space-x-2">
                                                {item?.original_price && (
                                                    <span
                                                        className={cn(
                                                            'text-primary',
                                                            item?.discount_price &&
                                                                'text-slate-400 line-through'
                                                        )}
                                                    >
                                                        {currencyFormatter(
                                                            item?.original_price
                                                        )}
                                                    </span>
                                                )}
                                                {item?.discount_price && (
                                                    <span className="text-primary">
                                                        {currencyFormatter(
                                                            item?.discount_price
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-primary w-full p-10 text-center text-xl">
                            Không tìm thấy sản phẩm!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
