export interface SeatEntity {
  id?: number;
  floorPlanId: number;
  seatNumber: string;
  description?: string;
  available: boolean;
  x: number;
  y: number;
  angle: number; 
  createdAt?: Date;
  updatedAt?: Date;
}
