import Building from '../models/Buildings';
import { BuildingEntity } from '../../db/entities/Building';

import Floor from '../models/Floors';
import { FloorEntity } from '../../db/entities/Floor';

// Create Building
export const createBuilding = async (name: string): Promise<BuildingEntity> => {
    return await Building.create({ name });
};

// Create Floor
export const createFloor = async (buildingId: number, name: string, description: string): Promise<FloorEntity> => {
    return await Floor.create({ buildingId, name, description });
};

// Find Building by ID
export const findBuildingById = async (buildingId: number): Promise<BuildingEntity | null> => {
    return await Building.findByPk(buildingId);
};

// Find Floor by ID
export const findFloorById = async (floorId: number): Promise<FloorEntity | null> => {
    return await Floor.findByPk(floorId);
};

// Update Building
export const updateBuilding = async (buildingId: number, name: string): Promise<BuildingEntity | null> => {
    const building = await Building.findByPk(buildingId);
    if (!building) return null;
    await building.update({ name });
    return building;
};

// Update Floor
export const updateFloor = async (floorId: number, name: string, description?: string): Promise<FloorEntity | null> => {
    const floor = await Floor.findByPk(floorId);
    if (!floor) return null;
    await floor.update({ name, description });
    return floor;
};

// Delete Building
export const deleteBuilding = async (buildingId: number): Promise<boolean> => {
    const building = await Building.findByPk(buildingId);
    if (!building) return false;
    await building.destroy();
    return true;
};

// Delete Floor
export const deleteFloor = async (floorId: number): Promise<boolean> => {
    const floor = await Floor.findByPk(floorId);
    if (!floor) return false;
    await floor.destroy();
    return true;
};

// Get All Buildings and Floors
// Get All Buildings and Floors
export const getAllBuildingsAndFloors = async (): Promise<BuildingEntity[]> => {
    return await Building.findAll({
        include: [{
            model: Floor,
            as: 'floors', // Match the alias from Building.hasMany
            attributes: ['id', 'name', 'description'],
        }],
    });
};