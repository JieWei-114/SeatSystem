import { Router } from 'express';
import { bookSeat, getBookingHistory, deleteBooking } from '../controllers/bookingController';

const router: Router = Router();

router.post('/add', bookSeat);
router.get('/history', getBookingHistory);
router.delete('/delete', deleteBooking);

export default router;