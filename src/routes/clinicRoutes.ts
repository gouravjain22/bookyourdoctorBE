import { Router } from 'express';
import {
  getClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
} from '../controllers/clinicController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createClinicSchema } from '../validations/clinicValidation';

const router = Router();

router.get('/', getClinics);
router.get('/:id', getClinicById);

router.post('/', authenticateAdmin, validateRequest(createClinicSchema), createClinic);
router.put('/:id', authenticateAdmin, updateClinic);
router.delete('/:id', authenticateAdmin, deleteClinic);

export default router;
