import { Router } from 'express';
import {
  getAllSpecialties,
  getSpecialtyBySlug,
  createSpecialty,
} from '../controllers/specialtyController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getAllSpecialties);
router.get('/:specialtySlug', getSpecialtyBySlug);
router.post('/', authenticateAdmin, createSpecialty);

export default router;
