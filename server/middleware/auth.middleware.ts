import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    schoolId?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_jwt_key') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

export const checkSchoolAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }

  const requestedSchoolId = req.params.schoolId || req.body.school_id || req.query.school_id;

  // Directors can only access their own school
  if (req.user.role === 'school_director' && req.user.schoolId !== requestedSchoolId) {
    return res.status(403).json({
      success: false,
      error: 'You can only access your own school data',
    });
  }

  // Teachers can only access their school data
  if (req.user.role === 'teacher' && req.user.schoolId !== requestedSchoolId) {
    return res.status(403).json({
      success: false,
      error: 'You can only access your own school data',
    });
  }

  next();
};

// Middleware pour logger les accès (optionnel)
export const logAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user) {
    const logData = {
      user_id: req.user.id,
      school_id: req.user.schoolId,
      action: req.method,
      resource: req.path,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    };
    // TODO: Sauvegarder dans access_logs si besoin
    console.log('Access:', logData);
  }
  next();
};
