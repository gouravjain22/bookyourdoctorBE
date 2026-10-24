"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClinic = exports.updateClinic = exports.createClinic = exports.getClinicById = exports.getClinics = void 0;
const Clinic_1 = require("../models/Clinic");
const City_1 = require("../models/City");
const slugify_1 = require("../utils/slugify");
const getClinics = async (req, res) => {
    try {
        const { citySlug, locality } = req.query;
        const filter = { isActive: true };
        if (citySlug) {
            filter.citySlug = citySlug.toLowerCase();
        }
        if (locality) {
            filter.locality = { $regex: new RegExp(locality, 'i') };
        }
        const clinics = await Clinic_1.Clinic.find(filter).populate('city', 'name slug state').sort({ name: 1 });
        res.status(200).json({ success: true, count: clinics.length, data: clinics });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getClinics = getClinics;
const getClinicById = async (req, res) => {
    try {
        const { id } = req.params;
        const clinic = await Clinic_1.Clinic.findById(id).populate('city', 'name slug state');
        if (!clinic) {
            res.status(404).json({ success: false, message: 'Clinic not found' });
            return;
        }
        res.status(200).json({ success: true, data: clinic });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getClinicById = getClinicById;
const createClinic = async (req, res) => {
    try {
        const { name, city, locality, address, pincode, phone, googleMapsUrl, openingHours, slotDurationMinutes } = req.body;
        const cityDoc = await City_1.City.findById(city);
        if (!cityDoc) {
            res.status(400).json({ success: false, message: 'Invalid city ID' });
            return;
        }
        const slug = (0, slugify_1.slugify)(`${name}-${locality}`);
        const clinic = await Clinic_1.Clinic.create({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createClinic = createClinic;
const updateClinic = async (req, res) => {
    try {
        const { id } = req.params;
        const clinic = await Clinic_1.Clinic.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!clinic) {
            res.status(404).json({ success: false, message: 'Clinic not found' });
            return;
        }
        res.status(200).json({ success: true, data: clinic });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateClinic = updateClinic;
const deleteClinic = async (req, res) => {
    try {
        const { id } = req.params;
        const clinic = await Clinic_1.Clinic.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!clinic) {
            res.status(404).json({ success: false, message: 'Clinic not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Clinic deactivated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteClinic = deleteClinic;
