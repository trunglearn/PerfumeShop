import React from 'react';

type Props = {
    title: string;
    children?: React.ReactNode;
};

const OrderDetailItem: React.FC<Props> = ({ title, children }) => {
    return (
        <div className="grid min-h-[50px] grid-cols-4 border-b-2 border-b-slate-100">
            <div className="col-span-1 flex items-center justify-center bg-slate-100 font-semibold">
                {title}
            </div>
            <div className="col-span-3 flex items-center px-5">{children}</div>
        </div>
    );
};

OrderDetailItem.defaultProps = {
    children: undefined,
};

export default OrderDetailItem;
