"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDoctorConfirmationToken = exports.generateDoctorConfirmationToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateDoctorConfirmationToken = (appointmentId, doctorId, bookingId) => {
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours validity
    // Create a signed JWT with tamper-proof signature
    const token = jsonwebtoken_1.default.sign({
        appointmentId,
        doctorId,
        bookingId,
        nonce: crypto_1.default.randomBytes(8).toString('hex'),
    }, env_1.config.doctorConfirmationSecret, { expiresIn: '72h' });
    return { token, expiresAt };
};
exports.generateDoctorConfirmationToken = generateDoctorConfirmationToken;
const verifyDoctorConfirmationToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.doctorConfirmationSecret);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyDoctorConfirmationToken = verifyDoctorConfirmationToken;
