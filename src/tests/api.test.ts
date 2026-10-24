import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { seedDatabase } from '../utils/seedData';
import { City } from '../models/City';
import { Doctor } from '../models/Doctor';
import { Clinic } from '../models/Clinic';
import { Appointment } from '../models/Appointment';

beforeAll(async () => {
  await connectDB();
  await seedDatabase();
}, 60000);

afterAll(async () => {
  await disconnectDB();
});

describe('Public Directory APIs', () => {
  it('GET /api/cities should return list of active cities', async () => {
    const res = await request(app).get('/api/cities');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    
    const pune = res.body.data.find((c: any) => c.slug === 'pune');
    expect(pune).toBeDefined();
    expect(pune.popularLocalities).toContain('Kothrud');
  });

  it('GET /api/specialties should return list of specialties', async () => {
    const res = await request(app).get('/api/specialties');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some((s: any) => s.slug === 'cardiologist')).toBe(true);
  });

  it('GET /api/doctors should filter doctors by city slug', async () => {
    const res = await request(app).get('/api/doctors?citySlug=pune');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    
    // Check doctor card fields required by prompt
    const doc = res.body.data[0];
    expect(doc.fullName).toBeDefined();
    expect(doc.qualifications).toBeDefined();
    expect(doc.experienceYears).toBeDefined();
    expect(doc.primarySpecialty).toBeDefined();
    expect(doc.clinics.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/doctors/by-slug/:slug should return full doctor profile with multi-clinic data', async () => {
    const res = await request(app).get('/api/doctors/by-slug/dr-aarav-deshmukh-cardiologist-pune');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.registrationNumber).toBeDefined();
    expect(res.body.data.isVerified).toBe(true);
    expect(res.body.data.clinics.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.clinics[0].clinic.address).toBeDefined();
  });
});

describe('Appointment Booking & WhatsApp Confirmation Workflow', () => {
  it('POST /api/appointments should validate required fields and create pending appointment', async () => {
    const doctor = await Doctor.findOne({ slug: 'dr-aarav-deshmukh-cardiologist-pune' });
    const clinicId = doctor!.clinics[0].clinic.toString();

    const payload = {
      doctorId: doctor!._id.toString(),
      clinicId,
      patientName: 'Kavita Patel',
      patientPhone: '+919876501234',
      patientEmail: 'kavita.patel@example.com',
      patientAge: 32,
      patientGender: 'female',
      requestedDate: '2026-10-25',
      requestedTimeSlot: '11:30 AM',
      consultationType: 'in-person',
      reasonForVisit: 'Second opinion for persistent migraine and blood pressure check',
      communicationConsent: true,
      whatsappConsent: true,
    };

    const res = await request(app).post('/api/appointments').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingId).toMatch(/^BK-[A-Z0-9]{6}$/);
    expect(res.body.data.status).toBe('pending');

    const createdAppointment = await Appointment.findOne({ bookingId: res.body.data.bookingId });
    expect(createdAppointment).toBeDefined();
    expect(createdAppointment!.doctorConfirmationToken).toBeDefined();

    // Now test Doctor Confirmation via secure token
    const token = createdAppointment!.doctorConfirmationToken;
    const getDocRes = await request(app).get(`/api/appointments/doctor-confirm/${token}`);
    expect(getDocRes.status).toBe(200);
    expect(getDocRes.body.data.patientName).toBe('Kavita Patel');

    // Doctor confirms appointment
    const confirmRes = await request(app)
      .post(`/api/appointments/doctor-confirm/${token}`)
      .send({
        decision: 'confirm',
        notes: 'Please bring recent lipid profile and fasting glucose reports.',
        confirmedTimeSlot: '11:30 AM',
      });

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.status).toBe('confirmed');
    expect(confirmRes.body.data.doctorDecisionNotes).toContain('Please bring recent lipid');

    // Verify patient can view confirmed status on receipt
    const receiptRes = await request(app).get(`/api/appointments/booking/${res.body.data.bookingId}`);
    expect(receiptRes.status).toBe(200);
    expect(receiptRes.body.data.status).toBe('confirmed');
  });

  it('Doctor cannot double-decide on already processed appointment', async () => {
    const doctor = await Doctor.findOne();
    const clinicId = doctor!.clinics[0].clinic.toString();

    const createRes = await request(app).post('/api/appointments').send({
      doctorId: doctor!._id.toString(),
      clinicId,
      patientName: 'Sunil Verma',
      patientPhone: '+919811122233',
      requestedDate: '2026-10-28',
      requestedTimeSlot: '04:00 PM',
      reasonForVisit: 'Routine cardiac health review',
      communicationConsent: true,
    });

    const bookingId = createRes.body.data.bookingId;
    const appointment = await Appointment.findOne({ bookingId });
    const token = appointment!.doctorConfirmationToken;

    // First decision: reject
    await request(app)
      .post(`/api/appointments/doctor-confirm/${token}`)
      .send({ decision: 'reject', notes: 'Doctor unavailable due to emergency OT schedule' });

    // Second decision attempt should fail with 400
    const secondDecision = await request(app)
      .post(`/api/appointments/doctor-confirm/${token}`)
      .send({ decision: 'confirm' });

    expect(secondDecision.status).toBe(400);
    expect(secondDecision.body.message).toContain('already been marked as REJECTED');
  });
});
