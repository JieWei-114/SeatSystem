import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  createBuilding,
  createFloor,
  updateBuilding as updateBuildingDao,
  updateFloor as updateFloorDao,
  deleteBuilding as deleteBuildingDao,
  deleteFloor as deleteFloorDao,
  getAllBuildingsAndFloors,
  findBuildingById,
  findFloorById,
} from '../db/dao/buildingDao';

interface UserPayload {
  id: number;
  username: string;
  role: string;
}

// Add Building (Super Admin only)
export const addBuilding = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { name } = req.body;

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  let decodedUser: UserPayload;
  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  if (decodedUser.role !== 'super_admin') {
    res.status(403).json({ status: 'fail', message: 'Unauthorized: Super Admin only' });
    return;
  }

  if (!name) {
    res.status(400).json({ status: 'fail', message: 'Building name required' });
    return;
  }

  try {
    const building = await createBuilding(name);
    res.status(201).json({
      status: 'success',
      message: 'Building added successfully',
      data: building,
    });
  } catch (error) {
    console.error('Add building error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during building creation' });
  }
};

// Add Floor (Super Admin only)
export const addFloor = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { buildingId, name, description } = req.body;

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  let decodedUser: UserPayload;
  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  if (decodedUser.role !== 'super_admin') {
    res.status(403).json({ status: 'fail', message: 'Unauthorized: Super Admin only' });
    return;
  }

  if (!buildingId || !name || !description) {
    res.status(400).json({ status: 'fail', message: 'Building ID, name, and description required' });
    return;
  }

  try {
    const building = await findBuildingById(buildingId);
    if (!building) {
      res.status(404).json({ status: 'fail', message: 'Building not found' });
      return;
    }

    const floor = await createFloor(buildingId, name, description);
    res.status(201).json({
      status: 'success',
      message: 'Floor added successfully',
      data: floor,
    });
  } catch (error) {
    console.error('Add floor error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during floor creation' });
  }
};

// Update Building (Admin and Manager)
export const updateBuilding = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { buildingId, name } = req.body;

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  let decodedUser: UserPayload;
  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  if (!['super_admin', 'facility_manager'].includes(decodedUser.role)) {
    res.status(403).json({ status: 'fail', message: 'Unauthorized: Admins/Managers only' });
    return;
  }

  if (!buildingId || !name) {
    res.status(400).json({ status: 'fail', message: 'Building ID and name required' });
    return;
  }

  try {
    const building = await updateBuildingDao(buildingId, name);
    if (!building) {
      res.status(404).json({ status: 'fail', message: 'Building not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Building updated successfully',
      data: building,
    });
  } catch (error) {
    console.error('Update building error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during building update' });
  }
};

// Update Floor (Admin and Manager)
export const updateFloor = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { floorId, name, description } = req.body;

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  let decodedUser: UserPayload;
  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  if (!['super_admin', 'facility_manager'].includes(decodedUser.role)) {
    res.status(403).json({ status: 'fail', message: 'Unauthorized: Admins/Managers only' });
    return;
  }

  if (!floorId || !name) { // Description is optional in DAO
    res.status(400).json({ status: 'fail', message: 'Floor ID and name required' });
    return;
  }

  try {
    const floor = await updateFloorDao(floorId, name, description);
    if (!floor) {
      res.status(404).json({ status: 'fail', message: 'Floor not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Floor updated successfully',
      data: floor,
    });
  } catch (error) {
    console.error('Update floor error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during floor update' });
  }
};

// Delete Building (Admin and Manager)
export const deleteBuilding = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { buildingId } = req.body;

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  let decodedUser: UserPayload;
  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  if (!['super_admin', 'facility_manager'].includes(decodedUser.role)) {
    res.status(403).json({ status: 'fail', message: 'Unauthorized: Admins/Managers only' });
    return;
  }

  if (!buildingId) {
    res.status(400).json({ status: 'fail', message: 'Building ID required' });
    return;
  }

  try {
    const success = await deleteBuildingDao(buildingId);
    if (!success) {
      res.status(404).json({ status: 'fail', message: 'Building not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Building deleted successfully',
    });
  } catch (error) {
    console.error('Delete building error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during building deletion' });
  }
};

// Delete Floor (Admin and Manager)
export const deleteFloor = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { floorId } = req.body;

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  let decodedUser: UserPayload;
  try {
    decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  if (!['super_admin', 'facility_manager'].includes(decodedUser.role)) {
    res.status(403).json({ status: 'fail', message: 'Unauthorized: Admins/Managers only' });
    return;
  }

  if (!floorId) {
    res.status(400).json({ status: 'fail', message: 'Floor ID required' });
    return;
  }

  try {
    const success = await deleteFloorDao(floorId);
    if (!success) {
      res.status(404).json({ status: 'fail', message: 'Floor not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Floor deleted successfully',
    });
  } catch (error) {
    console.error('Delete floor error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during floor deletion' });
  }
};

// Get Buildings and Floors (All authenticated users)
export const getBuildingsAndFloors = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No token provided' });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (err) {
    res.status(403).json({ status: 'fail', message: 'Invalid token' });
    return;
  }

  try {
    const buildings = await getAllBuildingsAndFloors();
    res.status(200).json({
      status: 'success',
      data: buildings.map(building => ({
        id: building.id,
        name: building.name,
        floors: building.floors || [], // Ensure floors is included even if empty
      })),
    });
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during fetch' });
  }
};