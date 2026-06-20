const mongoose = require('mongoose');
const crypto = require('crypto');

const StudentAuthSchema = new mongoose.Schema({
  indexno: { 
    type: String, 
    required: true, 
    unique: true,
    ref: 'Student' 
  }, // Links to Student model's indexno
  passwordHash: { 
    type: String, 
    required: true 
  }, // Hashed password (never store plain text)
  temporaryPassword: {
    type: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  resetPasswordTokenHash: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

// Keep updatedAt in sync on each save
StudentAuthSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Method to hash password
StudentAuthSchema.statics.hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Method to verify password
StudentAuthSchema.methods.verifyPassword = function(password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return this.passwordHash === hash;
};

module.exports = mongoose.model('StudentAuth', StudentAuthSchema);
