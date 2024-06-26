import { LeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import React from 'react';

type Props = {
    title: string;
    isBack?: boolean;
};

const Header: React.FC<Props> = ({ title, isBack }) => {
    const router = useRouter();

    return (
        <div className="mb-10 flex items-center border-b-2 border-b-slate-700 py-5 text-xl font-bold uppercase">
            {isBack && (
                <LeftOutlined
                    className="mr-5 cursor-pointer hover:text-blue-500"
                    onClick={() => router.back()}
                />
            )}
            <div>{title}</div>
        </div>
    );
};

Header.defaultProps = {
    isBack: undefined,
};

export default Header;
