"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCity = exports.updateCity = exports.createCity = exports.getCityBySlug = exports.getAllCities = void 0;
const City_1 = require("../models/City");
const slugify_1 = require("../utils/slugify");
const getAllCities = async (_req, res) => {
    try {
        const cities = await City_1.City.find({ isActive: true }).sort({ isPopular: -1, name: 1 });
        res.status(200).json({ success: true, count: cities.length, data: cities });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllCities = getAllCities;
const getCityBySlug = async (req, res) => {
    try {
        const { citySlug } = req.params;
        const city = await City_1.City.findOne({ slug: citySlug.toLowerCase(), isActive: true });
        if (!city) {
            res.status(404).json({ success: false, message: `City '${citySlug}' not found` });
            return;
        }
        res.status(200).json({ success: true, data: city });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCityBySlug = getCityBySlug;
const createCity = async (req, res) => {
    try {
        const { name, state, popularLocalities, introContent, metaTitle, metaDescription, imageUrl, isPopular } = req.body;
        const slug = (0, slugify_1.slugify)(name);
        const existing = await City_1.City.findOne({ slug });
        if (existing) {
            res.status(400).json({ success: false, message: `City with slug '${slug}' already exists` });
            return;
        }
        const city = await City_1.City.create({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCity = createCity;
const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await City_1.City.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updated) {
            res.status(404).json({ success: false, message: 'City not found' });
            return;
        }
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCity = updateCity;
const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;
        const city = await City_1.City.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!city) {
            res.status(404).json({ success: false, message: 'City not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'City marked inactive' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCity = deleteCity;
