import { FloorEntity } from './Floor';
export interface FloorPlanEntity {
    id?: number;
    floorId: number;
    imagePath: string;
    createdAt?: Date;
    updatedAt?: Date;
    
    floor?: FloorEntity;
}
