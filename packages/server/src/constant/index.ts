export type SuccessResponseType = {
    data: {
        data: Record<
            string,
            boolean | string | string[] | number | Date | Record<string, string>
        >;
        meta_data?: Record<string, string>;
    };
    message?: string;
};

export type ErrorResponseType = {
    errors: Record<string, string | string[]>;
    message: string | undefined;
};

export const ERROR_RES: ErrorResponseType = {
    errors: {},
    message: '',
};

export const SUCCESS_RES: SuccessResponseType = {
    data: {
        data: undefined,
        meta_data: undefined,
    },
    message: 'Successful',
};

export const SALT: number = 10;

export const { TOKEN_KEY, REFRESH_TOKEN_KEY } = process.env;

export const EXPIRES_TOKEN = '2d';

export const TOKEN_TYPE = 'Bearer';

export const PAGE_SIZE: number = 5;

export const TAKE_LATEST_CLIENT_DEFAULT = 10;

export const TAKE_HOT_SEARCH_CLIENT_DEFAULT = 10;
