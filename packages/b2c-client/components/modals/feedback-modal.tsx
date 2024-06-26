import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, Modal } from 'antd';
import * as request from 'common/utils/http-request';
import React from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '~/hooks/useAuth';
import styles from '../../styles/feedback-modal.module.css';

type FeedbackModalProps = {
    visible: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({
    visible,
    onClose,
    productId,
    productName,
}) => {
    const [form] = Form.useForm();
    const auth = useAuth();

    const addFeedback = useMutation({
        mutationFn: async (data: {
            productId: string;
            description: string;
        }) => {
            if (!auth || !(auth as { access_token: string }).access_token) {
                throw new Error('No access token available');
            }

            const token = (auth as { access_token: string }).access_token;

            return request.post('/feedback/add', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        onSuccess: () => {
            toast.success('Phản hồi sản phẩm thành công!');
            form.resetFields();
            onClose();
        },
        onError: () => {
            toast.error('Đã có lỗi xảy ra.');
        },
    });

    const handleFinish = (values: { description: string }) => {
        addFeedback.mutate({
            productId,
            description: values.description,
        });
    };

    return (
        <Modal
            footer={null}
            onCancel={onClose}
            title="Phản hồi sản phẩm"
            visible={visible}
        >
            <Form
                className={styles.feedbackForm}
                form={form}
                layout="vertical"
                onFinish={handleFinish}
            >
                <Form.Item label="Sản phẩm">
                    <Input
                        className={styles.productNameInput}
                        value={productName}
                    />
                </Form.Item>
                <Form.Item
                    label="Phản hồi"
                    name="description"
                    rules={[
                        {
                            required: true,
                            message: 'Hãy thêm phản hồi của bạn về sản phẩm',
                        },
                    ]}
                >
                    <Input.TextArea
                        placeholder="Phản hồi sản phẩm"
                        rows={4}
                        style={{ resize: 'none' }}
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        className={styles.submitButton}
                        htmlType="submit"
                        type="primary"
                    >
                        Phản hồi
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default FeedbackModal;
