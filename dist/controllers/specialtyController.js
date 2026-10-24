"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpecialty = exports.getSpecialtyBySlug = exports.getAllSpecialties = void 0;
const Specialty_1 = require("../models/Specialty");
const slugify_1 = require("../utils/slugify");
const getAllSpecialties = async (_req, res) => {
    try {
        const specialties = await Specialty_1.Specialty.find({ isActive: true }).sort({ isPopular: -1, name: 1 });
        res.status(200).json({ success: true, count: specialties.length, data: specialties });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllSpecialties = getAllSpecialties;
const getSpecialtyBySlug = async (req, res) => {
    try {
        const { specialtySlug } = req.params;
        const specialty = await Specialty_1.Specialty.findOne({ slug: specialtySlug.toLowerCase(), isActive: true });
        if (!specialty) {
            res.status(404).json({ success: false, message: `Specialty '${specialtySlug}' not found` });
            return;
        }
        res.status(200).json({ success: true, data: specialty });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSpecialtyBySlug = getSpecialtyBySlug;
const createSpecialty = async (req, res) => {
    try {
        const { name, icon, description, commonConditions, isPopular } = req.body;
        const slug = (0, slugify_1.slugify)(name);
        const existing = await Specialty_1.Specialty.findOne({ slug });
        if (existing) {
            res.status(400).json({ success: false, message: `Specialty '${slug}' already exists` });
            return;
        }
        const specialty = await Specialty_1.Specialty.create({
            name,
            slug,
            icon: icon || 'Stethoscope',
            description: description || '',
            commonConditions: commonConditions || [],
            isPopular: isPopular || false,
            isActive: true,
        });
        res.status(201).json({ success: true, data: specialty });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createSpecialty = createSpecialty;
