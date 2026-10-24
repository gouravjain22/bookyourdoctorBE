"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorDecisionSchema = exports.createAppointmentSchema = void 0;
const zod_1 = require("zod");
exports.createAppointmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        doctorId: zod_1.z.string().min(1, 'Doctor ID is required'),
        clinicId: zod_1.z.string().min(1, 'Clinic ID is required'),
        patientName: zod_1.z.string().min(2, 'Patient name must be at least 2 characters'),
        patientPhone: zod_1.z
            .string()
            .regex(/^[+]?[0-9]{10,14}$/, 'Please provide a valid mobile number (10-14 digits)'),
        patientEmail: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
        patientAge: zod_1.z.number().int().min(0).max(125).optional(),
        patientGender: zod_1.z.enum(['male', 'female', 'other', 'unspecified']).optional(),
        requestedDate: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Requested date must be in YYYY-MM-DD format'),
        requestedTimeSlot: zod_1.z.string().min(1, 'Requested time slot is required'),
        consultationType: zod_1.z.enum(['in-person', 'online']).default('in-person'),
        reasonForVisit: zod_1.z.string().min(5, 'Please provide the reason for consultation (min 5 characters)'),
        communicationConsent: zod_1.z.boolean().refine((val) => val === true, {
            message: 'You must consent to appointment-related communications',
        }),
        whatsappConsent: zod_1.z.boolean().default(true),
    }),
});
exports.doctorDecisionSchema = zod_1.z.object({
    body: zod_1.z.object({
        decision: zod_1.z.enum(['confirm', 'reject']),
        notes: zod_1.z.string().optional(),
        confirmedTimeSlot: zod_1.z.string().optional(),
        rescheduleDate: zod_1.z.string().optional(),
    }),
});
