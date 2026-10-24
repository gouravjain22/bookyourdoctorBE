import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface DoctorTokenPayload {
  appointmentId: string;
  doctorId: string;
  bookingId: string;
}

export const generateDoctorConfirmationToken = (
  appointmentId: string,
  doctorId: string,
  bookingId: string
): { token: string; expiresAt: Date } => {
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours validity
  
  // Create a signed JWT with tamper-proof signature
  const token = jwt.sign(
    {
      appointmentId,
      doctorId,
      bookingId,
      nonce: crypto.randomBytes(8).toString('hex'),
    },
    config.doctorConfirmationSecret,
    { expiresIn: '72h' }
  );

  return { token, expiresAt };
};

export const verifyDoctorConfirmationToken = (token: string): DoctorTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.doctorConfirmationSecret) as DoctorTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
