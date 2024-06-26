/** @type {import('next').NextConfig} */

const withTM = require('next-transpile-modules')([
    'common',
    '@gumlet/react-hls-player',
]);

const withAntdLess = require('next-plugin-antd-less');

const path = require('path');

const nextConfig = withTM(
    withAntdLess({
        output: 'standalone',
        experimental: {
            outputFileTracingRoot: path.join(__dirname, '../../'),
            newNextLinkBehavior: true,
        },
        modifyVars: { '@primary-color': '#028267' },
        lessVarsFilePathAppendToEndOfContent: false,
        cssLoaderOptions: {
            mode: 'local',
            exportLocalsConvention: 'camelCase',
            exportOnlyLocals: false,
            getLocalIdent: () => {
                return '[hash:base64:8]';
            },
        },
        compiler: {
            // Enables the styled-components SWC transform
            styledComponents: true,
        },

        // for Next.js ONLY
        nextjs: {
            localIdentNameFollowDev: true, // default false, for easy to debug on PROD mode
        },

        // Other Config Here...

        webpack(config) {
            return config;
        },
        images: {
            unoptimized: true,
        },
        reactStrictMode: false,
        swcMinify: true,
        sassOptions: {
            includePaths: [path.join(__dirname, 'styles')],
        },
    })
);

module.exports = nextConfig;
