import { createContext } from "react";

export type Role = 'Admin' | 'Organizer' | 'Staff';

export interface AuthContextType {
    user: any; // Replace with firebase.User | null for better typing
    role: Role | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
});

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string | File;
    role: Role
}

export interface UserDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string | null;
    role: Role;
    photoURL: string | null;
}

export type FormState = Omit<User, 'id'> & { image: string | File };

export type UserTableProps = {
    users: User[];
};

export interface UserEditProps {
    users: User;
    onUserUpdated?: () => void;
}

export type UserField = "name" | "email" | "phone" | "role";