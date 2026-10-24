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
exports.Appointment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AppointmentSchema = new mongoose_1.Schema({
    bookingId: { type: String, required: true, unique: true, uppercase: true, index: true },
    doctor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    clinic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    patientName: { type: String, required: true, trim: true },
    patientPhone: { type: String, required: true, trim: true },
    patientEmail: { type: String, trim: true, lowercase: true, default: '' },
    patientAge: { type: Number },
    patientGender: { type: String, default: 'unspecified' },
    requestedDate: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    requestedTimeSlot: { type: String, required: true },
    confirmedTimeSlot: { type: String },
    consultationType: { type: String, enum: ['in-person', 'online'], default: 'in-person' },
    reasonForVisit: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
        default: 'pending',
        index: true,
    },
    doctorConfirmationToken: { type: String, required: true, index: true },
    tokenExpiresAt: { type: Date, required: true },
    doctorDecisionNotes: { type: String, default: '' },
    doctorActionAt: { type: Date },
    communicationConsent: { type: Boolean, required: true, default: true },
    whatsappConsent: { type: Boolean, required: true, default: true },
    whatsappNotificationStatus: {
        doctorNotified: { type: Boolean, default: false },
        doctorNotifiedAt: { type: Date },
        doctorNotificationId: { type: String },
        patientNotified: { type: Boolean, default: false },
        patientNotifiedAt: { type: Date },
        patientNotificationId: { type: String },
    },
}, { timestamps: true });
exports.Appointment = mongoose_1.default.model('Appointment', AppointmentSchema);
