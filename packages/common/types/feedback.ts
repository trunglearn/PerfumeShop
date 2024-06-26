export type FeedbackType = {
    id: string | null;
    rating: null | null;
    description: string | null;
    user: User | null;
    image: FeedbackImage | null;
    userId: string | null;
    createdAt: Date | null;
};

export type User = {
    name: string | null;
    image: null | null;
};

export type FeedbackImage = {
    id: string | null;
    url: string | null;
};
