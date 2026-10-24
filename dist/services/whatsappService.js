"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const env_1 = require("../config/env");
const NotificationLog_1 = require("../models/NotificationLog");
class WhatsAppService {
    /**
     * Send WhatsApp notification via Meta Cloud API or Simulated Dev Provider
     */
    static async sendNotification(params) {
        const { toPhone, recipientName, recipientType, bookingId, templateName, messageBody, actionUrl, metadata, } = params;
        let provider = 'simulated';
        let deliveryStatus = 'sent';
        if (env_1.config.whatsAppEnabled && env_1.config.whatsAppAccessToken && env_1.config.whatsAppPhoneNumberId) {
            provider = 'meta_whatsapp';
            try {
                // Meta Graph API WhatsApp Cloud API call
                const response = await fetch(`https://graph.facebook.com/${env_1.config.whatsAppApiVersion}/${env_1.config.whatsAppPhoneNumberId}/messages`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${env_1.config.whatsAppAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        recipient_type: 'individual',
                        to: toPhone.replace(/\D/g, ''),
                        type: 'text',
                        text: {
                            preview_url: true,
                            body: `${messageBody}${actionUrl ? `\n\n🔗 ${actionUrl}` : ''}`,
                        },
                    }),
                });
                if (!response.ok) {
                    const errData = await response.json();
                    console.error('❌ Meta WhatsApp API Error:', errData);
                    deliveryStatus = 'failed';
                }
                else {
                    deliveryStatus = 'sent';
                }
            }
            catch (err) {
                console.error('❌ Error sending Meta WhatsApp message:', err);
                deliveryStatus = 'failed';
            }
        }
        else {
            // Dev / Simulated Provider
            console.log('\n======================================================');
            console.log(`📱 [WHATSAPP DISPATCH] To ${recipientType.toUpperCase()}: ${recipientName} (${toPhone})`);
            console.log(`📋 Booking ID: ${bookingId}`);
            console.log(`💬 Message:`);
            console.log(messageBody);
            if (actionUrl) {
                console.log(`👉 Link: ${actionUrl}`);
            }
            console.log('======================================================\n');
        }
        // Persist to audit & simulation log so client can visualize received messages
        try {
            await NotificationLog_1.NotificationLog.create({
                recipientType,
                recipientPhone: toPhone,
                recipientName,
                bookingId,
                templateName,
                messageBody,
                actionUrl,
                status: deliveryStatus,
                provider,
                metadata,
            });
        }
        catch (logErr) {
            console.error('Error logging WhatsApp notification:', logErr);
        }
        return deliveryStatus === 'sent';
    }
    /**
     * Trigger doctor alert with secure confirmation link
     */
    static async notifyDoctorNewRequest(data) {
        const confirmationUrl = `${env_1.config.clientUrl}/doctor/appointment/${data.confirmationToken}`;
        const message = `🚨 *New Appointment Request - BookYourDoctor*\n\n` +
            `Hello Dr. ${data.doctorName},\n` +
            `You have a new consultation request!\n\n` +
            `👤 *Patient:* ${data.patientName} (${data.patientAge ? `${data.patientAge}y, ` : ''}${data.patientGender || 'N/A'})\n` +
            `🏥 *Clinic:* ${data.clinicName} (${data.locality})\n` +
            `📅 *Date & Slot:* ${data.requestedDate} @ ${data.requestedTimeSlot}\n` +
            `📝 *Reason:* ${data.reasonForVisit}\n` +
            `🆔 *Ref:* ${data.bookingId}\n\n` +
            `Please tap the secure link below to Confirm or Decline this appointment:`;
        return this.sendNotification({
            toPhone: data.doctorPhone,
            recipientName: data.doctorName,
            recipientType: 'doctor',
            bookingId: data.bookingId,
            templateName: 'doctor_new_appointment_request',
            messageBody: message,
            actionUrl: confirmationUrl,
            metadata: {
                requestedDate: data.requestedDate,
                requestedTimeSlot: data.requestedTimeSlot,
                clinicName: data.clinicName,
            },
        });
    }
    /**
     * Trigger patient acknowledgment that booking request was received
     */
    static async notifyPatientBookingReceived(data) {
        const trackingUrl = `${env_1.config.clientUrl}/booking/${data.bookingId}`;
        const message = `👋 *Hello ${data.patientName}!*\n\n` +
            `Your appointment request has been submitted to *Dr. ${data.doctorName}*.\n\n` +
            `📋 *Booking Ref:* ${data.bookingId}\n` +
            `🏥 *Clinic:* ${data.clinicName}\n` +
            `📅 *Requested Slot:* ${data.requestedDate} @ ${data.requestedTimeSlot}\n` +
            `⏳ *Status:* Pending Doctor Confirmation\n\n` +
            `We have notified the doctor on WhatsApp. You will receive an immediate update as soon as they confirm!`;
        return this.sendNotification({
            toPhone: data.patientPhone,
            recipientName: data.patientName,
            recipientType: 'patient',
            bookingId: data.bookingId,
            templateName: 'patient_request_acknowledged',
            messageBody: message,
            actionUrl: trackingUrl,
        });
    }
    /**
     * Trigger patient notification when doctor confirms or rejects
     */
    static async notifyPatientDecision(data) {
        const trackingUrl = `${env_1.config.clientUrl}/booking/${data.bookingId}`;
        const isConfirmed = data.decision === 'confirmed';
        const header = isConfirmed
            ? `🎉 *Appointment Confirmed!*`
            : `⚠️ *Appointment Update*`;
        let statusLine = isConfirmed
            ? `Your appointment with *Dr. ${data.doctorName}* is confirmed for *${data.confirmedTimeSlot}*.`
            : `Dr. ${data.doctorName} was unable to accept your requested slot at this time.`;
        if (data.notes) {
            statusLine += `\n\nDoctor Note: "${data.notes}"`;
        }
        const message = `${header}\n\n` +
            `Hello ${data.patientName},\n` +
            `${statusLine}\n\n` +
            `🏥 *Location:* ${data.clinicName}\n` +
            `🆔 *Booking Ref:* ${data.bookingId}\n\n` +
            `Tap below to view full clinic directions, contact details, and receipt:`;
        return this.sendNotification({
            toPhone: data.patientPhone,
            recipientName: data.patientName,
            recipientType: 'patient',
            bookingId: data.bookingId,
            templateName: `patient_decision_${data.decision}`,
            messageBody: message,
            actionUrl: trackingUrl,
            metadata: {
                decision: data.decision,
                notes: data.notes,
            },
        });
    }
}
exports.WhatsAppService = WhatsAppService;
