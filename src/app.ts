import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import authRoutes from './routes/authRoutes';
import cityRoutes from './routes/cityRoutes';
import specialtyRoutes from './routes/specialtyRoutes';
import clinicRoutes from './routes/clinicRoutes';
import doctorRoutes from './routes/doctorRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Application = express();

// Security and utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
const allowedOrigins = [
  'https://letsbookyourdoctor.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  config.clientUrl,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'BookYourDoctor API',
  });
});

// Mount application API routes
app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Fallback handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
