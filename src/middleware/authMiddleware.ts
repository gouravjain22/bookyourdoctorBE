import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { Admin, IAdmin } from '../models/Admin';

export interface AuthenticatedRequest extends Request {
  admin?: IAdmin;
}

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.admin_token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in as an administrator.',
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Admin account not found or access revoked.',
      });
      return;
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
};
