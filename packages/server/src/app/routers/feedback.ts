import { Router } from 'express';
import { addFeedback, getFeedback } from '../controllers/feedback/index';
import { isAuthenticated } from '../../middlewares/index';

export default (router: Router) => {
    // Auth
    router.post('/feedback/add', isAuthenticated, addFeedback);

    // Public
    router.get('/feedback', getFeedback);
};
