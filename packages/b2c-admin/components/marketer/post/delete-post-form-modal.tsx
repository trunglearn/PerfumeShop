import { DeleteOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Button, Modal, Tooltip } from 'antd';
import React, { useState } from 'react';
import * as request from 'common/utils/http-request';
import { toast } from 'react-toastify';

type Props = {
    postId: string;
    title: string;

    reload: () => void;
};

const DeletePostFormModal: React.FC<Props> = ({ postId, title, reload }) => {
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            request.del(`post/delete/${postId}`).then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res?.message);
            setTimeout(() => {
                setIsOpenModal(false);
                reload();
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
                title="Delete Post"
                width={800}
            >
                <div className="text-center">
                    <div className="py-5 text-xl font-semibold text-rose-600">
                        Do you want delete this post?
                    </div>
                    <div>
                        <span className="font-semibold">Post ID:</span> {postId}
                    </div>
                    <div>
                        <span className="font-semibold">Title:</span> {title}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DeletePostFormModal;
