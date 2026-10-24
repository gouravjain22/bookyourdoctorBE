import { z } from 'zod';

export const createClinicSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Clinic name is required'),
    city: z.string().min(1, 'City ID is required'),
    locality: z.string().min(2, 'Locality is required'),
    address: z.string().min(5, 'Detailed address is required'),
    pincode: z.string().optional(),
    phone: z.string().min(8, 'Clinic contact phone number is required'),
    googleMapsUrl: z.string().optional(),
    slotDurationMinutes: z.number().int().min(10).max(120).default(30),
    openingHours: z
      .array(
        z.object({
          day: z.string(),
          openTime: z.string(),
          closeTime: z.string(),
          isClosed: z.boolean().default(false),
        })
      )
      .optional(),
  }),
});

export const createCitySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'City name is required'),
    state: z.string().min(2, 'State name is required'),
    popularLocalities: z.array(z.string()).min(1, 'At least one locality is required'),
    introContent: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    imageUrl: z.string().optional(),
    isPopular: z.boolean().optional(),
  }),
});
