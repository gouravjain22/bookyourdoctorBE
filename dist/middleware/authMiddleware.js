"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const Admin_1 = require("../models/Admin");
const authenticateAdmin = async (req, res, next) => {
    try {
        let token = req.cookies?.admin_token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in as an administrator.',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        const admin = await Admin_1.Admin.findById(decoded.id).select('-password');
        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Admin account not found or access revoked.',
            });
            return;
        }
        req.admin = admin;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired session. Please log in again.',
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
