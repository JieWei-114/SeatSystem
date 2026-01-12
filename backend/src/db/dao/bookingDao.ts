import { Transaction } from 'sequelize';
import Booking from '../models/Bookings';
import Seat from '../models/Seats';
import FloorPlan from '../models/FloorPlans';
import Floor from '../models/Floors';
import Building from '../models/Buildings';
import { BookingEntity, BookingHistory } from '../entities/Booking';

const sequelize = require('../../config/config').sequelize;

export const createBooking = async (
    userId: number,
    seatId: number,
    date: string
): Promise<BookingEntity> => {
    console.log('Creating booking:', { userId, seatId, date });

    const seat = await Seat.findByPk(seatId, { include: [{ model: FloorPlan, as: 'floorPlan' }] });
    if (!seat) {
        console.error('Seat not found:', seatId);
        throw new Error('Seat does not exist');
    }
    if (!seat.available) {
        console.error('Seat not available:', seatId);
        throw new Error('Seat is not available');
    }

    // const existingBooking = await Booking.findOne({ where: { seatId, date } });
    // if (existingBooking) {
    //     console.error('Seat already booked:', { seatId, date });
    //     throw new Error('Seat already booked for this date');
    // }

    try {
        return await sequelize.transaction(async (t: Transaction) => {
            const booking = await Booking.create({ userId, seatId, date }, { transaction: t });
            // await Seat.update({ available: false }, { where: { id: seatId }, transaction: t });
            console.log('Booking created:', booking.toJSON());
            return booking.get({ plain: true }) as BookingEntity;
        });
    } catch (error) {
        console.error('Transaction failed:', error);
        throw new Error('Failed to create booking');
    }
};

export const deleteBookingById = async (bookingId: number, userId: number): Promise<boolean> => {
    console.log('Deleting booking:', { bookingId, userId });

    const booking = await Booking.findOne({
        where: { id: bookingId, userId },
        include: [{ model: Seat, as: 'seat' }],
    });

    if (!booking) {
        console.error('Booking not found or not owned by user:', { bookingId, userId });
        return false;
    }

    try {
        return await sequelize.transaction(async (t: Transaction) => {
            await booking.destroy({ transaction: t });
            await Seat.update(
                { available: true },
                { where: { id: booking.seatId }, transaction: t }
            );
            console.log('Booking deleted and seat made available:', bookingId);
            return true;
        });
    } catch (error) {
        console.error('Transaction failed:', error);
        throw new Error('Failed to delete booking');
    }
};

export const getUserBookingHistory = async (userId: number): Promise<BookingHistory[]> => {
    console.log('Fetching history for user:', userId);

    const bookings = await Booking.findAll({
        where: { userId },
        include: [
            {
                model: Seat,
                as: 'seat',
                attributes: ['seatNumber'],
                include: [
                    {
                        model: FloorPlan,
                        as: 'floorPlan',
                        include: [
                            {
                                model: Floor,
                                as: 'floor',
                                attributes: ['name'],
                                include: [{ model: Building, as: 'building', attributes: ['name'] }],
                            },
                        ],
                    },
                ],
            },
        ],
    });

    return bookings.map(booking => ({
        id: booking.id,
        date: booking.date,
        buildingName: booking.seat?.floorPlan?.floor?.building?.name || 'Unknown Building',
        floorName: booking.seat?.floorPlan?.floor?.name || 'Unknown Floor',
        seatNumber: booking.seat?.seatNumber || 'Unknown Seat',
    }));
};