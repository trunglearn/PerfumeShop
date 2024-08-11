import { Router } from 'express';
import { createComment, getListComment } from '../controllers/comment';
import { isAuthenticated } from '../../middlewares';

export default (router: Router) => {
    // Public
    router.get('/comments', getListComment);

    // Auth
    router.post('/comment/add', isAuthenticated, createComment);
};
