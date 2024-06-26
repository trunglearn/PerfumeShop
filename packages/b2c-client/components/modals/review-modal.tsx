import { useMutation } from '@tanstack/react-query';
import { Button, Card, Form, FormProps, Image, Input, Modal, Rate } from 'antd';
import { getImageUrl } from 'common/utils/getImageUrl';
import * as request from 'common/utils/http-request';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
    productId: string;
    productName: string;
    thumnail: string;
    size: string;
    category: string;
};

type FormType = {
    productName: string;
    rating: number;
    description: string;
};

const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];

const ReviewModal: React.FC<Props> = ({
    productId,
    productName,
    thumnail,
    size,
    category,
}) => {
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const [form] = Form.useForm();
    const { push } = useRouter();
    const { mutate, isPending } = useMutation({
        mutationFn: (data: {
            productId: string;
            rating: number;
            description: string;
        }) => request.post('/feedback/add', data).then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res?.message);
            form.resetFields();
            setTimeout(() => {
                setIsOpenModal(false);
            }, 500);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const onFinish: FormProps<FormType>['onFinish'] = async (values) => {
        mutate({
            productId,
            rating: values.rating ?? 5,
            description: values.description,
        });
    };

    return (
        <div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpenModal(true);
                }}
                role="presentation"
            >
                <Button size="large" type="primary">
                    Đánh giá
                </Button>
            </div>

            <Modal
                cancelText="Trở lại"
                centered
                closable={!isPending}
                maskClosable={false}
                okText="Hoàn thành"
                onCancel={() => setIsOpenModal(false)}
                onOk={() => form.submit()}
                open={isOpenModal}
                title="Đánh giá sản phẩm"
                width={600}
            >
                <div className="max-h-[75vh] overflow-auto px-5">
                    <Form
                        disabled={isPending}
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <div className="">
                            <Form.Item label="Sản phẩm">
                                <Card
                                    className="my-2"
                                    hoverable
                                    key={productId}
                                    onClick={() =>
                                        push(`/product/${productId}`)
                                    }
                                >
                                    <div className=" flex h-full items-center">
                                        <Image
                                            className="pr-4"
                                            height={80}
                                            preview={false}
                                            src={getImageUrl(thumnail)}
                                        />
                                        <div className="flex h-full w-full justify-between">
                                            <div className="flex-col gap-8">
                                                <p className="text-xl">
                                                    {productName}
                                                </p>
                                                <p className="text-base text-gray-500">
                                                    Phân loại hàng: {category},{' '}
                                                    {size}
                                                    ml
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Form.Item>
                            <Form.Item
                                label="Chất lượng sản phẩm"
                                name="rating"
                            >
                                <Rate defaultValue={5} tooltips={desc} />
                            </Form.Item>
                            <Form.Item
                                label="Phản hồi"
                                name="description"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Hãy thêm đánh giá của bạn về sản phẩm',
                                    },
                                ]}
                                style={{ resize: 'none' }}
                            >
                                <Input.TextArea
                                    placeholder="Phản hồi sản phẩm"
                                    rows={4}
                                />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default ReviewModal;
