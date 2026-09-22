const express = require('express');
const crypto = require('crypto');
const TutorUser = require('../models/tutor/TutorUser');
const { createTutorToken } = require('../middleware/auth');

const router = express.Router();

const normalizeUsername = (value) => String(value || '').trim().toLowerCase();
const hashPassword = (password) => crypto.scryptSync(password, process.env.TUTOR_PASSWORD_SALT || 'edutrack-tutor-salt', 64).toString('hex');

router.post('/signup', async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username);
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Username, password, and confirmation are required.' });
    }
    if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-40 characters using letters, numbers, dot, underscore, or hyphen.' });
    }
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match.' });

    const existing = await TutorUser.findOne({ username });
    if (existing) return res.status(409).json({ error: 'That username is already in use.' });

    await TutorUser.create({ username, passwordHash: hashPassword(password), status: 'pending' });
    return res.status(201).json({ message: 'Request submitted. An administrator must approve it before you can log in.' });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'That username is already in use.' });
    return res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username);
    const password = String(req.body.password || '');
    const tutor = await TutorUser.findOne({ username });

    if (!tutor || tutor.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    if (tutor.status !== 'approved') {
      return res.status(403).json({ error: tutor.status === 'pending' ? 'Your tutor request is awaiting admin approval.' : 'This tutor account is not approved.' });
    }

    tutor.lastLogin = new Date();
    await tutor.save();
    return res.json({ token: createTutorToken(tutor), tutor: { id: tutor._id, username: tutor.username, role: 'tutor' } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
