import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Booking from '../db/models/Bookings';
import { createBooking, getUserBookingHistory, deleteBookingById } from '../db/dao/bookingDao';

interface UserPayload {
  id: number;
  username: string;
  role: string;
}

export const bookSeat = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  const { seatId, date } = req.body;

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

  if (!seatId || !date) {
    res.status(400).json({ status: 'fail', message: 'Seat ID and date required' });
    return;
  }

  const existingBooking = await Booking.findOne({ where: { seatId, date } });
    if (existingBooking) {
        console.error('Seat already booked for this date:', { seatId, date });
      return;
    }

  try {
    const booking = await createBooking(decodedUser.id, seatId, date);
    res.status(201).json({ status: 'success', message: 'Seat booked', data: booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  const { bookingId } = req.body;

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

  if (!bookingId) {
      res.status(400).json({ status: 'fail', message: 'Booking ID required' });
      return;
  }

  try {
      const success = await deleteBookingById(bookingId, decodedUser.id); // Use the renamed function

      if (!success) {
          res.status(404).json({ status: 'fail', message: 'Booking not found or not authorized' });
          return;
      }

      res.status(200).json({ status: 'success', message: 'Booking deleted successfully' });
  } catch (error) {
      console.error('Delete booking error:', error);
      res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

export const getBookingHistory = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

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

  try {
    const history = await getUserBookingHistory(decodedUser.id);
    res.status(200).json({ status: 'success', data: history });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch history' });
  }
};