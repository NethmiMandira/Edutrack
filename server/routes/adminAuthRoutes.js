const express = require('express');
const crypto = require('crypto');
const TutorUser = require('../models/tutor/TutorUser');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Promisified scrypt to prevent event loop blocking
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    const salt = process.env.TUTOR_PASSWORD_SALT || 'edutrack-tutor-salt';
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex'));
    });
  });
};

router.use(requireAdmin);

// GET all tutors
router.get('/tutors', async (req, res) => {
  try {
    const tutors = await TutorUser.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    return res.json(tutors);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve tutors list.' });
  }
});

// PATCH tutor status (approved/rejected/pending)
router.patch('/tutors/:id/status', async (req, res) => {
  try {
    const status = String(req.body.status || '').trim();
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid tutor status.' });
    }

    const tutor = await TutorUser.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-passwordHash');

    if (!tutor) return res.status(404).json({ error: 'Tutor not found.' });
    return res.json(tutor);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update tutor status.' });
  }
});

// POST reset tutor password
router.post('/tutors/:id/reset-password', async (req, res) => {
  try {
    const password = String(req.body.password || '');
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const newPasswordHash = await hashPassword(password);
    const tutor = await TutorUser.findByIdAndUpdate(
      req.params.id,
      { passwordHash: newPasswordHash },
      { new: true }
    ).select('-passwordHash');

    if (!tutor) return res.status(404).json({ error: 'Tutor not found.' });
    return res.json({ message: `Password reset for ${tutor.username}.`, tutor });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// DELETE tutor request/account
router.delete('/tutors/:id', async (req, res) => {
  try {
    const tutor = await TutorUser.findByIdAndDelete(req.params.id);
    if (!tutor) return res.status(404).json({ error: 'Tutor not found.' });

    return res.json({ message: `Removed ${tutor.username}.` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete tutor.' });
  }
});

module.exports = router;