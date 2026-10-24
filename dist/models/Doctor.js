"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctor = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DoctorClinicSchema = new mongoose_1.Schema({
    clinic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    consultationFee: { type: Number, required: true, min: 0 },
    consultationType: { type: String, enum: ['in-person', 'online', 'both'], default: 'in-person' },
    timings: { type: String, default: '10:00 AM - 01:00 PM, 05:00 PM - 08:00 PM' },
    availableDays: [{ type: String, default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }],
}, { _id: false });
const DoctorSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    photo: { type: String, default: '' },
    gender: { type: String, default: 'unspecified' },
    primarySpecialty: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Specialty', required: true, index: true },
    specialties: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Specialty' }],
    qualifications: [{ type: String, trim: true }],
    experienceYears: { type: Number, required: true, min: 0, index: true },
    registrationNumber: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: false, index: true },
    verificationBadgeDate: { type: Date },
    bio: { type: String, default: '' },
    languages: [{ type: String, trim: true }],
    services: [{ type: String, trim: true }],
    clinics: [DoctorClinicSchema],
    rating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });
exports.Doctor = mongoose_1.default.model('Doctor', DoctorSchema);
