import { Router } from 'express';
import {
    changePassword,
    getProfileUser,
    getUserImage,
    updateProfileUser,
    updateUserImage,
} from '../controllers/user/index';
import {
    createUser,
    deleteUser,
    editUser,
    getListUser,
    getSeller,
    getUser,
    getUserById,
} from '../controllers/admin/user';

import { isAuthenticated, isSeller } from '../../middlewares';

export default (router: Router) => {
    router.get('/user', isAuthenticated, getUser);
    router.get('/admin/user-list', getListUser);
    router.post('/admin/create-user', createUser);
    router.get('/admin/user-detail/:id', getUserById);
    router.put('/admin/edit-user/:id', editUser);
    router.put('/admin/delete-user/:id', deleteUser);

    router.get('/user-profile', isAuthenticated, getProfileUser);
    router.put('/user-profile/update', isAuthenticated, updateProfileUser);
    router.put(
        '/user-profile/change-password',
        isAuthenticated,
        changePassword
    );
    router.get('/user-image', isAuthenticated, getUserImage);
    router.put('/user-profile/update-image', isAuthenticated, updateUserImage);
    router.get('/seller-select', isAuthenticated, isSeller, getSeller);
};
