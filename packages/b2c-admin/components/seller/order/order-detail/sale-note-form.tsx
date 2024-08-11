import { useMutation } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import * as request from 'common/utils/http-request';
import { QueryResponseGetOneType } from 'common/types';
import { toast } from 'react-toastify';
import { Button, Form, FormProps, Input } from 'antd';
import { Order } from '~/types/order';

type Props = {
    orderId: string;
    saleNote?: string | null;
    reloadDetail: () => void;
    reloadActivity: () => void;
};

type FormType = {
    saleNote?: string | null;
};

const SaleNoteForm: React.FC<Props> = ({
    orderId,
    saleNote,
    reloadActivity,
    reloadDetail,
}) => {
    const [form] = Form.useForm();

    const { mutate } = useMutation({
        mutationFn: (data: FormType) =>
            request
                .put(`order/update-sale-note/${orderId}`, data)
                .then((res) => res.data),
        onSuccess: (res: QueryResponseGetOneType<Order>) => {
            toast.success(res.message);
            reloadActivity();
            reloadDetail();
        },
        onError: () => {
            toast.error('Something went wrong!');
        },
    });

    useEffect(() => {
        form.setFieldsValue({
            saleNote,
        });
    }, [saleNote, orderId]);

    const onFinish: FormProps<FormType>['onFinish'] = (values) => {
        if (!orderId) {
            return;
        }

        mutate(values);
    };

    return (
        <div>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item<FormType>
                    label="Sale note"
                    name="saleNote"
                    rules={[
                        { required: true, message: 'Please enter sale note.' },
                        {
                            max: 1000,
                            message:
                                'Sale note cannot be longer than 100 characters.',
                        },
                    ]}
                >
                    <Input.TextArea rows={8} />
                </Form.Item>
                <Form.Item className="flex justify-end">
                    <Button htmlType="submit" type="primary">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

SaleNoteForm.defaultProps = {
    saleNote: undefined,
};

export default SaleNoteForm;
