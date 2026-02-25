import { Router } from 'express';
import { createBooking, getMonthBookings } from '../controllers/bookingController.js';
import { getActivePriest } from '../controllers/priestController.js';

const router = Router();

router.get('/priests/active', getActivePriest);
router.get('/bookings/:year/:month', getMonthBookings);
router.post('/bookings', createBooking);

export default router;
