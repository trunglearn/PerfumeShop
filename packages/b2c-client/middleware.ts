import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
    const accessTokenClient = req.cookies.get('accessTokenClient');

    const user = accessTokenClient ? JSON.parse(accessTokenClient.value) : null;

    const path = req.nextUrl.pathname;
    const isPublicPath = path === '/';

    if (!isPublicPath && !user) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/my-page/:path*'],
};
