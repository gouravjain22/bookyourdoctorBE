"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = require("../controllers/statsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Endpoint for frontend WhatsApp simulator drawer & audit log
router.get('/recent', statsController_1.getRecentNotifications);
router.get('/dashboard-stats', authMiddleware_1.authenticateAdmin, statsController_1.getDashboardStats);
exports.default = router;
