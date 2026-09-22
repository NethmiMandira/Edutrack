const crypto = require('crypto');
const admin = require('firebase-admin');

const SESSION_SECRET = process.env.TUTOR_SESSION_SECRET || 'change-this-tutor-session-secret';
const ADMIN_UID = process.env.ADMIN_FIREBASE_UID || 'XqS0sDRoXCcqZLMVOwWqFDM3HYc2';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'mandiranethmi03@gmail.com').trim().toLowerCase();

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');
const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const createTutorToken = (tutor) => {
  const payload = base64UrlEncode(JSON.stringify({
    id: String(tutor._id),
    username: tutor.username,
    role: 'tutor',
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000),
  }));
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
};

const requireTutor = (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Tutor authentication is required.' });

    const [payload, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload || '').digest('base64url');
    if (!payload || !signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return res.status(401).json({ error: 'Invalid tutor session.' });
    }

    const session = JSON.parse(base64UrlDecode(payload));
    if (session.role !== 'tutor' || !session.id || !session.exp || session.exp < Date.now()) {
      return res.status(401).json({ error: 'Tutor session expired.' });
    }

    req.tutor = session;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid tutor session.' });
  }
};

const ensureFirebaseAdmin = () => {
  if (admin.apps.length) return;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    return;
  }

  admin.initializeApp({ credential: admin.credential.applicationDefault() });
};

const requireAdmin = async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Administrator authentication is required.' });

    ensureFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(token);
    const email = String(decoded.email || '').toLowerCase();
    if (decoded.uid !== ADMIN_UID || email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Administrator access denied.' });
    }

    req.admin = { uid: decoded.uid, email };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid administrator session.', details: error.message });
  }
};

module.exports = { createTutorToken, requireTutor, requireAdmin };
