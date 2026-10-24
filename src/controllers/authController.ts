import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { config } from '../config/env';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
      return;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Sign JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Set HTTP-Only Cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const adminLogout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('admin_token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.admin) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.status(200).json({
    success: true,
    admin: req.admin,
  });
};
