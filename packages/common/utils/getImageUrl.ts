export const getImageUrl = (imageName?: string) =>
    `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${imageName}`;
