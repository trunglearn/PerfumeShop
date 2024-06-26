import { Router } from 'express';
import { getCategoryById, getListCategory } from '../controllers/category';
import {
    createCategory,
    deleteCategory,
    getListCategoryManage,
    updateCategory,
} from '../controllers/category/cms-category';

export default (router: Router) => {
    // Auth route
    router.get('/manage/category', getListCategoryManage);
    router.post('/category/create', createCategory);
    router.put('/category/update/:id', updateCategory);
    router.delete('/category/delete/:id', deleteCategory);

    // Public route
    router.get('/category', getListCategory);
    router.get('/category/:id', getCategoryById);
};
