"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const appointmentValidation_1 = require("../validations/appointmentValidation");
const router = (0, express_1.Router)();
// Public Patient Booking
router.post('/', (0, validationMiddleware_1.validateRequest)(appointmentValidation_1.createAppointmentSchema), appointmentController_1.createAppointment);
router.get('/booking/:bookingId', appointmentController_1.getAppointmentByBookingId);
// Doctor WhatsApp secure confirmation endpoints
router.get('/doctor-confirm/:token', appointmentController_1.getDoctorAppointmentByToken);
router.post('/doctor-confirm/:token', (0, validationMiddleware_1.validateRequest)(appointmentValidation_1.doctorDecisionSchema), appointmentController_1.handleDoctorDecision);
// Admin appointments
router.get('/admin/all', authMiddleware_1.authenticateAdmin, appointmentController_1.getAllAppointments);
router.put('/admin/:id/status', authMiddleware_1.authenticateAdmin, appointmentController_1.updateAppointmentStatus);
exports.default = router;
