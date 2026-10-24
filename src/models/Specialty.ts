import mongoose, { Schema, Document } from 'mongoose';

export interface ISpecialty extends Document {
  name: string;
  slug: string;
  icon: string;
  description: string;
  commonConditions: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SpecialtySchema = new Schema<ISpecialty>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    icon: { type: String, default: 'Stethoscope' },
    description: { type: String, default: '' },
    commonConditions: [{ type: String, trim: true }],
    isPopular: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Specialty = mongoose.model<ISpecialty>('Specialty', SpecialtySchema);
