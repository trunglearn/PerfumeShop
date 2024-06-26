import { Router } from 'express';

import { isAuthenticated } from '../../middlewares';
import {
    deleteOrder,
    editOrderInformation,
    getListOrder,
    getOrderDetail,
} from '../controllers/order';

export default (router: Router) => {
    router.get('/my-order', isAuthenticated, getListOrder);
    router.get('/order-detail/:id', isAuthenticated, getOrderDetail);
    router.put('/my-order/edit/:id', editOrderInformation);
    router.delete('/my-order/delete/:id', deleteOrder);
};
