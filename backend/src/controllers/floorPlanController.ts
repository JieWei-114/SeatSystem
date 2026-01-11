import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createFloorPlan, getFloorPlanByFloorId, updateFloorPlan } from '../db/dao/floorPlanDao';
import fs from 'fs';
import path from 'path';

interface UserPayload {
  id: number;
  username: string;
  role: string;
}

interface SeatInput {
  seatNumber: string;
  description?: string;
  available: boolean;
  x: number;
  y: number;
  angle: number;
}

// Add Floor Plan (Super Admin only)
export const addFloorPlan = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { floorId, image, seats } = req.body;

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

  if (!floorId || !image || !seats) {
    res.status(400).json({ status: 'fail', message: 'Floor ID, image, and seats required' });
    return;
  }

  try {
    const fileName = `${Date.now()}.png`;
    const imagePath = `/uploads/floorplans/${fileName}`;
    const uploadDir = path.join(__dirname, '../../public/uploads/floorplans');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(__dirname, '../../public', imagePath), Buffer.from(image.split(',')[1], 'base64'));
    const floorPlan = await createFloorPlan(floorId, imagePath, seats);
    const fullImageUrl = `${req.protocol}://${req.get('host')}/uploads/floorplans/${fileName}`;
    res.status(201).json({
      status: 'success',
      message: 'Floor plan added successfully',
      data: { ...floorPlan, imagePath: fullImageUrl },
    });
  } catch (error) {
    console.error('Add floor plan error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during floor plan creation' });
  }
};

// Get Floor Plan by Floor ID (Authenticated users)
export const getFloorPlan = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { floorId } = req.params;

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

  if (!floorId) {
    res.status(400).json({ status: 'fail', message: 'Floor ID required' });
    return;
  }

  try {
    const floorPlan = await getFloorPlanByFloorId(parseInt(floorId));
    if (!floorPlan) {
      res.status(404).json({ status: 'fail', message: 'Floor plan not found' });
      return;
    }
    res.status(200).json({
      status: 'success',
      data: floorPlan,
    });
  } catch (error) {
    console.error('Get floor plan error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during fetch' });
  }
};

export const updateFloorPlans = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { floorId } = req.params;
  const { seats } = req.body; // No image required for update

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

  // if (decodedUser.role !== 'super_admin') {
  //   res.status(403).json({ status: 'fail', message: 'Unauthorized: Super Admin only' });
  //   return;
  // }

  if (!['super_admin', 'facility_manager'].includes(decodedUser.role)) {
    res.status(403).json({ status: 'fail', message: 'Unauthorized: Admins/Managers only' });
    return;
  }

  if (!seats) {
    res.status(400).json({ status: 'fail', message: 'Seats required' });
    return;
  }

  try {
    const floorPlan = await updateFloorPlan(Number(floorId), seats as SeatInput[]);
    const fullImageUrl = `${req.protocol}://${req.get('host')}${floorPlan.imagePath}`;
    res.status(200).json({
      status: 'success',
      message: 'Floor plan updated successfully',
      data: { ...floorPlan, imagePath: fullImageUrl },
    });
  } catch (error) {
    console.error('Update floor plan error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during floor plan update' });
  }
};