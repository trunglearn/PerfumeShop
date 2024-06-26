import React from 'react';
import { BuiltInIconProps } from './type';

const ArrowRightSquare = (props: BuiltInIconProps) => {
    const { width, height, background, iconColor, rounded } = props;
    return (
        <div
            style={{
                width: width ?? '26px',
                height: height ?? '26px',
            }}
        >
            <svg
                className={`rounded-[${rounded ?? 0}]`}
                height={height ?? 26}
                viewBox="0 0 26 26"
                width={width ?? 26}
                xmlns="http://www.w3.org/2000/svg"
            >
                <g
                    data-name="icon_&gt;_square"
                    id="icon___square"
                    transform="translate(-325 -268)"
                >
                    <rect
                        data-name="사각형 856"
                        fill={background ?? '#111'}
                        height="26"
                        id="사각형_856"
                        opacity="0.5"
                        transform="translate(325 268)"
                        width="26"
                    />
                    <g id="아이콘" transform="translate(331.5 274.5)">
                        <path
                            d="M643.056,424.75l4.7,3.7-4.7,3.7"
                            data-name="패스 13080"
                            fill="none"
                            id="패스_13080"
                            stroke={iconColor ?? '#fff'}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            transform="translate(-638.956 -421.446)"
                        />
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default ArrowRightSquare;
