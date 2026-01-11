import { FloorEntity } from './Floor';

export interface BuildingEntity {
    id?: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;

    floors?: FloorEntity;
}