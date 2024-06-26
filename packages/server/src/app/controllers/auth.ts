import { Request, Response } from 'express';
import { compareSync, hashSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../lib/db';
import { sendMail } from '../../lib/send-mail';
import {
    ERROR_RES,
    EXPIRES_TOKEN,
    REFRESH_TOKEN_KEY,
    SALT,
    SuccessResponseType,
    TOKEN_KEY,
    TOKEN_TYPE,
} from '../../constant';

export const register = async (req: Request, res: Response) => {
    const { password, name, email, phone, gender, address } = req.body;

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
            phone,
            gender,
            address,
            role: 'USER',
            status: 'NEWLY_REGISTER',
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

export const verifyEmail = async (req: Request, res: Response) => {
    const { email } = req.params;

    // Tìm người dùng theo email
    const user = await db.user.findUnique({ where: { email: String(email) } });

    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }

    // Tạo token
    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        TOKEN_KEY,
        { expiresIn: EXPIRES_TOKEN }
    );

    const refreshToken = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        REFRESH_TOKEN_KEY
    );

    // Cập nhật token cho người dùng
    const updateUserToken = await db.account.create({
        data: {
            token_type: TOKEN_TYPE,
            userId: user.id,
            access_token: token,
            refresh_token: refreshToken,
        },
    });

    // Lấy thông tin người dùng sau khi cập nhật token
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

    // Gửi email xác thực
    const subject = 'User Verification';
    const title = `Hi ${user.name},`;
    const mainContent =
        'Thank you for registering with us. To continue using our services, please verify your email address by clicking the button below:';
    const link = `http://localhost:3000/verify-email?id=${user.id}&token=${token}`;
    const label = 'Click here to verify';
    const secondContent = `If you did not request this verification, you can safely ignore this email. Your account will not be affected.<br>
        Best regards,<br>
        Perfume shop.`;
    await sendMail({
        to: email,
        subject,
        title,
        mainContent,
        secondContent,
        label,
        link,
    });
    const successObj = {
        data: {
            data: {
                name: responseUser.name,
                email: responseUser.email,
                role: responseUser.role,
                access_token: updateUserToken.access_token,
                refresh_token: updateUserToken.refresh_token,
                token_type: updateUserToken.token_type,
            },
        },
        message: 'Verification email sent successfully!',
    };

    return res.status(200).json(successObj);
};

export const checkVerify = async (req: Request, res: Response) => {
    const { id, token } = req.body;

    const user = await db.user.findFirst({
        where: {
            id,
            accounts: {
                some: {
                    access_token: token,
                },
            },
        },
    });

    if (!user) {
        return res.status(400).json({
            message: 'Account not found!',
        });
    }

    await db.user.update({
        where: {
            id,
        },
        data: {
            isVerified: true,
        },
    });

    const successObj = {
        data: {
            data: {
                access_token: token,
            },
        },
        message: 'Account verify successfully!',
    };
    return res.status(200).json(successObj);
};

export const loginClient = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Wrong email or password!',
        });
    }

    const user = await db.user.findFirst({
        where: {
            email,
        },
    });

    if (!user) {
        return res.status(400).json({
            message: 'Account invalid!',
        });
    }

    if (!user.isVerified) {
        return res.status(400).json({
            message: 'Unverified account!',
            data: {
                id: user.id,
                email: user.email,
                isVerified: user?.isVerified,
            },
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

export const senMailResetPassword = async (req: Request, res: Response) => {
    const { email } = req.params;

    const user = await db.user.findUnique({ where: { email: String(email) } });

    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        TOKEN_KEY,
        { expiresIn: 900 } // 15 minutes
    );

    const subject = 'Request to reset password';
    const title = `Hi ${user.name},`;
    const mainContent =
        'You received this email because we received a request to reset your password for your account. Click to button bellow to reset your password.';
    const link = `http://localhost:3000/reset-password?token=${token}`;
    const label = 'Click here to reset password';
    const secondContent = `If you did not request this verification, you can safely ignore this email. Your account will not be affected.<br>
        Best regards,<br>
        Perfume shop.`;

    await sendMail({
        to: email,
        subject,
        title,
        mainContent,
        secondContent,
        label,
        link,
    });

    return res.status(200).json({ message: 'Email sent successfully!' });
};

export const resetPassword = async (req: Request, res: Response) => {
    const { id, password } = req.body;

    const user = await db.user.findUnique({ where: { id: String(id) } });

    if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }

    const hashedPassword = await hashSync(password, SALT);

    await db.user.update({
        where: { id: user.id },
        data: {
            hashedPassword,
        },
    });

    return res.status(200).json({ message: 'Đặt lại mật khẩu thành công!' });
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
