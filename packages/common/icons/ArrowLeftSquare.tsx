import React from 'react';
import { BuiltInIconProps } from './type';

const ArrowLeftSquare = (props: BuiltInIconProps) => {
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
                data-name="icon_&gt;_square"
                height="100%"
                id="icon___square"
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 26 26"
                width="100%"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    data-name="사각형 856"
                    fill={background ?? '#111'}
                    height="26"
                    id="사각형_856"
                    opacity="0.5"
                    width="26"
                />
                <g id="아이콘" transform="translate(10.702 9.804)">
                    <path
                        d="M647.754,424.75l-4.7,3.7,4.7,3.7"
                        data-name="패스 13080"
                        fill="none"
                        id="패스_13080"
                        stroke={iconColor ?? '#fff'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        transform="translate(-643.056 -424.75)"
                    />
                </g>
            </svg>
        </div>
    );
};

export default ArrowLeftSquare;
