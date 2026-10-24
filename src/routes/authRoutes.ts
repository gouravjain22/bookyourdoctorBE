import { Router } from 'express';
import { adminLogin, adminLogout, getMe } from '../controllers/authController';
import { validateRequest } from '../middleware/validationMiddleware';
import { adminLoginSchema } from '../validations/authValidation';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', validateRequest(adminLoginSchema), adminLogin);
router.post('/logout', adminLogout);
router.get('/me', authenticateAdmin, getMe);

export default router;
