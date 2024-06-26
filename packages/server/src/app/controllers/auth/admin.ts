import { Request, Response } from 'express';
import { compareSync, hashSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../../lib/db';
import {
    ERROR_RES,
    EXPIRES_TOKEN,
    REFRESH_TOKEN_KEY,
    SALT,
    SuccessResponseType,
    TOKEN_KEY,
    TOKEN_TYPE,
} from '../../../constant';

export const register = async (req: Request, res: Response) => {
    const { password, name, email } = req.body;

    let user = await db.user.findFirst({
        where: { email },
    });

    if (user) {
        return res.status(400).json({
            ...ERROR_RES,
            errors: { message: 'Account already exist!' },
        });
    }

    user = await db.user.create({
        data: {
            name,
            email,
            hashedPassword: hashSync(password, SALT),
            role: 'ADMIN',
        },
    });

    const successObj: SuccessResponseType = {
        data: {
            data: user,
            meta_data: undefined,
        },
        message: 'Create new account successfully!',
    };

    return res.status(200).json(successObj);
};

export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Wrong email or password!',
        });
    }

    const user = await db.user.findFirst({
        where: {
            email,
            role: {
                not: 'USER',
            },
        },
    });

    if (!user) {
        return res.status(400).json({
            message: 'Account invalid!',
        });
    }

    const isCorrectPassword = await compareSync(password, user.hashedPassword);

    if (!isCorrectPassword) {
        return res.status(403).json({
            message: 'Wrong password!',
        });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        TOKEN_KEY
        // { expiresIn: EXPIRES_TOKEN }
    );

    const refreshToken = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        REFRESH_TOKEN_KEY
    );

    const updateUserToken = await db.account.create({
        data: {
            token_type: TOKEN_TYPE,
            userId: user.id,
            access_token: token,
            refresh_token: refreshToken,
        },
    });

    const responseUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
            name: true,
            email: true,
            accounts: {
                select: {
                    access_token: true,
                    refresh_token: true,
                    token_type: true,
                },
            },
            role: true,
        },
    });

    const successObj = {
        data: {
            name: responseUser.name,
            email: responseUser.email,
            role: responseUser.role,
            access_token: updateUserToken.access_token,
            refresh_token: updateUserToken.refresh_token,
            token_type: updateUserToken.token_type,
        },
        message: 'Login successfully!',
    };

    return res.status(200).json(successObj);
};

// eslint-disable-next-line consistent-return
export const refreshToken = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(401);
    }

    const account = await db.account.findFirst({
        where: { refresh_token: token },
    });

    if (!account) {
        return res.sendStatus(403);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt.verify(token, REFRESH_TOKEN_KEY, async (err: any, data: any) => {
        if (err) {
            return res.sendStatus(401);
        }

        const accessToken = jwt.sign(
            {
                id: data.id as string,
                email: data.email,
                name: data.name,
            },
            TOKEN_KEY,
            { expiresIn: EXPIRES_TOKEN }
        );

        const updateToken = await db.account.update({
            where: { id: account.id },
            data: {
                access_token: accessToken,
            },
        });

        return res.status(200).json({
            accessToken: updateToken.access_token,
        });
    });
};
