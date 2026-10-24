"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDoctor = exports.toggleVerification = exports.updateDoctor = exports.createDoctor = exports.getDoctorById = exports.getDoctorBySlug = exports.getDoctors = void 0;
const Doctor_1 = require("../models/Doctor");
const City_1 = require("../models/City");
const Specialty_1 = require("../models/Specialty");
const Clinic_1 = require("../models/Clinic");
const slugify_1 = require("../utils/slugify");
const getDoctors = async (req, res) => {
    try {
        const { citySlug, specialtySlug, locality, q, minExperience, minFee, maxFee, consultationType, sortBy = 'relevance', page = '1', limit = '10', featuredOnly, } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 10);
        const skip = (pageNum - 1) * limitNum;
        // Filter pipeline
        const query = { isActive: true };
        // City Filter
        let matchingClinicIds = [];
        if (citySlug) {
            const city = await City_1.City.findOne({ slug: citySlug.toLowerCase() });
            if (city) {
                const clinicQuery = { city: city._id, isActive: true };
                if (locality) {
                    clinicQuery.locality = { $regex: new RegExp(locality, 'i') };
                }
                const clinicsInCity = await Clinic_1.Clinic.find(clinicQuery).select('_id');
                matchingClinicIds = clinicsInCity.map((c) => c._id.toString());
                query['clinics.clinic'] = { $in: matchingClinicIds };
            }
            else {
                // City not found -> 0 results
                res.status(200).json({
                    success: true,
                    data: [],
                    pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 },
                });
                return;
            }
        }
        else if (locality) {
            const clinicsInLocality = await Clinic_1.Clinic.find({
                locality: { $regex: new RegExp(locality, 'i') },
                isActive: true,
            }).select('_id');
            matchingClinicIds = clinicsInLocality.map((c) => c._id.toString());
            query['clinics.clinic'] = { $in: matchingClinicIds };
        }
        // Specialty Filter
        if (specialtySlug) {
            const specialty = await Specialty_1.Specialty.findOne({ slug: specialtySlug.toLowerCase() });
            if (specialty) {
                query.$or = [{ primarySpecialty: specialty._id }, { specialties: specialty._id }];
            }
            else {
                res.status(200).json({
                    success: true,
                    data: [],
                    pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 },
                });
                return;
            }
        }
        // Minimum Experience Filter
        if (minExperience) {
            query.experienceYears = { $gte: parseInt(minExperience, 10) };
        }
        // Featured Only
        if (featuredOnly === 'true') {
            query.isFeatured = true;
        }
        // Fee Range Filter
        if (minFee || maxFee) {
            const feeFilter = {};
            if (minFee)
                feeFilter.$gte = parseInt(minFee, 10);
            if (maxFee)
                feeFilter.$lte = parseInt(maxFee, 10);
            query['clinics.consultationFee'] = feeFilter;
        }
        // Consultation Type Filter
        if (consultationType && consultationType !== 'all') {
            query['clinics.consultationType'] = { $in: [consultationType, 'both'] };
        }
        // Text Search
        if (q) {
            const searchRegex = new RegExp(q, 'i');
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { fullName: searchRegex },
                    { bio: searchRegex },
                    { qualifications: searchRegex },
                    { services: searchRegex },
                ],
            });
        }
        // Sort order
        let sortOptions = {};
        if (sortBy === 'experience') {
            sortOptions = { experienceYears: -1 };
        }
        else if (sortBy === 'fee_asc') {
            sortOptions = { 'clinics.consultationFee': 1 };
        }
        else if (sortBy === 'fee_desc') {
            sortOptions = { 'clinics.consultationFee': -1 };
        }
        else if (sortBy === 'rating') {
            sortOptions = { rating: -1, reviewCount: -1 };
        }
        else {
            // Relevance
            sortOptions = { isFeatured: -1, isVerified: -1, experienceYears: -1 };
        }
        const total = await Doctor_1.Doctor.countDocuments(query);
        const doctors = await Doctor_1.Doctor.find(query)
            .populate('primarySpecialty', 'name slug icon')
            .populate('specialties', 'name slug')
            .populate({
            path: 'clinics.clinic',
            populate: { path: 'city', select: 'name slug state' },
        })
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);
        res.status(200).json({
            success: true,
            data: doctors,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDoctors = getDoctors;
const getDoctorBySlug = async (req, res) => {
    try {
        const { doctorSlug } = req.params;
        const doctor = await Doctor_1.Doctor.findOne({ slug: doctorSlug.toLowerCase(), isActive: true })
            .populate('primarySpecialty', 'name slug icon description')
            .populate('specialties', 'name slug icon')
            .populate({
            path: 'clinics.clinic',
            populate: { path: 'city', select: 'name slug state' },
        });
        if (!doctor) {
            res.status(404).json({ success: false, message: 'Doctor profile not found' });
            return;
        }
        // Fetch related doctors in same specialty or clinics
        const relatedDoctors = await Doctor_1.Doctor.find({
            _id: { $ne: doctor._id },
            primarySpecialty: doctor.primarySpecialty,
            isActive: true,
        })
            .populate('primarySpecialty', 'name slug icon')
            .populate({
            path: 'clinics.clinic',
            populate: { path: 'city', select: 'name slug state' },
        })
            .limit(4);
        res.status(200).json({
            success: true,
            data: doctor,
            relatedDoctors,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDoctorBySlug = getDoctorBySlug;
const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor_1.Doctor.findById(id)
            .populate('primarySpecialty', 'name slug icon')
            .populate('specialties', 'name slug')
            .populate({
            path: 'clinics.clinic',
            populate: { path: 'city', select: 'name slug state' },
        });
        if (!doctor) {
            res.status(404).json({ success: false, message: 'Doctor not found' });
            return;
        }
        res.status(200).json({ success: true, data: doctor });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDoctorById = getDoctorById;
const createDoctor = async (req, res) => {
    try {
        const { fullName, primarySpecialty, isVerified } = req.body;
        let baseSlug = (0, slugify_1.slugify)(`dr-${fullName}`);
        // Check slug uniqueness
        let slug = baseSlug;
        let counter = 1;
        while (await Doctor_1.Doctor.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        const doctorData = {
            ...req.body,
            slug,
            verificationBadgeDate: isVerified ? new Date() : undefined,
            isActive: true,
        };
        const doctor = await Doctor_1.Doctor.create(doctorData);
        res.status(201).json({ success: true, data: doctor });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createDoctor = createDoctor;
const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Doctor_1.Doctor.findById(id);
        if (!existing) {
            res.status(404).json({ success: false, message: 'Doctor not found' });
            return;
        }
        const updateData = { ...req.body };
        if (req.body.isVerified && !existing.isVerified) {
            updateData.verificationBadgeDate = new Date();
        }
        else if (req.body.isVerified === false) {
            updateData.verificationBadgeDate = undefined;
        }
        const updated = await Doctor_1.Doctor.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate('primarySpecialty', 'name slug')
            .populate('clinics.clinic');
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateDoctor = updateDoctor;
const toggleVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor_1.Doctor.findById(id);
        if (!doctor) {
            res.status(404).json({ success: false, message: 'Doctor not found' });
            return;
        }
        doctor.isVerified = !doctor.isVerified;
        doctor.verificationBadgeDate = doctor.isVerified ? new Date() : undefined;
        await doctor.save();
        res.status(200).json({
            success: true,
            message: `Doctor verification ${doctor.isVerified ? 'granted' : 'revoked'}`,
            data: { isVerified: doctor.isVerified, verificationBadgeDate: doctor.verificationBadgeDate },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.toggleVerification = toggleVerification;
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor_1.Doctor.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!doctor) {
            res.status(404).json({ success: false, message: 'Doctor not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Doctor deactivated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteDoctor = deleteDoctor;
