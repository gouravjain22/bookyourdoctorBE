import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorClinic {
  clinic: mongoose.Types.ObjectId;
  consultationFee: number;
  consultationType: 'in-person' | 'online' | 'both';
  timings: string;
  availableDays: string[];
}

export interface IDoctor extends Document {
  fullName: string;
  slug: string;
  email: string;
  phone: string; // Doctor WhatsApp number with country code (e.g. +919876543210)
  photo: string;
  gender: string;
  primarySpecialty: mongoose.Types.ObjectId;
  specialties: mongoose.Types.ObjectId[];
  qualifications: string[];
  experienceYears: number;
  registrationNumber: string;
  isVerified: boolean;
  verificationBadgeDate?: Date;
  bio: string;
  languages: string[];
  services: string[];
  clinics: IDoctorClinic[];
  rating?: number;
  reviewCount?: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorClinicSchema = new Schema<IDoctorClinic>(
  {
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    consultationFee: { type: Number, required: true, min: 0 },
    consultationType: { type: String, enum: ['in-person', 'online', 'both'], default: 'in-person' },
    timings: { type: String, default: '10:00 AM - 01:00 PM, 05:00 PM - 08:00 PM' },
    availableDays: [{ type: String, default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }],
  },
  { _id: false }
);

const DoctorSchema = new Schema<IDoctor>(
  {
    fullName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    photo: { type: String, default: '' },
    gender: { type: String, default: 'unspecified' },
    primarySpecialty: { type: Schema.Types.ObjectId, ref: 'Specialty', required: true, index: true },
    specialties: [{ type: Schema.Types.ObjectId, ref: 'Specialty' }],
    qualifications: [{ type: String, trim: true }],
    experienceYears: { type: Number, required: true, min: 0, index: true },
    registrationNumber: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: false, index: true },
    verificationBadgeDate: { type: Date },
    bio: { type: String, default: '' },
    languages: [{ type: String, trim: true }],
    services: [{ type: String, trim: true }],
    clinics: [DoctorClinicSchema],
    rating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
