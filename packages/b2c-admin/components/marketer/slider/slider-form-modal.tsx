/* eslint-disable max-lines */
import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Button,
    Checkbox,
    ColorPicker,
    Form,
    FormProps,
    GetProp,
    Image,
    Input,
    Modal,
    Spin,
    Tooltip,
    Upload,
    UploadFile,
} from 'antd';
import { Color } from 'antd/es/color-picker';
import { RcFile, UploadProps } from 'antd/es/upload';
import { getImageUrl } from 'common/utils/getImageUrl';
import * as request from 'common/utils/http-request';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
    type: 'CREATE' | 'UPDATE' | 'VIEW';
    content: string;
    reload: () => void;
    sliderId?: string;
};

type FormType = {
    title: string;
    note: string;
    backlink: string;
    isShow: boolean;
    imageList: UploadFile[];
    titleTextColor: string;
    noteTextColor: string;
    backgroundSliderColor: string;
};

type SliderRequestType = {
    title: string | null;
    note: string | null;
    backlink: string | null;
    isShow: boolean | null;
    image: string | null;
    titleTextColor: string;
    noteTextColor: string;
    backgroundSliderColor: string;
};

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const SliderFormModal: React.FC<Props> = ({
    content,
    type,
    reload,
    sliderId,
}) => {
    const [form] = Form.useForm();
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [isUploadedImage, setIsUploadedImage] = useState<boolean>(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const button = useMemo(() => {
        switch (type) {
            case 'CREATE':
                return (
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => setIsOpenModal(true)}
                        type="primary"
                    >
                        <span className="pr-1">Create</span>
                    </Button>
                );
            case 'UPDATE':
                return (
                    <Tooltip arrow={false} color="#108ee9" title="Update">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => setIsOpenModal(true)}
                            shape="circle"
                            type="link"
                        />
                    </Tooltip>
                );
            case 'VIEW':
                return (
                    <Tooltip arrow={false} color="#108ee9" title="View">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => setIsOpenModal(true)}
                            shape="circle"
                            type="link"
                        />
                    </Tooltip>
                );
            default:
                return null;
        }
    }, [type]);

    const { mutateAsync: uploadFileTrigger, isPending: uploadFileIsPending } =
        useMutation({
            mutationFn: (files: RcFile[]) => {
                const formData = new FormData();
                files.forEach((file) => formData.append('files', file));
                return request.post('upload', formData).then((res) => res.data);
            },
            onError: () => {
                toast.error('Upload file failed!');
            },
        });

    const {
        mutate: createSlider,
        isPending: createSliderIsPending,
        isSuccess: createSliderIsSuccess,
    } = useMutation({
        mutationFn: (data: SliderRequestType) => {
            return request.post('/slider/create', data).then((res) => res.data);
        },
        onSuccess: (res) => {
            toast.success(res?.message);
            setTimeout(() => {
                setIsOpenModal(false);
                reload();
            }, 500);
        },
        onError: (error) => {
            toast.error(error?.message);
        },
    });

    const {
        mutate: updateSlider,
        isPending: updateSliderIsPending,
        isSuccess: updateSliderIsSuccess,
    } = useMutation({
        mutationFn: (data: SliderRequestType) => {
            return request
                .put(`/slider/update/${sliderId}`, data)
                .then((res) => res.data);
        },
        onSuccess: (res) => {
            toast.success(res?.message);
            setTimeout(() => {
                setIsOpenModal(false);
                reload();
            }, 500);
        },
        onError: (error) => {
            toast.error(error?.message);
        },
    });

    const { data: sliderDetail, isLoading: getSliderIsPending } = useQuery({
        queryKey: ['slider', sliderId],
        queryFn: () =>
            request.get(`/manage/slider/${sliderId}`).then((res) => res.data),
        enabled: !!isOpenModal && !!sliderId,
    });

    useEffect(() => {
        if ((createSliderIsSuccess || updateSliderIsSuccess) && !isOpenModal) {
            setIsUploadedImage(false);
        }
    }, [createSliderIsSuccess, updateSliderIsSuccess, isOpenModal]);

    useEffect(() => {
        if (isOpenModal && !sliderId) {
            form.resetFields();
        }

        if (isOpenModal && sliderDetail?.data?.image) {
            setIsUploadedImage(true);
        }
        if (isOpenModal && sliderId && sliderDetail) {
            form.setFieldsValue({
                title: sliderDetail?.data?.title,
                note: sliderDetail?.data?.note,
                backlink: sliderDetail?.data?.backlink,
                isShow: sliderDetail?.data?.isShow,
                titleTextColor: sliderDetail.data?.titleTextColor,
                noteTextColor: sliderDetail.data?.noteTextColor,
                backgroundSliderColor: sliderDetail.data?.backgroundSliderColor,
                imageList: sliderDetail?.data?.image
                    ? [
                          {
                              uid: '-1',
                              name: sliderDetail?.data?.image ?? '',
                              status: 'done',
                              url: getImageUrl(sliderDetail?.data?.image),
                          },
                      ]
                    : undefined,
            });
        }
    }, [isOpenModal, sliderId, sliderDetail]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const onFinish: FormProps<FormType>['onFinish'] = async (values) => {
        const {
            title,
            backlink,
            note,
            isShow,
            backgroundSliderColor,
            noteTextColor,
            titleTextColor,
        } = values;

        if (type === 'CREATE') {
            const imageList = values?.imageList?.map(
                (file) => file.originFileObj
            );
            const imageResponse = await uploadFileTrigger(
                (imageList as RcFile[]) ?? []
            )?.then((res) => res.imageUrls);

            const imageRequest = imageResponse?.map((image: string) => ({
                url: image,
            }));

            createSlider({
                title,
                note,
                backlink,
                isShow,
                image: imageRequest?.[0].url ?? '',
                backgroundSliderColor,
                noteTextColor,
                titleTextColor,
            });
        }

        if (type === 'UPDATE' && sliderId) {
            const newImage =
                values?.imageList?.[0]?.status === 'done'
                    ? [values?.imageList?.[0]?.name]
                    : await uploadFileTrigger(
                          values?.imageList?.map(
                              (item) => item.originFileObj as RcFile
                          ) ?? []
                      ).then((res) => res?.imageUrls);

            const submitObj = {
                title,
                note,
                backlink,
                isShow,
                image: newImage?.[0] ?? '',
                backgroundSliderColor,
                noteTextColor,
                titleTextColor,
            };

            updateSlider(submitObj);
        }
    };

    return (
        <div>
            {button}
            <Modal
                closable={
                    !uploadFileIsPending ||
                    !createSliderIsPending ||
                    !getSliderIsPending ||
                    !updateSliderIsPending
                }
                footer={false}
                maskClosable={false}
                onCancel={() => setIsOpenModal(false)}
                open={isOpenModal}
                title={content}
                width={800}
            >
                <Spin
                    spinning={
                        uploadFileIsPending ||
                        createSliderIsPending ||
                        getSliderIsPending ||
                        updateSliderIsPending
                    }
                >
                    <div className="max-h-[75vh] overflow-auto px-5">
                        <Form
                            disabled={
                                uploadFileIsPending ||
                                createSliderIsPending ||
                                getSliderIsPending ||
                                updateSliderIsPending
                            }
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item
                                getValueFromEvent={normFile}
                                label="Image"
                                name="imageList"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Slider image must be required!',
                                    },
                                ]}
                                valuePropName="fileList"
                            >
                                <Upload
                                    accept=".png, .jpg, .jpeg"
                                    beforeUpload={() => false}
                                    disabled={type === 'VIEW'}
                                    listType="picture-card"
                                    maxCount={1}
                                    onChange={({ fileList }) =>
                                        setIsUploadedImage(fileList.length > 0)
                                    }
                                    onPreview={handlePreview}
                                    onRemove={() => setIsUploadedImage(false)}
                                >
                                    {isUploadedImage ? null : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>
                                                Upload
                                            </div>
                                        </div>
                                    )}
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
                            <Form.Item<FormType> label="Title" name="title">
                                <Input
                                    readOnly={type === 'VIEW' ?? false}
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item<FormType>
                                getValueFromEvent={(color) => {
                                    return color.toHexString();
                                }}
                                label="Title text color"
                                name="titleTextColor"
                            >
                                <ColorPicker
                                    disabled={type === 'VIEW'}
                                    showText
                                />
                            </Form.Item>

                            <Form.Item label="Backlink" name="backlink">
                                <Input.TextArea
                                    readOnly={type === 'VIEW' ?? false}
                                    rows={5}
                                    size="large"
                                    style={{ resize: 'none' }}
                                />
                            </Form.Item>

                            <Form.Item label="Note" name="note">
                                <Input.TextArea
                                    readOnly={type === 'VIEW' ?? false}
                                    rows={5}
                                    size="large"
                                    style={{ resize: 'none' }}
                                />
                            </Form.Item>
                            <Form.Item<FormType>
                                getValueFromEvent={(color) => {
                                    return color.toHexString();
                                }}
                                label="Note text color"
                                name="noteTextColor"
                            >
                                <ColorPicker
                                    disabled={type === 'VIEW'}
                                    showText
                                />
                            </Form.Item>

                            <Form.Item<FormType>
                                getValueFromEvent={(color: Color) => {
                                    return color.toHexString();
                                }}
                                label="Back ground color"
                                name="backgroundSliderColor"
                            >
                                <ColorPicker
                                    disabled={type === 'VIEW'}
                                    showText
                                />
                            </Form.Item>

                            <Form.Item name="isShow" valuePropName="checked">
                                {type === 'VIEW' ? (
                                    <Checkbox
                                        checked={form.getFieldValue('isShow')}
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        Show slider on client page
                                    </Checkbox>
                                ) : (
                                    <Checkbox>
                                        Show slider on client page
                                    </Checkbox>
                                )}
                            </Form.Item>

                            <Form.Item>
                                <div className="flex gap-4">
                                    <Button
                                        loading={
                                            createSliderIsPending ||
                                            updateSliderIsPending
                                        }
                                        onClick={() => setIsOpenModal(false)}
                                        type="default"
                                    >
                                        Return
                                    </Button>
                                    <Button
                                        hidden={type === 'VIEW'}
                                        htmlType="submit"
                                        loading={
                                            createSliderIsPending ||
                                            updateSliderIsPending
                                        }
                                        type="primary"
                                    >
                                        {type === 'CREATE'
                                            ? 'Create'
                                            : 'Update'}
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    </div>
                </Spin>
            </Modal>
        </div>
    );
};

SliderFormModal.defaultProps = {
    sliderId: undefined,
};

export default SliderFormModal;
