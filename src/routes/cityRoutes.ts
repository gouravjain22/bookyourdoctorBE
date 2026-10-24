import { Router } from 'express';
import {
  getAllCities,
  getCityBySlug,
  createCity,
  updateCity,
  deleteCity,
} from '../controllers/cityController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createCitySchema } from '../validations/clinicValidation';

const router = Router();

// Public routes
router.get('/', getAllCities);
router.get('/:citySlug', getCityBySlug);

// Admin protected routes
router.post('/', authenticateAdmin, validateRequest(createCitySchema), createCity);
router.put('/:id', authenticateAdmin, updateCity);
router.delete('/:id', authenticateAdmin, deleteCity);

export default router;
