/* eslint-disable max-lines */
import { Request, Response } from 'express';
import { db } from '../../../lib/db';
import { PAGE_SIZE } from '../../../constant';

type SliderFilter = {
    isShow?: boolean;
    title?: {
        contains: string;
    };
    backlink?: {
        contains: string;
    };
    OR?: SliderFilter[];
};

type SortOrder = 'desc' | 'asc';

export const getListSliderManage = async (req: Request, res: Response) => {
    const { search, pageSize, currentPage, isShow, orderName, order } =
        req.query;

    const pagination = {
        skip: (Number(currentPage ?? 1) - 1) * Number(pageSize ?? PAGE_SIZE),
        take: Number(pageSize ?? PAGE_SIZE),
    };

    try {
        const whereClause: SliderFilter = {};

        let orderBy:
            | Record<string, SortOrder | Record<string, SortOrder>>
            | undefined;

        if (orderName && order) {
            orderBy = {
                [String(orderName)]: order as SortOrder,
            };
        }
        if (isShow) {
            whereClause.isShow = isShow === 'true';
        }

        if (search) {
            whereClause.OR = [
                { title: { contains: String(search) } },
                { backlink: { contains: String(search) } },
            ];
        }

        const select = {
            id: true,
            title: true,
            backlink: true,
            image: true,
            createdAt: true,
            isShow: true,
            note: true,
        };

        const total = await db.slider.count({
            where: {
                ...whereClause,
            },
        });

        const listSlider = await db.slider.findMany({
            ...pagination,
            where: {
                ...whereClause,
            },
            orderBy: orderBy ?? {
                createdAt: 'desc',
            },
            select,
        });

        return res.status(200).json({
            isOk: true,
            data: listSlider,
            message: 'Get list slider successfully!',
            pagination: {
                total,
            },
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const createSlider = async (req: Request, res: Response) => {
    const {
        title,
        image,
        backlink,
        note,
        isShow,
        backgroundSliderColor,
        noteTextColor,
        titleTextColor,
    } = req.body;

    try {
        const slider = await db.slider.create({
            data: {
                title: title ?? '',
                image,
                backlink: backlink ?? '',
                note,
                isShow: isShow ?? false,
                backgroundSliderColor,
                noteTextColor,
                titleTextColor,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: slider,
            message: 'Create new slider successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const updateSlider = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        title,
        image,
        backlink,
        note,
        isShow,
        backgroundSliderColor,
        noteTextColor,
        titleTextColor,
    } = req.body;

    try {
        const slider = await db.slider.update({
            where: {
                id,
            },
            data: {
                title,
                image,
                backlink,
                note,
                isShow,
                backgroundSliderColor,
                noteTextColor,
                titleTextColor,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: slider,
            message: 'Update slider successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const getSliderById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const slider = await db.slider.findUnique({
            where: {
                id,
            },
        });

        if (!slider) {
            return res.status(400).json({
                isOk: false,
                data: null,
                message: 'This slider does not exist!',
            });
        }

        return res.status(200).json({
            isOk: true,
            data: slider,
            message: 'Get slider successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const deleteSliderById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const slider = await db.slider.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: slider,
            message: 'Delete slider successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const updateSliderStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isShow } = req.body;

    try {
        const slider = await db.slider.update({
            where: {
                id,
            },
            data: {
                isShow,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: slider,
            message: 'Change slider status successfully!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};
