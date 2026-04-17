import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: { uid: string; email: string; name: string };
    }
  }
}

const ALLOWED_EMAILS = (process.env['ALLOWED_EMAILS'] ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const email = decoded.email ?? '';

    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email)) {
      res.status(403).json({ error: 'Access denied: account not authorized' });
      return;
    }

    req.user = {
      uid: decoded.uid,
      email,
      name: decoded.name ?? email,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
