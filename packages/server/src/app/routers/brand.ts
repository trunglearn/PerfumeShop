import { Router } from 'express';
import {
    createBrand,
    deleteBrand,
    getListBrandManage,
    updateBrand,
} from '../controllers/brand/marketer-brand';
import { getBrandById, getListBrand } from '../controllers/brand';
import { isAuthenticated, isMarketer } from '../../middlewares';

export default (router: Router) => {
    // Auth route
    router.get(
        '/manage/brand',
        isAuthenticated,
        isMarketer,
        getListBrandManage
    );
    router.post('/brand/create', createBrand);
    router.put('/brand/update/:id', updateBrand);
    router.delete('/brand/delete/:id', deleteBrand);

    // Public route
    router.get('/brand', getListBrand);
    router.get('/brand/:id', getBrandById);
};
