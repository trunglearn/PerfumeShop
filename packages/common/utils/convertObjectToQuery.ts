export const convertObjectToQuery = (
    obj: Record<string, string | number | boolean>
): string => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
        params.append(key, String(value)); // Ensure value is a string
    });
    return params.toString();
};
