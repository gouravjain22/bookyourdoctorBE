import { Router } from 'express';
import {
  getDoctors,
  getDoctorBySlug,
  getDoctorById,
  createDoctor,
  updateDoctor,
  toggleVerification,
  deleteDoctor,
} from '../controllers/doctorController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createDoctorSchema } from '../validations/doctorValidation';

const router = Router();

// Public routes
router.get('/', getDoctors);
router.get('/by-slug/:doctorSlug', getDoctorBySlug);
router.get('/:id', getDoctorById);

// Admin protected routes
router.post('/', authenticateAdmin, validateRequest(createDoctorSchema), createDoctor);
router.put('/:id', authenticateAdmin, updateDoctor);
router.patch('/:id/verify', authenticateAdmin, toggleVerification);
router.delete('/:id', authenticateAdmin, deleteDoctor);

export default router;
