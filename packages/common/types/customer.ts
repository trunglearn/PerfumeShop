export type Customer = {
    id: string;
    name: string;
    email: string;
    address: string;
    phone: string;
    dob: null;
    gender: string;
    image: string;
    status: CustomerStatus;
};

export type User = {
    id: string;
    name: string;
    email: string;
    address: string;
    phone: string;
    dob: string;
    gender: string;
    image: string;
    status: string;
    role: string;
};

export type CustomerStatus = 'NEWLY_REGISTER' | 'NEWLY_BOUGHT' | 'BANNED';
