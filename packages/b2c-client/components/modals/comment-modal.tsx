/* eslint-disable react/no-unused-prop-types */
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Form, FormProps, Image, Input, Modal } from 'antd';
import { currencyFormatter } from 'common/utils/formatter';
import { getImageUrl } from 'common/utils/getImageUrl';
import * as request from 'common/utils/http-request';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '~/hooks/useAuth';
import useLoginModal from '~/hooks/useLoginModal';

type Props = {
    productId: string;
    productName: string;
    thumnail: string;
    discount_price: number;
    original_price: number;
};

type FormType = {
    productName: string;
    description: string;
};

const CommentModal: React.FC<Props> = ({
    productId,
    productName,
    thumnail,
    discount_price,
    original_price,
}) => {
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const [form] = Form.useForm();
    const { push } = useRouter();
    const auth = useAuth();
    const { onOpen } = useLoginModal();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: { productId: string; description: string }) =>
            request.post('/comment/add', data).then((res) => res.data),
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
            description: values.description,
        });
    };

    const handleOpen = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!auth) {
            onOpen();
            return;
        }
        setIsOpenModal(true);
    };

    return (
        <div>
            <div onClick={(e) => handleOpen(e)} role="presentation">
                <Button>Phản hồi</Button>
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
                title="Phản hồi sản phẩm"
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
                                            </div>
                                            <div className="flex items-center gap-4 text-lg">
                                                <div className="flex gap-2">
                                                    <span
                                                        className={
                                                            discount_price
                                                                ? 'text-gray-400 line-through'
                                                                : ''
                                                        }
                                                    >
                                                        {original_price &&
                                                            currencyFormatter(
                                                                original_price
                                                            )}
                                                    </span>
                                                    <span>
                                                        {discount_price > 0 &&
                                                            currencyFormatter(
                                                                discount_price
                                                            )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Form.Item>
                            <Form.Item
                                label="Phản hồi"
                                name="description"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Hãy thêm phản hồi của bạn về sản phẩm',
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    placeholder="Phản hồi sản phẩm"
                                    rows={5}
                                    style={{ resize: 'none' }}
                                />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default CommentModal;
