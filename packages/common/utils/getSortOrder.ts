export const getSortOrder = (
    order: 'ascend' | 'descend' | undefined | null
) => {
    switch (order) {
        case 'ascend':
            return 'asc';
        case 'descend':
            return 'desc';
        default:
            return undefined;
    }
};
