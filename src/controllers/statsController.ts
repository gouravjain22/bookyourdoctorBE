import { Request, Response } from 'express';
import { NotificationLog } from '../models/NotificationLog';
import { Doctor } from '../models/Doctor';
import { Clinic } from '../models/Clinic';
import { City } from '../models/City';
import { Appointment } from '../models/Appointment';

export const getRecentNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '20', bookingId } = req.query;
    const query: Record<string, any> = {};

    if (bookingId) {
      query.bookingId = (bookingId as string).toUpperCase();
    }

    const notifications = await NotificationLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10) || 20);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalDoctors,
      verifiedDoctors,
      totalClinics,
      totalCities,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      recentAppointments,
    ] = await Promise.all([
      Doctor.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true, isVerified: true }),
      Clinic.countDocuments({ isActive: true }),
      City.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.find()
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
