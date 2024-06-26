import React from 'react';
import { Spin as Spinner } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

type Props = {
    spinning?: boolean;
};

export const Spin: React.FC<Props> = ({ spinning }) => {
    return (
        <Spinner
            fullscreen
            indicator={<LoadingOutlined style={{ fontSize: 28 }} />}
            spinning={spinning}
        />
    );
};

Spin.defaultProps = {
    spinning: true,
};
