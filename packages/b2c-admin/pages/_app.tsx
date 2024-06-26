import '~/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Spin } from 'common/components/spin';
import { AxiosError } from 'axios';
import Cookie from 'js-cookie';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import { ReactElement, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ConfigProvider } from 'antd';
import DefaultLayout from '~/components/layouts/default-layout';
import AdminLayout from '~/components/layouts/admin-layout';
import MarketerLayout from '~/components/layouts/marketer-layout';
import SellerLayout from '~/components/layouts/seller-layout';

declare module '@tanstack/react-query' {
    interface Register {
        defaultError: AxiosError;
    }
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            retryDelay: () => 1500,
        },
    },
});

export type NextPageWithLayout<P = Record<string, never>, IP = P> = NextPage<
    P,
    IP
> & {
    getLayout?: (page: ReactElement) => JSX.Element;
    title?: string;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
    const cmsUser = Cookie.get('cmsUser');

    const user = cmsUser ? JSON.parse(cmsUser) : null;

    const role = user?.role ?? null;

    const router = useRouter();

    const loadingRef = useRef<unknown | undefined>(undefined);

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const start = () => {
            if (loadingRef.current) {
                clearTimeout(loadingRef.current as number);
            }
            loadingRef.current = setTimeout(() => {
                setLoading(true);
            }, 200);
        };
        const end = () => {
            if (loadingRef.current) {
                clearTimeout(loadingRef.current as number);
            }
            setLoading(false);
        };
        router.events.on('routeChangeStart', start);
        router.events.on('routeChangeComplete', end);
        router.events.on('routeChangeError', end);
        window.addEventListener('showLoading', start);
        window.addEventListener('hideLoading', end);
        return () => {
            router.events.off('routeChangeStart', start);
            router.events.off('routeChangeComplete', end);
            router.events.off('routeChangeError', end);
            window.removeEventListener('showLoading', start);
            window.removeEventListener('hideLoading', end);
        };
    }, []);

    let getLayout =
        Component.getLayout ||
        ((page) => <DefaultLayout>{page}</DefaultLayout>);

    if (role === 'ADMIN') {
        getLayout = (page) => <AdminLayout>{page}</AdminLayout>;
    }

    if (role === 'SELLER') {
        getLayout = (page) => <SellerLayout>{page}</SellerLayout>;
    }

    if (role === 'MARKETER') {
        getLayout = (page) => <MarketerLayout>{page}</MarketerLayout>;
    }

    return (
        <ConfigProvider
            theme={{
                token: {
                    fontSize: 12,
                },
            }}
        >
            <QueryClientProvider client={queryClient}>
                <Spin spinning={loading} />
                <ToastContainer autoClose={2000} />
                {getLayout(<Component {...pageProps} />)}
            </QueryClientProvider>
        </ConfigProvider>
    );
}

export default dynamic(() => Promise.resolve(App), {
    ssr: false,
});
