import { Router } from 'express';
import {
    createNewCustomer,
    getCustomerById,
    getCustomerCms,
    updateCustomer,
} from '../controllers/customer/customer-cms';
import { isAuthenticated, isMarketer } from '../../middlewares';

export default (router: Router) => {
    router.get('/customer', isAuthenticated, isMarketer, getCustomerCms);
    router.post(
        '/customer/create',
        isAuthenticated,
        isMarketer,
        createNewCustomer
    );
    router.get(
        '/customer/:customerId',
        isAuthenticated,
        isMarketer,
        getCustomerById
    );
    router.put(
        '/customer/update/:customerId',
        isAuthenticated,
        isMarketer,
        updateCustomer
    );
};
