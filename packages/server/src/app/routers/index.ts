import { Router } from 'express';
import auth from './auth';
import user from './user';
import brand from './brand';
import upload from './upload';
import category from './category';
import product from './product';
import post from './post';
import slider from './slider';
import cart from './cart';
import order from './order';
import feedback from './feedback';

const router = Router();

export default (): Router => {
    auth(router);
    user(router);
    brand(router);
    upload(router);
    category(router);
    product(router);
    post(router);
    slider(router);
    cart(router);
    order(router);
    feedback(router);
    return router;
};
