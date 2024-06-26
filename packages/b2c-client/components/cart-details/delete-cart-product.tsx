import { DeleteOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Button, Modal, Tooltip } from 'antd';
import React, { useState } from 'react';
import * as request from 'common/utils/http-request';
import { toast } from 'react-toastify';
import { useCartQuery } from '~/hooks/useCartQuery';

type Props = {
    cartId: string;
    productId: string;

    reload: () => void;
};

const DeleteCartProductFormModal: React.FC<Props> = ({
    cartId,
    productId,
    reload,
}) => {
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const { reload: reloadCart } = useCartQuery();
    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            request.del(`cart/delete/${cartId}`).then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res?.message);
            setTimeout(() => {
                setIsOpenModal(false);
                reload();
                reloadCart();
            }, 500);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return (
        <div>
            <Tooltip color="red" title="Delete">
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setIsOpenModal(true)}
                    type="text"
                />
            </Tooltip>
            <Modal
                centered
                closable={!isPending}
                maskClosable={false}
                onCancel={() => setIsOpenModal(false)}
                onOk={() => mutate()}
                open={isOpenModal}
                title="Delete Product"
                width={800}
            >
                <div className="text-center">
                    <div className="py-5 text-xl font-semibold text-rose-600">
                        Do you want delete this product?
                    </div>
                    <div>
                        <span className="font-semibold">Mã sản phẩm:</span>{' '}
                        {productId}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DeleteCartProductFormModal;
