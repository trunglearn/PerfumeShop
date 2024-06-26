import React from 'react';
import { Card, Col, Layout, Row } from 'antd';
import { Product } from 'common/types/cart';
import { useQuery } from '@tanstack/react-query';
import request from 'common/utils/http-request';
import { QueryResponseGetOneType } from 'common/types';
import Image from 'next/image';
import { currencyFormatter } from 'common/utils/formatter';

type CartStoreItemProps = {
    productId: string;
    quantity: number;
};
const { Content } = Layout;

const CartContactItem: React.FC<CartStoreItemProps> = ({
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

    return (
        <Card className="m-2">
            <Content>
                <Row gutter={16}>
                    <Col span={6}>
                        <div
                            style={{
                                height: 50,
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
                    <Col span={6}>
                        <div className="text-lg font-semibold">
                            {data?.data?.name}
                        </div>
                    </Col>
                    <Col span={6}>
                        <div className="font-semibol mx-6 text-lg">
                            x{quantity}
                        </div>
                    </Col>
                    <Col span={6}>
                        <div className="font-semibol text-lg">
                            {currencyFormatter(
                                data?.data?.discount_price ??
                                    data?.data?.original_price ??
                                    0
                            )}
                        </div>
                    </Col>
                </Row>
            </Content>
        </Card>
    );
};

export default CartContactItem;
