const express = require('express');
const crypto = require('crypto');
const TutorUser = require('../models/tutor/TutorUser');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const hashPassword = (password) => crypto.scryptSync(password, process.env.TUTOR_PASSWORD_SALT || 'edutrack-tutor-salt', 64).toString('hex');

router.use(requireAdmin);

router.get('/tutors', async (req, res) => {
  try {
    const tutors = await TutorUser.find().select('-passwordHash').sort({ createdAt: -1 });
    return res.json(tutors);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/tutors/:id/status', async (req, res) => {
  try {
    const status = String(req.body.status || '').trim();
    if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid tutor status.' });
    const tutor = await TutorUser.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-passwordHash');
    if (!tutor) return res.status(404).json({ error: 'Tutor not found.' });
    return res.json(tutor);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/tutors/:id/reset-password', async (req, res) => {
  try {
    const password = String(req.body.password || '');
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const tutor = await TutorUser.findByIdAndUpdate(req.params.id, { passwordHash: hashPassword(password) }, { new: true }).select('-passwordHash');
    if (!tutor) return res.status(404).json({ error: 'Tutor not found.' });
    return res.json({ message: `Password reset for ${tutor.username}.`, tutor });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
