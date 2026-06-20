const express = require('express');
const admin = require('firebase-admin');
const crypto = require('crypto');
const StudentAuth = require('../models/student/StudentAuth');
const Student = require('../models/tutor/Student');

const router = express.Router();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeContactToE164 = (contact) => {
  const digits = String(contact || '').replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('0')) {
    return `+94${digits.slice(1)}`;
  }

  if (digits.startsWith('94')) {
    return `+${digits}`;
  }

  if (digits.startsWith('7') && digits.length === 9) {
    return `+94${digits}`;
  }

  return `+${digits}`;
};

const maskPhone = (contact) => {
  const digits = String(contact || '').replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return `${'*'.repeat(digits.length - 4)}${digits.slice(-4)}`;
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const maskEmail = (email) => {
  const normalized = normalizeEmail(email);
  const [name = '', domain = ''] = normalized.split('@');
  if (!name || !domain) return 'your registered email';
  if (name.length <= 2) {
    return `${name[0] || '*'}*@${domain}`;
  }
  return `${name[0]}${'*'.repeat(Math.max(name.length - 2, 1))}${name[name.length - 1]}@${domain}`;
};

const sendResetCodeEmail = async ({ toEmail, code, indexno }) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !pass) {
    console.warn('SMTP config is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
    console.info(`Password reset code for ${indexno}: ${code}`);
    return { delivered: false, fallback: true };
  }

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to: toEmail,
    subject: 'EduTrack Password Reset Code',
    text: [
      `Hello ${indexno},`,
      '',
      'We received a request to reset your EduTrack student account password.',
      `Your verification code is: ${code}`,
      'This code expires in 10 minutes.',
      '',
      'If you did not request this, you can safely ignore this email.'
    ].join('\n')
  });

  return { delivered: true, fallback: false };
};

const ensureFirebaseAdmin = () => {
  if (admin.apps.length) {
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      })
    });
    return;
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
};

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim();
};

// GET /api/student/profile/:indexno - Backward-compatible student profile endpoint
router.get('/profile/:indexno', async (req, res) => {
  try {
    const indexno = String(req.params.indexno || '').trim();
    if (!indexno) {
      return res.status(400).json({ error: 'Index number is required.' });
    }

    const studentAuth = await StudentAuth.findOne({
      indexno: { $regex: `^${escapeRegExp(indexno)}$`, $options: 'i' }
    });

    const studentRecord = await Student.findOne({
      indexno: { $regex: `^${escapeRegExp(indexno)}$`, $options: 'i' }
    }).populate('subjects', 'name numericId');

    if (!studentAuth && !studentRecord) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    return res.json({
      account: studentAuth
        ? {
            indexNumber: studentAuth.indexno || '',
            lastLogin: studentAuth.lastLogin || null,
            isActive: Boolean(studentAuth.isActive),
            createdAt: studentAuth.createdAt || null,
            updatedAt: studentAuth.updatedAt || null,
          }
        : null,
      profile: {
        firstName: studentRecord?.firstname || '',
        lastName: studentRecord?.lastname || '',
        indexNumber: studentRecord?.indexno || studentAuth?.indexno || indexno,
        grade: studentRecord?.grade || '',
        currentYear: studentRecord?.currentYear || null,
        contact: studentRecord?.contact || '',
        email: studentRecord?.email || '',
        dateRegistered: studentRecord?.date || null,
        subjects: Array.isArray(studentRecord?.subjects) ? studentRecord.subjects : [],
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/student/signup - Student signup
router.post('/signup', async (req, res) => {
  try {
    const { indexno, email, password, confirmPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Validation
    if (!indexno || !normalizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Index number, email, password, and confirm password are required.' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and confirm password do not match.' });
    }

    // Check if index number exists in tutor's Student model (case-insensitive)
    const studentRecord = await Student.findOne({ indexno: { $regex: `^${escapeRegExp(indexno.trim())}$`, $options: 'i' } });
    if (!studentRecord) {
      return res.status(400).json({ error: 'This index number is not found in tutor registrations.' });
    }

    const registeredEmail = normalizeEmail(studentRecord.email);
    if (!registeredEmail) {
      return res.status(400).json({ error: 'No email is registered for this student account. Please contact your tutor.' });
    }

    const matchedStudent = await Student.findOne({
      _id: studentRecord._id,
      email: normalizedEmail
    }).select('_id');

    if (!matchedStudent || normalizedEmail !== registeredEmail) {
      return res.status(400).json({ error: 'Please use the email registered by your tutor for this index number.' });
    }

    // Check if student already has auth account (case-insensitive, use actual indexno from studentRecord)
    const existingAuth = await StudentAuth.findOne({ indexno: studentRecord.indexno });
    if (existingAuth) {
      return res.status(400).json({ error: 'This student account is already registered.' });
    }

    // Hash password and save
    const hashedPassword = StudentAuth.hashPassword(password);
    const studentAuth = new StudentAuth({
      indexno: studentRecord.indexno, // Use actual stored indexno
      passwordHash: hashedPassword
    });

    await studentAuth.save();
    res.status(201).json({ message: 'Student account created successfully. Please login.' });
  } catch (err) {
    console.error('Student signup error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'This index number already has a registered account.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/student/login - Student login
router.post('/login', async (req, res) => {
  try {
    const { indexno, password } = req.body;

    if (!indexno || !password) {
      return res.status(400).json({ error: 'Please enter index number and password.' });
    }

    // Find auth record (case-insensitive)
    const studentAuth = await StudentAuth.findOne({ indexno: { $regex: `^${escapeRegExp(indexno.trim())}$`, $options: 'i' } });
    if (!studentAuth) {
      return res.status(401).json({ error: 'Invalid index number or password.' });
    }

    // Verify password
    if (!studentAuth.verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid index number or password.' });
    }

    // Update last login
    studentAuth.lastLogin = Date.now();
    await studentAuth.save();

    // Get student details from Student model (use actual indexno from auth)
    const studentRecord = await Student.findOne({ indexno: studentAuth.indexno }).populate('subjects', 'name');

    res.json({
      message: 'Login successful',
      student: {
        indexno: studentRecord.indexno,
        firstname: studentRecord.firstname,
        lastname: studentRecord.lastname,
        grade: studentRecord.grade,
        contact: studentRecord.contact,
        subjects: studentRecord.subjects
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/student/forgot-password/start - Validate student and send reset code to email
router.post('/forgot-password/start', async (req, res) => {
  try {
    const { indexno, email } = req.body;

    if (!indexno || !indexno.trim()) {
      return res.status(400).json({ error: 'Index number is required.' });
    }

    if (!email || !normalizeEmail(email)) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const studentRecord = await Student.findOne({
      indexno: { $regex: `^${escapeRegExp(indexno.trim())}$`, $options: 'i' }
    });

    if (!studentRecord) {
      return res.status(404).json({ error: 'Index number not found. Please check and try again.' });
    }

    const studentAuth = await StudentAuth.findOne({
      indexno: { $regex: `^${escapeRegExp(studentRecord.indexno)}$`, $options: 'i' }
    });

    if (!studentAuth) {
      return res.status(404).json({ error: 'No account found for this index number. Please sign up first.' });
    }

    const submittedEmail = normalizeEmail(email);
    const registeredEmail = normalizeEmail(studentRecord.email);

    if (!registeredEmail) {
      return res.status(400).json({ error: 'No email is registered for this student account. Please contact your tutor.' });
    }

    if (submittedEmail !== registeredEmail) {
      return res.status(401).json({ error: 'Email does not match our records for this index number.' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');

    studentAuth.resetPasswordTokenHash = tokenHash;
    studentAuth.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await studentAuth.save();

    const delivery = await sendResetCodeEmail({
      toEmail: registeredEmail,
      code,
      indexno: studentRecord.indexno
    });

    const responsePayload = {
      indexno: studentRecord.indexno,
      maskedEmail: maskEmail(registeredEmail),
      message: 'Verification code sent to your registered email.'
    };

    if (process.env.NODE_ENV !== 'production') {
      responsePayload.devVerificationCode = code;
      if (delivery?.fallback) {
        responsePayload.message = 'Email service is not configured. Use the code shown in app for development.';
      }
    }

    return res.json(responsePayload);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/student/verify-user - Verify Firebase ID token and match student phone
router.post('/verify-user', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const { indexno } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Missing bearer token.' });
    }

    if (!indexno || !indexno.trim()) {
      return res.status(400).json({ error: 'Index number is required.' });
    }

    ensureFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(token);

    const studentRecord = await Student.findOne({
      indexno: { $regex: `^${escapeRegExp(indexno.trim())}$`, $options: 'i' }
    });

    if (!studentRecord) {
      return res.status(404).json({ error: 'Index number not found.' });
    }

    const firebasePhone = normalizeContactToE164(decoded.phone_number || '');
    const registeredPhone = normalizeContactToE164(studentRecord.contact || '');

    if (!firebasePhone || !registeredPhone || firebasePhone !== registeredPhone) {
      return res.status(401).json({ error: 'Phone verification failed for this student.' });
    }

    return res.json({
      uid: decoded.uid,
      phone: decoded.phone_number,
      verified: true
    });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', details: err.message });
  }
});

// POST /api/student/forgot-password/reset - Verify email code and reset password
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { indexno, email, code, newPassword, confirmPassword } = req.body;

    if (!indexno || !email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Index number, email, code, new password, and confirm password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Password and confirm password do not match.' });
    }

    const studentRecord = await Student.findOne({
      indexno: { $regex: `^${escapeRegExp(indexno.trim())}$`, $options: 'i' }
    });

    if (!studentRecord) {
      return res.status(404).json({ error: 'Index number not found.' });
    }

    const submittedEmail = normalizeEmail(email);
    const registeredEmail = normalizeEmail(studentRecord.email || '');

    if (!registeredEmail || submittedEmail !== registeredEmail) {
      return res.status(401).json({ error: 'Email verification failed for this student.' });
    }

    const studentAuth = await StudentAuth.findOne({
      indexno: { $regex: `^${escapeRegExp(studentRecord.indexno)}$`, $options: 'i' }
    });

    if (!studentAuth) {
      return res.status(404).json({ error: 'No account found for this index number. Please sign up first.' });
    }

    if (!studentAuth.resetPasswordTokenHash || !studentAuth.resetPasswordExpires) {
      return res.status(400).json({ error: 'No active password reset request found. Please request a new code.' });
    }

    if (studentAuth.resetPasswordExpires.getTime() < Date.now()) {
      studentAuth.resetPasswordTokenHash = undefined;
      studentAuth.resetPasswordExpires = undefined;
      await studentAuth.save();
      return res.status(400).json({ error: 'Verification code expired. Please request a new code.' });
    }

    const submittedCodeHash = crypto.createHash('sha256').update(String(code).trim()).digest('hex');
    if (submittedCodeHash !== studentAuth.resetPasswordTokenHash) {
      return res.status(401).json({ error: 'Invalid verification code.' });
    }

    studentAuth.passwordHash = StudentAuth.hashPassword(newPassword);
    studentAuth.resetPasswordTokenHash = undefined;
    studentAuth.resetPasswordExpires = undefined;
    await studentAuth.save();

    return res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/student/change-password - Update password from profile security tab
router.post('/change-password', async (req, res) => {
  try {
    const { indexno, currentPassword, newPassword, confirmPassword } = req.body;

    if (!indexno || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'Index number, current password, new password, and confirm password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from current password.' });
    }

    const studentAuth = await StudentAuth.findOne({
      indexno: { $regex: `^${escapeRegExp(String(indexno).trim())}$`, $options: 'i' }
    });

    if (!studentAuth) {
      return res.status(404).json({ error: 'Student account not found. Please sign up first.' });
    }

    if (!studentAuth.verifyPassword(currentPassword)) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    studentAuth.passwordHash = StudentAuth.hashPassword(newPassword);
    studentAuth.resetPasswordTokenHash = undefined;
    studentAuth.resetPasswordExpires = undefined;
    await studentAuth.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
