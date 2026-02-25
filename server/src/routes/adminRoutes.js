import { Router } from 'express';
import { adminLogin } from '../controllers/adminController.js';
import { getAdminBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', adminLogin);
router.get('/bookings', requireAdminAuth, getAdminBookings);
router.patch('/bookings/:id/status', requireAdminAuth, updateBookingStatus);

export default router;
