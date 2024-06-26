import { Router } from 'express';
import {
    createPost,
    deletePost,
    getListMaketer,
    getListPostManage,
    updatePost,
    updatePostFeatured,
    updatePostStatus,
} from '../controllers/post/marketer-post';
import {
    getListFeaturedPost,
    getListLatestPost,
    getListPost,
    getPostById,
    getPublicPostById,
    searchPosts,
} from '../controllers/post';

export default (router: Router) => {
    // Auth route
    router.get('/manage/post', getListPostManage);
    router.post('/post/create', createPost);
    router.get('/post/:id', getPostById);
    router.put('/post/update/:id', updatePost);
    router.delete('/post/delete/:id', deletePost);
    router.get('/post', getListPost);
    router.put('/post/updateStatus/:id', updatePostStatus);
    router.put('/post/updateFeatured/:id', updatePostFeatured);
    router.get('/marketers', getListMaketer);

    // Public
    router.get('/post-featured', getListFeaturedPost);
    router.get('/post-latest', getListLatestPost);
    router.get('/post-search', searchPosts);
    router.get('/post-public/:id', getPublicPostById);
};
