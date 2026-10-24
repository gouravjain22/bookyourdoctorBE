import { Router } from 'express';
import { getRecentNotifications, getDashboardStats } from '../controllers/statsController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

// Endpoint for frontend WhatsApp simulator drawer & audit log
router.get('/recent', getRecentNotifications);
router.get('/dashboard-stats', authenticateAdmin, getDashboardStats);

export default router;
