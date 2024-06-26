import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Product } from 'common/types/product';
import { Button, Rate, Space } from 'antd';
import { currencyFormatter } from 'common/utils/formatter';
import { cn } from 'common/utils';
import {
    MinusOutlined,
    PlusOutlined,
    ShoppingCartOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import * as request from 'common/utils/http-request';
import { toast } from 'react-toastify';
import { QueryResponseGetOneType } from 'common/types';
import { Cart } from 'common/types/cart';
import ProductImageSlider from './product-image-slider';
import useCartStore from '~/hooks/useCartStore';
import { useAuth } from '~/hooks/useAuth';
import { useCartQuery } from '~/hooks/useCartQuery';
import Feedback from './feedback';

type Props = {
    data?: Product;
};

type ProductSpecificationsProps = {
    title: string;
    name: string;
};

type AddToCartRequest = {
    productId: string;
    quantity: number;
};

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
    title,
    name,
}) => {
    return (
        <div className="grid grid-cols-10 text-base">
            <div className="col-span-2 text-slate-500">{title}</div>
            <div className="col-span-6">{name}</div>
        </div>
    );
};

const ProductDetail: React.FC<Props> = ({ data }) => {
    const router = useRouter();
    const auth = useAuth();
    const { addProduct } = useCartStore();
    const { reload } = useCartQuery();

    const { mutateAsync: addToCartTrigger } = useMutation({
        mutationFn: ({
            productId,
            quantity,
        }: AddToCartRequest): Promise<QueryResponseGetOneType<Cart>> =>
            request
                .post('cart/add', { productId, quantity })
                .then((res) => res.data),

        onError: () => {
            toast.error('Có lỗi xảy ra. Vui long thử lại!');
        },
    });

    const [buyQuantity, setByQuantity] = useState<number>(1);

    useEffect(() => {
        setByQuantity(1);
    }, [data?.id]);

    useLayoutEffect(() => {
        if (buyQuantity <= 0) {
            setByQuantity(1);
        }
        if (data?.quantity && buyQuantity > data?.quantity) {
            setByQuantity(data?.quantity);
        }
    }, [buyQuantity, data?.quantity]);

    const disable = useMemo(() => {
        if (!data?.quantity) {
            return true;
        }
        return false;
    }, [data?.quantity]);

    const handleAddToCard = async () => {
        if (data?.id) {
            if (!auth) {
                addProduct({ productId: data?.id, quantity: buyQuantity });
            } else {
                const response = await addToCartTrigger({
                    productId: data?.id,
                    quantity: buyQuantity,
                });
                if (response?.isOk) {
                    toast.success('Thêm sản phẩm vào giỏ hàng thành công.');
                    reload();
                }
            }
        }
    };

    const handleBuyNow = async () => {
        if (data?.id) {
            if (!auth) {
                addProduct({ productId: data?.id, quantity: buyQuantity });
                router.push('/cart-details');
            } else {
                const response = await addToCartTrigger({
                    productId: data?.id,
                    quantity: buyQuantity,
                });

                if (response?.isOk) {
                    toast.success('Thêm sản phẩm vào giỏ hàng thành công.');
                    reload();
                    router.push('/cart-details');
                }
            }
        }
    };

    if (!data) {
        return <div>Sản phẩm này không tồn tại</div>;
    }

    return (
        <div className="container">
            <div className="flex gap-10">
                <ProductImageSlider listImage={data?.product_image ?? []} />
                <div className="flex flex-1 flex-col gap-10">
                    <div>
                        <div className="text-2xl font-semibold">
                            {data?.name}
                        </div>
                        <div className="mt-3 flex items-center gap-8">
                            {data?.rating ? (
                                <div className="text-primary flex items-center gap-2">
                                    <span className="text-xl underline underline-offset-4">
                                        {data?.rating}
                                    </span>
                                    <span>
                                        <Rate
                                            className="text-primary"
                                            disabled
                                            value={data?.rating ?? 0}
                                        />
                                    </span>
                                </div>
                            ) : (
                                <div className="text-lg text-slate-500">
                                    Chưa có đánh giá
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <span className="text-xl">
                                    {data?.sold_quantity}
                                </span>
                                <span className="text-slate-500">Đã bán</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-primary flex items-center gap-5 bg-slate-100 p-5 text-3xl">
                        {data?.original_price && (
                            <div
                                className={cn(
                                    data?.discount_price &&
                                        'text-lg text-slate-500 line-through'
                                )}
                            >
                                {currencyFormatter(data?.original_price)}
                            </div>
                        )}
                        {data?.discount_price && (
                            <div>{currencyFormatter(data?.discount_price)}</div>
                        )}
                    </div>
                    <div className="flex items-center gap-10 text-lg">
                        <p className="text-slate-500">Dung tích</p>
                        <div className="border px-5 py-2">{data?.size}ML</div>
                    </div>
                    <div className="flex items-center gap-10 text-lg">
                        <p className="text-slate-500">Số lượng</p>
                        <div className="flex border border-slate-300">
                            <div
                                className={cn(
                                    'flex h-[30px] w-[30px] cursor-pointer select-none items-center justify-center border-r border-r-slate-300',
                                    disable && 'cursor-not-allowed'
                                )}
                                onClick={() =>
                                    disable
                                        ? null
                                        : setByQuantity((prev) => prev - 1)
                                }
                                role="presentation"
                            >
                                <MinusOutlined />
                            </div>
                            <div className="flex w-[60px] items-center justify-center">
                                {buyQuantity}
                            </div>
                            <div
                                className={cn(
                                    'flex h-[30px] w-[30px] cursor-pointer select-none items-center justify-center border-l border-l-slate-300',
                                    disable && 'cursor-not-allowed'
                                )}
                                onClick={() =>
                                    disable
                                        ? null
                                        : setByQuantity((prev) => prev + 1)
                                }
                                role="presentation"
                            >
                                <PlusOutlined />
                            </div>
                        </div>
                        <div className="text-slate-500">
                            {data?.quantity ?? 0} sản phẩm có sẵn
                        </div>
                    </div>
                    <div>
                        <Space size="large">
                            <Button
                                className="border-primary text-primary w-[200px]"
                                disabled={disable}
                                icon={<ShoppingCartOutlined />}
                                onClick={handleAddToCard}
                                size="large"
                            >
                                Thêm vào giỏ hàng
                            </Button>
                            <Button
                                className="w-[200px]"
                                disabled={disable}
                                onClick={handleBuyNow}
                                size="large"
                                type="primary"
                            >
                                Mua ngay
                            </Button>
                        </Space>
                    </div>
                </div>
            </div>
            <div className="mt-20 flex flex-col gap-10 rounded-lg border p-5">
                <div className="flex flex-col gap-5">
                    <p className="text-xl uppercase underline underline-offset-4">
                        Chi tiết sản phẩm
                    </p>
                    <ProductSpecifications
                        name={data?.brand?.name ?? ''}
                        title="Thương hiệu"
                    />
                    <ProductSpecifications
                        name={data?.category?.name ?? ''}
                        title="Danh mục"
                    />
                    <ProductSpecifications
                        name={data?.size ? `${data?.size}ML` : ''}
                        title="Dung tích"
                    />
                </div>
                <div className="flex flex-col gap-5">
                    <p className="text-xl uppercase underline underline-offset-4">
                        Mô tả sản phẩm
                    </p>
                    <div>{data?.description}</div>
                </div>
            </div>
            <div className="mt-10">
                <Feedback
                    productId={data?.id ?? ''}
                    productRate={data?.rating ?? 0}
                />
            </div>
        </div>
    );
};

ProductDetail.defaultProps = {
    data: undefined,
};

export default ProductDetail;
