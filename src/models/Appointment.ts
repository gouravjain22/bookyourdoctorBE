import mongoose, { Schema, Document } from 'mongoose';

export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

export interface IAppointment extends Document {
  bookingId: string;
  doctor: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: number;
  patientGender?: string;
  requestedDate: string; // YYYY-MM-DD
  requestedTimeSlot: string; // e.g. "10:30 AM"
  confirmedTimeSlot?: string;
  consultationType: 'in-person' | 'online';
  reasonForVisit: string;
  status: AppointmentStatus;
  doctorConfirmationToken: string;
  tokenExpiresAt: Date;
  doctorDecisionNotes?: string;
  doctorActionAt?: Date;
  communicationConsent: boolean;
  whatsappConsent: boolean;
  whatsappNotificationStatus: {
    doctorNotified: boolean;
    doctorNotifiedAt?: Date;
    doctorNotificationId?: string;
    patientNotified: boolean;
    patientNotifiedAt?: Date;
    patientNotificationId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    bookingId: { type: String, required: true, unique: true, uppercase: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
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
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
