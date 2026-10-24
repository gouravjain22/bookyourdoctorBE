import { Request, Response } from 'express';
import { Specialty } from '../models/Specialty';
import { slugify } from '../utils/slugify';

export const getAllSpecialties = async (_req: Request, res: Response): Promise<void> => {
  try {
    const specialties = await Specialty.find({ isActive: true }).sort({ isPopular: -1, name: 1 });
    res.status(200).json({ success: true, count: specialties.length, data: specialties });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSpecialtyBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialtySlug } = req.params;
    const specialty = await Specialty.findOne({ slug: specialtySlug.toLowerCase(), isActive: true });

    if (!specialty) {
      res.status(404).json({ success: false, message: `Specialty '${specialtySlug}' not found` });
      return;
    }

    res.status(200).json({ success: true, data: specialty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSpecialty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, icon, description, commonConditions, isPopular } = req.body;
    const slug = slugify(name);

    const existing = await Specialty.findOne({ slug });
    if (existing) {
      res.status(400).json({ success: false, message: `Specialty '${slug}' already exists` });
      return;
    }

    const specialty = await Specialty.create({
      name,
      slug,
      icon: icon || 'Stethoscope',
      description: description || '',
      commonConditions: commonConditions || [],
      isPopular: isPopular || false,
      isActive: true,
    });

    res.status(201).json({ success: true, data: specialty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
