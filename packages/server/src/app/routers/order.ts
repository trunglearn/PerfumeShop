import { Router } from 'express';

import { isAuthenticated, isSeller, isSellerManager } from '../../middlewares';
import {
    checkAcceptRedirectDetail,
    createOrderForGuest,
    createOrderForUser,
    deleteOrder,
    editOrderInformation,
    getListOrder,
    getOrderCompletion,
    getOrderDetail,
    updateOrderStatusAfterPayment,
} from '../controllers/order';
import {
    getListOrderCms,
    getOrderAuditLog,
    getOrderDetailCms,
    updateAssignee,
    updateOrderStatus,
    updateSaleNote,
} from '../controllers/order/order-cms';

export default (router: Router) => {
    router.get('/my-order', isAuthenticated, getListOrder);
    router.get('/order-detail/:id', isAuthenticated, getOrderDetail);
    router.get('/order-completion/:id', getOrderCompletion);
    router.put('/my-order/edit/:id', isAuthenticated, editOrderInformation);
    router.delete('/my-order/delete/:id', isAuthenticated, deleteOrder);
    router.post('/my-order/user/create', isAuthenticated, createOrderForUser);
    router.post('/my-order/guest/create', createOrderForGuest);
    router.put(
        '/order/update-status-after-payment/:id',
        updateOrderStatusAfterPayment
    );
    router.get(
        '/check-accept-order-detail/:id',
        isAuthenticated,
        checkAcceptRedirectDetail
    );

    // CMS
    router.get(
        '/order/list-order-cms',
        isAuthenticated,
        isSeller,
        getListOrderCms
    );
    router.put(
        '/order/update-assignee/:id',
        isAuthenticated,
        isSellerManager,
        updateAssignee
    );
    router.put(
        '/order/update-status/:id',
        isAuthenticated,
        isSeller,
        updateOrderStatus
    );
    router.get(
        '/order/order-detail-cms/:id',
        isAuthenticated,
        isSeller,
        getOrderDetailCms
    );
    router.get(
        '/order/audit-log/:id',
        isAuthenticated,
        isSeller,
        getOrderAuditLog
    );
    router.put(
        '/order/update-sale-note/:id',
        isAuthenticated,
        isSeller,
        updateSaleNote
    );
};
