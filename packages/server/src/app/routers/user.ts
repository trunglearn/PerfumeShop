import { Router } from 'express';
import {
    createUser,
    deleteUser,
    editUser,
    getListUser,
    getUser,
    getUserById,
} from '../controllers/admin/user';
import { isAuthenticated } from '../../middlewares';

export default (router: Router) => {
    router.get('/user', isAuthenticated, getUser);
    router.get('/admin/user-list', getListUser);
    router.post('/admin/create-user', createUser);
    router.get('/admin/user-detail/:id', getUserById);
    router.put('/admin/edit-user/:id', editUser);
    router.put('/admin/delete-user/:id', deleteUser);
};
