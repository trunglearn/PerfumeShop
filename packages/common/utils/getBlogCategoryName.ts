import { PostCategoryType } from 'common/types/post';

export const getBlogCategoryName = (
    value: PostCategoryType | undefined,
    locale: 'vi' | 'en'
) => {
    switch (value) {
        case 'REVIEW':
            return locale === 'vi' ? 'Đánh giá' : 'Review';
        case 'NEWS':
            return locale === 'vi' ? 'Tin tức' : 'News';
        default:
            return undefined;
    }
};
