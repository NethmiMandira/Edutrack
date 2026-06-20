
const mongoose = require('mongoose');
require('./Counter');

const StudentSchema = new mongoose.Schema({
	numericId: { type: Number },
	firstname: { type: String, required: true, trim: true },
	lastname: { type: String, required: true, trim: true },
	indexno: { type: String, unique: true }, // e.g., STU-2026-001
	grade: { type: String, required: true },
	currentYear: { type: Number, required: true, min: 2010, max: 2050 },
	subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true }],
	contact: { type: String, required: true },
	email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
	date: { type: Date, required: true }
});

StudentSchema.pre('save', async function() {
	if (!this.isNew) return;

	try {
		const Counter = mongoose.model('Counter');
		const counter = await Counter.findOneAndUpdate(
			{ id: 'student_id' },
			{ $inc: { seq: 1 } },
			{ returnDocument: 'after', upsert: true }
		);

		this.numericId = counter.seq;
	} catch (error) {
		throw error;
	}
});

module.exports = mongoose.model('Student', StudentSchema);
