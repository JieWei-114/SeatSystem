import FloorPlan from '../models/FloorPlans';
import Seat from '../models/Seats';
import { FloorPlanEntity } from '../../db/entities/FloorPlan';
import { SeatEntity } from '../../db/entities/Seat';
import { CreationAttributes } from 'sequelize';
import * as fs from 'fs/promises';
import * as path from 'path';

interface SeatInput {
  seatNumber: string;
  description?: string;
  available: boolean;
  x: number;
  y: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
}

export const createFloorPlan = async (
  floorId: number,
  imagePath: string,
  seats: SeatInput[]
): Promise<FloorPlanEntity & { seats?: SeatEntity[] }> => {
  const floorPlan = await FloorPlan.create({ floorId, imagePath } as CreationAttributes<FloorPlan>);

  const seatData: CreationAttributes<Seat>[] = seats.map((seat) => ({
    floorPlanId: floorPlan.id,
    seatNumber: seat.seatNumber,
    description: seat.description,
    available: seat.available,
    x: seat.x,
    y: seat.y,
    angle: seat.angle,
    scaleX: seat.scaleX ?? 1,
    scaleY: seat.scaleY ?? 1,
    width: seat.width ?? null,
    height: seat.height ?? null,
  }));

  const createdSeats = await Seat.bulkCreate(seatData, { returning: true });

  const plainFloorPlan = floorPlan.get({ plain: true }) as FloorPlanEntity;
  return {
    ...plainFloorPlan,
    seats: createdSeats.map((seat) => seat.get({ plain: true }) as SeatEntity),
  };
};

// Get Floor Plan by ID (with Seats)
export const getFloorPlanById = async (
  floorPlanId: number
): Promise<(FloorPlanEntity & { seats?: SeatEntity[] }) | null> => {
  return await FloorPlan.findByPk(floorPlanId, {
    include: [{ model: Seat, as: 'seats' }],
  });
};

// Optional: Get Floor Plan by Floor ID (with Seats)
export const getFloorPlanByFloorId = async (
  floorId: number
): Promise<(FloorPlanEntity & { seats?: SeatEntity[] }) | null> => {
  return await FloorPlan.findOne({
    where: { floorId },
    include: [{ model: Seat, as: 'seats' }],
  });
};

export const updateFloorPlan = async (
  floorId: number,
  seats: SeatInput[]
): Promise<FloorPlanEntity & { seats?: SeatEntity[] }> => {
  const floorPlan = await FloorPlan.findOne({ where: { floorId } });
  if (!floorPlan) throw new Error('Floor plan not found');

  await Seat.destroy({ where: { floorPlanId: floorPlan.id } });
  const seatData = seats.map((seat) => ({
    floorPlanId: floorPlan.id,
    seatNumber: seat.seatNumber,
    description: seat.description,
    available: seat.available,
    x: seat.x,
    y: seat.y,
    angle: seat.angle,
    scaleX: seat.scaleX ?? 1,
    scaleY: seat.scaleY ?? 1,
    width: seat.width ?? null,
    height: seat.height ?? null,
  }));

  const updatedSeats = await Seat.bulkCreate(seatData, { returning: true });

  const plainFloorPlan = floorPlan.get({ plain: true }) as FloorPlanEntity;
  return {
    ...plainFloorPlan,
    seats: updatedSeats.map((seat) => seat.get({ plain: true }) as SeatEntity),
  };
};
