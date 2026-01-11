export interface BookingEntity {
    id?: number;
    userId?: number;
    seatId?: number;
    date?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface BookingHistory {
    id: number;
    date: string;
    buildingName: string;
    floorName: string;
    seatNumber: string;
}