import { PlusOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import {
    Button,
    Card,
    Form,
    FormProps,
    GetProp,
    Image,
    Input,
    Modal,
    Rate,
    Upload,
    UploadFile,
    UploadProps,
} from 'antd';
import { RcFile } from 'antd/es/upload';
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
    orderDetailId: string;
    reload: () => void;
};

type FormType = {
    productName: string;
    rating: number;
    description: string;
    imageList?: UploadFile[];
};

const desc = ['Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normFile = (e: any) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};

const FeedBackModal: React.FC<Props> = ({
    productId,
    productName,
    thumnail,
    size,
    category,
    orderDetailId,
    reload,
}) => {
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const [form] = Form.useForm();
    const { push } = useRouter();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const { mutate, isPending } = useMutation({
        mutationFn: (data: {
            productId: string;
            rating: number;
            description: string;
            orderDetailId: string;
            images: string;
        }) => request.post('/feedback/add', data).then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res?.message);
            form.resetFields();
            setTimeout(() => {
                reload();
                setIsOpenModal(false);
            }, 500);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const { mutateAsync: uploadFileTrigger, isPending: uploadFileIsPending } =
        useMutation({
            mutationFn: (fileList: RcFile[]) => {
                const formData = new FormData();
                fileList.forEach((file) => formData.append('files', file));
                return request.post('upload', formData).then((res) => res.data);
            },
            onError: () => {
                toast.error('Upload file failed!');
            },
        });

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const onFinish: FormProps<FormType>['onFinish'] = async (values) => {
        const imageList = values?.imageList?.map((file) => file.originFileObj);

        const imageListResponse = await uploadFileTrigger(
            (imageList as RcFile[]) ?? []
        )?.then((res) => res.imageUrls);

        const imageListRequest = imageListResponse?.map((image: string) => ({
            url: image,
        }));

        mutate({
            productId,
            rating: values.rating ?? 5,
            description: values.description,
            orderDetailId,
            images: imageListRequest ?? [],
        });
    };

    return (
        <div>
            <div
                onClick={(e) => {
                    e.preventDefault();
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
                closable={!isPending || !uploadFileIsPending}
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
                                getValueFromEvent={normFile}
                                label="Avatar"
                                name="imageList"
                            >
                                <Upload
                                    accept=".png, .jpg, .jpeg"
                                    beforeUpload={() => false}
                                    listType="picture-card"
                                    maxCount={8}
                                    onPreview={handlePreview}
                                >
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>
                                            Upload
                                        </div>
                                    </div>
                                </Upload>
                            </Form.Item>
                            <div>
                                {previewImage && (
                                    <Image
                                        preview={{
                                            visible: previewOpen,
                                            onVisibleChange: (visible) =>
                                                setPreviewOpen(visible),
                                            afterOpenChange: (visible) =>
                                                !visible && setPreviewImage(''),
                                        }}
                                        src={previewImage}
                                        wrapperStyle={{ display: 'none' }}
                                    />
                                )}
                            </div>
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

export default FeedBackModal;
