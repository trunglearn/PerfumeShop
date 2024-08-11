/* eslint-disable max-lines */
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Checkbox, Col, Layout, Modal, Row } from 'antd';
import { QueryResponseType } from 'common/types';
import { Cart } from 'common/types/cart';
import { Product } from 'common/types/product';
import { currencyFormatter } from 'common/utils/formatter';
import * as request from 'common/utils/http-request';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '~/hooks/useAuth';
import useCartStore from '~/hooks/useCartStore';
import DeleteCartProductFormModal from './delete-cart-product';

const { Content } = Layout;

// eslint-disable-next-line max-lines-per-function
const CartDetails = () => {
    const auth = useAuth();
    const router = useRouter();
    const { query } = useRouter();

    // Initialize cartItems from localStorage or default to empty array
    const [cartItems, setCartItems] = useState<Cart[]>([]);

    const itemKeysQuery = query.itemKeys as string;

    const [selectedItems, setSelectedItems] = useState<
        {
            id: string;
            quantity: string;
        }[]
    >([]);

    const [totalCartPrice, setTotalCartPrice] = useState(0);
    const {
        data: cartStorage,
        deleteProduct,
        updateProductQuantity,
    } = useCartStore();

    const {
        data: listCartItemsStore,
        isLoading: isLoadinglistCartItemsStore,
        refetch: listCartItemsStoreRefetch,
    } = useQuery<QueryResponseType<Product>>({
        queryKey: ['list_product_cart'],
        queryFn: async () => {
            return request
                .get('/list-product-cart', {
                    params: {
                        listProductId: cartStorage.map(
                            (cart) => cart.productId
                        ),
                    },
                })
                .then((res) => res.data);
        },
        enabled: cartStorage.length > 0,
    });

    const { data: cartData, refetch: refetchCart } = useQuery<
        QueryResponseType<Cart>
    >({
        queryKey: ['cart'],
        queryFn: () => {
            if (auth) {
                return request.get('cart').then((res) => res.data);
            }
            return Promise.resolve({ data: null }); // Return a dummy response or handle as needed
        },
        enabled: !!auth, // Only fetch data when auth is true
    });

    const { mutate: updateCartTrigger } = useMutation({
        mutationFn: ({ id, quantity }: { id: string; quantity: number }) => {
            return request
                .put(`cart/updateQuantity/${id}`, { quantity })
                .then((res) => res.data);
        },
    });

    useEffect(() => {
        if (listCartItemsStore?.data) {
            const total = listCartItemsStore.data.reduce((acc, cur) => {
                const cartItem = cartStorage.find(
                    (item) => item.productId === cur.id
                );
                if (cartItem) {
                    const price = cur.discount_price ?? cur.original_price ?? 0;
                    // eslint-disable-next-line no-param-reassign
                    acc += price * cartItem.quantity;
                }
                return acc;
            }, 0);
            setTotalCartPrice(total);
        } else {
            setTotalCartPrice(0);
        }
    }, [listCartItemsStore, cartStorage, isLoadinglistCartItemsStore]);

    useEffect(() => {
        if (auth) {
            if (cartData?.data) {
                setCartItems(cartData.data);
            }
        } else {
            setCartItems(cartStorage);
        }
    }, [cartData, cartStorage, auth]);

    const updateCartQuantity = (id: string, type: 'plus' | 'minus') => {
        const updatedCartItems = cartItems.map((item) => {
            if (item.id === id) {
                let newQuantity =
                    type === 'plus'
                        ? (item.quantity ?? 0) + 1
                        : (item.quantity ?? 0) - 1;
                // Ensure quantity doesn't go below 1
                newQuantity = Math.max(newQuantity, 1);
                newQuantity = Math.min(
                    newQuantity,
                    item?.product?.quantity ?? 0
                );
                updateCartTrigger({
                    id: id || '',
                    quantity: newQuantity,
                });
                return { ...item, quantity: newQuantity };
            }

            return item;
        });
        setCartItems(updatedCartItems); // Update state
    };

    const totalPrice = cartItems.reduce(
        (total, item) =>
            total +
            (item.quantity ?? 0) *
                (item.product?.discount_price ??
                    item.product?.original_price ??
                    0),
        0
    );

    useEffect(() => {
        if (itemKeysQuery) {
            const product = itemKeysQuery.split(',');
            product.forEach((e: string) => {
                const [id, quantity] = e.split(':');

                setSelectedItems((prevSelectedItems) => [
                    ...prevSelectedItems,
                    { id, quantity },
                ]);
            });
        }
    }, [itemKeysQuery, cartItems]);

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setSelectedItems((prevSelectedItems) => {
            if (checked) {
                return [...prevSelectedItems, { id, quantity: '1' }];
            }
            return prevSelectedItems.filter((item) => item.id !== id);
        });
    };

    const handlePurchase = () => {
        const queryString = selectedItems?.map((e) => `${e.id}`).join(',');
        if (queryString === null || queryString === '') {
            Modal.warn({
                content: 'Vui lòng chọn sản phẩm để tiến hành đặt hàng.',
                okText: 'Trở lại',
            });
            return;
        }
        router.push(`/cart-contact?itemKeys=${queryString}`);
    };

    if (!auth) {
        return (
            <Layout>
                <Content style={{ padding: '0 48px' }}>
                    <Layout style={{ padding: '24px 0' }}>
                        <Content>
                            <Row gutter={16}>
                                <Col span={16}>
                                    {listCartItemsStore?.data?.map((item) => (
                                        <Card
                                            bordered={false}
                                            extra={
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={async () => {
                                                        await deleteProduct(
                                                            item?.id ?? ''
                                                        );
                                                        listCartItemsStoreRefetch();
                                                    }}
                                                />
                                            }
                                            style={{
                                                marginBottom: 10,
                                                marginLeft: 10,
                                            }}
                                            title={
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={selectedItems.some(
                                                            (e) =>
                                                                e.id === item.id
                                                        )}
                                                        onChange={(e) =>
                                                            handleCheckboxChange(
                                                                item?.id ?? '',
                                                                e.target.checked
                                                            )
                                                        }
                                                        value={item?.id}
                                                    />
                                                    {` Mã sản phẩm:  ${item?.id}`}
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
                                                                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item?.thumbnail}`}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col span={8}>
                                                        <div className="relative flex justify-center text-xl font-semibold">
                                                            {item?.name}
                                                        </div>
                                                        <div className="relative top-2 flex justify-center">
                                                            <div>
                                                                <div className="text-center">
                                                                    Số lượng
                                                                </div>
                                                                <div
                                                                    className="max-sm: relative top-1 flex border-spacing-2 justify-evenly backdrop-brightness-90"
                                                                    style={{
                                                                        borderRadius: 10,
                                                                        width: 100,
                                                                    }}
                                                                >
                                                                    <Button
                                                                        block
                                                                        icon={
                                                                            <MinusOutlined />
                                                                        }
                                                                        onClick={() =>
                                                                            updateProductQuantity(
                                                                                {
                                                                                    productId:
                                                                                        item?.id ??
                                                                                        '',
                                                                                    quantity:
                                                                                        (cartStorage.find(
                                                                                            (
                                                                                                e
                                                                                            ) =>
                                                                                                e.productId ===
                                                                                                item.id
                                                                                        )
                                                                                            ?.quantity ??
                                                                                            0) >
                                                                                        0
                                                                                            ? (cartStorage.find(
                                                                                                  (
                                                                                                      e
                                                                                                  ) =>
                                                                                                      e.productId ===
                                                                                                      item.id
                                                                                              )
                                                                                                  ?.quantity ??
                                                                                                  0) -
                                                                                              1
                                                                                            : 0,
                                                                                },
                                                                                cartStorage.find(
                                                                                    (
                                                                                        e
                                                                                    ) =>
                                                                                        e.productId ===
                                                                                        item.id
                                                                                )
                                                                                    ?.quantity ??
                                                                                    0
                                                                            )
                                                                        }
                                                                    />
                                                                    <span className="mx-2 flex items-center">
                                                                        {
                                                                            cartStorage.find(
                                                                                (
                                                                                    e
                                                                                ) =>
                                                                                    e.productId ===
                                                                                    item.id
                                                                            )
                                                                                ?.quantity
                                                                        }
                                                                    </span>
                                                                    <Button
                                                                        block
                                                                        icon={
                                                                            <PlusOutlined />
                                                                        }
                                                                        onClick={() =>
                                                                            updateProductQuantity(
                                                                                {
                                                                                    productId:
                                                                                        item?.id ??
                                                                                        '',
                                                                                    quantity:
                                                                                        (cartStorage.find(
                                                                                            (
                                                                                                e
                                                                                            ) =>
                                                                                                e.productId ===
                                                                                                item.id
                                                                                        )
                                                                                            ?.quantity ??
                                                                                            0) >
                                                                                        0
                                                                                            ? (cartStorage.find(
                                                                                                  (
                                                                                                      e
                                                                                                  ) =>
                                                                                                      e.productId ===
                                                                                                      item.id
                                                                                              )
                                                                                                  ?.quantity ??
                                                                                                  0) +
                                                                                              1
                                                                                            : 0,
                                                                                },
                                                                                item?.quantity ??
                                                                                    0
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
                                                                    <div>
                                                                        Giá
                                                                    </div>
                                                                    <div className="text-lg font-semibold">
                                                                        {currencyFormatter(
                                                                            item?.discount_price ??
                                                                                item?.original_price ??
                                                                                0
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div>
                                                                        Tổng
                                                                    </div>
                                                                    <div className="text-lg font-semibold">
                                                                        {currencyFormatter(
                                                                            (cartStorage.find(
                                                                                (
                                                                                    e
                                                                                ) =>
                                                                                    e.productId ===
                                                                                    item.id
                                                                            )
                                                                                ?.quantity ??
                                                                                0) >
                                                                                0
                                                                                ? (cartStorage.find(
                                                                                      (
                                                                                          e
                                                                                      ) =>
                                                                                          e.productId ===
                                                                                          item.id
                                                                                  )
                                                                                      ?.quantity ??
                                                                                      0) *
                                                                                      (item?.discount_price ??
                                                                                          item?.original_price ??
                                                                                          0)
                                                                                : 0
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Content>
                                        </Card>
                                    ))}
                                </Col>
                                <Col span={8}>
                                    <Card
                                        bordered={false}
                                        title={
                                            <div>
                                                Tổng đơn hàng:{' '}
                                                <span>
                                                    {currencyFormatter(
                                                        totalCartPrice
                                                    )}
                                                </span>
                                            </div>
                                        }
                                    >
                                        <Link href="/product">
                                            <Button
                                                block
                                                size="large"
                                                style={{
                                                    marginBottom: 20,
                                                }}
                                                type="primary"
                                            >
                                                Tiếp tục mua sắm
                                            </Button>
                                        </Link>
                                        <Button
                                            block
                                            onClick={handlePurchase}
                                            size="large"
                                            type="primary"
                                        >
                                            Thanh toán đơn hàng
                                        </Button>
                                    </Card>
                                </Col>
                            </Row>
                        </Content>
                    </Layout>
                </Content>
            </Layout>
        );
    }
    return (
        <Layout>
            <Content style={{ padding: '0 48px' }}>
                <Layout style={{ padding: '24px 0' }}>
                    <Content>
                        <Row gutter={16}>
                            <Col span={16}>
                                {cartItems?.map((item) => (
                                    <Layout key={item.id}>
                                        <Card
                                            bordered={false}
                                            extra={
                                                <DeleteCartProductFormModal
                                                    cartId={item.id ?? ''}
                                                    productId={
                                                        item.product?.id ?? ''
                                                    }
                                                    reload={refetchCart}
                                                />
                                            }
                                            style={{
                                                marginBottom: 10,
                                                marginLeft: 10,
                                            }}
                                            title={
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={selectedItems.some(
                                                            (e) =>
                                                                e.id ===
                                                                item.product?.id
                                                        )}
                                                        onChange={(e) =>
                                                            handleCheckboxChange(
                                                                item.product
                                                                    ?.id ?? '',
                                                                e.target.checked
                                                            )
                                                        }
                                                        value={item.product?.id}
                                                    />
                                                    {` Mã sản phẩm: ${auth ? item.product?.id : item.productId}`}
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
                                                                alt={
                                                                    item.id ??
                                                                    ''
                                                                }
                                                                className="shadow-lg"
                                                                layout="fill"
                                                                objectFit="cover"
                                                                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item.product?.thumbnail}`}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col span={8}>
                                                        <div className="relative flex justify-center text-xl font-semibold">
                                                            {item.product?.name}
                                                        </div>
                                                        <div className="relative top-2 flex justify-center">
                                                            <div>
                                                                <div className="text-center">
                                                                    Số lượng
                                                                </div>
                                                                <div
                                                                    className="max-sm: relative top-1 flex border-spacing-2 justify-evenly backdrop-brightness-90"
                                                                    style={{
                                                                        borderRadius: 10,
                                                                        width: 100,
                                                                    }}
                                                                >
                                                                    <Button
                                                                        block
                                                                        icon={
                                                                            <MinusOutlined />
                                                                        }
                                                                        onClick={() =>
                                                                            updateCartQuantity(
                                                                                item.id ??
                                                                                    '',
                                                                                'minus'
                                                                            )
                                                                        }
                                                                    />
                                                                    <span className="mx-2 flex items-center">
                                                                        {item.quantity ??
                                                                            0}
                                                                    </span>
                                                                    <Button
                                                                        block
                                                                        icon={
                                                                            <PlusOutlined />
                                                                        }
                                                                        onClick={() =>
                                                                            updateCartQuantity(
                                                                                item.id ??
                                                                                    '',
                                                                                'plus'
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
                                                                    <div>
                                                                        Giá
                                                                    </div>
                                                                    <div className="text-lg font-semibold">
                                                                        {currencyFormatter(
                                                                            item
                                                                                .product
                                                                                ?.discount_price ??
                                                                                item
                                                                                    .product
                                                                                    ?.original_price ??
                                                                                0
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div>
                                                                        Tổng
                                                                    </div>
                                                                    <div className="text-lg font-semibold">
                                                                        {currencyFormatter(
                                                                            (item.quantity ??
                                                                                0) *
                                                                                (item
                                                                                    .product
                                                                                    ?.discount_price ??
                                                                                    item
                                                                                        .product
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
                                ))}
                            </Col>
                            <Col span={8}>
                                <Card
                                    bordered={false}
                                    title={
                                        <div>
                                            Tổng đơn hàng:
                                            <span>
                                                {currencyFormatter(totalPrice)}
                                            </span>
                                        </div>
                                    }
                                >
                                    <Link href="/product">
                                        <Button
                                            block
                                            size="large"
                                            style={{ marginBottom: 20 }}
                                            type="primary"
                                        >
                                            Tiêp tục mua sắm
                                        </Button>
                                    </Link>
                                    <Button
                                        block
                                        onClick={handlePurchase}
                                        size="large"
                                        type="primary"
                                    >
                                        Thanh toán đơn hàng
                                    </Button>
                                </Card>
                            </Col>
                        </Row>
                    </Content>
                </Layout>
            </Content>
        </Layout>
    );
};

export default CartDetails;
