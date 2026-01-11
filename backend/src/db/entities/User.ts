export interface UserEntity {
    id?: number; // Optional, auto-incremented by database
    username: string;
    password: string;
    role: 'super_admin' | 'facility_manager' | 'normal_user';
    createdAt?: Date;
    updatedAt?: Date;
}