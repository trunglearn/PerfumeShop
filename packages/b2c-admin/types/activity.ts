export interface Activity {
    id: string;
    action: Action;
    orderId: string;
    title: string;
    userId: string;
    userImage: string;
    userName: string;
    userEmail: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum Action {
    Create = 'Create',
    Update = 'UPDATE',
    Delete = 'DELETE',
}
