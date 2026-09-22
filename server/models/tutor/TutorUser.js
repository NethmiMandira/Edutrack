const mongoose = require('mongoose');

const TutorUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TutorUser', TutorUserSchema, 'users');
