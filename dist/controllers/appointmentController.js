"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatus = exports.getAllAppointments = exports.handleDoctorDecision = exports.getDoctorAppointmentByToken = exports.getAppointmentByBookingId = exports.createAppointment = void 0;
const Appointment_1 = require("../models/Appointment");
const Doctor_1 = require("../models/Doctor");
const Clinic_1 = require("../models/Clinic");
const slugify_1 = require("../utils/slugify");
const tokenService_1 = require("../services/tokenService");
const whatsappService_1 = require("../services/whatsappService");
const createAppointment = async (req, res) => {
    try {
        const { doctorId, clinicId, patientName, patientPhone, patientEmail, patientAge, patientGender, requestedDate, requestedTimeSlot, consultationType, reasonForVisit, communicationConsent, whatsappConsent, } = req.body;
        const doctor = await Doctor_1.Doctor.findById(doctorId).populate('primarySpecialty');
        if (!doctor || !doctor.isActive) {
            res.status(404).json({ success: false, message: 'Doctor not found or inactive' });
            return;
        }
        const clinic = await Clinic_1.Clinic.findById(clinicId);
        if (!clinic || !clinic.isActive) {
            res.status(404).json({ success: false, message: 'Clinic location not found or inactive' });
            return;
        }
        // Ensure clinic belongs to doctor
        const clinicConfig = doctor.clinics.find((c) => c.clinic.toString() === clinic._id.toString());
        if (!clinicConfig) {
            res.status(400).json({
                success: false,
                message: 'Doctor is not affiliated with the selected clinic location',
            });
            return;
        }
        const bookingId = (0, slugify_1.generateBookingId)();
        // Create temporary ObjectId for appointment token generation
        const { token, expiresAt } = (0, tokenService_1.generateDoctorConfirmationToken)(bookingId, doctor._id.toString(), bookingId);
        const appointment = await Appointment_1.Appointment.create({
            bookingId,
            doctor: doctor._id,
            clinic: clinic._id,
            patientName,
            patientPhone,
            patientEmail: patientEmail || '',
            patientAge: patientAge || undefined,
            patientGender: patientGender || 'unspecified',
            requestedDate,
            requestedTimeSlot,
            consultationType: consultationType || 'in-person',
            reasonForVisit,
            status: 'pending',
            doctorConfirmationToken: token,
            tokenExpiresAt: expiresAt,
            communicationConsent,
            whatsappConsent,
            whatsappNotificationStatus: {
                doctorNotified: false,
                patientNotified: false,
            },
        });
        // Send WhatsApp notification to Doctor with confirmation link
        const doctorNotified = await whatsappService_1.WhatsAppService.notifyDoctorNewRequest({
            doctorName: doctor.fullName,
            doctorPhone: doctor.phone,
            patientName,
            patientAge,
            patientGender,
            clinicName: clinic.name,
            locality: clinic.locality,
            requestedDate,
            requestedTimeSlot,
            reasonForVisit,
            bookingId,
            confirmationToken: token,
        });
        // Send WhatsApp acknowledgment to Patient
        const patientNotified = await whatsappService_1.WhatsAppService.notifyPatientBookingReceived({
            patientName,
            patientPhone,
            doctorName: doctor.fullName,
            clinicName: clinic.name,
            requestedDate,
            requestedTimeSlot,
            bookingId,
        });
        // Update appointment notification status
        appointment.whatsappNotificationStatus.doctorNotified = doctorNotified;
        appointment.whatsappNotificationStatus.doctorNotifiedAt = new Date();
        appointment.whatsappNotificationStatus.patientNotified = patientNotified;
        appointment.whatsappNotificationStatus.patientNotifiedAt = new Date();
        await appointment.save();
        res.status(201).json({
            success: true,
            message: 'Appointment request submitted successfully. Pending doctor confirmation.',
            data: {
                bookingId: appointment.bookingId,
                status: appointment.status,
                patientName: appointment.patientName,
                requestedDate: appointment.requestedDate,
                requestedTimeSlot: appointment.requestedTimeSlot,
                clinic: {
                    name: clinic.name,
                    address: clinic.address,
                    locality: clinic.locality,
                    phone: clinic.phone,
                    googleMapsUrl: clinic.googleMapsUrl,
                },
                doctor: {
                    id: doctor._id,
                    fullName: doctor.fullName,
                    specialty: doctor.primarySpecialty?.name,
                    photo: doctor.photo,
                },
                fee: clinicConfig.consultationFee,
                createdAt: appointment.createdAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createAppointment = createAppointment;
const getAppointmentByBookingId = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const appointment = await Appointment_1.Appointment.findOne({ bookingId: bookingId.toUpperCase() })
            .populate({
            path: 'doctor',
            select: 'fullName slug photo qualifications experienceYears primarySpecialty rating',
            populate: { path: 'primarySpecialty', select: 'name icon' },
        })
            .populate('clinic', 'name address locality city phone googleMapsUrl openingHours');
        if (!appointment) {
            res.status(404).json({ success: false, message: 'Booking not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: appointment,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAppointmentByBookingId = getAppointmentByBookingId;
const getDoctorAppointmentByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const payload = (0, tokenService_1.verifyDoctorConfirmationToken)(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired doctor confirmation link.',
            });
            return;
        }
        const appointment = await Appointment_1.Appointment.findOne({ doctorConfirmationToken: token })
            .populate('doctor', 'fullName slug photo qualifications phone')
            .populate('clinic', 'name address locality phone');
        if (!appointment) {
            res.status(404).json({
                success: false,
                message: 'Appointment record not found for this token.',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: appointment,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDoctorAppointmentByToken = getDoctorAppointmentByToken;
const handleDoctorDecision = async (req, res) => {
    try {
        const { token } = req.params;
        const { decision, notes, confirmedTimeSlot } = req.body;
        const payload = (0, tokenService_1.verifyDoctorConfirmationToken)(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired confirmation link',
            });
            return;
        }
        const appointment = await Appointment_1.Appointment.findOne({ doctorConfirmationToken: token })
            .populate('doctor', 'fullName phone')
            .populate('clinic', 'name');
        if (!appointment) {
            res.status(404).json({ success: false, message: 'Appointment not found' });
            return;
        }
        if (appointment.status !== 'pending') {
            res.status(400).json({
                success: false,
                message: `This appointment has already been marked as ${appointment.status.toUpperCase()}. No further action can be taken.`,
                data: appointment,
            });
            return;
        }
        if (decision === 'confirm') {
            appointment.status = 'confirmed';
            appointment.confirmedTimeSlot = confirmedTimeSlot || appointment.requestedTimeSlot;
        }
        else {
            appointment.status = 'rejected';
        }
        appointment.doctorDecisionNotes = notes || '';
        appointment.doctorActionAt = new Date();
        await appointment.save();
        // Notify patient on WhatsApp regarding doctor decision
        await whatsappService_1.WhatsAppService.notifyPatientDecision({
            patientName: appointment.patientName,
            patientPhone: appointment.patientPhone,
            doctorName: appointment.doctor?.fullName || 'the Doctor',
            clinicName: appointment.clinic?.name || 'the Clinic',
            decision: appointment.status,
            confirmedTimeSlot: appointment.confirmedTimeSlot,
            notes: appointment.doctorDecisionNotes,
            bookingId: appointment.bookingId,
        });
        res.status(200).json({
            success: true,
            message: `Appointment has been ${appointment.status} successfully`,
            data: appointment,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.handleDoctorDecision = handleDoctorDecision;
const getAllAppointments = async (req, res) => {
    try {
        const { status, doctorId, citySlug, search, page = '1', limit = '15' } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 15);
        const skip = (pageNum - 1) * limitNum;
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (doctorId) {
            query.doctor = doctorId;
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [{ bookingId: regex }, { patientName: regex }, { patientPhone: regex }];
        }
        const total = await Appointment_1.Appointment.countDocuments(query);
        const appointments = await Appointment_1.Appointment.find(query)
            .populate('doctor', 'fullName slug photo primarySpecialty')
            .populate('clinic', 'name locality citySlug address phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        res.status(200).json({
            success: true,
            data: appointments,
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
exports.getAllAppointments = getAllAppointments;
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const appointment = await Appointment_1.Appointment.findById(id)
            .populate('doctor', 'fullName phone')
            .populate('clinic', 'name');
        if (!appointment) {
            res.status(404).json({ success: false, message: 'Appointment not found' });
            return;
        }
        appointment.status = status;
        if (notes) {
            appointment.doctorDecisionNotes = notes;
        }
        await appointment.save();
        // Trigger WhatsApp notification if confirmed or rejected
        if (status === 'confirmed' || status === 'rejected') {
            await whatsappService_1.WhatsAppService.notifyPatientDecision({
                patientName: appointment.patientName,
                patientPhone: appointment.patientPhone,
                doctorName: appointment.doctor?.fullName || 'the Doctor',
                clinicName: appointment.clinic?.name || 'the Clinic',
                decision: status,
                confirmedTimeSlot: appointment.confirmedTimeSlot || appointment.requestedTimeSlot,
                notes: appointment.doctorDecisionNotes,
                bookingId: appointment.bookingId,
            });
        }
        res.status(200).json({
            success: true,
            message: `Appointment status updated to ${status}`,
            data: appointment,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
