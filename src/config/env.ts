import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: (process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, ''),
  jwtSecret: process.env.JWT_SECRET || 'super_secret_bookyourdoctor_jwt_key_2026_dev',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  doctorConfirmationSecret: process.env.DOCTOR_CONFIRMATION_SECRET || 'doctor_whatsapp_secure_token_key_2026',
  
  // WhatsApp settings
  whatsAppEnabled: process.env.WHATSAPP_ENABLED === 'true',
  whatsAppApiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
  whatsAppPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  whatsAppAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  whatsAppVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'bookyourdoctor_webhook_verify_token',
  businessWhatsAppNumber: process.env.BUSINESS_WHATSAPP_NUMBER || '+919876543210',
};
