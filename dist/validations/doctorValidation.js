"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoctorSchema = void 0;
const zod_1 = require("zod");
exports.createDoctorSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(2, 'Full name is required'),
        email: zod_1.z.string().email('Valid email is required'),
        phone: zod_1.z.string().min(10, 'Valid WhatsApp phone is required'),
        photo: zod_1.z.string().optional(),
        gender: zod_1.z.string().optional(),
        primarySpecialty: zod_1.z.string().min(1, 'Primary specialty is required'),
        specialties: zod_1.z.array(zod_1.z.string()).optional(),
        qualifications: zod_1.z.array(zod_1.z.string()).min(1, 'At least one qualification required'),
        experienceYears: zod_1.z.number().min(0, 'Experience years must be positive'),
        registrationNumber: zod_1.z.string().min(2, 'Medical registration number is required'),
        isVerified: zod_1.z.boolean().default(false),
        bio: zod_1.z.string().optional(),
        languages: zod_1.z.array(zod_1.z.string()).min(1, 'At least one language required'),
        services: zod_1.z.array(zod_1.z.string()).optional(),
        clinics: zod_1.z.array(zod_1.z.object({
            clinic: zod_1.z.string().min(1, 'Clinic is required'),
            consultationFee: zod_1.z.number().min(0, 'Fee cannot be negative'),
            consultationType: zod_1.z.enum(['in-person', 'online', 'both']).default('in-person'),
            timings: zod_1.z.string().optional(),
            availableDays: zod_1.z.array(zod_1.z.string()).optional(),
        })).min(1, 'At least one clinic location is required'),
        isFeatured: zod_1.z.boolean().optional(),
    }),
});
