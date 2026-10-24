import { Request, Response } from 'express';
import { City } from '../models/City';
import { slugify } from '../utils/slugify';

export const getAllCities = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cities = await City.find({ isActive: true }).sort({ isPopular: -1, name: 1 });
    res.status(200).json({ success: true, count: cities.length, data: cities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCityBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { citySlug } = req.params;
    const city = await City.findOne({ slug: citySlug.toLowerCase(), isActive: true });

    if (!city) {
      res.status(404).json({ success: false, message: `City '${citySlug}' not found` });
      return;
    }

    res.status(200).json({ success: true, data: city });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, state, popularLocalities, introContent, metaTitle, metaDescription, imageUrl, isPopular } = req.body;
    const slug = slugify(name);

    const existing = await City.findOne({ slug });
    if (existing) {
      res.status(400).json({ success: false, message: `City with slug '${slug}' already exists` });
      return;
    }

    const city = await City.create({
      name,
      slug,
      state,
      popularLocalities: popularLocalities || [],
      introContent: introContent || `Find and book verified doctors in ${name}. Compare clinics, consultation fees, and patient reviews.`,
      metaTitle: metaTitle || `Top Doctors & Clinics in ${name} | BookYourDoctor`,
      metaDescription: metaDescription || `Discover the best doctors in ${name}. Search by specialty, locality, and book appointments with instant WhatsApp updates.`,
      imageUrl: imageUrl || '',
      isPopular: isPopular || false,
      isActive: true,
    });

    res.status(201).json({ success: true, data: city });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await City.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'City not found' });
      return;
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const city = await City.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!city) {
      res.status(404).json({ success: false, message: 'City not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'City marked inactive' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
