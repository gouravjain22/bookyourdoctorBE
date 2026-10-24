import { config } from '../config/env';
import { NotificationLog } from '../models/NotificationLog';

export interface SendWhatsAppParams {
  toPhone: string;
  recipientName: string;
  recipientType: 'doctor' | 'patient';
  bookingId: string;
  templateName: string;
  messageBody: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export class WhatsAppService {
  /**
   * Send WhatsApp notification via Meta Cloud API or Simulated Dev Provider
   */
  static async sendNotification(params: SendWhatsAppParams): Promise<boolean> {
    const {
      toPhone,
      recipientName,
      recipientType,
      bookingId,
      templateName,
      messageBody,
      actionUrl,
      metadata,
    } = params;

    let provider: 'simulated' | 'meta_whatsapp' = 'simulated';
    let deliveryStatus: 'sent' | 'failed' = 'sent';

    if (config.whatsAppEnabled && config.whatsAppAccessToken && config.whatsAppPhoneNumberId) {
      provider = 'meta_whatsapp';
      try {
        // Meta Graph API WhatsApp Cloud API call
        const response = await fetch(
          `https://graph.facebook.com/${config.whatsAppApiVersion}/${config.whatsAppPhoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${config.whatsAppAccessToken}`,
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
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          console.error('❌ Meta WhatsApp API Error:', errData);
          deliveryStatus = 'failed';
        } else {
          deliveryStatus = 'sent';
        }
      } catch (err) {
        console.error('❌ Error sending Meta WhatsApp message:', err);
        deliveryStatus = 'failed';
      }
    } else {
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
      await NotificationLog.create({
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
    } catch (logErr) {
      console.error('Error logging WhatsApp notification:', logErr);
    }

    return deliveryStatus === 'sent';
  }

  /**
   * Trigger doctor alert with secure confirmation link
   */
  static async notifyDoctorNewRequest(data: {
    doctorName: string;
    doctorPhone: string;
    patientName: string;
    patientAge?: number;
    patientGender?: string;
    clinicName: string;
    locality: string;
    requestedDate: string;
    requestedTimeSlot: string;
    reasonForVisit: string;
    bookingId: string;
    confirmationToken: string;
  }): Promise<boolean> {
    const confirmationUrl = `${config.clientUrl}/doctor/appointment/${data.confirmationToken}`;
    const cleanDoctorName = data.doctorName.startsWith('Dr.') ? data.doctorName : `Dr. ${data.doctorName}`;
    
    const message = `🚨 *New Appointment Request - BookYourDoctor*\n\n` +
      `Hello ${cleanDoctorName},\n` +
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
  static async notifyPatientBookingReceived(data: {
    patientName: string;
    patientPhone: string;
    doctorName: string;
    clinicName: string;
    requestedDate: string;
    requestedTimeSlot: string;
    bookingId: string;
  }): Promise<boolean> {
    const trackingUrl = `${config.clientUrl}/booking/${data.bookingId}`;
    const cleanDoctorName = data.doctorName.startsWith('Dr.') ? data.doctorName : `Dr. ${data.doctorName}`;

    const message = `👋 *Hello ${data.patientName}!*\n\n` +
      `Your appointment request has been submitted to *${cleanDoctorName}*.\n\n` +
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
  static async notifyPatientDecision(data: {
    patientName: string;
    patientPhone: string;
    doctorName: string;
    clinicName: string;
    decision: 'confirmed' | 'rejected';
    confirmedTimeSlot?: string;
    notes?: string;
    bookingId: string;
  }): Promise<boolean> {
    const trackingUrl = `${config.clientUrl}/booking/${data.bookingId}`;
    const isConfirmed = data.decision === 'confirmed';
    const cleanDoctorName = data.doctorName.startsWith('Dr.') ? data.doctorName : `Dr. ${data.doctorName}`;

    const header = isConfirmed
      ? `🎉 *Appointment Confirmed!*`
      : `⚠️ *Appointment Update*`;

    let statusLine = isConfirmed
      ? `Your appointment with *${cleanDoctorName}* is confirmed for *${data.confirmedTimeSlot}*.`
      : `${cleanDoctorName} was unable to accept your requested slot at this time.`;

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
