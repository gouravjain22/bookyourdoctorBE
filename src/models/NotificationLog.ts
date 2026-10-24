import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationLog extends Document {
  recipientType: 'doctor' | 'patient';
  recipientPhone: string;
  recipientName: string;
  bookingId: string;
  templateName: string;
  messageBody: string;
  actionUrl?: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  provider: 'simulated' | 'meta_whatsapp';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    recipientType: { type: String, enum: ['doctor', 'patient'], required: true, index: true },
    recipientPhone: { type: String, required: true },
    recipientName: { type: String, required: true },
    bookingId: { type: String, required: true, index: true },
    templateName: { type: String, required: true },
    messageBody: { type: String, required: true },
    actionUrl: { type: String },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
      default: 'sent',
      index: true,
    },
    provider: { type: String, enum: ['simulated', 'meta_whatsapp'], default: 'simulated' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const NotificationLog = mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);
