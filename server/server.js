

// --- TOP OF FILE: All requires and app setup ---
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const soap = require('soap');
const Subject = require('./models/tutor/Subject');
const Category = require('./models/tutor/Category');
const Student = require('./models/tutor/Student');
const StudentAuth = require('./models/student/StudentAuth');
const MarksEntry = require('./models/tutor/MarksEntry');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const crypto = require('crypto');

const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// SMS functionality removed. Configuration previously lived here.

const formatDateTime = (date) => {
  // Format date/time explicitly in Sri Lanka timezone to avoid server-local timezone mismatches
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
};

const getSriLankaNow = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date()).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  return new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+05:30`);
};

const calculateSMSPages = (messageLength) => Math.ceil(messageLength / 160);

const escapeXml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters
  let cleaned = String(phoneNumber).replace(/\D/g, '');
  
  // Remove leading zeros and plus signs
  cleaned = cleaned.replace(/^0+/, '');
  
  // If empty after cleaning, return null
  if (!cleaned) return null;
  
  // If doesn't start with country code, add Sri Lanka's 94
  if (!cleaned.startsWith('94')) {
    cleaned = `94${cleaned}`;
  }
  
  // Validate length (Sri Lanka numbers should be 10 digits after 94 prefix = 12 total)
  if (cleaned.length < 10 || cleaned.length > 12) {
    console.warn(`⚠️ Phone number may be invalid: ${cleaned} (length: ${cleaned.length})`);
  }
  
  return cleaned;
};

const MOBITEL_SMS_WSDL_URL = process.env.MOBITEL_SMS_WSDL_URL || 'https://msmsent.mobitel.lk/BulkSMS_v2/SendBulk?wsdl';
const MOBITEL_SMS_ENDPOINT = process.env.MOBITEL_SMS_ENDPOINT || 'https://msmsent.mobitel.lk/BulkSMS_v2/SendBulk';

const buildMobitelCampaignName = (indexno) => {
  const suffix = String(indexno || '').trim();
  return suffix ? `EduTrack Registration ${suffix}` : 'EduTrack Registration';
};

const buildMobitelWelcomeMessage = ({ firstname, lastname, indexno, password }) => {
  // Use first name only; generate welcome message
  const name = (String(firstname || '')).trim() || indexno;
  
  // Build message with exact format: Hello {name}, your account ready. Login: URL ID: indexno Password: password
  return `Hello ${name}, your student account is ready. Login: https://skmathzone.com/student/login ID:${indexno} Password:${password}`;
};

const buildMobitelMarksMessage = ({ firstname, indexno, password, subject, grade, paperName, date, mark, maxMark }) => {
  // Use first name only; paperName already contains subject and grade, so don't repeat them
  const name = (String(firstname || '')).trim() || indexno;

  return `Hello ${name}, Paper: ${paperName} Mark: ${mark}/${maxMark}. View result: https://skmathzone.com/student/login ID:${indexno} PW:${password}`;
};

const createMobitelClient = async () => {
  const client = await soap.createClientAsync(MOBITEL_SMS_WSDL_URL);
  if (typeof client.setEndpoint === 'function') {
    client.setEndpoint(MOBITEL_SMS_ENDPOINT);
  }
  return client;
};

const sendInstanceSMS = async ({ toNumber, message, indexno, firstname, lastname }) => {
  if (process.env.SMS_ACTIVATION_STATUS === 'false') {
    return { success: false, skipped: true, reason: 'SMS disabled by configuration' };
  }

  const accountNo = String(process.env.SMS_ACCOUNT_NO || '').trim();
  const username = String(process.env.SMS_USERNAME || '').trim();
  const password = String(process.env.SMS_PASSWORD || '').trim();
  const sendId = String(process.env.SMS_SENDER_ID || '').trim();
  const language = String(process.env.SMS_LANGUAGE || '1').trim() || '1';

  if (!accountNo || !username || !password || !sendId) {
    return { success: false, skipped: true, reason: 'Mobitel SMS credentials are missing' };
  }

  if (!toNumber) {
    return { success: false, skipped: true, reason: 'Recipient number is missing' };
  }

  const client = await createMobitelClient();
  const now = getSriLankaNow();
  // Add 10-second buffer to account for network/processing delays before Mobitel receives request
  const startDate = new Date(now.getTime() + (10 * 1000));
  const endDate = new Date(startDate.getTime() + (5 * 60 * 1000));

  const smsDetails = {
    account_no: accountNo,
    username,
    password,
    send_id: sendId,
    language,
    sms_content: String(message || '').trim(),
    bulk_start_date: formatDateTime(startDate),
    bulk_end_date: formatDateTime(endDate),
    campaign_name: buildMobitelCampaignName(indexno),
    number_list: [toNumber],
  };

  // Debug logging moved outside the object to avoid syntax errors
  console.log(`🔍 SMS Timing Debug - Student: ${indexno}, Recipient: ${toNumber}`);
  console.log(`   Now (SL): ${formatDateTime(now)}`);
  console.log(`   Start: ${smsDetails.bulk_start_date}, End: ${smsDetails.bulk_end_date}`);

  const [result] = await client.SendInstantSMSAsync({ SMSDetails: smsDetails });
  const responseValue = result?.return ?? result ?? null;

  return {
    success: true,
    response: responseValue,
    recipient: toNumber,
    student: indexno,
    firstname,
    lastname,
  };
};

const generateStudentPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join('');
};

const sendStudentWelcomeEmail = async ({ toEmail, indexno, password, firstname, lastname }) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !pass) {
    throw new Error('SMTP config is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
  }

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to: toEmail,
    subject: 'Your EduTrack Student Account Password',
    text: [
      `Hello ${firstname || lastname || indexno},`,
      '',
      'Your student account has been registered successfully.',
      `Index Number: ${indexno}`,
      `Temporary Password: ${password}`,
      '',
      'Use your index number and this password to log in to EduTrack.',
      'Please change your password after your first login if that option is available.',
      '',
      'If you did not expect this email, please contact your tutor.'
    ].join('\n')
  });

  return { delivered: true, fallback: false };
};

const sendStudentRemovalEmail = async ({ toEmail, indexno, firstname, lastname }) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';
  // If SMTP is not configured, log and return a fallback result instead of throwing.
  if (!host || !user || !pass) {
    console.warn('⚠️ sendStudentRemovalEmail: SMTP config missing — skipping email.');
    return { delivered: false, fallback: true, error: 'SMTP config missing' };
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (requireErr) {
    console.warn('⚠️ sendStudentRemovalEmail: nodemailer not available:', requireErr && requireErr.message);
    return { delivered: false, fallback: true, error: 'nodemailer not installed' };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to: toEmail,
      subject: 'EduTrack Student Account Removed',
      text: [
        `Hello ${firstname || lastname || indexno},`,
        '',
        'Your student account has been removed from EduTrack by the tutor.',
        `Index Number: ${indexno}`,
        '',
        'If you believe this was done by mistake, please contact your tutor immediately.'
      ].join('\n')
    });
    return { delivered: true, fallback: false };
  } catch (sendErr) {
    console.error('❌ Failed to send removal email:', sendErr && sendErr.message);
    return { delivered: false, fallback: false, error: sendErr.message };
  }
};

const getDefaultCurrentYear = () => {
  const year = new Date().getFullYear();
  return Math.min(2050, Math.max(2010, year));
};

const parseCurrentYear = (value) => {
  if (value === undefined || value === null || value === '') {
    return getDefaultCurrentYear();
  }

  const year = Number(value);
  if (!Number.isInteger(year) || year < 2010 || year > 2050) {
    return null;
  }

  return year;
};

const ensureNumericIds = async (Model, counterId) => {
  const missingDocs = await Model.find({
    $or: [{ numericId: { $exists: false } }, { numericId: null }],
  }).sort({ _id: 1 });

  if (missingDocs.length === 0) return;

  const maxDoc = await Model.findOne({ numericId: { $ne: null } })
    .sort({ numericId: -1 })
    .select('numericId');

  let nextId = maxDoc?.numericId || 0;

  for (const doc of missingDocs) {
    nextId += 1;
    doc.numericId = nextId;
    await doc.save();
  }

  const Counter = mongoose.model('Counter');
  await Counter.findOneAndUpdate(
    { id: counterId },
    { seq: nextId },
    { upsert: true }
  );
};

dotenv.config();
const app = express();

// ✅ CORS configuration - Allow both production and development
const allowedOrigins = [
  "https://skmathzone.com",
  "https://www.skmathzone.com",
  "https://api.skmathzone.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000"
];

const allowedOriginPatterns = [
  /^https:\/\/[^/]+\.github\.io$/i,
];

app.use(cors({
  origin: function(origin, callback) {
    const matchesAllowedPattern = allowedOriginPatterns.some((pattern) => pattern.test(origin || ''));

    if (!origin || allowedOrigins.includes(origin) || matchesAllowedPattern) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));
app.use(express.json());

// ✅ HEALTH CHECK - Test if server is running (no MongoDB required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅', timestamp: new Date().toISOString() });
});

// 🔍 DEBUG ENDPOINT - Check database status
app.get('/api/debug/status', async (req, res) => {
  try {
    const counts = {
      students: await Student.countDocuments(),
      subjects: await Subject.countDocuments(),
      categories: await Category.countDocuments(),
      marks: await MarksEntry.countDocuments(),
    };
    
    res.json({
      server: 'running',
      mongodb: 'connected',
      collections: counts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      server: 'running',
      mongodb: 'error',
      error: err.message,
    });
  }
});

// SMS debug endpoints removed.

// Direct provider diagnostic endpoint removed.

// GET student details by index number
const getStudentProfileByIndex = async (req, res) => {
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
};

app.get('/api/profile/:indexno', getStudentProfileByIndex);
app.get('/api/student/profile/:indexno', getStudentProfileByIndex);

// Mount student auth routes
app.use('/api/student', studentAuthRoutes);

// --- ENDPOINTS START HERE ---

// GET all marks
app.get('/api/marks', async (req, res) => {
  try {
    console.log('📨 Request received: GET /api/marks');
    await ensureNumericIds(MarksEntry, 'mark_id');

    const entries = await MarksEntry.find()
      .populate('student', 'indexno')
      .populate('subject', 'name')
      .populate('paperCategory', 'name')
      .sort({ numericId: 1, date: -1, createdAt: -1 });
    // Format for frontend grid
    const formatted = entries.map(e => ({
      id: e._id,
      numericId: e.numericId,
      indexno: e.student?.indexno || '',
      date: e.date,
      subject: e.subject?.name || '',
      paperName: e.paperName,
      paperCategory: e.paperCategory?.name || '',
      grade: e.grade,
      mark: e.mark,
      maxMark: e.maxMark,
    }));
    console.log(`✅ GET /api/marks: Returned ${formatted.length} marks records`);
    res.json(formatted);
  } catch (err) {
    console.error('❌ GET /api/marks error:', err.message);
    res.status(500).json({ error: `Failed to fetch marks: ${err.message}` });
  }
});

// MARKS ENTRY ENDPOINT
// POST /api/marks - Save a mark entry
app.post('/api/marks', async (req, res) => {
  try {
    const { indexno, date, subject, paperName, paperCategory, grade, mark, maxMark } = req.body;
    // Find student by indexno
    const studentDoc = await Student.findOne({ indexno });
    if (!studentDoc) return res.status(400).json({ error: 'Student not found' });

    const existingEntry = await MarksEntry.findOne({ student: studentDoc._id, paperName });
    if (existingEntry) {
      return res.status(400).json({ error: 'This student already has a record for this paper.' });
    }

    // Find subject by name
    const subjectDoc = await Subject.findOne({ name: subject });
    if (!subjectDoc) return res.status(400).json({ error: 'Subject not found' });
    // Find category by name
    const categoryDoc = await Category.findOne({ name: paperCategory });
    if (!categoryDoc) return res.status(400).json({ error: 'Category not found' });
    // Create and save marks entry
    const entry = new MarksEntry({
      student: studentDoc._id,
      subject: subjectDoc._id,
      paperName,
      paperCategory: categoryDoc._id,
      grade,
      mark,
      maxMark,
      date
    });
    await entry.save();

    // Send marks SMS asynchronously
    setImmediate(async () => {
      try {
        const formattedPhone = formatPhoneNumber(studentDoc.contact);
        if (!formattedPhone) {
          console.error(`❌ Invalid student contact for marks SMS: ${studentDoc.contact}`);
          return;
        }
        
        // Fetch student auth to get password (optimize by passing in request if available)
        const studentAuth = await StudentAuth.findOne({ indexno: studentDoc.indexno });
        const studentPassword = studentAuth?.temporaryPassword || 'N/A';
        
        const smsResult = await sendInstanceSMS({
          toNumber: formattedPhone,
          message: buildMobitelMarksMessage({
            firstname: studentDoc.firstname,
            indexno: studentDoc.indexno,
            password: studentPassword,
            subject: subject,
            grade: grade,
            paperName: paperName,
            date: date,
            mark: mark,
            maxMark: maxMark,
          }),
          indexno: studentDoc.indexno,
          firstname: studentDoc.firstname,
          lastname: studentDoc.lastname,
        });
        console.log('✅ Marks notification SMS submitted:', JSON.stringify(smsResult));
      } catch (smsErr) {
        console.error('⚠️ Marks notification SMS error:', smsErr && smsErr.message);
      }
    });

    res.status(201).json({ message: 'Mark entry saved' });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ error: 'This student already has a record for this paper.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/marks/:id - Update an existing mark entry
app.put('/api/marks/:id', async (req, res) => {
  try {
    const { indexno, date, subject, paperName, paperCategory, grade, mark, maxMark } = req.body;

    // Find student by indexno
    const studentDoc = await Student.findOne({ indexno });
    if (!studentDoc) return res.status(400).json({ error: 'Student not found' });

    // Ensure no duplicate for another record
    const existingEntry = await MarksEntry.findOne({
      student: studentDoc._id,
      paperName,
      _id: { $ne: req.params.id },
    });
    if (existingEntry) {
      return res.status(400).json({ error: 'This student already has a record for this paper.' });
    }

    // Find subject by name
    const subjectDoc = await Subject.findOne({ name: subject });
    if (!subjectDoc) return res.status(400).json({ error: 'Subject not found' });

    // Find category by name
    const categoryDoc = await Category.findOne({ name: paperCategory });
    if (!categoryDoc) return res.status(400).json({ error: 'Category not found' });

    const updatedEntry = await MarksEntry.findByIdAndUpdate(
      req.params.id,
      {
        student: studentDoc._id,
        subject: subjectDoc._id,
        paperName,
        paperCategory: categoryDoc._id,
        grade,
        mark,
        maxMark,
        date,
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: 'Mark entry not found' });
    }

    // No SMS on update — only send when marks first entered (POST)

    return res.json({ message: 'Mark entry updated' });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ error: 'This student already has a record for this paper.' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/marks/:id - Delete a mark entry
app.delete('/api/marks/:id', async (req, res) => {
  try {
    console.log('Attempting to delete mark with id:', req.params.id);
    const deleted = await MarksEntry.findByIdAndDelete(req.params.id);
    if (!deleted) {
      console.warn('Mark entry not found for id:', req.params.id);
      return res.status(404).json({ error: 'Mark entry not found' });
    }

    const remainingCount = await MarksEntry.countDocuments();
    if (remainingCount === 0) {
      const Counter = mongoose.model('Counter');
      await Counter.findOneAndUpdate(
        { id: 'mark_id' },
        { seq: 0 },
        { upsert: true }
      );
      console.log('♻️ Marks grid empty: Counter reset to 0');
    }

    console.log('Successfully deleted mark with id:', req.params.id);
    res.json({ message: 'Mark entry deleted' });
  } catch (err) {
    console.error('Error deleting mark with id:', req.params.id, err);
    res.status(500).json({ error: err.message });
  }
});

// STUDENT CRUD ENDPOINTS

// GET Students (populate subjects)
app.get('/api/students', async (req, res) => {
  try {
    console.log('📨 Request received: GET /api/students');
    await ensureNumericIds(Student, 'student_id');

    const students = await Student.find().sort({ numericId: 1 }).populate('subjects', 'name numericId');
    console.log(`✅ GET /api/students: Returned ${students.length} students`);
    res.json(students);
  } catch (err) {
    console.error('❌ GET /api/students error:', err.message);
    res.status(500).json({ error: `Failed to fetch students: ${err.message}` });
  }
});

// POST Student
app.post('/api/students', async (req, res) => {
  try {
    const { firstname, lastname, grade, currentYear, subjects, contact, date, indexno, email } = req.body;
    console.log('Received indexno:', indexno);
    // Normalize contact: remove non-digits and leading zeros
    const normalizedContact = String(contact).replace(/\D/g, '').replace(/^0+/, '');
    const normalizedEmail = String(email || '').trim().toLowerCase();
    console.log('Raw contact from client:', contact);
    console.log('Normalized contact for DB:', normalizedContact);
    const year = parseCurrentYear(currentYear);

    if (!firstname || !lastname || !grade || !subjects || !Array.isArray(subjects) || subjects.length === 0 || !contact || !date || !indexno) {
      return res.status(400).json({ error: 'All fields are required and at least one subject.' });
    }

    if (year === null) {
      return res.status(400).json({ error: 'Current year must be between 2010 and 2050.' });
    }
    // Contact uniqueness is intentionally not enforced server-side to allow duplicates

    if (normalizedEmail) {
      const emailExists = await Student.findOne({ email: normalizedEmail });
      if (emailExists) return res.status(400).json({ error: 'Email already exists!' });
    }

    // Validate subject IDs
    const validSubjects = await Subject.find({ _id: { $in: subjects } });
    if (validSubjects.length !== subjects.length) {
      return res.status(400).json({ error: 'Invalid subject(s) selected.' });
    }

    const student = new Student({ firstname, lastname, grade, currentYear: year, subjects, contact: normalizedContact, email: normalizedEmail || undefined, date, indexno });
    await student.save();

    const temporaryPassword = generateStudentPassword();

    await StudentAuth.findOneAndUpdate(
      { indexno: student.indexno },
      {
        indexno: student.indexno,
        passwordHash: StudentAuth.hashPassword(temporaryPassword),
        temporaryPassword,
        resetPasswordTokenHash: undefined,
        resetPasswordExpires: undefined,
        isActive: true,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const populated = await Student.findById(student._id).populate('subjects', 'name numericId');
    const responsePayload = populated?.toObject ? populated.toObject() : populated;
    const formattedPhone = formatPhoneNumber(student.contact);
    const smsStatus = process.env.SMS_ACTIVATION_STATUS === 'false'
      ? 'disabled'
      : (formattedPhone ? 'queued' : 'skipped');
    const smsError = process.env.SMS_ACTIVATION_STATUS === 'false'
      ? 'SMS processing is disabled in configuration.'
      : (formattedPhone ? null : 'Student contact number is missing or invalid for SMS delivery.');

    res.status(201).json({
      ...responsePayload,
      smsStatus,
      smsError,
      notificationWarnings: smsError ? [smsError] : [],
      notificationsQueued: Boolean(formattedPhone && process.env.SMS_ACTIVATION_STATUS !== 'false'),
      temporaryPasswordIssued: true,
      generatedPassword: temporaryPassword,
    });

    setImmediate(async () => {
      if (formattedPhone && process.env.SMS_ACTIVATION_STATUS !== 'false') {
        try {
          const smsResult = await sendInstanceSMS({
            toNumber: formattedPhone,
            message: buildMobitelWelcomeMessage({
              firstname,
              lastname,
              indexno: student.indexno,
              password: temporaryPassword,
            }),
            indexno: student.indexno,
            firstname,
            lastname,
          });
          console.log('✅ Student welcome SMS submitted:', JSON.stringify(smsResult));
        } catch (smsErr) {
          console.error('❌ Student welcome SMS error:', smsErr && smsErr.message);
        }
      }

      if (normalizedEmail) {
        try {
          await sendStudentWelcomeEmail({
            toEmail: normalizedEmail,
            indexno: student.indexno,
            password: temporaryPassword,
            firstname,
            lastname
          });
        } catch (mailErr) {
          console.error('❌ Student welcome email error:', mailErr.message);
        }
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error: check which field(s) actually exist
      const { contact, indexno, email } = req.body;
      const normalizedContact = String(contact).replace(/\D/g, '').replace(/^0+/, '');
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const contactExists = await Student.findOne({ contact: normalizedContact });
      const indexExists = await Student.findOne({ indexno });
      const emailExists = normalizedEmail ? await Student.findOne({ email: normalizedEmail }) : null;
      let msg = '';
      if (contactExists && indexExists) {
        msg = 'Index number and contact must both be unique!';
      } else if (emailExists) {
        msg = 'Email already exists!';
      } else if (contactExists) {
        msg = 'Contact already exists!';
      } else if (indexExists) {
        msg = 'Index number already exists!';
      } else {
        msg = 'Index number, contact, or email must be unique!';
      }
      res.status(400).json({ error: msg });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// PUT Student (update by id)
app.put('/api/students/:id', async (req, res) => {
  try {
    const { firstname, lastname, grade, currentYear, subjects, contact, date, indexno, email } = req.body;
    // Normalize contact: remove non-digits and leading zeros
    const normalizedContact = String(contact).replace(/\D/g, '').replace(/^0+/, '');
    const normalizedEmail = String(email || '').trim().toLowerCase();
    console.log('Raw contact from client (update):', contact);
    console.log('Normalized contact for DB (update):', normalizedContact);
    const year = parseCurrentYear(currentYear);

    if (!firstname || !lastname || !grade || !subjects || !Array.isArray(subjects) || subjects.length === 0 || !contact || !date || !indexno) {
      return res.status(400).json({ error: 'All fields are required and at least one subject.' });
    }

    if (year === null) {
      return res.status(400).json({ error: 'Current year must be between 2010 and 2050.' });
    }
    // Contact uniqueness is intentionally not enforced on update to allow duplicate contacts

    if (normalizedEmail) {
      const emailExists = await Student.findOne({ email: normalizedEmail, _id: { $ne: req.params.id } });
      if (emailExists) return res.status(400).json({ error: 'Email already exists!' });
    }

    // Validate subject IDs
    const validSubjects = await Subject.find({ _id: { $in: subjects } });
    if (validSubjects.length !== subjects.length) {
      return res.status(400).json({ error: 'Invalid subject(s) selected.' });
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { firstname, lastname, grade, currentYear: year, subjects, contact: normalizedContact, email: normalizedEmail || undefined, date, indexno },
      { returnDocument: 'after', runValidators: true }
    ).populate('subjects', 'name numericId');
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error: check which field(s) actually exist (ignore self)
      const { contact, indexno, email } = req.body;
      const normalizedContact = String(contact).replace(/\D/g, '').replace(/^0+/, '');
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const contactExists = await Student.findOne({ contact: normalizedContact, _id: { $ne: req.params.id } });
      const indexExists = await Student.findOne({ indexno, _id: { $ne: req.params.id } });
      const emailExists = normalizedEmail ? await Student.findOne({ email: normalizedEmail, _id: { $ne: req.params.id } }) : null;
      let msg = '';
      if (contactExists && indexExists) {
        msg = 'Index number and contact must both be unique!';
      } else if (emailExists) {
        msg = 'Email already exists!';
      } else if (contactExists) {
        msg = 'Contact already exists!';
      } else if (indexExists) {
        msg = 'Index number already exists!';
      } else {
        msg = 'Index number, contact, or email must be unique!';
      }
      res.status(400).json({ error: msg });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE Student (delete by id)
app.delete('/api/students/:id', async (req, res) => {
  try {
    const studentToDelete = await Student.findById(req.params.id);
    if (!studentToDelete) return res.status(404).json({ error: 'Student not found' });

    let mailResult = null;
    if (studentToDelete.email) {
      try {
        mailResult = await sendStudentRemovalEmail({
          toEmail: studentToDelete.email,
          indexno: studentToDelete.indexno,
          firstname: studentToDelete.firstname,
          lastname: studentToDelete.lastname,
        });
      } catch (mailErr) {
        // Shouldn't normally reach here because sendStudentRemovalEmail returns fallback objects,
        // but in case of unexpected errors, log and continue with deletion.
        console.error('❌ Unexpected error while attempting to send removal email:', mailErr && mailErr.message);
        mailResult = { delivered: false, fallback: false, error: mailErr && mailErr.message };
      }
    }

    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Student not found' });

    await StudentAuth.deleteOne({ indexno: deleted.indexno });

    await MarksEntry.deleteMany({ student: req.params.id });

    const remainingMarksCount = await MarksEntry.countDocuments();
    if (remainingMarksCount === 0) {
      const Counter = mongoose.model('Counter');
      await Counter.findOneAndUpdate(
        { id: 'mark_id' },
        { seq: 0 },
        { upsert: true }
      );
      console.log('♻️ Marks grid empty: Counter reset to 0');
    }

    const remainingCount = await Student.countDocuments();
    if (remainingCount === 0) {
      const Counter = mongoose.model('Counter');
      await Counter.findOneAndUpdate(
        { id: 'student_id' },
        { seq: 0 },
        { upsert: true }
      );
      console.log('♻️ Student grid empty: Counter reset to 0');
    }

    const responsePayload = { message: 'Student deleted' };
    if (mailResult && mailResult.delivered === false) {
      responsePayload.emailWarning = mailResult.error || 'Email not delivered. Check server logs or SMTP configuration.';
      responsePayload.emailFallback = Boolean(mailResult.fallback);
      console.warn('⚠️ Student deletion email not delivered:', responsePayload.emailWarning);
    }

    return res.json(responsePayload);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT Category (update by id)
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Category not found" });
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "This category already exists!" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET all categories
app.get('/api/categories', async (req, res) => {
  try {
    console.log('📨 Request received: GET /api/categories');
    await ensureNumericIds(Category, 'category_id');

    const categories = await Category.find().sort({ numericId: 1, name: 1 });
    console.log(`✅ GET /api/categories: Returned ${categories.length} categories`);
    res.json(categories);
  } catch (err) {
    console.error('❌ GET /api/categories error:', err.message);
    res.status(500).json({ error: `Failed to fetch categories: ${err.message}` });
  }
});

// POST Category
app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const newCategory = new Category({ name: name.trim() });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'This category already exists!' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE Category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });

    const remainingCount = await Category.countDocuments();
    if (remainingCount === 0) {
      const Counter = mongoose.model('Counter');
      await Counter.findOneAndUpdate(
        { id: 'category_id' },
        { seq: 0 },
        { upsert: true }
      );
      console.log('♻️ Category grid empty: Counter reset to 0');
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
      // Removed duplicate dotenv.config() call

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
    console.log("📊 Database: edutrackdb");
    console.log("🔌 Connection Status: ACTIVE");
    // Attempt to remove any existing unique index on `contact` so duplicates are allowed.
    (async () => {
      try {
        const indexes = await Student.collection.indexes();
        const contactIndex = indexes.find(idx => idx.key && idx.key.contact === 1);
        if (contactIndex && contactIndex.name) {
          await Student.collection.dropIndex(contactIndex.name);
          console.log('♻️ Dropped existing index on Student.contact:', contactIndex.name);
        }
      } catch (dropErr) {
        console.warn('⚠️ Could not drop contact index (it may not exist):', dropErr && dropErr.message);
      }
    })();
  })
  .catch(err => {
    console.error("❌ MongoDB Connection FAILED");
    console.error("❌ Error:", err.message);
    console.error("❌ MONGO_URI being used:", process.env.MONGO_URI);
    console.error("\n🔧 Troubleshooting MongoDB Connection:");
    console.error("1. Check MongoDB Atlas Network Access (whitelist IP)");
    console.error("2. Verify username and password are correct");
    console.error("3. Check if database 'edutrackdb' exists");
    console.error("4. Ensure MONGO_URI is properly formatted");
  });

// GET Subjects
app.get('/api/subjects', async (req, res) => {
  try {
    console.log('📨 Request received: GET /api/subjects');
    const subjects = await Subject.find().sort({ numericId: 1 });
    console.log(`✅ GET /api/subjects: Returned ${subjects.length} subjects`);
    res.json(subjects);
  } catch (err) {
    console.error('❌ GET /api/subjects error:', err.message);
    res.status(500).json({ error: `Failed to fetch subjects: ${err.message}` });
  }
});

// POST Subject (Fixed with detailed error)
app.post('/api/subjects', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Subject name is required" });

    const newSubject = new Subject({ name });
    const savedSubject = await newSubject.save();
    res.status(201).json(savedSubject);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "This subject already exists!" });
    } else {
      res.status(500).json({ error: "Server Error", details: err.message });
    }
  }
});

// PUT Subject (Update by ID)
app.put('/api/subjects/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Subject name is required" });

    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      { name },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Subject not found" });
    
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "This subject name already exists!" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE Subject
app.delete('/api/subjects/:id', async (req, res) => {
  try {
    // 1. Delete the specific subject
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Subject not found" });

    // 2. Check if the Subject collection is now empty
    const remainingCount = await Subject.countDocuments();
    
    if (remainingCount === 0) {
      // 3. Reset the Counter document for subjects back to 0
      // This ensures the NEXT 'save' starts at 1
      const Counter = mongoose.model('Counter');
      await Counter.findOneAndUpdate(
        { id: 'subject_id' }, 
        { seq: 0 },
        { upsert: true }
      );
      console.log("♻️ Subject grid empty: Counter reset to 0");
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from React build
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all: send index.html for any non-API route (Express 5 compatible)
app.use((req, res) => {
  if (!req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  }

  res.status(404).json({
    error: 'API route not found',
    path: req.path,
    method: req.method
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});