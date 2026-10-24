"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.adminLogout = exports.adminLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = require("../models/Admin");
const env_1 = require("../config/env");
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin_1.Admin.findOne({ email: email.toLowerCase().trim() });
        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password credentials',
            });
            return;
        }
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password credentials',
            });
            return;
        }
        // Update last login
        admin.lastLogin = new Date();
        await admin.save();
        // Sign JWT
        const token = jsonwebtoken_1.default.sign({ id: admin._id, email: admin.email, role: admin.role }, env_1.config.jwtSecret, { expiresIn: '7d' });
        // Set HTTP-Only Cookie
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: env_1.config.nodeEnv === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                lastLogin: admin.lastLogin,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Login failed' });
    }
};
exports.adminLogin = adminLogin;
const adminLogout = async (_req, res) => {
    res.clearCookie('admin_token');
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};
exports.adminLogout = adminLogout;
const getMe = async (req, res) => {
    if (!req.admin) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }
    res.status(200).json({
        success: true,
        admin: req.admin,
    });
};
exports.getMe = getMe;
