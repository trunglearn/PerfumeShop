import { Request } from 'express';

export const getToken = (req: Request) => {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
        const token: string = authorizationHeader.split(' ')[1];
        return token;
    }
    return null;
};
