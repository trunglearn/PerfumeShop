import { Router } from 'express';
import { getCategoryById, getListCategory } from '../controllers/category';
import {
    createCategory,
    deleteCategory,
    getListCategoryManage,
    updateCategory,
} from '../controllers/category/cms-category';
import { isAuthenticated, isMarketer } from '../../middlewares';

export default (router: Router) => {
    // Auth route
    router.get(
        '/manage/category',
        isAuthenticated,
        isMarketer,
        getListCategoryManage
    );
    router.post(
        '/category/create',
        isAuthenticated,
        isMarketer,
        createCategory
    );
    router.put(
        '/category/update/:id',
        isAuthenticated,
        isMarketer,
        updateCategory
    );
    router.delete(
        '/category/delete/:id',
        isAuthenticated,
        isMarketer,
        deleteCategory
    );

    // Public route
    router.get('/category', getListCategory);
    router.get('/category/:id', getCategoryById);
};
