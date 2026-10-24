import { Request, Response } from 'express';
import { Clinic } from '../models/Clinic';
import { City } from '../models/City';
import { slugify } from '../utils/slugify';

export const getClinics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { citySlug, locality } = req.query;
    const filter: Record<string, any> = { isActive: true };

    if (citySlug) {
      filter.citySlug = (citySlug as string).toLowerCase();
    }
    if (locality) {
      filter.locality = { $regex: new RegExp(locality as string, 'i') };
    }

    const clinics = await Clinic.find(filter).populate('city', 'name slug state').sort({ name: 1 });
    res.status(200).json({ success: true, count: clinics.length, data: clinics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClinicById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findById(id).populate('city', 'name slug state');

    if (!clinic) {
      res.status(404).json({ success: false, message: 'Clinic not found' });
      return;
    }

    res.status(200).json({ success: true, data: clinic });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, city, locality, address, pincode, phone, googleMapsUrl, openingHours, slotDurationMinutes } = req.body;

    const cityDoc = await City.findById(city);
    if (!cityDoc) {
      res.status(400).json({ success: false, message: 'Invalid city ID' });
      return;
    }

    const slug = slugify(`${name}-${locality}`);

    const clinic = await Clinic.create({
      name,
      slug,
      city: cityDoc._id,
      citySlug: cityDoc.slug,
      locality,
      address,
      pincode: pincode || '',
      phone,
      googleMapsUrl: googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${name}, ${address}, ${cityDoc.name}`)}`,
      openingHours: openingHours || [
        { day: 'Monday', openTime: '09:00 AM', closeTime: '08:00 PM', isClosed: false },
        { day: 'Tuesday', openTime: '09:00 AM', closeTime: '08:00 PM', isClosed: false },
        { day: 'Wednesday', openTime: '09:00 AM', closeTime: '08:00 PM', isClosed: false },
        { day: 'Thursday', openTime: '09:00 AM', closeTime: '08:00 PM', isClosed: false },
        { day: 'Friday', openTime: '09:00 AM', closeTime: '08:00 PM', isClosed: false },
        { day: 'Saturday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
        { day: 'Sunday', openTime: '10:00 AM', closeTime: '02:00 PM', isClosed: true },
      ],
      slotDurationMinutes: slotDurationMinutes || 30,
      isActive: true,
    });

    res.status(201).json({ success: true, data: clinic });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!clinic) {
      res.status(404).json({ success: false, message: 'Clinic not found' });
      return;
    }

    res.status(200).json({ success: true, data: clinic });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!clinic) {
      res.status(404).json({ success: false, message: 'Clinic not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Clinic deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
