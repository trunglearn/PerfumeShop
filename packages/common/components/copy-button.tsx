import { CopyOutlined } from '@ant-design/icons';
import React from 'react';
import { copy } from 'common/utils/copy';
import { cn } from 'common/utils';
import { toast } from 'react-toastify';

type Props = {
    value: string | number;
    className?: string;
    toastInfo: string;
};

export const CopyButton: React.FC<Props> = ({
    value,
    className,
    toastInfo,
}) => {
    return (
        <span
            className={cn('cursor-pointer p-2 ', className)}
            onClick={async () => {
                await copy(value);
                toast.success(toastInfo);
            }}
            role="presentation"
        >
            <CopyOutlined />
        </span>
    );
};

CopyButton.defaultProps = {
    className: undefined,
};
