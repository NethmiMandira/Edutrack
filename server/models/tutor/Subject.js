const mongoose = require('mongoose');
// Ensure Counter is registered
require('./Counter'); 

const SubjectSchema = new mongoose.Schema({
  numericId: { type: Number },
  name: { type: String, required: true, unique: true, trim: true }
});

// REMOVED 'next' from the arguments because we are using async
SubjectSchema.pre('save', async function() {
  if (!this.isNew) return; // Just return, don't call next()

  try {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { id: 'subject_id' }, 
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true } // Updated 'new' to 'returnDocument' to stop the warning
    );

    this.numericId = counter.seq;
    // No next() call here! Async functions handle this automatically.
  } catch (error) {
    console.error("ID Generation Failed:", error);
    throw error; // Throwing the error tells Mongoose the save failed
  }
});

module.exports = mongoose.model('Subject', SubjectSchema);