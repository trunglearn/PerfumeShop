import React from 'react';

type Props = {
    children: React.ReactNode;
};

const DefaultLayout = ({ children }: Props) => {
    return children;
};

export default DefaultLayout;
