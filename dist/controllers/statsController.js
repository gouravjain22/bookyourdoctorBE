"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getRecentNotifications = void 0;
const NotificationLog_1 = require("../models/NotificationLog");
const Doctor_1 = require("../models/Doctor");
const Clinic_1 = require("../models/Clinic");
const City_1 = require("../models/City");
const Appointment_1 = require("../models/Appointment");
const getRecentNotifications = async (req, res) => {
    try {
        const { limit = '20', bookingId } = req.query;
        const query = {};
        if (bookingId) {
            query.bookingId = bookingId.toUpperCase();
        }
        const notifications = await NotificationLog_1.NotificationLog.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit, 10) || 20);
        res.status(200).json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRecentNotifications = getRecentNotifications;
const getDashboardStats = async (_req, res) => {
    try {
        const [totalDoctors, verifiedDoctors, totalClinics, totalCities, totalAppointments, pendingAppointments, confirmedAppointments, recentAppointments,] = await Promise.all([
            Doctor_1.Doctor.countDocuments({ isActive: true }),
            Doctor_1.Doctor.countDocuments({ isActive: true, isVerified: true }),
            Clinic_1.Clinic.countDocuments({ isActive: true }),
            City_1.City.countDocuments({ isActive: true }),
            Appointment_1.Appointment.countDocuments(),
            Appointment_1.Appointment.countDocuments({ status: 'pending' }),
            Appointment_1.Appointment.countDocuments({ status: 'confirmed' }),
            Appointment_1.Appointment.find()
                .populate('doctor', 'fullName photo')
                .populate('clinic', 'name locality')
                .sort({ createdAt: -1 })
                .limit(6),
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalDoctors,
                verifiedDoctors,
                totalClinics,
                totalCities,
                totalAppointments,
                pendingAppointments,
                confirmedAppointments,
                recentAppointments,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
