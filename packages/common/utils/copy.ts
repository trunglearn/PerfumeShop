export const copy = async (value: string | number) => {
    return navigator.clipboard.writeText(String(value));
};
