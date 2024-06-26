import { useQuery } from '@tanstack/react-query';
import React from 'react';
import * as request from 'common/utils/http-request';
import { useRouter } from 'next/router';
import { Spin } from 'antd';
import { AxiosError } from 'axios';
import Header from '~/components/header';
import { Product } from '~/types/product';
import ProductDetailAll from './product-detail-all';
import ProductFormModal from '../product-form-modal';

const ProductDetail = () => {
    const { query } = useRouter();
    const { data, isLoading, error, refetch } = useQuery<
        Product,
        AxiosError<{
            isOk?: boolean | null;
            message?: string | null;
        }>
    >({
        queryKey: ['product-detail'],
        queryFn: () =>
            request
                .get(`manage/product/${query?.id}`)
                .then((res) => res.data)
                .then((res) => res.data),
        enabled: !!query?.id,
    });
    if (error) {
        return (
            <div>
                <Header isBack title="Product detail" />
                <div className="mt-16 text-center text-2xl font-semibold">
                    {error?.response?.data?.message}
                </div>
            </div>
        );
    }
    return (
        <Spin spinning={isLoading}>
            <div>
                <Header isBack title="Product detail" />
                <div>
                    <div className="flex justify-end px-5 py-2">
                        <ProductFormModal
                            productId={String(query?.id) ?? ''}
                            reload={() => {
                                refetch();
                            }}
                            title="Update product"
                            type="UPDATE_BUTTON"
                        />
                    </div>
                    <div>
                        <ProductDetailAll data={data} />
                    </div>
                </div>
            </div>
        </Spin>
    );
};

export default ProductDetail;
