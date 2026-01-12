import { BuildingEntity } from "./Building";
export interface FloorEntity {
    id?: number;
    buildingId: number;
    name: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;

    building?: BuildingEntity;
}