import { cn } from 'common/utils';
import Image from 'next/image';
import React, { useState } from 'react';

type Props = {
    width: number;
    height: number;
    src: string;
    className?: string;
};

const Avatar: React.FC<Props> = ({ width, height, src, className }) => {
    const [fallback, setFallback] = useState<string | undefined>();

    return (
        <Image
            alt="avatar"
            className={cn('rounded-full object-cover', className)}
            height={height}
            onError={() => {
                setFallback('/images/placeholder.jpg');
            }}
            src={fallback ?? src}
            style={{
                width,
                height,
            }}
            width={width}
        />
    );
};

Avatar.defaultProps = {
    className: '',
};

export default Avatar;
