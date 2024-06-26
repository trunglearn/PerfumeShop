import { TableProps } from 'antd';

type PaginationResponse = {
    total?: number;
};

export type QueryResponseType<T> = {
    isOk?: boolean | null;
    data?: Partial<T>[];
    message?: string | null;
    pagination?: PaginationResponse;
};

type OnChange<T> = NonNullable<TableProps<T>['onChange']>;

type GetSingle<T> = T extends (infer U)[] ? U : never;

export type Sorts<T> = GetSingle<Parameters<OnChange<T>>[2]>;

export type Pagination = {
    current: number;
    pageSize: number;
};

export type QueryResponseGetOneType<T> = {
    isOk?: boolean | null;
    data?: T;
    message?: string | null;
};
