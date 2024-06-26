import React from 'react';
import { Button, Card, Col, Layout, Row } from 'antd';
import { Product } from 'common/types/cart';
import { useQuery } from '@tanstack/react-query';
import request from 'common/utils/http-request';
import { QueryResponseGetOneType } from 'common/types';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { currencyFormatter } from 'common/utils/formatter';
import useCartStore from '~/hooks/useCartStore';

type CartStoreItemProps = {
    productId: string;
    quantity: number;
};
const { Content } = Layout;

const CartStoreItem: React.FC<CartStoreItemProps> = ({
    productId,
    quantity,
}) => {
    const { data } = useQuery<QueryResponseGetOneType<Product>>({
        queryKey: ['product-info-cart', productId],
        queryFn: () =>
            request
                .get(`productPublicInfo/${productId}`)
                .then((res) => res.data),
        enabled: !!productId,
    });

    const { deleteProduct, updateProductQuantity } = useCartStore();

    return (
        <Layout key={data?.data?.id}>
            <Card
                bordered={false}
                extra={
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteProduct(data?.data?.id ?? '')}
                    />
                }
                style={{
                    marginBottom: 10,
                    marginLeft: 10,
                }}
                title={
                    <div className="flex items-center gap-2">
                        {` Mã sản phẩm: ${data?.data?.id}`}
                    </div>
                }
            >
                <Content>
                    <Row gutter={16}>
                        <Col span={6}>
                            <div
                                style={{
                                    height: 150,
                                }}
                            >
                                <Image
                                    alt=""
                                    className="shadow-lg"
                                    layout="fill"
                                    objectFit="cover"
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${data?.data?.thumbnail}`}
                                />
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="relative flex justify-center text-xl font-semibold">
                                {data?.data?.name}
                            </div>
                            <div className="relative top-2 flex justify-center">
                                <div>
                                    <div className="text-center">Số lượng</div>
                                    <div
                                        className="max-sm: relative top-1 flex border-spacing-2 justify-evenly backdrop-brightness-90"
                                        style={{
                                            borderRadius: 10,
                                            width: 100,
                                        }}
                                    >
                                        <Button
                                            block
                                            icon={<MinusOutlined />}
                                            onClick={() =>
                                                updateProductQuantity(
                                                    {
                                                        productId:
                                                            data?.data?.id ??
                                                            '',
                                                        quantity: quantity - 1,
                                                    },
                                                    data?.data?.quantity ?? 0
                                                )
                                            }
                                        />
                                        <span className="mx-2 flex items-center">
                                            {quantity}
                                        </span>
                                        <Button
                                            block
                                            icon={<PlusOutlined />}
                                            onClick={() =>
                                                updateProductQuantity(
                                                    {
                                                        productId:
                                                            data?.data?.id ??
                                                            '',
                                                        quantity: quantity + 1,
                                                    },
                                                    data?.data?.quantity ?? 0
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div
                                style={{
                                    marginTop: 38,
                                }}
                            >
                                <div className="flex justify-evenly">
                                    <div>
                                        <div>Giá</div>
                                        <div className="text-lg font-semibold">
                                            {currencyFormatter(
                                                data?.data?.discount_price ??
                                                    data?.data
                                                        ?.original_price ??
                                                    0
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div>Tổng</div>
                                        <div className="text-lg font-semibold">
                                            {currencyFormatter(
                                                quantity *
                                                    (data?.data
                                                        ?.discount_price ??
                                                        data?.data
                                                            ?.original_price ??
                                                        0)
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Content>
            </Card>
        </Layout>
    );
};

export default CartStoreItem;
