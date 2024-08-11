/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    Layout,
    Modal,
    Radio,
    RadioChangeEvent,
    Row,
    Select,
    Space,
    Spin,
} from 'antd';
import { QueryResponseType } from 'common/types';
import { Cart } from 'common/types/cart';
import { OrderDetail } from 'common/types/order';
import { Product } from 'common/types/product';
import { currencyFormatter } from 'common/utils/formatter';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as request from 'common/utils/http-request';
import { useAuth } from '~/hooks/useAuth';
import useCartStore from '~/hooks/useCartStore';
import CartContactItem from './cart-contact-list';
import { useCartQuery } from '~/hooks/useCartQuery';

const { Content } = Layout;

const CartContact = () => {
    const auth = useAuth();
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState('CASH_ON_DELIVERY');
    const router = useRouter();
    const itemKeysQuery = router.query.itemKeys as string;

    const onChange = (e: RadioChangeEvent) => {
        setSelectedPaymentMethod(e.target.value);
    };
    const [cartItems, setCartItems] = useState<Cart[]>([]);

    const [totalCartPrice, setTotalCartPrice] = useState(0);
    const { data: cartStorage, deleteListProduct } = useCartStore();
    const { reload: reloadCartQuery } = useCartQuery();
    // lấy dữ liệu product có trong localstorage nếu chưa đăng nhập
    const { data: listProductCart } = useQuery<QueryResponseType<Product>>({
        queryKey: ['list_product_cart'],
        queryFn: async () => {
            return request
                .get('/list-product-cart', {
                    params: {
                        listProductId: itemKeysQuery
                            .split(',')
                            .map((item) => item),
                    },
                })
                .then((res) => res.data);
        },
    });

    // lấy dữ liệu cart từ database nếu đã đăng nhập
    const { data: cartData, isLoading: isCartLoading } = useQuery<
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

    // lọc lấy những sản phẩm được chọn, tính tổng tiền
    useEffect(() => {
        if (itemKeysQuery) {
            const productIds = itemKeysQuery.split(',');
            if (auth) {
                if (cartData?.data) {
                    const filteredCartItems = cartData?.data.filter((item) => {
                        return productIds.includes(item.product?.id as string);
                    });

                    setCartItems(filteredCartItems);
                }
            } else {
                const filteredCartItems = cartStorage.filter((item) =>
                    productIds.includes(item.productId as string)
                );

                const total = listProductCart?.data?.reduce((acc, cur) => {
                    const cartItem = filteredCartItems.find(
                        (item) => item.productId === cur.id
                    );
                    if (cartItem) {
                        const price =
                            cur.discount_price ?? cur.original_price ?? 0;
                        // eslint-disable-next-line no-param-reassign
                        acc += price * (cartItem?.quantity ?? 0);
                    }
                    return acc;
                }, 0);
                setTotalCartPrice(total ?? 0);
                setCartItems(filteredCartItems);
            }
        }
    }, [cartData, cartStorage, auth]);

    const totalPrice = cartItems.reduce(
        (total, item) =>
            total +
            (item.quantity ?? 0) *
                (item.product?.discount_price ??
                    item.product?.original_price ??
                    0),
        0
    );

    const genderOptions = {
        MALE: 'Nam',
        FEMALE: 'Nữ',
    };

    const { data } = useQuery({
        queryKey: ['userContact'],
        queryFn: () => request.get('userContact').then((res) => res.data),
        enabled: !!auth, // Only fetch data when auth is true
    });

    const [form] = Form.useForm();

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                name: data?.data?.name ?? '',
                email: data?.data?.email ?? '',
                gender:
                    genderOptions[
                        data?.data?.gender as keyof typeof genderOptions
                    ] ?? '',
                phone: data?.data?.phone ?? '',
                address: data?.data?.address ?? '',
            });
        }
    }, [data, form]);

    const {
        mutateAsync: createOrderForUser,
        isPending: createOrderForUserIsPending,
    } = useMutation({
        mutationFn: (dataCreateOrder: {
            name: string;
            email: string;
            gender: string;
            phone: string;
            address: string;
            notes: string;
            paymentMethod: string;
            orderDetails: OrderDetail[];
        }) =>
            request
                .post('/my-order/user/create', dataCreateOrder)
                .then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res?.message);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const {
        mutateAsync: createOrderForGuest,
        isPending: createOrderForGuestIsPending,
    } = useMutation({
        mutationFn: (dataCreateOrder: {
            name: string;
            email: string;
            gender: string;
            phone: string;
            address: string;
            notes: string;
            paymentMethod: string;
            orderDetails: OrderDetail[];
        }) =>
            request
                .post('/my-order/guest/create', dataCreateOrder)
                .then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res?.message);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleCreateOrder = async () => {
        const { name, email, gender, phone, address, notes } =
            form.getFieldsValue();
        try {
            await form.validateFields();
        } catch (error) {
            return;
        }
        const orderDetails: OrderDetail[] =
            listProductCart?.data?.map((item) => {
                const quantity =
                    cartItems.find((e) => {
                        if (auth) {
                            return item.id === e.product?.id;
                        }
                        return item.id === e.productId;
                    })?.quantity ?? null;
                return {
                    id: null,
                    quantity,
                    originalPrice: item?.original_price ?? null,
                    discountPrice: item?.discount_price ?? null,
                    totalPrice: item.discount_price
                        ? (item.discount_price ?? 0) * (quantity ?? 0)
                        : (item.original_price ?? 0) * (quantity ?? 0),
                    thumbnail: item?.thumbnail ?? null,
                    brand: item?.brand?.name ?? null,
                    size: item?.size ?? null,
                    category: item?.category?.name ?? null,
                    productId: item?.id ?? null,
                    productName: item?.name ?? null,
                    orderId: null,
                    feedbackId: null,
                };
            }) ?? [];

        const createOrder = async () => {
            if (auth) {
                const newOrder = await createOrderForUser({
                    name,
                    email,
                    gender: Object.keys(genderOptions)[
                        Object.values(genderOptions).indexOf(gender)
                    ],
                    paymentMethod: selectedPaymentMethod,
                    phone,
                    address,
                    notes,
                    orderDetails,
                }).then((res) => res.data);

                reloadCartQuery();
                router.push(`/cart-completion?orderId=${newOrder.id}`);
            } else {
                const newOrder = await createOrderForGuest({
                    name,
                    email,
                    gender: Object.keys(genderOptions)[
                        Object.values(genderOptions).indexOf(gender)
                    ],
                    paymentMethod: selectedPaymentMethod,
                    phone,
                    address,
                    notes,
                    orderDetails,
                }).then((res) => res.data);

                deleteListProduct(itemKeysQuery.split(','));

                router.push(`/cart-completion?orderId=${newOrder.id}`);
            }
        };

        let closable = false;

        Modal.confirm({
            title: 'Xác nhận đơn hàng',
            content: 'Bạn có chắc chắn muốn tạo đơn hàng này?',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: () => {
                createOrder();
                closable = true;
            },
            closable,
        });
    };

    const handleBackToCart = () => {
        router.push(`/cart-details?itemKeys=${itemKeysQuery}`);
    };

    if (!auth) {
        return (
            <Layout>
                <Spin
                    spinning={
                        createOrderForGuestIsPending ||
                        createOrderForUserIsPending
                    }
                >
                    <Content style={{ padding: '0 48px' }}>
                        <Layout style={{ padding: '24px 0' }}>
                            <Content>
                                <Row gutter={16}>
                                    <Col span={10}>
                                        <div>
                                            <Card
                                                bordered={false}
                                                title={
                                                    <div className="font-bold">
                                                        Thông tin mua hàng
                                                    </div>
                                                }
                                            >
                                                <div className="max-h-[75vh] overflow-auto px-5">
                                                    <Form
                                                        form={form}
                                                        layout="vertical"
                                                    >
                                                        <Form.Item
                                                            label="Họ và tên"
                                                            name="name"
                                                            rules={[
                                                                {
                                                                    required:
                                                                        true,
                                                                    message:
                                                                        'Họ và tên không được để trống!',
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label="Email"
                                                            name="email"
                                                            rules={[
                                                                {
                                                                    required:
                                                                        true,
                                                                    message:
                                                                        'Email không được để trống!',
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label="Giới tính"
                                                            name="gender"
                                                            rules={[
                                                                {
                                                                    required:
                                                                        true,
                                                                    message:
                                                                        'Giới tính không được để trống!',
                                                                },
                                                            ]}
                                                        >
                                                            <Select size="large">
                                                                {Object.values(
                                                                    genderOptions
                                                                ).map(
                                                                    (
                                                                        item: string
                                                                    ) => (
                                                                        <Select.Option
                                                                            key={
                                                                                item
                                                                            }
                                                                            value={
                                                                                item
                                                                            }
                                                                        >
                                                                            {
                                                                                item
                                                                            }
                                                                        </Select.Option>
                                                                    )
                                                                )}
                                                            </Select>
                                                        </Form.Item>

                                                        <Form.Item
                                                            label="Số điện thoại"
                                                            name="phone"
                                                            rules={[
                                                                {
                                                                    required:
                                                                        true,
                                                                    message:
                                                                        'Số điện thoại không được để trống!',
                                                                },
                                                                {
                                                                    pattern:
                                                                        /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
                                                                    message:
                                                                        'Please enter a valid phone number!',
                                                                },
                                                            ]}
                                                        >
                                                            <Input size="large" />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label="Địa chỉ"
                                                            name="address"
                                                            rules={[
                                                                {
                                                                    required:
                                                                        true,
                                                                    message:
                                                                        'Địa chỉ không được để trống!',
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label="Ghi chú"
                                                            name="notes"
                                                            rules={[
                                                                {
                                                                    max: 1000,
                                                                    message:
                                                                        'Ghi chú phải ít hơn 1000 ký tự!',
                                                                },
                                                            ]}
                                                        >
                                                            <Input.TextArea
                                                                rows={5}
                                                            />
                                                        </Form.Item>
                                                    </Form>
                                                </div>
                                            </Card>
                                        </div>
                                    </Col>
                                    <Col span={6}>
                                        <Card
                                            bordered={false}
                                            title={
                                                <div className="font-bold">
                                                    Hình thức thanh toán
                                                </div>
                                            }
                                        >
                                            <Radio.Group
                                                onChange={onChange}
                                                value={selectedPaymentMethod}
                                            >
                                                <Space direction="vertical">
                                                    <Radio
                                                        className="mb-2"
                                                        value="CASH_ON_DELIVERY"
                                                    >
                                                        <div className="font-semibold ">
                                                            Thanh toán khi nhận
                                                            hàng(COD)
                                                        </div>
                                                    </Radio>
                                                    {/* <Radio value="BANK_TRANSFER">
                                                        <div className="font-semibold">
                                                            Thanh toán qua
                                                            ZaloPay
                                                        </div>
                                                    </Radio> */}
                                                </Space>
                                            </Radio.Group>
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card
                                            bordered={false}
                                            title={
                                                <div className="font-bold">
                                                    Đơn hàng
                                                </div>
                                            }
                                        >
                                            {cartItems?.map((item) => (
                                                <CartContactItem
                                                    key={item?.productId}
                                                    productId={
                                                        item.productId ?? ''
                                                    }
                                                    quantity={
                                                        item.quantity ?? 0
                                                    }
                                                />
                                            ))}

                                            <div className="text-end text-xl font-bold">
                                                Tổng đơn hàng:{' '}
                                                {currencyFormatter(
                                                    totalCartPrice
                                                )}
                                            </div>
                                            <div className="m-10 flex justify-evenly">
                                                <div>
                                                    <Button
                                                        block
                                                        onClick={
                                                            handleBackToCart
                                                        }
                                                        size="large"
                                                        style={{
                                                            marginBottom: 20,
                                                        }}
                                                        type="primary"
                                                    >
                                                        Quay về giỏ hàng
                                                    </Button>
                                                </div>
                                                <div>
                                                    <Button
                                                        block
                                                        onClick={
                                                            handleCreateOrder
                                                        }
                                                        size="large"
                                                        type="primary"
                                                    >
                                                        Thanh toán
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </Content>
                        </Layout>
                    </Content>
                </Spin>
            </Layout>
        );
    }
    return (
        <Layout>
            <Spin
                spinning={
                    createOrderForGuestIsPending || createOrderForUserIsPending
                }
            >
                <Content style={{ padding: '0 48px' }}>
                    <Layout style={{ padding: '24px 0' }}>
                        <Content>
                            <Row gutter={16}>
                                <Col span={10}>
                                    <div>
                                        <Card
                                            bordered={false}
                                            title={
                                                <div className="font-bold">
                                                    Thông tin mua hàng
                                                </div>
                                            }
                                        >
                                            <div className="max-h-[75vh] overflow-auto px-5">
                                                <Form
                                                    form={form}
                                                    layout="vertical"
                                                >
                                                    <Form.Item
                                                        label="Họ và tên"
                                                        name="name"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message:
                                                                    'Họ và tên không được để trống!',
                                                            },
                                                        ]}
                                                    >
                                                        <Input />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Email"
                                                        name="email"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message:
                                                                    'Email không được để trống!',
                                                            },
                                                        ]}
                                                    >
                                                        <Input />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Giới tính"
                                                        name="gender"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message:
                                                                    'Giới tính không được để trống!',
                                                            },
                                                        ]}
                                                    >
                                                        <Select size="large">
                                                            {Object.values(
                                                                genderOptions
                                                            ).map(
                                                                (
                                                                    item: string
                                                                ) => (
                                                                    <Select.Option
                                                                        key={
                                                                            item
                                                                        }
                                                                        value={
                                                                            item
                                                                        }
                                                                    >
                                                                        {item}
                                                                    </Select.Option>
                                                                )
                                                            )}
                                                        </Select>
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Số điện thoại"
                                                        name="phone"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message:
                                                                    'Số điện thoại không được để trống!',
                                                            },
                                                            {
                                                                pattern:
                                                                    /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
                                                                message:
                                                                    'Please enter a valid phone number!',
                                                            },
                                                        ]}
                                                    >
                                                        <Input size="large" />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Địa chỉ"
                                                        name="address"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message:
                                                                    'Địa chỉ không được để trống!',
                                                            },
                                                        ]}
                                                    >
                                                        <Input />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Ghi chú"
                                                        name="notes"
                                                    >
                                                        <Input.TextArea
                                                            rows={5}
                                                        />
                                                    </Form.Item>
                                                </Form>
                                            </div>
                                        </Card>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <Card
                                        bordered={false}
                                        title={
                                            <div className="font-bold">
                                                Hình thức thanh toán
                                            </div>
                                        }
                                    >
                                        <Radio.Group
                                            onChange={onChange}
                                            value={selectedPaymentMethod}
                                        >
                                            <Space direction="vertical">
                                                <Radio
                                                    className="mb-2"
                                                    value="CASH_ON_DELIVERY"
                                                >
                                                    <div className="font-semibold ">
                                                        Thanh toán khi nhận
                                                        hàng(COD)
                                                    </div>
                                                </Radio>
                                                {/* <Radio value="BANK_TRANSFER">
                                                    <div className="font-semibold">
                                                        Thanh toán qua ZaloPay
                                                    </div>
                                                </Radio> */}
                                            </Space>
                                        </Radio.Group>
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card
                                        bordered={false}
                                        title={
                                            <div className="font-bold">
                                                Đơn hàng
                                            </div>
                                        }
                                    >
                                        <Spin spinning={isCartLoading}>
                                            {cartItems?.map((item) => (
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
                                                            <Col span={6}>
                                                                <div className="text-lg font-semibold">
                                                                    {
                                                                        item
                                                                            .product
                                                                            ?.name
                                                                    }
                                                                </div>
                                                            </Col>
                                                            <Col span={6}>
                                                                <div className="font-semibol mx-6 text-lg">
                                                                    x
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </div>
                                                            </Col>
                                                            <Col span={6}>
                                                                <div className="font-semibol text-lg">
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
                                                            </Col>
                                                        </Row>
                                                    </Content>
                                                </Card>
                                            ))}
                                        </Spin>

                                        <div className="text-end text-xl font-bold">
                                            Tổng đơn hàng:{' '}
                                            {currencyFormatter(totalPrice)}
                                        </div>
                                        <div className="m-10 flex justify-evenly">
                                            <div>
                                                <Button
                                                    block
                                                    onClick={handleBackToCart}
                                                    size="large"
                                                    style={{
                                                        marginBottom: 20,
                                                    }}
                                                    type="primary"
                                                >
                                                    Quay về giỏ hàng
                                                </Button>
                                            </div>
                                            <div>
                                                <Button
                                                    block
                                                    onClick={handleCreateOrder}
                                                    size="large"
                                                    type="primary"
                                                >
                                                    Thanh toán
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Content>
                    </Layout>
                </Content>
            </Spin>
        </Layout>
    );
};

export default CartContact;
