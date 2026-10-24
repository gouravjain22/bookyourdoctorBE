import { Router } from 'express';
import {
  createAppointment,
  getAppointmentByBookingId,
  getDoctorAppointmentByToken,
  handleDoctorDecision,
  getAllAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import {
  createAppointmentSchema,
  doctorDecisionSchema,
} from '../validations/appointmentValidation';

const router = Router();

// Public Patient Booking
router.post('/', validateRequest(createAppointmentSchema), createAppointment);
router.get('/booking/:bookingId', getAppointmentByBookingId);

// Doctor WhatsApp secure confirmation endpoints
router.get('/doctor-confirm/:token', getDoctorAppointmentByToken);
router.post('/doctor-confirm/:token', validateRequest(doctorDecisionSchema), handleDoctorDecision);

// Admin appointments
router.get('/admin/all', authenticateAdmin, getAllAppointments);
router.put('/admin/:id/status', authenticateAdmin, updateAppointmentStatus);

export default router;
