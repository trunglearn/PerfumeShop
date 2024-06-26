/* eslint-disable max-lines */
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Button,
    Form,
    FormProps,
    Image,
    Input,
    Pagination,
    Select,
    Spin,
    Switch,
    Table,
    TableColumnsType,
    TableProps,
    Tag,
} from 'antd';
import { AxiosError } from 'axios';
import { PAGE_SIZE } from 'common/constant';
import { getImageUrl } from 'common/utils/getImageUrl';
import { getSortOrder } from 'common/utils/getSortOrder';
import * as request from 'common/utils/http-request';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Header from '~/components/header';
import { Slider } from '~/types/slider';
import DeleteSliderAlert from './delete-slider-alert';
import SliderFormModal from './slider-form-modal';

type FormType = {
    search?: string;
    isShow?: boolean;
};

type SearchParams = FormType & {
    pageSize?: number;
    currentPage?: number;
};

type OnChange = NonNullable<TableProps<FormType>['onChange']>;

type GetSingle<T> = T extends (infer U)[] ? U : never;

type Sorts = GetSingle<Parameters<OnChange>[2]>;

const SliderList = () => {
    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useState<SearchParams>({
        pageSize: PAGE_SIZE,
        currentPage: 1,
    });
    const [sortedInfo, setSortedInfo] = useState<Sorts>({});

    const {
        data: listSlider,
        isLoading: listSliderLoading,
        refetch,
    } = useQuery({
        queryKey: ['product'],
        queryFn: () =>
            request
                .get('manage/listSlider', {
                    params: {
                        ...searchParams,
                        orderName: sortedInfo?.field,
                        order: getSortOrder(sortedInfo?.order),
                    },
                })
                .then((res) => res.data),
    });
    const {
        mutate: updateSliderStatusTrigger,
        isPending: updateSliderStatusIsPending,
        isSuccess: updateSliderStatusIsSuccess,
    } = useMutation({
        mutationFn: ({
            sliderId,
            isShow,
        }: {
            sliderId: string;
            isShow: boolean;
        }) => {
            return request
                .put(`slider/updateStatus/${sliderId}`, { isShow })
                .then((res) => res.data);
        },
        onSuccess: (res) => toast.success(res.message),
        onError: (
            error: AxiosError<{
                isOk?: boolean | null;
                message?: string | null;
            }>
        ) => toast.error(error.response?.data.message),
    });

    useEffect(() => {
        if (updateSliderStatusIsSuccess) refetch();
    }, [updateSliderStatusIsSuccess]);

    const columns: TableColumnsType<Slider> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 180,
            align: 'center',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 180,
            align: 'center',
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'title' ? sortedInfo.order : null,
        },
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            width: 150,
            align: 'center',
            render: (value: string) => (
                <Image height={80} src={getImageUrl(value)} width={80} />
            ),
        },
        {
            title: 'Backlink',
            dataIndex: 'backlink',
            align: 'center',
            key: 'backlink',
            width: 150,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === 'backlink' ? sortedInfo.order : null,
            render: (value: string) => (
                <div className="max-h-[200px] w-full overflow-hidden ">
                    <a
                        className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap "
                        href={value}
                        rel="noreferrer"
                        target="_blank"
                    >
                        {value}
                    </a>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'isShow',
            align: 'center',
            key: 'isShow',
            render: (value: boolean, record: Slider) => {
                return (
                    <Switch
                        checked={value}
                        checkedChildren="Show"
                        disabled={updateSliderStatusIsPending}
                        onChange={(checked: boolean) => {
                            updateSliderStatusTrigger({
                                sliderId: record?.id || '',
                                isShow: checked,
                            });
                        }}
                        unCheckedChildren="Hide"
                    />
                );
            },
            width: 120,
        },
        {
            title: 'Actions',
            align: 'center',
            key: 'actions',
            width: 150,
            render: (_: undefined, record: Slider) => (
                <div className="flex w-full justify-center gap-1">
                    <SliderFormModal
                        content="View"
                        reload={() => refetch()}
                        sliderId={record?.id ?? ''}
                        type="VIEW"
                    />
                    <SliderFormModal
                        content="Create slider"
                        reload={() => {
                            refetch();
                        }}
                        sliderId={record?.id ?? ''}
                        type="UPDATE"
                    />
                    <DeleteSliderAlert
                        reload={() => {
                            refetch();
                        }}
                        sliderId={record?.id ?? ''}
                        sliderTitle={record?.title ?? ''}
                    />
                </div>
            ),
        },
    ];

    const onFinish: FormProps<FormType>['onFinish'] = (values) => {
        setSearchParams((prev) => ({ ...prev, ...values, currentPage: 1 }));
        setTimeout(() => {
            refetch();
        });
    };

    const handleTableChange: TableProps<Slider>['onChange'] = (
        pagination,
        filters,
        sorter
    ) => {
        setSortedInfo(sorter as Sorts);
        setTimeout(() => {
            refetch();
        }, 500);
    };

    return (
        <Spin spinning={listSliderLoading}>
            <Header title="Manage Slider" />
            <div>
                <Form
                    className="flex gap-x-10"
                    form={form}
                    labelCol={{ span: 6 }}
                    onFinish={onFinish}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            form.submit();
                        }
                    }}
                    wrapperCol={{ span: 18 }}
                >
                    <div className="grid flex-1 grid-cols-2 justify-end gap-x-5 xl:grid-cols-3">
                        <Form.Item<FormType> label="Search " name="search">
                            <Input
                                allowClear
                                placeholder="Enter slider title or backlink..."
                            />
                        </Form.Item>
                        <Form.Item<FormType> label="Status" name="isShow">
                            <Select
                                allowClear
                                placeholder="Choose show on client..."
                            >
                                <Select.Option value="true">
                                    <Tag color="blue">SHOW</Tag>
                                </Select.Option>
                                <Select.Option value="false">
                                    <Tag color="red">HIDE</Tag>
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <div className="flex-col">
                        <Form.Item>
                            <Button
                                htmlType="submit"
                                icon={<SearchOutlined />}
                                type="primary"
                            >
                                Search
                            </Button>
                        </Form.Item>
                        <Form.Item className="w-full">
                            <Button
                                htmlType="reset"
                                icon={<SyncOutlined />}
                                onClick={() => {
                                    form.resetFields();
                                    form.submit();
                                }}
                                type="primary"
                            >
                                <span className="pr-2">Reset</span>
                            </Button>
                        </Form.Item>
                        <Form.Item className="w-full">
                            <SliderFormModal
                                content="Create slider"
                                reload={() => {
                                    refetch();
                                }}
                                type="CREATE"
                            />
                        </Form.Item>
                    </div>
                </Form>
            </div>

            <div>
                <Table
                    bordered
                    columns={columns}
                    dataSource={listSlider?.data}
                    onChange={handleTableChange}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    tableLayout="fixed"
                />
                <div className="mt-5 flex justify-end">
                    {listSlider?.pagination?.total ? (
                        <Pagination
                            current={searchParams?.currentPage}
                            defaultCurrent={1}
                            onChange={(page, pageSize) => {
                                setSearchParams((prev) => ({
                                    ...prev,
                                    currentPage: page,
                                    pageSize,
                                }));
                                setTimeout(() => {
                                    refetch();
                                });
                            }}
                            pageSize={searchParams?.pageSize}
                            pageSizeOptions={[5, 10, 20, 50]}
                            showSizeChanger
                            total={listSlider?.pagination?.total}
                        />
                    ) : null}
                </div>
            </div>
        </Spin>
    );
};

export default SliderList;
