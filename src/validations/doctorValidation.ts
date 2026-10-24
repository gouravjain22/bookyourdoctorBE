import { z } from 'zod';

export const createDoctorSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid WhatsApp phone is required'),
    photo: z.string().optional(),
    gender: z.string().optional(),
    primarySpecialty: z.string().min(1, 'Primary specialty is required'),
    specialties: z.array(z.string()).optional(),
    qualifications: z.array(z.string()).min(1, 'At least one qualification required'),
    experienceYears: z.number().min(0, 'Experience years must be positive'),
    registrationNumber: z.string().min(2, 'Medical registration number is required'),
    isVerified: z.boolean().default(false),
    bio: z.string().optional(),
    languages: z.array(z.string()).min(1, 'At least one language required'),
    services: z.array(z.string()).optional(),
    clinics: z.array(
      z.object({
        clinic: z.string().min(1, 'Clinic is required'),
        consultationFee: z.number().min(0, 'Fee cannot be negative'),
        consultationType: z.enum(['in-person', 'online', 'both']).default('in-person'),
        timings: z.string().optional(),
        availableDays: z.array(z.string()).optional(),
      })
    ).min(1, 'At least one clinic location is required'),
    isFeatured: z.boolean().optional(),
  }),
});
