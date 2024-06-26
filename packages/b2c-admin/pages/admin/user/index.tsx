/* eslint-disable max-lines */
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
    Button,
    DatePicker,
    Form,
    FormProps,
    Input,
    Pagination,
    Select,
    Spin,
    Table,
    TableColumnsType,
} from 'antd';
import { PAGE_SIZE } from 'common/constant';
import request from 'common/utils/http-request';
import { useState } from 'react';
import { Moment } from 'moment';
import Header from '~/components/header';
import { User } from '~/types/user';
import DeleteUserModal from '../../../components/admin/user/delete-user-modal';
import UserFormModal from '../../../components/admin/user/user-form-modal';

interface DataType {
    key: string;
    id: string;
    name: string;
    role: string;
    email: string;
    gender: string;
    phone: string;
    dob: string;
    status: string;
    address: string;
}

const FILTER_LIST = [
    {
        id: 'NAME_A_TO_Z',
        name: 'Name: A to Z',
    },
    {
        id: 'NAME_Z_TO_A',
        name: 'Name: Z to A',
    },
    {
        id: 'EMAIL_A_TO_Z',
        name: 'Email: A to Z',
    },
    {
        id: 'EMAIL_Z_TO_A',
        name: 'Email: Z to A',
    },
    {
        id: 'GENDER_A_TO_Z',
        name: 'Gender: A to Z',
    },
    {
        id: 'GENDER_Z_TO_A',
        name: 'Gender: Z to A',
    },
    {
        id: 'PHONE_LOW_TO_HIGH',
        name: 'Phone: Low to High',
    },
    {
        id: 'PHONE_HIGH_TO_LOW',
        name: 'Phone: High to Low',
    },
    {
        id: 'ROLE_A_TO_Z',
        name: 'Role: A to Z',
    },
    {
        id: 'ROLE_Z_TO_A',
        name: 'Role: Z to A',
    },
    {
        id: 'STATUS_A_TO_Z',
        name: 'Status: A to Z',
    },
    {
        id: 'STATUS_Z_TO_A',
        name: 'Status: Z to A',
    },
    {
        id: 'LATEST',
        name: 'Latest Create Date',
    },
    {
        id: 'OLDEST',
        name: 'Oldest Create Date',
    },
];

const filterRole = [
    {
        id: 'ADMIN',
        name: 'Admin',
    },
    {
        id: 'USER',
        name: 'User',
    },
    {
        id: 'MARKETER',
        name: 'Marketer',
    },
    {
        id: 'SELLER',
        name: 'Seller',
    },
];

const filterGender = [
    {
        id: 'MALE',
        name: 'Male',
    },
    {
        id: 'FEMALE',
        name: 'Female',
    },
];

const filterStatus = [
    {
        id: 'ACTIVE',
        name: 'Active',
    },
    {
        id: 'INACTIVE',
        name: 'Inactive',
    },
    {
        id: 'BANNED',
        name: 'Banned',
    },
    {
        id: 'NEWLY_REGISTER',
        name: 'Newly register',
    },
    {
        id: 'NEWLY_BOUGHT',
        name: 'Newly bought',
    },
];
type FormType = {
    searchBy?: string;
    search?: string;
    filterBy?: string;
    filter?: string;
    sortBy?: string;
    dateRange?: [Moment, Moment];
    startDate?: string;
    endDate?: string;
};

const searchBy = [
    {
        id: 'name',
        name: 'Name',
    },
    {
        id: 'email',
        name: 'Email',
    },
    {
        id: 'phone',
        name: 'Phone',
    },
];

type SearchParams = FormType & {
    pageSize?: number;
    currentPage?: number;
};

const ListUser = () => {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        pageSize: PAGE_SIZE,
        currentPage: 1,
    });
    const { RangePicker } = DatePicker;
    const [form] = Form.useForm();
    const {
        data: listUser,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['listUser'],
        queryFn: () =>
            request
                .get('/admin/user-list', {
                    params: { ...searchParams },
                })
                .then((res) => res.data),
    });

    const columns: TableColumnsType<DataType> = [
        {
            title: 'Index',
            key: 'index',
            dataIndex: 'index',
            width: '10%',
            render: (id: string, record: User, index: number) => {
                return (
                    index +
                    1 +
                    ((searchParams?.currentPage ?? 1) - 1) *
                        (searchParams?.pageSize ?? 0)
                );
            },
        },
        {
            title: 'Full name',
            key: 'name',
            dataIndex: 'name',
            width: '15%',
        },
        {
            title: 'Gender',
            key: 'gender',
            dataIndex: 'gender',
            width: '10%',
        },
        {
            title: 'Email',
            key: 'email',
            dataIndex: 'email',
            width: '20%',
        },
        {
            title: 'Phone',
            key: 'phone',
            dataIndex: 'phone',
            width: '10%',
        },
        {
            title: 'Role',
            key: 'role',
            dataIndex: 'role',
            width: '10%',
            render: (record: string) => {
                const role = filterRole.find((r) => r.id === record);
                return role ? role.name : record;
            },
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: '10%',
            render: (record: string) => {
                const role = filterStatus.find((s) => s.id === record);
                return role ? role.name : record;
            },
        },
        {
            title: 'Date Created',
            key: 'createdAt',
            dataIndex: 'createdAt',
            width: '10%',
            render: (record: string) => {
                return record.split('T')[0];
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: User) => (
                <div className="flex w-full justify-center gap-1">
                    <UserFormModal
                        reload={() => refetch()}
                        title="Edit user"
                        type="VIEW"
                        userId={record?.id ?? ''}
                    />
                    <UserFormModal
                        reload={() => refetch()}
                        title="Edit user"
                        type="EDIT"
                        userId={record?.id ?? ''}
                    />
                    <div>
                        <DeleteUserModal
                            reload={() => refetch()}
                            userId={record?.id ?? ''}
                            userName={record?.name ?? ''}
                        />
                    </div>
                </div>
            ),
            align: 'center',
        },
    ];

    const filterOption = (
        input: string,
        option?: { value: string; label: string }
    ) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const onFinish: FormProps<FormType>['onFinish'] = (values) => {
        let startDate;
        let endDate;
        if (values.dateRange) {
            startDate = values.dateRange[0].format('YYYY-MM-DD');
            endDate = values.dateRange[1].format('YYYY-MM-DD');
        }

        const newValues = {
            ...values,
            startDate,
            endDate,
        };

        // Remove dateRange from newValues
        delete newValues.dateRange;

        // Gửi newValues đến backend
        setSearchParams((prev) => ({
            ...prev,
            ...newValues,
            currentPage: 1,
        }));

        setTimeout(() => {
            refetch();
        });
    };

    return (
        <Spin spinning={isLoading}>
            <Header title="Manage User" />
            <div className="">
                <Form
                    className="flex gap-x-10"
                    form={form}
                    labelCol={{ span: 6 }}
                    onFinish={onFinish}
                    wrapperCol={{ span: 18 }}
                >
                    <div className="grid flex-1 grid-cols-3 items-end justify-start gap-x-5">
                        <Form.Item<FormType> label="Order by" name="sortBy">
                            <Select
                                allowClear
                                placeholder="Select type of order..."
                            >
                                {FILTER_LIST.map((item) => (
                                    <Select.Option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item<FormType> label="Search by" name="searchBy">
                            <Select
                                allowClear
                                filterOption={filterOption}
                                options={searchBy.map(
                                    (item: { id: string; name: string }) => ({
                                        value: item.id,
                                        label: item.name,
                                    })
                                )}
                                placeholder="Select search by..."
                                showSearch
                            />
                        </Form.Item>
                        <Form.Item<FormType> label="Search" name="search">
                            <Input
                                allowClear
                                placeholder="Input to search..."
                            />
                        </Form.Item>
                        <Form.Item
                            label="Filter by gender"
                            name="fillterByGender"
                        >
                            <Select
                                allowClear
                                options={filterGender.map((item) => ({
                                    value: item.id,
                                    label: item.name,
                                }))}
                                placeholder="Select gender to filter..."
                                showSearch
                            />
                        </Form.Item>
                        <Form.Item label="Filter by role" name="fillterByRole">
                            <Select
                                allowClear
                                options={filterRole.map((item) => ({
                                    value: item.id,
                                    label: item.name,
                                }))}
                                placeholder="Select role to filter..."
                                showSearch
                            />
                        </Form.Item>
                        <Form.Item
                            label="Filter by status"
                            name="fillterByStatus"
                        >
                            <Select
                                allowClear
                                options={filterStatus.map((item) => ({
                                    value: item.id,
                                    label: item.name,
                                }))}
                                placeholder="Select status to filter..."
                                showSearch
                            />
                        </Form.Item>

                        <Form.Item label="Select date:" name="dateRange">
                            <RangePicker />
                        </Form.Item>
                    </div>
                    <div className="">
                        <Form.Item>
                            <Button
                                htmlType="submit"
                                icon={<SearchOutlined />}
                                type="primary"
                            >
                                Search
                            </Button>
                        </Form.Item>
                        <Form.Item>
                            <Button
                                htmlType="reset"
                                icon={<SyncOutlined />}
                                onClick={() => form.resetFields()}
                                type="primary"
                            >
                                Reset
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </div>
            <div className="mb-10 flex justify-end">
                <UserFormModal
                    reload={() => {
                        refetch();
                    }}
                    title="Create user"
                    type="CREATE"
                />
            </div>
            <div>
                <Table
                    columns={columns}
                    dataSource={listUser?.data}
                    pagination={false}
                />
                <div className="mt-5 flex justify-end">
                    {listUser?.pagination?.total ? (
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
                            total={listUser?.pagination?.total}
                        />
                    ) : null}
                </div>
            </div>
        </Spin>
    );
};

export default ListUser;
