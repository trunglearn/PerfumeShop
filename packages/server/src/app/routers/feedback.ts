import { Router } from 'express';
import {
    addFeedback,
    getFeedback,
    getFeedbackById,
    getListFeedbackManage,
    updateFeedbackStatus,
} from '../controllers/feedback';
import { isAuthenticated, isMarketer } from '../../middlewares';

export default (router: Router) => {
    // Auth
    router.post('/feedback/add', isAuthenticated, addFeedback);
    router.get(
        '/manage/feedback',
        isAuthenticated,
        isMarketer,
        getListFeedbackManage
    );
    router.put(
        '/feedback/updateStatus/:id',
        isAuthenticated,
        isMarketer,
        updateFeedbackStatus
    );
    router.get('/feedback/:id', getFeedbackById);
    // Public
    router.get('/feedback', getFeedback);
};
