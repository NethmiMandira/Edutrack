const mongoose = require('mongoose');
require('./Counter');

const CategorySchema = new mongoose.Schema({
  numericId: { type: Number },
  name: { type: String, required: true, unique: true, trim: true }
});

CategorySchema.pre('save', async function() {
  if (!this.isNew) return;

  try {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { id: 'category_id' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    this.numericId = counter.seq;
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model('Category', CategorySchema);
