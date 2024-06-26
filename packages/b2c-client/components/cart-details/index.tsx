/* eslint-disable max-lines */
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Checkbox, Col, Layout, Row } from 'antd';
import { QueryResponseType } from 'common/types';
import { Cart } from 'common/types/cart';
import { currencyFormatter } from 'common/utils/formatter';
import * as request from 'common/utils/http-request';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '~/hooks/useAuth';
import useCartStore from '~/hooks/useCartStore';
import CartStoreItem from './cart-list';
import DeleteCartProductFormModal from './delete-cart-product';

const { Content } = Layout;

// eslint-disable-next-line max-lines-per-function
const CartDetails = () => {
    const auth = useAuth();
    const router = useRouter();
    const { query } = useRouter();

    // Initialize cartItems from localStorage or default to empty array
    const [cartItems, setCartItems] = useState<Cart[]>([]);

    const { data: cartStorage } = useCartStore();

    const itemKeysQuery = query.itemKeys as string;
    const [selectedItems, setSelectedItems] = useState<
        {
            id: string;
            quantity: string;
        }[]
    >([]);

    const [totalCartPrice, setTotalCartPrice] = useState(0);

    const { data: listProductCart, isLoading: isLoadingListProductCart } =
        useQuery<
            QueryResponseType<{
                id: string;
                discount_price: number;
                original_price: number;
            }>
        >({
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

    const { mutate: addCart } = useMutation({
        mutationFn: async (dataAddCart: {
            productId: string;
            quantity: number;
        }) => {
            return request.post('/cart/add', dataAddCart);
        },
        onSuccess: () => {
            refetchCart(); // Corrected function name
        },
    });

    useEffect(() => {
        if (listProductCart?.data) {
            const total = listProductCart.data.reduce((acc, cur) => {
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
    }, [listProductCart, cartStorage, isLoadingListProductCart]);

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

                if (!cartItems.some((item) => item.product?.id === id)) {
                    addCart({
                        productId: id,
                        quantity: Number(quantity),
                    });
                    refetchCart();
                }

                setSelectedItems((prevSelectedItems) => [
                    ...prevSelectedItems,
                    { id, quantity },
                ]);
            });
        }
    }, [itemKeysQuery, cartItems, addCart, refetchCart]);

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setSelectedItems((prevSelectedItems) => {
            if (checked) {
                return [...prevSelectedItems, { id, quantity: '1' }];
            }
            return prevSelectedItems.filter((item) => item.id !== id);
        });
    };

    if (!auth) {
        return (
            <Layout>
                <Content style={{ padding: '0 48px' }}>
                    <Layout style={{ padding: '24px 0' }}>
                        <Content>
                            <Row gutter={16}>
                                <Col span={16}>
                                    {cartItems?.map((item) => (
                                        <CartStoreItem
                                            key={item?.productId}
                                            productId={item.productId ?? ''}
                                            quantity={item.quantity ?? 0}
                                        />
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
                                            onClick={() =>
                                                router.push('/cart-contact')
                                            }
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
                                        onClick={() =>
                                            router.push('/cart-contact')
                                        }
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
