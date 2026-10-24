"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    mongoUri: process.env.MONGODB_URI || '',
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
