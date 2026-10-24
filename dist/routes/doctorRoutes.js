"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctorController_1 = require("../controllers/doctorController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const doctorValidation_1 = require("../validations/doctorValidation");
const router = (0, express_1.Router)();
// Public routes
router.get('/', doctorController_1.getDoctors);
router.get('/by-slug/:doctorSlug', doctorController_1.getDoctorBySlug);
router.get('/:id', doctorController_1.getDoctorById);
// Admin protected routes
router.post('/', authMiddleware_1.authenticateAdmin, (0, validationMiddleware_1.validateRequest)(doctorValidation_1.createDoctorSchema), doctorController_1.createDoctor);
router.put('/:id', authMiddleware_1.authenticateAdmin, doctorController_1.updateDoctor);
router.patch('/:id/verify', authMiddleware_1.authenticateAdmin, doctorController_1.toggleVerification);
router.delete('/:id', authMiddleware_1.authenticateAdmin, doctorController_1.deleteDoctor);
exports.default = router;
