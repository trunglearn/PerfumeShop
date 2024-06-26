import { Router } from 'express';
import {
    checkVerify,
    loginClient,
    refreshToken,
    register,
    resetPassword,
    senMailResetPassword,
    verifyEmail,
} from '../controllers/auth';
import {
    loginAdmin,
    register as registerAdmin,
} from '../controllers/auth/admin';

export default (router: Router) => {
    // admin
    router.post('/auth/admin/login', loginAdmin);
    router.post('/auth/admin/register', registerAdmin);

    // user
    router.post('/auth/user/register', register);
    router.post('/auth/verify-email/:email', verifyEmail);
    router.post('/auth/check-verify', checkVerify);
    router.post('/auth/user/login', loginClient);
    router.post('/auth/refreshToken', refreshToken);
    router.post('/auth/reset-password/:email', senMailResetPassword);
    router.post('/auth/reset-password', resetPassword);
};
