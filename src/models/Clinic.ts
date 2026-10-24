import mongoose, { Schema, Document } from 'mongoose';

export interface IOpeningHours {
  day: string; // "Monday", "Tuesday", etc.
  openTime: string; // "09:00 AM"
  closeTime: string; // "08:00 PM"
  isClosed: boolean;
}

export interface IClinic extends Document {
  name: string;
  slug: string;
  city: mongoose.Types.ObjectId;
  citySlug: string;
  locality: string;
  address: string;
  pincode: string;
  phone: string;
  googleMapsUrl: string;
  openingHours: IOpeningHours[];
  slotDurationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OpeningHoursSchema = new Schema<IOpeningHours>(
  {
    day: { type: String, required: true },
    openTime: { type: String, default: '09:00 AM' },
    closeTime: { type: String, default: '08:00 PM' },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const ClinicSchema = new Schema<IClinic>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    city: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    citySlug: { type: String, required: true, lowercase: true, index: true },
    locality: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    pincode: { type: String, default: '' },
    phone: { type: String, required: true, trim: true },
    googleMapsUrl: { type: String, default: '' },
    openingHours: [OpeningHoursSchema],
    slotDurationMinutes: { type: Number, default: 30 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Clinic = mongoose.model<IClinic>('Clinic', ClinicSchema);
