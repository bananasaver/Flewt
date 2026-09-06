import jwt from 'jsonwebtoken';

// Requires a valid Bearer token. Attaches { id, email, plan } to req.user
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'You need to be signed in to do that.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Your session expired. Please sign in again.' });
  }
}

// Attaches req.user if a valid token is present, but doesn't block the request otherwise.
// Used on tool routes so free/anonymous use still works, but logged-in users get their plan limits applied.
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // ignore invalid token, treat as anonymous
    }
  }
  next();
}
