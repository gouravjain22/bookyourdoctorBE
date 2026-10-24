import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().min(1, 'Doctor ID is required'),
    clinicId: z.string().min(1, 'Clinic ID is required'),
    patientName: z.string().min(2, 'Patient name must be at least 2 characters'),
    patientPhone: z
      .string()
      .regex(/^[+]?[0-9]{10,14}$/, 'Please provide a valid mobile number (10-14 digits)'),
    patientEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
    patientAge: z.number().int().min(0).max(125).optional(),
    patientGender: z.enum(['male', 'female', 'other', 'unspecified']).optional(),
    requestedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Requested date must be in YYYY-MM-DD format'),
    requestedTimeSlot: z.string().min(1, 'Requested time slot is required'),
    consultationType: z.enum(['in-person', 'online']).default('in-person'),
    reasonForVisit: z.string().min(5, 'Please provide the reason for consultation (min 5 characters)'),
    communicationConsent: z.boolean().refine((val) => val === true, {
      message: 'You must consent to appointment-related communications',
    }),
    whatsappConsent: z.boolean().default(true),
  }),
});

export const doctorDecisionSchema = z.object({
  body: z.object({
    decision: z.enum(['confirm', 'reject']),
    notes: z.string().optional(),
    confirmedTimeSlot: z.string().optional(),
    rescheduleDate: z.string().optional(),
  }),
});
