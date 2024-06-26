import MainBanner from '~/components/home-page/main-banner';
import { NextPageWithLayout } from './_app';
import ListProductFeatured from '~/components/home-page/product-featured';
import ListLatestPost from '~/components/common/latest-post';
import ListPostFeatured from '~/components/home-page/post-featured';

const HomePage: NextPageWithLayout = () => {
    return (
        <div className="space-y-10">
            <MainBanner />
            <div className="flex space-x-32 px-10">
                <div className="sticky top-10 h-[90vh] w-[350px] min-w-[350px]">
                    <ListLatestPost />
                </div>
                <div className="container flex-1 space-y-20">
                    <ListPostFeatured />
                    <ListProductFeatured />
                </div>
            </div>
        </div>
    );
};

HomePage.title = 'Trang chủ';

export default HomePage;
