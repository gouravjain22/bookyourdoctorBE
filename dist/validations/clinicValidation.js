"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCitySchema = exports.createClinicSchema = void 0;
const zod_1 = require("zod");
exports.createClinicSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Clinic name is required'),
        city: zod_1.z.string().min(1, 'City ID is required'),
        locality: zod_1.z.string().min(2, 'Locality is required'),
        address: zod_1.z.string().min(5, 'Detailed address is required'),
        pincode: zod_1.z.string().optional(),
        phone: zod_1.z.string().min(8, 'Clinic contact phone number is required'),
        googleMapsUrl: zod_1.z.string().optional(),
        slotDurationMinutes: zod_1.z.number().int().min(10).max(120).default(30),
        openingHours: zod_1.z
            .array(zod_1.z.object({
            day: zod_1.z.string(),
            openTime: zod_1.z.string(),
            closeTime: zod_1.z.string(),
            isClosed: zod_1.z.boolean().default(false),
        }))
            .optional(),
    }),
});
exports.createCitySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'City name is required'),
        state: zod_1.z.string().min(2, 'State name is required'),
        popularLocalities: zod_1.z.array(zod_1.z.string()).min(1, 'At least one locality is required'),
        introContent: zod_1.z.string().optional(),
        metaTitle: zod_1.z.string().optional(),
        metaDescription: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().optional(),
        isPopular: zod_1.z.boolean().optional(),
    }),
});
