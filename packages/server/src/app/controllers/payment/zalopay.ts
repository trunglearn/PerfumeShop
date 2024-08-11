/* eslint-disable @typescript-eslint/naming-convention */
import { Request, Response } from 'express';
import moment from 'moment';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import qs from 'qs';
import { db } from '../../../lib/db';

const config = {
    app_id: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
    callback_url: 'localhost:8000/zalo-pay/callback', // URL nhận dữ liệu trả về từ zalopay, phải là public url
};

export type callBackType = {
    return_code: number | undefined;
    return_message: string | undefined;
};

export const zaloPayCreateOrder = async (req: Request, res: Response) => {
    const { orderId, amount } = req.body;
    const embed_data = {
        redirecturl: 'https://your-public-url/payment-success', // URL chuyển hướng sau khi thanh toán thành công
    };
    try {
        const orderInfo = await db.order.findUnique({
            where: { id: orderId },
            include: {
                orderDetail: true,
            },
        });

        const transID = Math.floor(Math.random() * 1000000);
        const appTransId = `${moment().format('YYMMDD')}_${transID}`;
        const items = orderInfo.orderDetail.map((e) => e.productName);
        const order = {
            app_id: config.app_id,
            app_trans_id: appTransId,
            app_user: 'user123',
            app_time: Date.now(), // milliseconds
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: Number(amount),
            callback_url: config.callback_url,
            description: `Thanh toan don hang #${orderId}`,
            bank_code: 'zalopayapp',
            mac: '',
        };

        const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        const result = await axios.post(config.endpoint, null, {
            params: order,
        });

        await db.order.update({
            where: {
                id: orderId,
            },
            data: {
                appTransId,
            },
        });

        const response = {
            orderUrl: result.data.order_url,
            appTransId,
        };

        return res.status(201).json({
            isOk: true,
            data: response,
            message: 'Tạo thanh toán thành công!',
        });
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const zaloPayCheckStatusOrder = async (req: Request, res: Response) => {
    const { appTransId } = req.body;

    const postData = {
        app_id: config.app_id,
        app_trans_id: appTransId,
        mac: '',
    };

    const data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`;
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const postConfig = {
        method: 'post',
        url: 'https://sb-openapi.zalopay.vn/v2/query',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify(postData),
    };

    try {
        const result = await axios(postConfig);

        if (result.data.return_code === 1) {
            await db.order.update({
                where: {
                    appTransId,
                },
                data: {
                    status: 'PENDING',
                },
            });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        return res.sendStatus(500);
    }
};

export const zaloPayCallBack = async (req: Request, res: Response) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }
    try {
        const result: callBackType = {
            return_code: null,
            return_message: '',
        };
        try {
            const dataStr = req.body.data;
            const reqMac = req.body.mac;

            const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

            if (reqMac !== mac) {
                // invalid callback
                result.return_code = -1;
                result.return_message = 'mac is not equal';
            } else {
                // the payment is successful
                const bytes = CryptoJS.AES.decrypt(dataStr, config.key2);
                const decryptedDataStr = bytes.toString(CryptoJS.enc.Utf8);
                const dataJson = JSON.parse(decryptedDataStr);

                await db.order.update({
                    where: {
                        appTransId: dataJson.app_trans_id,
                    },
                    data: {
                        status: 'PENDING',
                    },
                });

                result.return_code = 1;
                result.return_message = 'success';
            }
        } catch (ex) {
            result.return_code = 0; // ZaloPay server will callback (at most 3 times)
            result.return_message = ex.message;
        }

        // return response to ZaloPay
        res.json(result);
    } catch (err) {
        res.status(500).json({ statusCode: 500, message: err.message });
    }
};
