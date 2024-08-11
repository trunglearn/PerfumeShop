import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import { TokenDecoded } from 'types';
import bcrypt from 'bcrypt';
import { getToken } from '../../../lib/utils';
import { db } from '../../../lib/db';

export const getProfileUser = async (req: Request, res: Response) => {
    const accessToken = getToken(req);

    if (!accessToken) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    try {
        const tokenDecoded = (await jwtDecode(accessToken)) as TokenDecoded;
        const userId = tokenDecoded.id;

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                gender: true,
                dob: true,
                phone: true,
                address: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                isOk: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            isOk: true,
            data: user,
            message: 'Get user profile successfully!',
        });
    } catch (error) {
        return res
            .status(500)
            .json({ error: 'Internal Server Error', details: error });
    }
};

export const updateProfileUser = async (req: Request, res: Response) => {
    const accessToken = getToken(req);

    if (!accessToken) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    try {
        const tokenDecoded = (await jwtDecode(accessToken)) as TokenDecoded;
        const userId = tokenDecoded.id;

        const { name, gender, dob, phone, address, image } = req.body;

        const user = await db.user.update({
            where: { id: userId },
            data: {
                name,
                gender,
                dob: dob ? new Date(dob) : null,
                phone,
                address,
                image,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: user,
            message: 'Hồ sơ người dùng được cập nhật thành công!',
        });
    } catch (error) {
        return res
            .status(500)
            .json({ error: 'Internal Server Error', details: error.message });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    const accessToken = getToken(req);

    if (!accessToken) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    try {
        const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;
        const userId = tokenDecoded.id;

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res
                .status(400)
                .json({ message: 'Cần có mật khẩu cũ và mới' });
        }

        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.hashedPassword) {
            return res
                .status(404)
                .json({ message: 'Không tìm thấy người dùng' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.hashedPassword);

        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.user.update({
            where: { id: userId },
            data: {
                hashedPassword,
            },
        });

        return res.status(200).json({
            isOk: true,
            message: 'Đã đổi mật khẩu thành công!',
        });
    } catch (error) {
        return res
            .status(500)
            .json({ error: 'Internal Server Error', details: error.message });
    }
};

export const getUserImage = async (req: Request, res: Response) => {
    const accessToken = getToken(req);

    if (!accessToken) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    try {
        const tokenDecoded = (await jwtDecode(accessToken)) as TokenDecoded;
        const userId = tokenDecoded.id;

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                image: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                isOk: false,
                message: 'User not found',
            });
        }

        // Assuming user.image is the URL or path to the user's image
        const userImage = user.image;

        return res.status(200).json({
            isOk: true,
            data: {
                image: userImage,
            },
            message: 'Nhận hình ảnh người dùng thành công!',
        });
    } catch (error) {
        return res
            .status(500)
            .json({ error: 'Internal Server Error', details: error.message });
    }
};

export const updateUserImage = async (req: Request, res: Response) => {
    const accessToken = getToken(req);

    if (!accessToken) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    try {
        const tokenDecoded = (await jwtDecode(accessToken)) as TokenDecoded;
        const userId = tokenDecoded.id;

        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const user = await db.user.update({
            where: { id: userId },
            data: { image },
        });

        return res.status(200).json({
            isOk: true,
            data: user,
            message: 'Hình ảnh người dùng được cập nhật thành công!',
        });
    } catch (error) {
        return res
            .status(500)
            .json({ error: 'Internal Server Error', details: error.message });
    }
};
