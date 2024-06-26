import React from 'react';

import { cn } from '../utils';

type Props = {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    outline?: boolean;
    small?: boolean;
};

const Button: React.FC<Props> = ({
    label,
    onClick,
    disabled,
    outline,
    small,
}) => {
    return (
        <button
            className={cn(
                'relative w-full rounded-lg transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70',
                outline
                    ? 'border-black bg-white text-black'
                    : 'border-rose-500 bg-rose-500 text-white',
                small
                    ? 'border-[1px] py-1 text-sm font-light'
                    : 'border-2 py-3 font-semibold'
            )}
            disabled={disabled}
            onClick={onClick}
            type="button"
        >
            {label}
        </button>
    );
};

Button.defaultProps = {
    disabled: false,
    outline: false,
    small: false,
};

export default Button;
