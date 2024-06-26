export const currencyFormatter = (number: number) => {
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        // currencyDisplay: 'code',
    });

    return formatter.format(number);
};
