import { Router } from 'express';
import {
    zaloPayCallBack,
    zaloPayCheckStatusOrder,
    zaloPayCreateOrder,
} from '../controllers/payment/zalopay';

export default (router: Router) => {
    router.post('/zalo-pay/create-order', zaloPayCreateOrder);
    router.post('/zalo-pay/check-status-order/', zaloPayCheckStatusOrder);
    router.post('/zalo-pay/callback', zaloPayCallBack);
};
