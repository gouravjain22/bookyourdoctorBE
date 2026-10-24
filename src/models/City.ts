import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  name: string;
  slug: string;
  state: string;
  popularLocalities: string[];
  introContent: string;
  metaTitle: string;
  metaDescription: string;
  imageUrl?: string;
  isActive: boolean;
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    state: { type: String, required: true, trim: true },
    popularLocalities: [{ type: String, trim: true }],
    introContent: { type: String, default: '' },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const City = mongoose.model<ICity>('City', CitySchema);
